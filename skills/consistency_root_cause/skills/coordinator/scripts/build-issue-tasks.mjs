#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function usage() {
  console.error(`Usage:
  node build-issue-tasks.mjs <analysis-dir>

Reads <analysis-dir>/issue-plan.json and writes batches/<batch-id>/task.md plus batch-issues.json.
`);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function issueDirName(issue) {
  const turn = issue.turn == null ? 'unknown' : String(issue.turn).padStart(2, '0');
  return `issue-${String(issue.issueIndex).padStart(3, '0')}-turn-${turn}`;
}

function issueLine(issue) {
  const bits = [
    `issueIndex=${issue.issueIndex}`,
    `turn=${issue.turn ?? 'unknown'}`,
    `severity=${issue.severity}`,
    `type=${issue.type}`,
  ];
  if (issue.scope) bits.push(`scope=${issue.scope}`);
  return `- ${bits.join(', ')}：${issue.summary || '无摘要'}`;
}

function makeTask(plan, batch, batchDir, batchIssuesPath) {
  return `请使用这个 skill 分析一个互动叙事一致性问题批次的根因：
${plan.issueTracerSkill}

运行目录：
${plan.runDir}

一致性评测输出目录：
${plan.reviewDir}

玩家可见时间线：
${plan.timelinePath}

本批次 issue 列表：
${batchIssuesPath}

输出目录：
${batchDir}

批次说明：
${batch.reason}

本批次包含的 issue：
${batch.issues.map(issueLine).join('\n')}

要求：
- 必须逐条分析 batch-issues.json 中的每个 issue，包括 low。
- 每条 issue 都必须先做 issueValidity 判断：valid、questionable 或 invalid。
- 对 valid issue，必须追到 L3 root mechanism，不要停在 Director、Narrator、Choice、storyline、statefold、agent-system 或 recent-context。
- 对 questionable 或 invalid issue，也要写明为什么证据不足或为什么是评测误判。
- 每条 issue 都要生成独立目录：issues/issue-<index>-turn-<turn>/。
- 每条 issue 都要落盘 root-cause-report.md 和 root-cause-result.json。
- 可以使用 issue_tracer 的 build-trace-packet.mjs 为每条 issue 生成 trace packet。
- 分析必须综合玩家可见时间线、story state、Director/Narrator/Choice prompt、LLM calls、output、events 和 runtime-after 中必要的 artifact。
- 不要用隐藏信息倒推玩家可见错误；只有先用玩家可见证据确认问题成立后，才能使用内部 artifact 追根因。
- 报告用中文编写，enum、机制标签、字段名和文件路径保持英文。
- 完成后生成 batch-root-cause-summary.md 和 batch-root-cause-summary.json，汇总本批次每条 issue 的 validity、rootCause.label、family、confidence 和报告路径。
`;
}

async function main() {
  const analysisDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
  if (!analysisDir) {
    usage();
    process.exitCode = 1;
    return;
  }

  const planPath = path.join(analysisDir, 'issue-plan.json');
  const plan = await readJson(planPath);
  const batchesDir = path.join(analysisDir, 'batches');
  await mkdir(batchesDir, { recursive: true });

  for (const batch of plan.batches ?? []) {
    const batchDir = path.join(batchesDir, batch.batchId);
    const issuesDir = path.join(batchDir, 'issues');
    await mkdir(issuesDir, { recursive: true });

    const batchIssuesPath = path.join(batchDir, 'batch-issues.json');
    await writeFile(batchIssuesPath, `${JSON.stringify(batch.issues, null, 2)}\n`);

    for (const issue of batch.issues) {
      await mkdir(path.join(issuesDir, issueDirName(issue)), { recursive: true });
    }

    const task = makeTask(plan, batch, batchDir, batchIssuesPath);
    await writeFile(path.join(batchDir, 'task.md'), task);
    console.log(`Wrote ${path.join(batchDir, 'task.md')}`);
  }
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exitCode = 1;
});
