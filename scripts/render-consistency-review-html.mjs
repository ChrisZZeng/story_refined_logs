#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ISSUE_TYPE_LABELS = {
  'fact-conflict': '事实冲突',
  'identity-drift': '身份漂移',
  'quality-regression': '质量退化',
  'repeated-scene': '重复演出',
  'space-time-break': '时空断裂',
  'unsupported-jump': '无支撑跳跃',
  'user-input-ignored': '用户输入未响应',
  'event-denial': '事件否定',
};

const SEVERITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
};

const SCOPE_LABELS = {
  visibleText: '正文',
  choices: '选项',
  preLlmEvents: '预事件',
  mixed: '混合',
};

const DEFAULT_OUTPUT_NAMES = {
  fullTurn: 'fullturn-bubble-review.html',
  visibleText: 'visibletext-bubble-review.html',
};

function parseArgs(argv) {
  const args = {
    _: [],
    runIds: [],
    mode: 'fullTurn',
    outputName: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === '--run-id') {
      const value = argv[i + 1];
      if (!value) throw new Error('--run-id requires a value');
      args.runIds.push(value);
      i += 1;
      continue;
    }
    if (item === '--mode') {
      const value = argv[i + 1];
      if (value !== 'fullTurn' && value !== 'visibleText') {
        throw new Error('--mode must be fullTurn or visibleText');
      }
      args.mode = value;
      i += 1;
      continue;
    }
    if (item === '--output-name') {
      const value = argv[i + 1];
      if (!value) throw new Error('--output-name requires a value');
      args.outputName = value;
      i += 1;
      continue;
    }
    if (item === '--help' || item === '-h') {
      args.help = true;
      continue;
    }
    args._.push(item);
  }

  return args;
}

function usage() {
  const scriptName = path.basename(fileURLToPath(import.meta.url));
  return [
    `Usage: node scripts/${scriptName} <log-group-dir> [options]`,
    '',
    'Options:',
    '  --run-id <run-id>       Only render this run. Can be repeated.',
    '  --mode <mode>           fullTurn or visibleText. Default: fullTurn.',
    '  --output-name <name>    Output html filename. Default depends on mode.',
    '',
    'Example:',
    '  node scripts/render-consistency-review-html.mjs \\',
    '    logs/2124ade90932-dev-orchestrator-membackend',
  ].join('\n');
}

