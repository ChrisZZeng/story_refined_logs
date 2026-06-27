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

async function writeRunFixture(logGroupDir, runId) {
  const runDir = path.join(logGroupDir, 'run_logs', runId);
  const reviewDir = path.join(logGroupDir, 'consistency-review', runId);
  await mkdir(runDir, { recursive: true });
  await mkdir(reviewDir, { recursive: true });
  await writeJson(path.join(runDir, '00-run-config.json'), {});

  for (let turn = 1; turn <= 4; turn += 1) {
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
    {
      id: 'issue-001',
      turn: 4,
      type: 'continuity',
      currentEvidence: 'issue A',
    },
  ]);

  await writeFile(
    path.join(reviewDir, 'visible-timeline.jsonl'),
    [1, 2, 3, 4]
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

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
