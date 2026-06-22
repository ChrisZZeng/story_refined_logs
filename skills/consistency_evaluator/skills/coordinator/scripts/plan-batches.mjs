#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function parseArgs(argv) {
  const args = {
    timelinePath: undefined,
    outDir: undefined,
    runDir: undefined,
    initial: 10,
    context: 10,
    evalSize: 10,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--out-dir') args.outDir = argv[++i];
    else if (value === '--run-dir') args.runDir = argv[++i];
    else if (value === '--initial') args.initial = Number(argv[++i]);
    else if (value === '--context') args.context = Number(argv[++i]);
    else if (value === '--eval-size') args.evalSize = Number(argv[++i]);
    else if (!args.timelinePath) args.timelinePath = value;
  }

  if (!args.timelinePath) {
    throw new Error('Usage: plan-batches.mjs <visible-timeline.jsonl> [--out-dir <review-dir>] [--run-dir <run-dir>]');
  }
  return args;
}

async function readJsonl(filePath) {
  const content = await readFile(filePath, 'utf8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function buildBatches(turns, options) {
  const firstTurn = turns[0];
  const lastTurn = turns.at(-1);
  const batches = [];

  let evalStart = firstTurn;
  let batchIndex = 1;

  while (evalStart <= lastTurn) {
    const isFirstBatch = batchIndex === 1;
    const evalEnd = Math.min(
      evalStart + (isFirstBatch ? options.initial : options.evalSize) - 1,
      lastTurn,
    );
    const windowStart = isFirstBatch ? evalStart : Math.max(firstTurn, evalStart - options.context);
    const windowEnd = evalEnd;
    const id = `batch-${String(batchIndex).padStart(3, '0')}`;

    batches.push({
      id,
      windowRange: { start: windowStart, end: windowEnd },
      evalRange: { start: evalStart, end: evalEnd },
    });

    evalStart = evalEnd + 1;
    batchIndex += 1;
  }

  return batches;
}

function createTask({ batch, runDir, timelinePath, outDir, batchReviewerSkill }) {
  return `请使用这个 skill 审阅一个互动叙事一致性批次：
${batchReviewerSkill}

运行目录：
${runDir ?? '未指定；只使用玩家可见时间线和任务给定窗口审阅'}

玩家可见时间线：
${timelinePath}

窗口范围：
${batch.windowRange.start}-${batch.windowRange.end}

重点评估范围：
${batch.evalRange.start}-${batch.evalRange.end}

输出目录：
${outDir}

要求：
- 只统计重点评估范围内的问题。
- 窗口上文只作为上下文和冲突证据。
- 审阅完整玩家可见 turn，包括 visibleText、choices 和 preLlmEvents。
- 每条 issue 必须写 scope 字段：visibleText、choices、preLlmEvents 或 mixed。
- 可以按需回查完整玩家可见时间线，但不要通读完整运行正文。
- 按 skill 的输出约定落盘 batch-issues.json、batch-summary.json 和 batch-summary.md。
`;
}

function inferRunDir({ timelinePath, outDir }) {
  const timelineName = path.basename(timelinePath);
  const timelineParent = path.dirname(timelinePath);
  if (timelineName === 'visible-timeline.jsonl' && path.resolve(timelineParent) === path.resolve(outDir)) {
    return path.join(path.dirname(outDir), 'run');
  }
  return undefined;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const timelinePath = path.resolve(args.timelinePath);
  const outDir = path.resolve(args.outDir ?? path.dirname(timelinePath));
  const records = await readJsonl(timelinePath);
  const turns = [...new Set(records.map((record) => Number(record.turn)).filter(Number.isFinite))].sort(
    (left, right) => left - right,
  );

  if (turns.length === 0) {
    throw new Error(`No turns found in ${timelinePath}`);
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const batchReviewerSkill = path.resolve(scriptDir, '../../batch_reviewer/SKILL.md');
  const runDir = args.runDir ? path.resolve(args.runDir) : inferRunDir({ timelinePath, outDir });
  const batches = buildBatches(turns, args).map((batch) => ({
    ...batch,
    outputDir: path.relative(outDir, path.join(outDir, 'batches', batch.id)),
    taskPath: path.relative(outDir, path.join(outDir, 'batches', batch.id, 'task.md')),
  }));

  await mkdir(path.join(outDir, 'batches'), { recursive: true });

  for (const batch of batches) {
    const batchOutDir = path.join(outDir, batch.outputDir);
    await mkdir(batchOutDir, { recursive: true });
    await writeFile(
      path.join(outDir, batch.taskPath),
      createTask({
        batch,
        runDir,
        timelinePath,
        outDir: batchOutDir,
        batchReviewerSkill,
      }),
    );
  }

  const plan = {
    runDir: runDir ?? null,
    timelinePath,
    turnCount: turns.length,
    initial: args.initial,
    context: args.context,
    evalSize: args.evalSize,
    batches,
  };

  await writeFile(path.join(outDir, 'batch-plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
  console.log(JSON.stringify({ outDir, batchCount: batches.length }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
