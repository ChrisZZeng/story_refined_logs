import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  readCaseArtifact,
  readReplaySummary,
  readRunArtifact,
} from '../../scripts/prompt-replay-workbench/artifact-reader.mjs';

test('readReplaySummary loads summary and exposes result identity', async () => {
  const resultDir = await writeReplayArtifacts();

  const summary = await readReplaySummary({ resultDir });

  assert.equal(summary.replayId, 'replay-a');
  assert.equal(summary.resultDir, resultDir);
  assert.equal(summary.cases.length, 1);
});

test('readCaseArtifact loads context, aggregate summary, and repeated runs', async () => {
  const resultDir = await writeReplayArtifacts();

  const artifact = await readCaseArtifact({ resultDir, turn: 5 });

  assert.equal(artifact.turn, 5);
  assert.equal(artifact.context.turn, 5);
  assert.equal(artifact.aggregate.passRate, 0.5);
  assert.deepEqual(
    artifact.runs.map((run) => run.runIndex),
    [1, 2],
  );
});

test('readRunArtifact loads repeated run output, calls, and issue judge results', async () => {
  const resultDir = await writeReplayArtifacts();

  const artifact = await readRunArtifact({ resultDir, turn: 5, runIndex: 2 });

  assert.equal(artifact.turn, 5);
  assert.equal(artifact.runIndex, 2);
  assert.equal(artifact.output.normalizedContent.visibleText, 'new text 2');
  assert.equal(artifact.llmCalls[0].stage, 'director');
  assert.equal(artifact.issues[0].issueId, 'issue-001');
  assert.equal(artifact.issues[0].judgeResult.verdict, 'regressed');
});

test('readRunArtifact supports legacy single-run case directory', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'artifact-reader-legacy-'));
  const resultDir = path.join(root, 'replay-a');
  const caseDir = path.join(resultDir, 'cases', 'turn-005');
  await mkdir(path.join(caseDir, 'issues', 'issue-001'), { recursive: true });
  await writeJson(path.join(caseDir, 'new-04-output.json'), {
    normalizedContent: { visibleText: 'legacy new text' },
  });
  await writeJson(path.join(caseDir, 'llm-calls.json'), [{ stage: 'choice' }]);
  await writeJson(path.join(caseDir, 'issues', 'issue-001', 'judge-result.json'), {
    verdict: 'fixed',
  });

  const artifact = await readRunArtifact({ resultDir, turn: 5, runIndex: 1 });

  assert.equal(artifact.output.normalizedContent.visibleText, 'legacy new text');
  assert.equal(artifact.llmCalls[0].stage, 'choice');
  assert.equal(artifact.issues[0].issueId, 'issue-001');
});

async function writeReplayArtifacts() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'artifact-reader-'));
  const resultDir = path.join(root, 'replay-a');
  const caseDir = path.join(resultDir, 'cases', 'turn-005');
  await mkdir(caseDir, { recursive: true });
  await writeJson(path.join(resultDir, 'summary.json'), {
    replayId: 'replay-a',
    resultDir,
    cases: [{ turn: 5, passRate: 0.5 }],
  });
  await writeJson(path.join(caseDir, 'turn-replay-context.json'), {
    turn: 5,
    originalOutput: { normalizedContent: { visibleText: 'old text' } },
  });
  await writeJson(path.join(caseDir, 'aggregate-summary.json'), {
    turn: 5,
    passRate: 0.5,
  });

  for (const runIndex of [1, 2]) {
    const runDir = path.join(caseDir, 'runs', `run-${String(runIndex).padStart(3, '0')}`);
    await mkdir(path.join(runDir, 'issues', 'issue-001'), { recursive: true });
    await writeJson(path.join(runDir, 'new-04-output.json'), {
      normalizedContent: { visibleText: `new text ${runIndex}` },
    });
    await writeJson(path.join(runDir, 'llm-calls.json'), [{ stage: 'director', runIndex }]);
    await writeJson(path.join(runDir, 'issues', 'issue-001', 'judge-result.json'), {
      verdict: runIndex === 1 ? 'fixed' : 'regressed',
    });
  }

  return resultDir;
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
