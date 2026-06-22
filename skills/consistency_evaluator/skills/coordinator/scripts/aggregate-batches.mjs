#!/usr/bin/env node
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = { reviewDir: argv[0] };
  if (!args.reviewDir) {
    throw new Error('Usage: aggregate-batches.mjs <review-dir>');
  }
  return args;
}

async function readJsonIfExists(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw new Error(`Failed to read JSON: ${filePath}\n${error.message}`);
  }
}

async function readRequiredJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Missing required JSON file: ${filePath}`);
    }
    throw new Error(`Failed to read JSON: ${filePath}\n${error.message}`);
  }
}

async function readTimelineTurnCount(reviewDir) {
  try {
    const content = await readFile(path.join(reviewDir, 'visible-timeline.jsonl'), 'utf8');
    return content.split('\n').filter((line) => line.trim()).length;
  } catch (error) {
    if (error?.code === 'ENOENT') return 0;
    throw error;
  }
}

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 160);
}

function dedupeKey(issue) {
  return [
    issue.turn,
    issue.scope,
    issue.type,
    issue.source,
    normalizeText(issue.currentEvidence),
    normalizeText(issue.conflictingEvidence),
    normalizeText(issue.reason),
  ].join('|');
}

function mergeIssue(existing, next) {
  const conflictingTurns = new Set([
    ...(Array.isArray(existing.conflictingTurns) ? existing.conflictingTurns : []),
    ...(Array.isArray(next.conflictingTurns) ? next.conflictingTurns : []),
  ]);
  return {
    ...existing,
    conflictingTurns: [...conflictingTurns].sort((left, right) => left - right),
  };
}

function dedupeIssues(issues) {
  const byKey = new Map();
  for (const issue of issues) {
    const key = dedupeKey(issue);
    const existing = byKey.get(key);
    byKey.set(key, existing ? mergeIssue(existing, issue) : issue);
  }
  return [...byKey.values()].sort((left, right) => {
    const turnDiff = Number(left.turn ?? 0) - Number(right.turn ?? 0);
    if (turnDiff !== 0) return turnDiff;
    return String(left.type ?? '').localeCompare(String(right.type ?? ''));
  });
}

async function listBatchDirs(reviewDir, plan) {
  if (Array.isArray(plan?.batches)) {
    return plan.batches.map((batch) => path.join(reviewDir, batch.outputDir));
  }

  const batchesDir = path.join(reviewDir, 'batches');
  const entries = await readdir(batchesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(batchesDir, entry.name))
    .sort();
}

async function readBatchIssues(batchDir) {
  const issues = await readRequiredJson(path.join(batchDir, 'batch-issues.json'));
  if (!Array.isArray(issues)) {
    throw new Error(`batch-issues.json must be an array: ${batchDir}`);
  }
  return issues;
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = String(item?.[key] ?? 'unspecified');
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function inferRunDir(reviewDir) {
  return path.join(path.dirname(reviewDir), 'run');
}

function buildReportSummary({ reviewDir, runDir, turnCount, batchCount, issues, reportMode }) {
  const inconsistentTurns = [
    ...new Set(
      issues
        .filter((issue) => issue.source !== 'uncertain')
        .map((issue) => Number(issue.turn))
        .filter(Number.isFinite),
    ),
  ].sort((left, right) => left - right);
  const uncertainTurns = [
    ...new Set(
      issues
        .filter((issue) => issue.source === 'uncertain')
        .map((issue) => Number(issue.turn))
        .filter(Number.isFinite),
    ),
  ].sort((left, right) => left - right);

  return {
    runDir: runDir ?? inferRunDir(reviewDir),
    reportMode,
    turnCount,
    firstInconsistentTurn: inconsistentTurns[0] ?? null,
    inconsistentTurnCount: inconsistentTurns.length,
    issueCount: issues.length,
    issueScopeCounts: countBy(issues, 'scope'),
    uncertainTurnCount: uncertainTurns.length,
    inconsistentTurns,
    uncertainTurns,
    batchCount,
  };
}

function renderReportSummary(summary) {
  return `# 一致性评测汇总（${summary.reportMode}）

- 运行目录：${summary.runDir}
- 报告模式：${summary.reportMode}
- 总轮数：${summary.turnCount}
- 批次数：${summary.batchCount}
- 第一次出现问题的轮次：${summary.firstInconsistentTurn ?? '无'}
- 出现问题的轮次数：${summary.inconsistentTurnCount}
- 问题总数：${summary.issueCount}
- 问题 scope 分布：${JSON.stringify(summary.issueScopeCounts)}
- 不确定问题轮次数：${summary.uncertainTurnCount}
- 问题轮次：${summary.inconsistentTurns.length > 0 ? summary.inconsistentTurns.join(', ') : '无'}
- 不确定轮次：${summary.uncertainTurns.length > 0 ? summary.uncertainTurns.join(', ') : '无'}
`;
}

function renderCombinedSummary({ runDir, turnCount, batchCount, fullTurn, visibleText }) {
  return `# 一致性评测汇总

