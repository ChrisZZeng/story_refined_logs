const VERDICTS = new Set(['fixed', 'improved', 'unchanged', 'regressed', 'uncertain']);
const CONFIDENCE = new Set(['high', 'medium', 'low']);
const REGRESSION_VIOLATION_TYPES = new Set([
  'factual_contradiction',
  'repetition',
  'continuity_break',
  'physical_implausibility',
]);

export function buildJudgeInput({ issue, context, newOutput }) {
  return {
    issue,
    originalOutput: context.originalOutput,
    newOutput,
    visibleContext: context.visibleContext ?? [],
    sourceFiles: context.sourceFiles ?? {},
  };
}

export function buildRegressionJudgeInput({ context, newOutput, target = 'fullTurn' }) {
  return {
    history_turn: (context.visibleContext ?? []).map((item) => ({
      turn: item.turn,
      playerInput: item.playerInput ?? '',
      output: visibleTextFromTimelineItem(item),
    })),
    playerInput: context.turnInput?.trigger?.playerInput ?? '',
    output: visibleTextFromOutput(newOutput),
    target,
  };
}

export function parseJudgeResult(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('judge result must be an object');
  }
  if (!VERDICTS.has(value.verdict)) {
    throw new Error('judge result verdict is invalid');
  }
  if (!CONFIDENCE.has(value.confidence)) {
    throw new Error('judge result confidence is invalid');
  }
  if (typeof value.reason !== 'string' || value.reason.trim().length === 0) {
    throw new Error('judge result reason must be non-empty');
  }
  return {
    verdict: value.verdict,
    confidence: value.confidence,
    reason: value.reason,
    remainingProblems: Array.isArray(value.remainingProblems) ? value.remainingProblems : [],
    newRegressions: Array.isArray(value.newRegressions) ? value.newRegressions : [],
  };
}

export function parseRegressionJudgeResult(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('regression judge result must be an object');
  }
  const rawViolation = value.isViolation ?? value.is_violation;
  if (![0, 1, true, false].includes(rawViolation)) {
    throw new Error('regression judge result is_violation must be 0 or 1');
  }
  if (!CONFIDENCE.has(value.confidence)) {
    throw new Error('regression judge result confidence is invalid');
  }
  if (!Array.isArray(value.violations)) {
    throw new Error('regression judge result violations must be an array');
  }
  const violations = value.violations.map((violation, index) =>
    parseRegressionViolation(violation, index),
  );
  if (typeof value.reasoning !== 'string' || value.reasoning.trim().length === 0) {
    throw new Error('regression judge result reasoning must be non-empty');
  }
  return {
    isViolation: rawViolation === 1 || rawViolation === true,
    confidence: value.confidence,
    violations,
    reasoning: value.reasoning,
  };
}

export async function runJudge({
  mode = 'openai-compatible',
  modelConfig,
  input,
  fetchImpl = fetch,
  onRawResponse,
}) {
  if (mode === 'fake') {
    return {
      verdict: 'uncertain',
      confidence: 'low',
      reason: 'fake judge mode does not evaluate semantic repair.',
      remainingProblems: [],
      newRegressions: [],
    };
  }
  if (mode !== 'openai-compatible') {
    throw new Error(`Unsupported judge mode: ${mode}`);
  }
  return runOpenAiCompatibleJudge({ modelConfig, input, fetchImpl, onRawResponse });
}

export async function runRegressionJudge({
  mode = 'openai-compatible',
  modelConfig,
  input,
  fetchImpl = fetch,
  onRawResponse,
}) {
  if (mode === 'fake') {
    return {
      isViolation: false,
      confidence: 'low',
      violations: [],
      reasoning: 'fake judge mode does not evaluate consistency regression.',
    };
  }
  if (mode !== 'openai-compatible') {
    throw new Error(`Unsupported regression judge mode: ${mode}`);
  }
  return runOpenAiCompatibleRegressionJudge({ modelConfig, input, fetchImpl, onRawResponse });
}

async function runOpenAiCompatibleJudge({ modelConfig, input, fetchImpl, onRawResponse }) {
  const apiKey = process.env[modelConfig.apiKeyEnv];
  if (!apiKey) throw new Error(`Missing API key env: ${modelConfig.apiKeyEnv}`);
  const response = await fetchImpl(`${trimTrailingSlash(modelConfig.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelConfig.model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildJudgeSystemPrompt() },
        { role: 'user', content: JSON.stringify(input, null, 2) },
      ],
    }),
  });
  const payload = await readResponsePayload(response);
  const rawResponse = buildRawResponse({ response, payload, modelConfig });
  await onRawResponse?.(rawResponse);
  if (!response.ok) {
    throw new Error(`judge request failed: HTTP ${response.status}`);
  }
  if (payload.bodyParseError) {
    throw new Error(`judge response body was not valid JSON: ${payload.bodyParseError}`);
  }
  const body = payload.body;
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('judge response did not include choices[0].message.content');
  }
  return parseJudgeResult(parseJsonObjectContent(content, 'judge'));
}

async function runOpenAiCompatibleRegressionJudge({
  modelConfig,
  input,
  fetchImpl,
  onRawResponse,
}) {
  const apiKey = process.env[modelConfig.apiKeyEnv];
  if (!apiKey) throw new Error(`Missing API key env: ${modelConfig.apiKeyEnv}`);
  const response = await fetchImpl(`${trimTrailingSlash(modelConfig.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelConfig.model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildRegressionJudgeSystemPrompt() },
        { role: 'user', content: JSON.stringify(input, null, 2) },
      ],
    }),
  });
  const payload = await readResponsePayload(response);
  const rawResponse = buildRawResponse({ response, payload, modelConfig });
  await onRawResponse?.(rawResponse);
  if (!response.ok) {
    throw new Error(`regression judge request failed: HTTP ${response.status}`);
  }
  if (payload.bodyParseError) {
    throw new Error(`regression judge response body was not valid JSON: ${payload.bodyParseError}`);
  }
  const body = payload.body;
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('regression judge response did not include choices[0].message.content');
  }
  return parseRegressionJudgeResult(parseJsonObjectContent(content, 'regression judge'));
}

