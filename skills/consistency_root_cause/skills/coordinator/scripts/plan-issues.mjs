#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultIssueTracerSkill = path.resolve(scriptDir, '../../issue_tracer/SKILL.md');

function usage() {
  console.error(`Usage:
  node plan-issues.mjs <consistency-review-dir> --run-dir <run-dir> --out-dir <analysis-dir>

Options:
  --issues-file <path>          Defaults to <review-dir>/issues.json, then issues-visible-text.json
  --timeline <path>             Defaults to <review-dir>/visible-timeline.jsonl
  --issue-tracer-skill <path>   Defaults to sibling issue_tracer/SKILL.md
  --max-issues-per-batch <n>    Defaults to 4
`);
}

function parseArgs(argv) {
  const positional = [];
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      opts[key] = true;
    } else {
      opts[key] = next;
      i += 1;
    }
  }
  return { positional, opts };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function firstExisting(candidates) {
  for (const candidate of candidates) {
    try {
      await readFile(candidate, 'utf8');
      return candidate;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  return null;
}

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function textFromIssue(issue) {
  const raw =
    issue.summary ??
    issue.reason ??
    issue.description ??
    issue.problem ??
    issue.currentEvidence ??
    issue.message ??
    '';
  return String(raw).replace(/\s+/g, ' ').trim();
}

function normalizeIssue(issue, index) {
  const turn =
    asNumber(issue.turn) ??
    asNumber(issue.turnNumber) ??
    asNumber(issue.startTurn) ??
    asNumber(issue.round);
  return {
    issueIndex: index + 1,
    turn,
    severity: String(issue.severity ?? issue.level ?? issue.rating ?? 'unknown'),
    type: String(issue.type ?? issue.category ?? issue.issueType ?? 'unknown'),
    scope: issue.scope ? String(issue.scope) : undefined,
    summary: textFromIssue(issue),
    sourceIssue: issue,
  };
}

function issueSortKey(issue) {
  return [issue.turn ?? Number.MAX_SAFE_INTEGER, issue.issueIndex];
}

function compareIssues(a, b) {
  const ka = issueSortKey(a);
  const kb = issueSortKey(b);
  return ka[0] - kb[0] || ka[1] - kb[1];
}

function groupByTurn(issues) {
  const groups = [];
  for (const issue of issues) {
    const last = groups.at(-1);
    if (last && last.turn === issue.turn) {
      last.issues.push(issue);
    } else {
      groups.push({ turn: issue.turn, issues: [issue] });
    }
  }
  return groups;
}

function hasHigh(group) {
  return group.issues.some((issue) => issue.severity === 'high');
}

function makeBatches(issues, maxIssuesPerBatch) {
  const batches = [];
  let current = [];
  let currentTurns = [];

  function flush(reason = '按 turn 顺序自动切分，控制单个 subagent 的分析负载。') {
    if (current.length === 0) return;
    batches.push({
      batchId: `batch-${String(batches.length + 1).padStart(3, '0')}`,
      reason,
      turnRange: {
        start: currentTurns[0] ?? null,
        end: currentTurns.at(-1) ?? null,
      },
      issues: current,
    });
    current = [];
    currentTurns = [];
  }

  for (const group of groupByTurn(issues)) {
    if (hasHigh(group)) {
      flush();
      batches.push({
        batchId: `batch-${String(batches.length + 1).padStart(3, '0')}`,
        reason: '包含 high severity issue；同一 turn 的问题放在一起，避免重复读取同一轮证据。',
        turnRange: { start: group.turn, end: group.turn },
        issues: group.issues,
      });
      continue;
    }

    if (current.length > 0 && current.length + group.issues.length > maxIssuesPerBatch) {
      flush();
    }
    current.push(...group.issues);
    currentTurns.push(group.turn);
  }
  flush();

  return batches;
}

function serializableIssue(issue) {
  return Object.fromEntries(
    Object.entries(issue).filter(([key, value]) => key !== 'sourceIssue' && value !== undefined),
  );
}

async function main() {
  const { positional, opts } = parseArgs(process.argv.slice(2));
  const reviewDir = positional[0] ? path.resolve(positional[0]) : null;
  if (!reviewDir || !opts['run-dir']) {
    usage();
    process.exitCode = 1;
    return;
  }

  const runDir = path.resolve(String(opts['run-dir']));
  const analysisDir = path.resolve(String(opts['out-dir'] ?? path.join(reviewDir, 'root-cause-analysis')));
  const issuesFile = opts['issues-file']
    ? path.resolve(String(opts['issues-file']))
    : await firstExisting([
        path.join(reviewDir, 'issues.json'),
        path.join(reviewDir, 'issues-visible-text.json'),
      ]);
  if (!issuesFile) {
    throw new Error(`Cannot find issues.json or issues-visible-text.json in ${reviewDir}`);
  }

  const timelinePath = path.resolve(
    String(opts.timeline ?? path.join(reviewDir, 'visible-timeline.jsonl')),
  );
  const issueTracerSkill = path.resolve(String(opts['issue-tracer-skill'] ?? defaultIssueTracerSkill));
  const maxIssuesPerBatch = Number(opts['max-issues-per-batch'] ?? 4);
  if (!Number.isInteger(maxIssuesPerBatch) || maxIssuesPerBatch < 1) {
    throw new Error('--max-issues-per-batch must be a positive integer');
  }

  const rawIssues = await readJson(issuesFile);
  if (!Array.isArray(rawIssues)) {
    throw new Error(`${issuesFile} must contain a JSON array`);
  }

  const issues = rawIssues.map(normalizeIssue).sort(compareIssues);
  const batches = makeBatches(issues, maxIssuesPerBatch).map((batch) => ({
    ...batch,
    issues: batch.issues.map(serializableIssue),
  }));

  const plan = {
    generatedAt: new Date().toISOString(),
    runDir,
    reviewDir,
    analysisDir,
    issuesFile,
    timelinePath,
    issueTracerSkill,
    maxIssuesPerBatch,
    issueCount: issues.length,
    batchCount: batches.length,
    batches,
  };

  await mkdir(analysisDir, { recursive: true });
  await writeFile(path.join(analysisDir, 'issue-plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
  console.log(`Wrote ${path.join(analysisDir, 'issue-plan.json')}`);
  console.log(`Issues: ${issues.length}; batches: ${batches.length}`);
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exitCode = 1;
});