本次评测只跑一次 coordinator 和 batch reviewer。批次审阅会标注每条 issue 的 scope，聚合层再同时生成两种报告。

- 运行目录：${runDir}
- 总轮数：${turnCount}
- 批次数：${batchCount}

## visibleText 正文报告

- 第一次出现问题的轮次：${visibleText.firstInconsistentTurn ?? '无'}
- 出现问题的轮次数：${visibleText.inconsistentTurnCount}
- 问题总数：${visibleText.issueCount}
- 不确定问题轮次数：${visibleText.uncertainTurnCount}
- 问题轮次：${visibleText.inconsistentTurns.length > 0 ? visibleText.inconsistentTurns.join(', ') : '无'}

## fullTurn 完整玩家体验报告

- 第一次出现问题的轮次：${fullTurn.firstInconsistentTurn ?? '无'}
- 出现问题的轮次数：${fullTurn.inconsistentTurnCount}
- 问题总数：${fullTurn.issueCount}
- 问题 scope 分布：${JSON.stringify(fullTurn.issueScopeCounts)}
- 不确定问题轮次数：${fullTurn.uncertainTurnCount}
- 问题轮次：${fullTurn.inconsistentTurns.length > 0 ? fullTurn.inconsistentTurns.join(', ') : '无'}
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const reviewDir = path.resolve(args.reviewDir);
  const plan = await readJsonIfExists(path.join(reviewDir, 'batch-plan.json'), undefined);
  const batchDirs = await listBatchDirs(reviewDir, plan);
  const issueGroups = await Promise.all(batchDirs.map(readBatchIssues));
  const issues = dedupeIssues(issueGroups.flat());
  const visibleTextIssues = issues.filter((issue) => issue.scope === 'visibleText');
  const turnCount = plan?.turnCount ?? (await readTimelineTurnCount(reviewDir));
  const fullTurnSummary = buildReportSummary({
    reviewDir,
    runDir: plan?.runDir,
    turnCount,
    batchCount: batchDirs.length,
    issues,
    reportMode: 'fullTurn',
  });
  const visibleTextSummary = buildReportSummary({
    reviewDir,
    runDir: plan?.runDir,
    turnCount,
    batchCount: batchDirs.length,
    issues: visibleTextIssues,
    reportMode: 'visibleText',
  });
  const summary = {
    runDir: plan?.runDir ?? inferRunDir(reviewDir),
    turnCount,
    batchCount: batchDirs.length,
    reports: {
      visibleText: visibleTextSummary,
      fullTurn: fullTurnSummary,
    },
  };

  const combinedSummary = renderCombinedSummary({
    runDir: summary.runDir,
    turnCount,
    batchCount: batchDirs.length,
    visibleText: visibleTextSummary,
    fullTurn: fullTurnSummary,
  });

  await mkdir(reviewDir, { recursive: true });
  await writeFile(path.join(reviewDir, 'issues.json'), `${JSON.stringify(issues, null, 2)}\n`);
  await writeFile(path.join(reviewDir, 'issues-visible-text.json'), `${JSON.stringify(visibleTextIssues, null, 2)}\n`);
  await writeFile(path.join(reviewDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(path.join(reviewDir, 'summary.md'), combinedSummary);
  await writeFile(path.join(reviewDir, 'summary-full-turn.json'), `${JSON.stringify(fullTurnSummary, null, 2)}\n`);
  await writeFile(path.join(reviewDir, 'summary-full-turn.md'), renderReportSummary(fullTurnSummary));
  await writeFile(path.join(reviewDir, 'summary-visible-text.json'), `${JSON.stringify(visibleTextSummary, null, 2)}\n`);
  await writeFile(path.join(reviewDir, 'summary-visible-text.md'), renderReportSummary(visibleTextSummary));
  await writeFile(
    path.join(reviewDir, 'coordinator-method.md'),
    [
      '# 聚合方法',
      '',
      '本次聚合只读取各批次的结构化输出。',
      '去重依据为轮次、问题类型、来源、当前证据、冲突证据和原因的规范化文本。',
      '每条 issue 的 scope 用于生成两种报告：visibleText 正文报告只统计 scope 为 visibleText 的问题；fullTurn 完整玩家体验报告统计全部问题。',
      '如果某个问题证据存在争议，需要人工回到对应批次和原始日志抽查。',
      '',
    ].join('\n'),
  );

  console.log(
    JSON.stringify(
      {
        outDir: reviewDir,
        issueCount: issues.length,
        visibleTextIssueCount: visibleTextIssues.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