function normalizeGroupDir(inputPath) {
  const resolved = path.resolve(inputPath);
  const base = path.basename(resolved);
  if (base === 'run_logs' || base === 'consistency-review') {
    return path.dirname(resolved);
  }
  return resolved;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonIfExists(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return readJson(filePath);
}

function readJsonl(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function listDirectories(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function countBy(items, keyFn) {
  const result = new Map();
  for (const item of items) {
    const key = keyFn(item) ?? '(none)';
    result.set(key, (result.get(key) ?? 0) + 1);
  }
  return Object.fromEntries([...result.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))));
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function issueTypeLabel(type) {
  return ISSUE_TYPE_LABELS[type] ?? type ?? '未知类型';
}

function severityLabel(severity) {
  return SEVERITY_LABELS[severity] ?? severity ?? '未知';
}

function scopeLabel(scope) {
  return SCOPE_LABELS[scope] ?? scope ?? '未知';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function decodeHtml(value) {
  const namedEntities = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return String(value ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();
    if (normalized.startsWith('#x')) {
      const codePoint = Number.parseInt(normalized.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    if (normalized.startsWith('#')) {
      const codePoint = Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return namedEntities[normalized] ?? match;
  });
}

function getHtmlAttribute(attrs, name) {
  const doubleQuoted = attrs.match(new RegExp(`${name}="([^"]*)"`));
  if (doubleQuoted) return decodeHtml(doubleQuoted[1]);
  const singleQuoted = attrs.match(new RegExp(`${name}='([^']*)'`));
  if (singleQuoted) return decodeHtml(singleQuoted[1]);
  return null;
}

function htmlFragmentToText(html) {
  return decodeHtml(
    String(html ?? '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p\b[^>]*>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
  ).trim();
}

function renderText(value) {
  if (value === null || value === undefined || value === '') return '<span class="muted">（无）</span>';
  return escapeHtml(value);
}

function renderList(title, values) {
  const items = Array.isArray(values) ? values.filter((value) => value !== null && value !== undefined && value !== '') : [];
  if (items.length === 0) return '';
  return [
    `<div class="detail-list">`,
    `<h4>${escapeHtml(title)}</h4>`,
    '<ul>',
    ...items.map((item) => `<li>${escapeHtml(item)}</li>`),
    '</ul>',
    '</div>',
  ].join('\n');
}

function renderCharacterBeats(values) {
  const items = Array.isArray(values) ? values.filter(Boolean) : [];
  if (items.length === 0) return '';

  return [
    '<div class="detail-list character-beats">',
    '<h4>characterBeats</h4>',
    ...items.map((item) => {
      if (typeof item === 'string') {
        return `<div class="character-beat"><p>${escapeHtml(item)}</p></div>`;
      }

      const rows = [
        ['角色', item.characterId],
        ['意图', item.intent],
        ['动作提示', item.actionHint],
      ].filter(([, value]) => value !== null && value !== undefined && value !== '');

      return [
        '<div class="character-beat">',
        ...rows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><p>${escapeHtml(value)}</p></div>`),
        '</div>',
      ].join('\n');
    }),
    '</div>',
  ].join('\n');
}

function renderObjectDetails(title, value) {
  if (!value || (Array.isArray(value) && value.length === 0)) return '';
  return [
    '<details class="events">',
    `<summary>${escapeHtml(title)}</summary>`,
    `<pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre>`,
    '</details>',
  ].join('\n');
}

function issueId(issue, index) {
  return `issue-${issue.turn}-${index + 1}`;
}

function loadTurnOutput(runDir, turn) {
  const padded = String(turn).padStart(2, '0');
  return readJsonIfExists(path.join(runDir, `turn-${padded}`, '04-output.json'));
}

function loadTurnScriptState(runDir, turn) {
  const padded = String(turn).padStart(2, '0');
  return readJsonIfExists(path.join(runDir, `turn-${padded}`, '02-script-state.json'));
}

function firstLine(value) {
  return String(value ?? '').split(/\r?\n/).find((line) => line.trim() !== '')?.trim() ?? '';
}

function collectCategoryText(byCategory, categories) {
  const values = categories.flatMap((category) => byCategory.get(category) ?? []);
  return values.join('\n\n');
}

function buildStorylineBrief(scriptState) {
  const items = Array.isArray(scriptState?.context?.items) ? scriptState.context.items : [];
  const beatItems = items.filter((item) => item?.owner?.kind === 'beat' && item?.owner?.id);
  const currentBeatId = beatItems[0]?.owner?.id;
  if (!currentBeatId) return null;

  const currentItems = beatItems.filter((item) => item?.owner?.id === currentBeatId);
  const byCategory = new Map();
  for (const item of currentItems) {
    const text = item?.text;
    if (typeof text !== 'string' || text.trim() === '') continue;
    const category = item?.category ?? 'beat::other';
    const existing = byCategory.get(category) ?? [];
    existing.push(text.trim());
    byCategory.set(category, existing);
  }

  const title = byCategory.get('beat::title')?.[0] ?? currentBeatId;
  const themeCompass = byCategory.get('beat::theme_compass')?.[0] ?? '';
  const orderedCategories = [
    ['Opening template', ['beat::opening_template', 'beat::openingTemplate', 'beat::opening-template']],
    ['Core beats / 核心流程', ['beat::core_beats', 'beat::coreBeats', 'beat::core-beats', 'beat::core_flow']],
    ['主题罗盘', ['beat::theme_compass']],
    ['约束', ['beat::constraints']],
    ['互动后续', ['beat::interaction_followup']],
  ];
  const usedCategories = new Set([
    'beat::title',
    'beat::content',
    ...orderedCategories.flatMap(([, categories]) => categories),
  ]);
  const structuredSections = orderedCategories.flatMap(([label, categories]) => {
    const text = collectCategoryText(byCategory, categories);
    return text ? [{ label, text }] : [];
  });
  const extraSections = [...byCategory.entries()].flatMap(([category, values]) => {
    if (usedCategories.has(category)) return [];
    const text = Array.isArray(values) ? values.join('\n\n') : '';
    if (!text) return [];
    return [{ label: category.replace(/^beat::/, ''), text }];
  });

  return {
    beatId: currentBeatId,
    title,
    summary: firstLine(themeCompass),
    sections: [
      ...structuredSections,
      ...extraSections,
    ],
  };
}

function buildMetrics(summary, issues, turns, mode) {
  const report = summary?.reports?.[mode] ?? {};
  const issueTurns = uniqueSorted(issues.map((issue) => issue.turn).filter(Number.isFinite));
  const severityCounts = countBy(issues, (issue) => issue.severity);

  return {
    firstIssueTurn: report.firstInconsistentTurn ?? issueTurns[0] ?? null,
    issueTurnCount: report.inconsistentTurnCount ?? issueTurns.length,
    issueCount: report.issueCount ?? issues.length,
    highCount: severityCounts.high ?? 0,
    mediumCount: severityCounts.medium ?? 0,
    lowCount: severityCounts.low ?? 0,
    turnCount: report.turnCount ?? summary?.turnCount ?? turns.length,
  };
}

function formatCountMap(map, labelFn = (value) => value) {
  const entries = Object.entries(map);
  if (entries.length === 0) return '无';
  return entries.map(([key, count]) => `${labelFn(key)} ${count}`).join(' / ');
}

function runDisplayName(runId) {
  const match = runId.match(/(\d{4}-\d{2}-\d{2}T.+)$/);
  return match ? match[1] : runId;
}

function renderPlotPoint(output) {
  const plotPoint = output?.plotPoint;
  if (!plotPoint) return '';
  const summaryRows = [
    ['玩家意图', plotPoint.playerIntent],
    ['场景', plotPoint.scene],
    ['语气', plotPoint.tone],
    ['节奏', plotPoint.pacing],
    ['章节信号', plotPoint.sectionSignalSuggestion],
  ].filter(([, value]) => value);

  return [
    '<details class="director-brief">',
    '<summary>导演安排摘要</summary>',
    plotPoint.summary ? `<p>${escapeHtml(plotPoint.summary)}</p>` : '',
    summaryRows.length > 0
      ? `<dl>${summaryRows.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>`
      : '',
    renderList('beats', plotPoint.beats),
    renderCharacterBeats(plotPoint.characterBeats),
    renderList('requiredContent', plotPoint.requiredContent),
    renderList('currentTurnConstraints', plotPoint.currentTurnConstraints),
    renderList('currentStorylineConstraints', plotPoint.currentStorylineConstraints),
    '</details>',
  ].join('\n');
}

function renderStorylineBrief(scriptState, defaultOpen) {
  const brief = buildStorylineBrief(scriptState);
  if (!brief) return '';
  const openAttr = defaultOpen ? ' open' : '';
  const subtitle = brief.summary ? ` · ${brief.summary}` : '';

  return [
    `<details class="storyline-brief"${openAttr}>`,
    `<summary>当前故事线 / Beat 参考：${escapeHtml(brief.beatId)} · ${escapeHtml(brief.title)}</summary>`,
    `<div class="storyline-meta">${escapeHtml(brief.beatId)}${escapeHtml(subtitle)}</div>`,
    ...brief.sections.map((section) => [
      '<section class="storyline-section">',
      `<h4>${escapeHtml(section.label)}</h4>`,
      `<p>${escapeHtml(section.text)}</p>`,
      '</section>',
    ].join('\n')),
    '</details>',
  ].join('\n');
}

function renderChoice(choice, index) {
  const text = choice?.text ?? JSON.stringify(choice);
  const actionId = choice?.actionId ? `<small>${escapeHtml(choice.actionId)}</small>` : '';
  return [
    '<div class="choice-line">',
    `<span>${index + 1}</span>`,
    `<div><b>${escapeHtml(text)}</b>${actionId}</div>`,
    '</div>',
  ].join('');
}

function rawNarrativeHtml(output) {
  return output?.normalizedContent?.rawHtml
    ?? output?.narrative
    ?? output?.writes?.find((write) => write?.target === 'turnContent')?.content?.rawHtml
    ?? null;
}

function parseNarrativeParagraphs(output, fallbackText) {
  const rawHtml = rawNarrativeHtml(output);
  if (!rawHtml) return [{ text: fallbackText }];

  const paragraphs = [];
  const paragraphPattern = /<p\b([^>]*)>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = paragraphPattern.exec(rawHtml)) !== null) {
    const attrs = match[1] ?? '';
    const text = htmlFragmentToText(match[2]);
    if (!text) continue;
    paragraphs.push({
      speaker: getHtmlAttribute(attrs, 'data-speaker'),
      to: getHtmlAttribute(attrs, 'data-to'),
      text,
    });
  }

  if (paragraphs.length > 0) return paragraphs;
  return [{ text: htmlFragmentToText(rawHtml) || fallbackText }];
}

function renderNarrative(turn, output) {
  const paragraphs = parseNarrativeParagraphs(output, turn.visibleText);
  return [
    '<div class="narration-block">',
    '<div class="speaker"><span>正文</span></div>',
    '<div class="narrative-flow">',
    ...paragraphs.map((paragraph) => {
      const speakerLabel = paragraph.speaker
        ? `<div class="dialogue-speaker"><span>${escapeHtml(paragraph.speaker)}</span>${paragraph.to ? `<b>→</b><span>${escapeHtml(paragraph.to)}</span>` : ''}</div>`
        : '';
      return [
        `<div class="narrative-paragraph ${paragraph.speaker ? 'dialogue' : ''}">`,
        speakerLabel,
        `<div class="paragraph-text">${renderText(paragraph.text)}</div>`,
        '</div>',
      ].join('\n');
    }),
    '</div>',
    '</div>',
  ].join('\n');
}

function renderIssueCard(issue, id) {
  const conflictingTurns = Array.isArray(issue.conflictingTurns) && issue.conflictingTurns.length > 0
    ? issue.conflictingTurns.join(', ')
    : '无';

  return [
    `<article class="issue-card severity-${escapeHtml(issue.severity)}" id="${escapeHtml(id)}">`,
    '<div class="issue-head">',
    `<strong>T${escapeHtml(issue.turn)} · ${escapeHtml(issueTypeLabel(issue.type))}</strong>`,
    `<span>${escapeHtml(scopeLabel(issue.scope))} · ${escapeHtml(severityLabel(issue.severity))} · ${escapeHtml(issue.source ?? 'unknown')}</span>`,
    '</div>',
    '<dl>',
    '<dt>当前证据</dt>',
    `<dd>${renderText(issue.currentEvidence)}</dd>`,
    '<dt>冲突证据</dt>',
    `<dd>${renderText(issue.conflictingEvidence)}</dd>`,
    '<dt>原因</dt>',
    `<dd>${renderText(issue.reason)}</dd>`,
    '<dt>冲突轮次</dt>',
    `<dd>${escapeHtml(conflictingTurns)}</dd>`,
    '</dl>',
    '</article>',
  ].join('\n');
}

function renderTurn(turn, output, scriptState, issuesForTurn, issueIndexByObject) {
  const choices = Array.isArray(turn.choices) ? turn.choices : [];
  const hasIssues = issuesForTurn.length > 0;
  const issuePills = issuesForTurn.map((issue) => {
    const id = issueIndexByObject.get(issue);
    return `<a class="issue-pill severity-${escapeHtml(issue.severity)}" href="#${escapeHtml(id)}">${escapeHtml(scopeLabel(issue.scope))} · ${escapeHtml(issueTypeLabel(issue.type))}</a>`;
  });

  return [
    `<section class="turn-card ${hasIssues ? 'has-issue' : ''}" id="turn-${escapeHtml(turn.turn)}">`,
    '<header class="turn-header">',
    '<div>',
    '<span class="turn-kicker">Turn</span>',
    `<h2>${escapeHtml(turn.turn)}</h2>`,
    '</div>',
    `<div class="turn-badges">${issuePills.length > 0 ? issuePills.join('') : '<span class="clean-pill">本轮未标记问题</span>'}</div>`,
    '</header>',
    '<div class="turn-grid">',
    '<main class="conversation">',
    '<div class="bubble player">',
    '<div class="speaker"><span>玩家输入</span></div>',
    `<div class="bubble-text">${renderText(turn.playerInput ?? '初始回合')}</div>`,
    turn.playerInputSource ? `<div class="source-note">${escapeHtml(turn.playerInputSource)}</div>` : '',
    '</div>',
    renderObjectDetails('生成前可见事件', turn.preLlmEvents),
    renderStorylineBrief(scriptState, hasIssues),
    renderPlotPoint(output),
    renderNarrative(turn, output),
    choices.length > 0
      ? [
          '<div class="choice-group">',
          '<h3>本轮选项</h3>',
          ...choices.map(renderChoice),
          '</div>',
        ].join('\n')
      : '',
    '</main>',
    `<aside class="issues-panel ${hasIssues ? '' : 'clean'}">`,
    hasIssues
      ? ['<h3>本轮问题</h3>', ...issuesForTurn.map((issue) => renderIssueCard(issue, issueIndexByObject.get(issue)))].join('\n')
      : '<h3>本轮未标记问题</h3><p>consistency review 没有在这一轮记录 issue。</p>',
    '</aside>',
    '</div>',
    '</section>',
  ].join('\n');
}

function renderHtml(data) {
  const {
    runId,
    groupDir,
    runConfig,
    summary,
    issues,
    turns,
    outputsByTurn,
    scriptStatesByTurn,
    mode,
  } = data;

  const metrics = buildMetrics(summary, issues, turns, mode);
  const issuesByTurn = Map.groupBy
    ? Map.groupBy(issues, (issue) => issue.turn)
    : issues.reduce((map, issue) => {
        const existing = map.get(issue.turn) ?? [];
        existing.push(issue);
        map.set(issue.turn, existing);
        return map;
      }, new Map());
  const issueIndexByObject = new Map(issues.map((issue, index) => [issue, issueId(issue, index)]));
  const severityCounts = countBy(issues, (issue) => issue.severity);
  const scopeCounts = countBy(issues, (issue) => issue.scope);
  const typeCounts = countBy(issues, (issue) => issue.type);
  const title = `互动叙事一致性审阅 · ${runConfig?.choiceStrategy ?? 'unknown'} · ${runDisplayName(runId)}`;
  const nav = issues.map((issue, index) => {
    const id = issueId(issue, index);
    return `<a class="nav-issue severity-${escapeHtml(issue.severity)}" href="#${escapeHtml(id)}"><span>T${escapeHtml(issue.turn)}</span><b>${escapeHtml(issueTypeLabel(issue.type))}</b></a>`;
  });

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} 气泡对照报告</title>
<style>
:root { --bg:#f6f7f9; --panel:#ffffff; --ink:#1f2933; --muted:#667085; --line:#d9dee7; --player:#e8f3ff; --choice:#edf7ed; --issue:#fff1f1; --issue-line:#ef9a9a; --medium:#ffb55a; --low:#7aa7d9; --high:#e85d5d; --good:#dfeee7; --shadow:0 8px 24px rgba(35,45,62,.08); }
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif; color:var(--ink); background:var(--bg); line-height:1.65; }
.shell { max-width:1440px; margin:0 auto; padding:24px; }
.hero { background:var(--panel); border:1px solid var(--line); box-shadow:var(--shadow); padding:22px; border-radius:8px; position:sticky; top:0; z-index:5; }
.hero h1 { margin:0 0 10px; font-size:24px; }
.hero p { margin:0; color:var(--muted); }
.metrics { display:grid; grid-template-columns:repeat(6,minmax(120px,1fr)); gap:10px; margin-top:16px; }
.metric { border:1px solid var(--line); border-radius:8px; padding:10px 12px; background:#fbfcfe; }
.metric span { display:block; color:var(--muted); font-size:12px; }
.metric strong { display:block; font-size:22px; line-height:1.25; }
.submetrics { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; color:var(--muted); font-size:13px; }
.submetrics span { border:1px solid var(--line); background:#fbfcfe; border-radius:999px; padding:5px 9px; }
.nav-strip { display:flex; gap:8px; overflow:auto; padding:14px 0 2px; }
.nav-issue { flex:0 0 auto; text-decoration:none; color:var(--ink); border:1px solid var(--line); border-radius:999px; padding:7px 10px; background:#fff; display:flex; gap:7px; align-items:center; font-size:13px; }
.nav-issue span { font-weight:700; }
.severity-high { border-color:var(--high) !important; background:#fff0f0 !important; }
.severity-medium { border-color:var(--medium) !important; background:#fff8ec !important; }
.severity-low { border-color:#b7cde5 !important; background:#f5f9ff !important; }
.turn-card { margin-top:18px; background:var(--panel); border:1px solid var(--line); box-shadow:var(--shadow); border-radius:8px; overflow:clip; }
.turn-card.has-issue { border-color:#edb7b7; }
.turn-header { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:14px 18px; border-bottom:1px solid var(--line); background:#fbfcfe; }
.turn-kicker { color:var(--muted); font-size:12px; text-transform:uppercase; }
h2 { margin:0; font-size:24px; }
.turn-badges { display:flex; flex-wrap:wrap; gap:8px; justify-content:flex-end; }
.issue-pill,.clean-pill { text-decoration:none; color:var(--ink); border:1px solid var(--line); border-radius:999px; padding:6px 10px; background:#fff; font-size:13px; }
.clean-pill { background:var(--good); }
.turn-grid { display:grid; grid-template-columns:minmax(0,1fr) 410px; gap:0; }
.conversation { padding:18px; border-right:1px solid var(--line); }
.bubble { max-width:880px; border:1px solid var(--line); border-radius:8px; padding:12px 14px; margin:0 0 12px; background:#fff; }
.bubble.player { margin-left:auto; background:var(--player); border-color:#b7d7f4; }
.narration-block { max-width:980px; padding:4px 4px 8px 4px; margin:0 0 8px; color:#27313f; line-height:1.7; }
.speaker { display:flex; align-items:baseline; gap:8px; margin-bottom:5px; font-weight:700; color:#344054; }
.bubble-text { white-space:pre-wrap; }
.narrative-flow { display:block; }
.narrative-paragraph { margin:0; white-space:normal; }
.narrative-paragraph + .narrative-paragraph { margin-top:4px; }
.narrative-paragraph.dialogue { border-left:3px solid #bfd7f4; padding:2px 5px; background:#fbfdff; border-radius:6px; }
.dialogue-speaker { display:inline-flex; align-items:center; gap:4px; margin-bottom:0; color:#47657f; font-size:12px; font-weight:700; line-height:1.2; }
.dialogue-speaker b { color:var(--muted); font-weight:600; }
.paragraph-text { white-space:pre-wrap; margin:0; }
.source-note { color:var(--muted); font-size:12px; margin-top:6px; }
.choice-group { margin-top:18px; padding-top:12px; border-top:1px dashed var(--line); }
.choice-group h3 { margin:0 0 10px; font-size:15px; color:var(--muted); }
.choice-line { display:grid; grid-template-columns:28px minmax(0,1fr); gap:8px; border:1px solid #bfdcc2; background:var(--choice); border-radius:8px; padding:8px 10px; margin-bottom:8px; }
.choice-line span { width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; border-radius:999px; background:#fff; color:#527a56; font-weight:700; }
.choice-line small { display:block; color:var(--muted); font-weight:500; margin-top:3px; }
.events,.director-brief { border:1px dashed var(--line); border-radius:8px; margin:0 0 12px; padding:8px 12px; background:#fbfcfe; }
.events summary,.director-brief summary { cursor:pointer; color:var(--muted); font-weight:700; }
.events pre { white-space:pre-wrap; overflow:auto; max-height:260px; background:rgba(127,127,127,.08); padding:8px; border-radius:6px; }
.director-brief p { margin:8px 0; }
.director-brief dl { display:grid; grid-template-columns:90px minmax(0,1fr); gap:4px 10px; margin:8px 0; }
.director-brief dt { color:var(--muted); font-weight:700; }
.director-brief dd { margin:0; }
.storyline-brief { border:1px solid #cdd7e3; border-radius:8px; margin:0 0 12px; padding:9px 12px; background:#f8fbff; }
.storyline-brief summary { cursor:pointer; color:#3d556f; font-weight:800; }
.storyline-meta { margin:8px 0 10px; color:var(--muted); font-size:13px; }
.storyline-section { border-top:1px dashed #cdd7e3; padding-top:8px; margin-top:8px; }
.storyline-section h4 { margin:0 0 5px; color:#3d556f; font-size:13px; }
.storyline-section p { margin:0; white-space:pre-wrap; }
.detail-list h4 { margin:10px 0 4px; color:var(--muted); font-size:13px; }
.detail-list ul { margin:0 0 8px 18px; padding:0; }
.character-beat { border:1px solid var(--line); background:#fff; border-radius:6px; padding:8px 10px; margin:0 0 8px; }
.character-beat div { display:grid; grid-template-columns:72px minmax(0,1fr); gap:8px; margin:4px 0; }
.character-beat span { color:var(--muted); font-weight:700; font-size:12px; }
.character-beat p { margin:0; }
.issues-panel { padding:18px; background:#fffafa; }
.issues-panel.clean { background:#fbfdfc; color:var(--muted); }
.issues-panel h3 { margin:0 0 12px; font-size:16px; }
.issue-card { border:1px solid var(--issue-line); border-radius:8px; padding:12px; background:var(--issue); margin-bottom:12px; }
.issue-head { display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:10px; }
.issue-head span { color:var(--muted); font-size:13px; white-space:nowrap; }
dl { margin:0; }
dt { margin-top:10px; color:#8a3f3f; font-weight:700; font-size:13px; }
dd { margin:3px 0 0; color:#344054; }
.muted { color:var(--muted); }
.footer { color:var(--muted); font-size:12px; padding:20px 4px; text-align:center; }
@media (max-width:980px) { .shell{padding:12px;} .hero{position:static;} .metrics{grid-template-columns:repeat(2,minmax(120px,1fr));} .turn-grid{grid-template-columns:1fr;} .conversation{border-right:0; border-bottom:1px solid var(--line);} .bubble,.narration-block{max-width:100%;} }
</style>
</head>
<body>
<div class="shell">
  <section class="hero">
    <h1>${escapeHtml(title)} 气泡对照报告</h1>
    <p>Run：${escapeHtml(runId)} · ${escapeHtml(mode)} consistency 版 · 来源：${escapeHtml(path.relative(groupDir, path.join(groupDir, 'consistency-review', runId, 'visible-timeline.jsonl')))} + issues.json + run log</p>
    <div class="metrics">
      <div class="metric"><span>首次问题轮次</span><strong>${escapeHtml(metrics.firstIssueTurn ?? '无')}</strong></div>
      <div class="metric"><span>问题轮次数</span><strong>${escapeHtml(metrics.issueTurnCount)}</strong></div>
      <div class="metric"><span>问题总数</span><strong>${escapeHtml(metrics.issueCount)}</strong></div>
      <div class="metric"><span>高严重度</span><strong>${escapeHtml(metrics.highCount)}</strong></div>
      <div class="metric"><span>中严重度</span><strong>${escapeHtml(metrics.mediumCount)}</strong></div>
      <div class="metric"><span>总轮次</span><strong>${escapeHtml(metrics.turnCount)}</strong></div>
    </div>
    <div class="submetrics">
      <span>模式：${escapeHtml(runConfig?.choiceStrategy ?? 'unknown')}</span>
      <span>模型：${escapeHtml(runConfig?.model?.model ?? 'unknown')}</span>
      <span>recentTurns：${escapeHtml(runConfig?.memory?.recentTurnLimit ?? 'unknown')}</span>
      <span>scope：${escapeHtml(formatCountMap(scopeCounts, scopeLabel))}</span>
      <span>类型：${escapeHtml(formatCountMap(typeCounts, issueTypeLabel))}</span>
      <span>严重度：${escapeHtml(formatCountMap(severityCounts, severityLabel))}</span>
    </div>
    <div class="nav-strip" aria-label="问题轮次导航">${nav.length > 0 ? nav.join('') : '<span class="clean-pill">没有 issue</span>'}</div>
  </section>
  ${turns.map((turn) => renderTurn(turn, outputsByTurn.get(turn.turn), scriptStatesByTurn.get(turn.turn), issuesByTurn.get(turn.turn) ?? [], issueIndexByObject)).join('\n')}
  <footer class="footer">Generated from ${escapeHtml(path.basename(groupDir))} · ${escapeHtml(mode)} consistency review</footer>
</div>
</body>
</html>
`;
}

function loadRunData(groupDir, runId, mode) {
  const runDir = path.join(groupDir, 'run_logs', runId);
  const reviewDir = path.join(groupDir, 'consistency-review', runId);
  const timelinePath = path.join(reviewDir, 'visible-timeline.jsonl');
  const issuesPath = mode === 'visibleText'
    ? path.join(reviewDir, 'issues-visible-text.json')
    : path.join(reviewDir, 'issues.json');
  const fallbackIssuesPath = path.join(reviewDir, 'issues.json');

  if (!fs.existsSync(runDir)) throw new Error(`Missing run log directory: ${runDir}`);
  if (!fs.existsSync(reviewDir)) throw new Error(`Missing consistency review directory: ${reviewDir}`);
  if (!fs.existsSync(timelinePath)) throw new Error(`Missing visible timeline: ${timelinePath}`);

  const turns = readJsonl(timelinePath);
  const issues = fs.existsSync(issuesPath) ? readJson(issuesPath) : readJson(fallbackIssuesPath);
  const summary = readJsonIfExists(path.join(reviewDir, 'summary.json'), {});
  const runConfig = readJsonIfExists(path.join(runDir, '00-run-config.json'), {});
  const outputsByTurn = new Map(turns.map((turn) => [turn.turn, loadTurnOutput(runDir, turn.turn)]));
  const scriptStatesByTurn = new Map(turns.map((turn) => [turn.turn, loadTurnScriptState(runDir, turn.turn)]));

  return {
    runId,
    groupDir,
    runDir,
    reviewDir,
    runConfig,
    summary,
    issues,
    turns,
    outputsByTurn,
    scriptStatesByTurn,
    mode,
  };
}

function renderRun(groupDir, runId, options) {
  const data = loadRunData(groupDir, runId, options.mode);
  const html = renderHtml(data);
  const outputName = options.outputName ?? DEFAULT_OUTPUT_NAMES[options.mode];
  const outputPath = path.join(data.reviewDir, outputName);
  fs.writeFileSync(outputPath, html);
  return outputPath;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args._.length === 0) {
    console.log(usage());
    return;
  }

  const groupDir = normalizeGroupDir(args._[0]);
  const runLogsDir = path.join(groupDir, 'run_logs');
  const reviewRoot = path.join(groupDir, 'consistency-review');
  if (!fs.existsSync(runLogsDir)) throw new Error(`Missing run_logs directory: ${runLogsDir}`);
  if (!fs.existsSync(reviewRoot)) throw new Error(`Missing consistency-review directory: ${reviewRoot}`);

  const runIds = args.runIds.length > 0 ? args.runIds : listDirectories(runLogsDir);
  if (runIds.length === 0) throw new Error(`No runs found under ${runLogsDir}`);

  const outputs = [];
  for (const runId of runIds) {
    const outputPath = renderRun(groupDir, runId, args);
    outputs.push(outputPath);
  }

  for (const outputPath of outputs) {
    console.log(outputPath);
  }
}

main();
