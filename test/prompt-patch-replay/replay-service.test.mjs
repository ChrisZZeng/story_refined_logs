import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { runPromptPatchReplay } from '../../scripts/prompt-patch-replay/replay-service.mjs';

test('runPromptPatchReplay writes context-only dry-run artifacts and returns paths', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-service-'));
  const logGroupDir = path.join(root, 'abcdef0-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId);
  const taskPath = path.join(root, 'replay-task.yaml');
  await writeFile(
    taskPath,
    [
      'replayId: service-dry-run',
      'caseSet:',
      `  logGroupDir: ${JSON.stringify(logGroupDir)}`,
      `  runId: ${runId}`,
      '  turns: [4]',
      'source:',
      '  oreturnRepo: /tmp/oreturn-does-not-need-to-exist-for-context-only',
      'models:',
      '  replay: { baseUrl: http://llm/v1, apiKeyEnv: REPLAY_KEY, model: replay-model }',
      '  judge: { useReplayModel: true }',
      'patchBundle:',
      '  id: bundle-a',
      '  patches:',
      '    - id: rule-a',
      '      originalText: old prompt',
      '      replacementText: new prompt',
      '',
    ].join('\n'),
  );

  const result = await runPromptPatchReplay({
    configPath: taskPath,
    dryRunContextOnly: true,
    cwd: process.cwd(),
  });

  assert.equal(result.replayId, 'service-dry-run');
  assert.match(result.resultDir, /prompt-patch-replay\/service-dry-run$/);
  assert.equal(result.summaryPath, path.join(result.resultDir, 'summary.md'));

  const summary = JSON.parse(await readFile(path.join(result.resultDir, 'summary.json'), 'utf8'));
  assert.equal(summary.replayId, 'service-dry-run');
  assert.equal(summary.turnCount, 1);
  assert.equal(summary.issueCount, 1);
  assert.equal(summary.cases[0].status, 'context-only');

  const sourceVersion = JSON.parse(
    await readFile(path.join(result.resultDir, 'resolved-source-version.json'), 'utf8'),
  );
  assert.equal(sourceVersion.sourceOreturnCommit, 'abcdef0');
  assert.equal(sourceVersion.dryRunContextOnly, true);

  const context = JSON.parse(
    await readFile(
      path.join(result.resultDir, 'cases', 'turn-004', 'turn-replay-context.json'),
      'utf8',
    ),
  );
  assert.equal(context.turn, 4);
  assert.equal(context.issues.length, 1);
});

test('runPromptPatchReplay starts badcase turns concurrently and preserves summary order', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-service-parallel-'));
  const logGroupDir = path.join(root, 'abcdef0-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId, { maxTurn: 5, issueTurns: [4, 5] });
  const taskPath = path.join(root, 'replay-task.yaml');
  await writeFile(
    taskPath,
    [
      'replayId: service-parallel',
      'caseSet:',
      `  logGroupDir: ${JSON.stringify(logGroupDir)}`,
      `  runId: ${runId}`,
      '  turns: [4, 5]',
      'source:',
      '  oreturnRepo: /tmp/oreturn-faked-by-test',
      'models:',
      '  replay: { baseUrl: http://llm/v1, apiKeyEnv: REPLAY_KEY, model: replay-model }',
      '  judge: { useReplayModel: true }',
      'judgeMode: fake',
      'patchBundle:',
      '  id: bundle-a',
      '  patches:',
      '    - id: rule-a',
      '      originalText: old prompt',
      '      replacementText: new prompt',
      '',
    ].join('\n'),
  );

  const replayStarts = [];
  let resolveTurnFiveStarted;
  const turnFiveStarted = new Promise((resolve) => {
    resolveTurnFiveStarted = resolve;
  });

  const result = await runPromptPatchReplay({
    configPath: taskPath,
    cwd: process.cwd(),
    deps: {
      ensureOreturnReplayWorktree: () => ({
        sourceOreturnCommit: 'abcdef0',
        replayEngineOreturnCommit: 'abcdef0123456789',
        oreturnRepo: '/tmp/oreturn-faked-by-test',
        replayEngineOreturnRepo: '/tmp/oreturn-faked-by-test',
        managedWorktree: true,
        dirty: false,
        matched: true,
      }),
      runOreturnReplay: async ({ context }) => {
        replayStarts.push(context.turn);
        if (context.turn === 5) resolveTurnFiveStarted();
        if (context.turn === 4) {
          await Promise.race([
            turnFiveStarted,
            delay(75).then(() => {
              throw new Error('turn 5 did not start before turn 4 completed');
            }),
          ]);
        }
        return {
          newOutput: { normalizedContent: { visibleText: `new output ${context.turn}` } },
        };
      },
    },
  });

  assert.deepEqual([...replayStarts].sort((left, right) => left - right), [4, 5]);
  assert.deepEqual(result.summary.cases.map((item) => item.turn), [4, 5]);
  assert.deepEqual(result.summary.cases.map((item) => item.status), ['completed', 'completed']);
});

async function writeRunFixture(logGroupDir, runId, { maxTurn = 4, issueTurns = [4] } = {}) {
  const runDir = path.join(logGroupDir, 'run_logs', runId);
  const reviewDir = path.join(logGroupDir, 'consistency-review', runId);
  await mkdir(runDir, { recursive: true });
  await mkdir(reviewDir, { recursive: true });
  await writeJson(path.join(runDir, '00-run-config.json'), {});

  for (let turn = 1; turn <= maxTurn; turn += 1) {
    const turnDir = path.join(runDir, `turn-${String(turn).padStart(2, '0')}`);
    await mkdir(turnDir, { recursive: true });
    await writeJson(path.join(turnDir, '01-summary.json'), {
      turn,
      playerInput: `玩家输入 ${turn}`,
    });
    await writeJson(path.join(turnDir, '03-story-state.json'), {
      marker: `story-state-${turn}`,
    });
    await writeJson(path.join(turnDir, '04-output.json'), {
      normalizedContent: { visibleText: `正文 ${turn}` },
      choices: { options: [] },
    });
  }

  await writeJson(path.join(reviewDir, 'issues.json'), [
    ...issueTurns.map((turn, index) => ({
      id: `issue-${String(index + 1).padStart(3, '0')}`,
      turn,
      type: 'continuity',
      currentEvidence: `issue ${turn}`,
    })),
  ]);

  await writeFile(
    path.join(reviewDir, 'visible-timeline.jsonl'),
    Array.from({ length: maxTurn }, (_, index) => index + 1)
      .map((turn) =>
        JSON.stringify({
          turn,
          playerInput: `玩家输入 ${turn}`,
          visibleText: `正文 ${turn}`,
          choices: [],
        }),
      )
      .join('\n') + '\n',
  );
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
