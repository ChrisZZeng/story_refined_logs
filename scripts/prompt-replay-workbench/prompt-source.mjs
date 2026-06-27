import { readFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';

export async function loadPromptSources({ configPath, oreturnRepo, allowUnavailable = false }) {
  const resolvedConfigPath = path.resolve(configPath);
  const configText = await readFile(resolvedConfigPath, 'utf8');
  const config = YAML.parse(configText);
  const promptSources = Array.isArray(config?.promptSources) ? config.promptSources : [];

  const sources = [];
  for (const source of promptSources) {
    const sourceId = source.id;
    const file = resolveSourceFile({ file: source.file, oreturnRepo });
    const symbol = source.extract?.symbol;

    let fileText;
    try {
      fileText = await readFile(file, 'utf8');
    } catch (cause) {
      const error = promptSourceError({
        message: `Failed to read prompt source ${sourceId} from ${file}`,
        code: 'PROMPT_SOURCE_READ_FAILED',
        sourceId,
        file,
        cause,
      });
      if (allowUnavailable) {
        sources.push(unavailableSource({ source, sourceId, file, symbol, error }));
        continue;
      }
      throw error;
    }

    let originalText;
    try {
      originalText = extractPromptText({ sourceText: fileText, source });
    } catch (cause) {
      const error = promptSourceError({
        message: `Failed to extract prompt source ${sourceId} symbol ${symbol} from ${file}`,
        code: 'PROMPT_SOURCE_EXTRACT_FAILED',
        sourceId,
        file,
        symbol,
        cause,
      });
      if (allowUnavailable) {
        sources.push(unavailableSource({ source, sourceId, file, symbol, error }));
        continue;
      }
      throw error;
    }

    sources.push({
      id: sourceId,
      label: source.label,
      stage: source.stage,
      file,
      symbol,
      originalText,
      draftText: originalText,
      dirty: false,
      sourceHash: `sha256:${crypto.createHash('sha256').update(originalText).digest('hex')}`,
    });
  }

  return sources;
}

function unavailableSource({ source, sourceId, file, symbol, error }) {
  return {
    id: sourceId,
    label: source.label,
    stage: source.stage,
    file,
    symbol,
    originalText: '',
    draftText: '',
    dirty: false,
    unavailable: true,
    unavailableReason: error.message,
    unavailableCode: error.code,
    sourceHash: `sha256:${crypto.createHash('sha256').update('').digest('hex')}`,
  };
}

function resolveSourceFile({ file, oreturnRepo }) {
  if (!file) return file;
  if (path.isAbsolute(file)) return path.normalize(file);
  return path.resolve(oreturnRepo, file);
}

function extractPromptText({ sourceText, source }) {
  if (source.extract?.type !== 'function-body-return-array') {
    throw new Error(`Unsupported prompt source extract type: ${source.extract?.type}`);
  }
  const symbols = [
    source.extract?.symbol,
    ...(Array.isArray(source.extract?.fallbackSymbols) ? source.extract.fallbackSymbols : []),
  ].filter((symbol) => typeof symbol === 'string' && symbol.length > 0);

  const errors = [];
  for (const symbol of symbols) {
    try {
      return extractPromptTextBySymbol({ sourceText, symbol, stack: [] });
    } catch (error) {
      errors.push(`${symbol}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`Prompt symbol extraction failed: ${errors.join('; ')}`);
}

function extractPromptTextBySymbol({ sourceText, symbol, stack }) {
  const body = findFunctionBody(sourceText, symbol);
  if (!body) {
    throw new Error(`Prompt symbol not found: ${symbol}`);
  }

  const returnArray = findReturnArray(body);
  if (!returnArray) {
    throw new Error(`Return array not found for prompt symbol: ${symbol}`);
  }

  return parseExpressionArray(returnArray.arrayText, { sourceText, stack: [...stack, symbol] }).join(returnArray.separator);
}

function findFunctionBody(sourceText, symbol) {
  const escapedSymbol = escapeRegExp(symbol);
  const declarations = [
    new RegExp(`(?:^|\\s)(?:export\\s+)?(?:async\\s+)?function\\s+${escapedSymbol}\\b[^{}]*\\{`, 'm'),
    new RegExp(`(?:^|\\s)(?:export\\s+)?const\\s+${escapedSymbol}\\s*=\\s*[^=]*=>\\s*\\{`, 'm'),
  ];

  for (const declaration of declarations) {
    const match = declaration.exec(sourceText);
    if (!match) continue;
    const openBrace = sourceText.indexOf('{', match.index);
    const closeBrace = findMatchingDelimiter(sourceText, openBrace, '{', '}');
    if (closeBrace !== -1) {
      return sourceText.slice(openBrace + 1, closeBrace);
    }
  }

  return null;
}

function findReturnArray(body) {
  let index = 0;
  while (index < body.length) {
    const returnIndex = findKeyword(body, 'return', index);
    if (returnIndex === -1) return null;
    let cursor = skipIgnorable(body, returnIndex + 'return'.length);
    if (body[cursor] === '[') {
      const closeBracket = findMatchingDelimiter(body, cursor, '[', ']');
      if (closeBracket === -1) return null;
      const afterArray = skipIgnorable(body, closeBracket + 1);
      if (/^\.join\s*\(/.test(body.slice(afterArray))) {
        return {
          arrayText: body.slice(cursor + 1, closeBracket),
          separator: parseJoinSeparator(body, afterArray),
        };
      }
      index = closeBracket + 1;
      continue;
    }

    const statementEnd = findStatementEnd(body, cursor);
    const wrappedArray = findJoinedArray(body.slice(cursor, statementEnd));
    if (wrappedArray) return wrappedArray;
    index = returnIndex + 'return'.length;
  }
  return null;
}

function findJoinedArray(expression) {
  let cursor = 0;
  while (cursor < expression.length) {
    cursor = skipIgnorable(expression, cursor);
    if (expression[cursor] !== '[') {
      cursor += 1;
      continue;
    }

    const closeBracket = findMatchingDelimiter(expression, cursor, '[', ']');
    if (closeBracket === -1) return null;
    const afterArray = skipIgnorable(expression, closeBracket + 1);
    if (/^\.join\s*\(/.test(expression.slice(afterArray))) {
      return {
        arrayText: expression.slice(cursor + 1, closeBracket),
        separator: parseJoinSeparator(expression, afterArray),
      };
    }
    cursor = closeBracket + 1;
  }
  return null;
}

function parseJoinSeparator(text, joinStart) {
  const joinMatch = /^\.join\s*\(/.exec(text.slice(joinStart));
  if (!joinMatch) return '\n';
  const openParen = joinStart + joinMatch[0].lastIndexOf('(');
  const closeParen = findMatchingDelimiter(text, openParen, '(', ')');
  if (closeParen === -1) return '\n';
  const args = splitTopLevel(text.slice(openParen + 1, closeParen), ',');
  if (args.length === 0 || !args[0].trim()) return ',';
  const separator = evaluatePromptExpression(args[0], { sourceText: '', stack: [] });
  if (typeof separator !== 'string') {
    throw new Error('join separator must be a static string');
  }
  return separator;
}

function findStatementEnd(text, start) {
  let cursor = start;
  let depth = 0;
  while (cursor < text.length) {
    const char = text[cursor];
    if (char === "'" || char === '"' || char === '`') {
      cursor = readStringLiteral(text, cursor).end;
      continue;
    }
    if (text.startsWith('//', cursor)) {
      cursor = skipLineComment(text, cursor);
      continue;
    }
    if (text.startsWith('/*', cursor)) {
      cursor = skipBlockComment(text, cursor);
      continue;
    }
    if (char === '(' || char === '[' || char === '{') {
      depth += 1;
    } else if (char === ')' || char === ']' || char === '}') {
      depth = Math.max(0, depth - 1);
    } else if ((char === ';' || char === '\n') && depth === 0) {
      return cursor;
    }
    cursor += 1;
  }
  return cursor;
}

function parseExpressionArray(arrayText, context) {
  const values = [];
  for (const entry of splitTopLevel(arrayText, ',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const value = evaluatePromptExpression(trimmed, context);
    if (value !== undefined) {
      values.push(value);
    }
  }

  if (values.length === 0) {
  throw new Error('Prompt return array is empty');
  }
  return values;
}

function evaluatePromptExpression(expression, context) {
  const trimmed = stripOuterParens(expression.trim());
  if (!trimmed) return undefined;

  const literal = tryReadCompleteStringLiteral(trimmed);
  if (literal) {
    return decodeStringLiteral(literal.raw, trimmed[0]);
  }

  const joinedArray = parseJoinedArrayExpression(trimmed);
  if (joinedArray) {
    return parseExpressionArray(joinedArray.arrayText, context).join(joinedArray.separator);
  }

  const call = parseCallExpression(trimmed);
  if (call?.name === 'renderPromptBlock') {
    const args = call.args.map((arg) => evaluatePromptExpression(arg, context));
    return renderPromptBlockStatic({
      tagName: args[0],
      content: args[1],
      intro: args[2],
      emptyText: args[3],
    });
  }

  if (call && call.args.length === 0) {
    if (context.stack.includes(call.name)) {
      throw new Error(`Recursive prompt helper call: ${[...context.stack, call.name].join(' -> ')}`);
    }
    return extractPromptTextBySymbol({
      sourceText: context.sourceText,
      symbol: call.name,
      stack: context.stack,
    });
  }

  throw new Error(`Unsupported prompt array entry near: ${trimmed.slice(0, 80)}`);
}

function renderPromptBlockStatic({ tagName, content, intro, emptyText = '（无）' }) {
  if (typeof tagName !== 'string') {
    throw new Error('renderPromptBlock tagName must be a static string');
  }
  const trimmed = typeof content === 'string' ? content.trim() : '';
  const trimmedIntro = typeof intro === 'string' ? intro.trim() : '';
  const body = trimmed || (typeof emptyText === 'string' ? emptyText : '（无）');
  const parts = trimmedIntro ? [trimmedIntro, body] : [body];
  return `<${tagName}>\n${parts.join('\n\n')}\n</${tagName}>`;
}

function parseJoinedArrayExpression(expression) {
  const cursor = skipIgnorable(expression, 0);
  if (expression[cursor] !== '[') return null;
  const closeBracket = findMatchingDelimiter(expression, cursor, '[', ']');
  if (closeBracket === -1) return null;
  const afterArray = skipIgnorable(expression, closeBracket + 1);
  const joinMatch = /^\.join\s*\(/.exec(expression.slice(afterArray));
  if (!joinMatch) return null;
  const openParen = afterArray + joinMatch[0].lastIndexOf('(');
  const closeParen = findMatchingDelimiter(expression, openParen, '(', ')');
  if (closeParen === -1) return null;
  const tail = skipIgnorable(expression, closeParen + 1);
  if (tail < expression.length) return null;
  const args = splitTopLevel(expression.slice(openParen + 1, closeParen), ',');
  const separator = args.length > 0 && args[0].trim()
    ? evaluatePromptExpression(args[0], { sourceText: '', stack: [] })
    : ',';
  if (typeof separator !== 'string') {
    throw new Error('join separator must be a static string');
  }
  return {
    arrayText: expression.slice(cursor + 1, closeBracket),
    separator,
  };
}

function parseCallExpression(expression) {
  const match = /^([A-Za-z_$][\w$]*)\s*\(/.exec(expression);
  if (!match) return null;
  const openParen = expression.indexOf('(', match[0].length - 1);
  const closeParen = findMatchingDelimiter(expression, openParen, '(', ')');
  if (closeParen === -1) return null;
  const tail = skipIgnorable(expression, closeParen + 1);
  if (tail < expression.length) return null;
  return {
    name: match[1],
    args: splitTopLevel(expression.slice(openParen + 1, closeParen), ',')
      .map((arg) => arg.trim())
      .filter((arg) => arg.length > 0),
  };
}

function splitTopLevel(text, delimiter) {
  const parts = [];
  let start = 0;
  let cursor = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;
  while (cursor < text.length) {
    const char = text[cursor];
    if (char === "'" || char === '"' || char === '`') {
      cursor = readStringLiteral(text, cursor).end;
      continue;
    }
    if (text.startsWith('//', cursor)) {
      cursor = skipLineComment(text, cursor);
      continue;
    }
    if (text.startsWith('/*', cursor)) {
      cursor = skipBlockComment(text, cursor);
      continue;
    }
    if (char === '(') parenDepth += 1;
    if (char === ')') parenDepth -= 1;
    if (char === '[') bracketDepth += 1;
    if (char === ']') bracketDepth -= 1;
    if (char === '{') braceDepth += 1;
    if (char === '}') braceDepth -= 1;
    if (char === delimiter && parenDepth === 0 && bracketDepth === 0 && braceDepth === 0) {
      parts.push(text.slice(start, cursor));
      start = cursor + 1;
    }
    cursor += 1;
  }
  parts.push(text.slice(start));
  return parts;
}

function tryReadCompleteStringLiteral(text) {
  const quote = text[0];
  if (quote !== "'" && quote !== '"' && quote !== '`') return null;
  const literal = readStringLiteral(text, 0);
  const tail = skipIgnorable(text, literal.end);
  return tail === text.length ? literal : null;
}

function stripOuterParens(expression) {
  let text = expression;
  while (text.startsWith('(')) {
    const closeParen = findMatchingDelimiter(text, 0, '(', ')');
    if (closeParen !== text.length - 1) break;
    text = text.slice(1, -1).trim();
  }
  return text;
}

function readStringLiteral(text, start) {
  const quote = text[start];
  let cursor = start + 1;
  while (cursor < text.length) {
    const char = text[cursor];
    if (char === '\\') {
      cursor += 2;
      continue;
    }
    if (char === quote) {
      return {
        raw: text.slice(start, cursor + 1),
        end: cursor + 1,
      };
    }
    cursor += 1;
  }
  throw new Error('Unterminated prompt string literal');
}

function decodeStringLiteral(raw, quote) {
  if (quote === '`') {
    return raw.slice(1, -1).replaceAll('\\`', '`');
  }
  return JSON.parse(`"${raw.slice(1, -1).replaceAll('"', '\\"')}"`);
}

function findMatchingDelimiter(text, openIndex, openChar, closeChar) {
  let depth = 0;
  let cursor = openIndex;
  while (cursor < text.length) {
    const char = text[cursor];
    if (char === "'" || char === '"' || char === '`') {
      cursor = readStringLiteral(text, cursor).end;
      continue;
    }
    if (text.startsWith('//', cursor)) {
      cursor = skipLineComment(text, cursor);
      continue;
    }
    if (text.startsWith('/*', cursor)) {
      cursor = skipBlockComment(text, cursor);
      continue;
    }
    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return cursor;
    }
    cursor += 1;
  }
  return -1;
}

function findKeyword(text, keyword, start) {
  const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'g');
  regex.lastIndex = start;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (!isInsideStringOrComment(text, match.index)) {
      return match.index;
    }
  }
  return -1;
}

function isInsideStringOrComment(text, targetIndex) {
  let cursor = 0;
  while (cursor < targetIndex) {
    const char = text[cursor];
    if (char === "'" || char === '"' || char === '`') {
      const end = readStringLiteral(text, cursor).end;
      if (targetIndex < end) return true;
      cursor = end;
      continue;
    }
    if (text.startsWith('//', cursor)) {
      const end = skipLineComment(text, cursor);
      if (targetIndex < end) return true;
      cursor = end;
      continue;
    }
    if (text.startsWith('/*', cursor)) {
      const end = skipBlockComment(text, cursor);
      if (targetIndex < end) return true;
      cursor = end;
      continue;
    }
    cursor += 1;
  }
  return false;
}

function skipIgnorable(text, start) {
  let cursor = start;
  while (cursor < text.length) {
    if (/\s/.test(text[cursor])) {
      cursor += 1;
      continue;
    }
    if (text.startsWith('//', cursor)) {
      cursor = skipLineComment(text, cursor);
      continue;
    }
    if (text.startsWith('/*', cursor)) {
      cursor = skipBlockComment(text, cursor);
      continue;
    }
    return cursor;
  }
  return cursor;
}

function skipLineComment(text, start) {
  const nextLine = text.indexOf('\n', start + 2);
  return nextLine === -1 ? text.length : nextLine + 1;
}

function skipBlockComment(text, start) {
  const end = text.indexOf('*/', start + 2);
  return end === -1 ? text.length : end + 2;
}

function promptSourceError({ message, code, sourceId, file, symbol, cause }) {
  const error = new Error(message, { cause });
  error.code = code;
  error.sourceId = sourceId;
  error.file = file;
  if (symbol) error.symbol = symbol;
  return error;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