function buildJudgeSystemPrompt() {
  return [
    '你是一名互动小说 badcase 修复复核员。',
    '你只判断 newOutput 是否修复了 issue 中描述的原始问题。',
    '请同时留意 newOutput 是否引入明显新退化。',
    '只输出 JSON 对象，字段为 verdict、confidence、reason、remainingProblems、newRegressions。',
    '字段值中引用原文时使用中文引号“”或转义英文双引号，确保最终输出是合法 JSON。',
    'verdict 必须是 fixed、improved、unchanged、regressed、uncertain 之一。',
    'confidence 必须是 high、medium、low 之一。',
  ].join('\n');
}

function buildRegressionJudgeSystemPrompt() {
  return [
    '你是一名互动小说叙事一致性回归检查员。',
    '你只判断当前 replay 输出是否相对历史可见上下文引入新的叙事一致性问题。',
    '不要判断原 badcase issue 是否被修复；这是另一个 judge 的职责。',
    '只输出 JSON 对象，字段为 is_violation、confidence、violations、reasoning。',
    '字段值中引用原文时使用中文引号“”或转义英文双引号，确保最终输出是合法 JSON。',
    'is_violation 必须是 0 或 1。',
    'confidence 必须是 high、medium、low 之一。',
    'violations 中每项包含 type、evidence_history、evidence_current、explanation。',
    'type 必须是 factual_contradiction、repetition、continuity_break、physical_implausibility 之一。',
  ].join('\n');
}

function parseRegressionViolation(value, index) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`regression judge result violations[${index}] must be an object`);
  }
  if (!REGRESSION_VIOLATION_TYPES.has(value.type)) {
    throw new Error(`regression judge result violations[${index}].type is invalid`);
  }
  return {
    type: value.type,
    evidence_history: requireNonEmptyString(
      value.evidence_history,
      `regression judge result violations[${index}].evidence_history`,
    ),
    evidence_current: requireNonEmptyString(
      value.evidence_current,
      `regression judge result violations[${index}].evidence_current`,
    ),
    explanation: requireNonEmptyString(
      value.explanation,
      `regression judge result violations[${index}].explanation`,
    ),
  };
}

function requireNonEmptyString(value, field) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} must be non-empty`);
  }
  return value;
}

function visibleTextFromTimelineItem(item) {
  return item.visibleText ?? item.output ?? item.normalizedContent?.visibleText ?? '';
}

function visibleTextFromOutput(output) {
  return output?.normalizedContent?.visibleText
    ?? output?.normalizedContent?.rawHtml
    ?? output?.narrative
    ?? '';
}

async function readResponsePayload(response) {
  const bodyText = await response.text();
  if (bodyText.trim().length === 0) {
    return { bodyText, body: null, bodyParseError: null };
  }
  try {
    return { bodyText, body: JSON.parse(bodyText), bodyParseError: null };
  } catch (error) {
    return {
      bodyText,
      body: null,
      bodyParseError: error instanceof Error ? error.message : String(error),
    };
  }
}

function buildRawResponse({ response, payload, modelConfig }) {
  const body = payload.body;
  const content = body?.choices?.[0]?.message?.content;
  return {
    receivedAt: new Date().toISOString(),
    provider: modelConfig.provider,
    model: modelConfig.model,
    status: response.status,
    statusText: response.statusText ?? '',
    ok: response.ok,
    headers: responseHeaders(response.headers),
    bodyText: payload.bodyText,
    ...(payload.bodyParseError ? { bodyParseError: payload.bodyParseError } : {}),
    ...(body !== null ? { body } : {}),
    ...(typeof content === 'string' ? { content } : {}),
  };
}

function responseHeaders(headers) {
  if (!headers || typeof headers.entries !== 'function') return {};
  return Object.fromEntries(headers.entries());
}

function parseJsonObjectContent(content, label) {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const extracted = extractFirstJsonObject(trimmed);
    if (extracted && extracted !== trimmed) {
      try {
        return JSON.parse(extracted);
      } catch {
        // Keep the original parse error because it points at the raw model content.
      }
    }
    const message = error instanceof Error ? error.message : String(error);
    const wrapped = new Error(`${label} response content is not valid JSON: ${message}`);
    wrapped.cause = error;
    throw wrapped;
  }
}

function extractFirstJsonObject(value) {
  const start = value.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < value.length; index += 1) {
    const char = value[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) return value.slice(start, index + 1);
    }
  }
  return null;
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}
