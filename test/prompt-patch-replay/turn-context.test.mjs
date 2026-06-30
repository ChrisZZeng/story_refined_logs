import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { buildTurnReplayContext } from '../../scripts/prompt-patch-replay/turn-context.mjs';

test('buildTurnReplayContext builds input, issues, and visible context', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'story-replay-context-'));
  const logGroupDir = path.join(root, 'a4a2cfc1e411-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId);

  const context = await buildTurnReplayContext({ logGroupDir, runId, turn: 4 });

  assert.equal(context.caseId, 'turn-004');
  assert.deepEqual(context.turnInput, {
    trigger: { kind: 'player-input', playerInput: '玩家输入 4' },
  });
  assert.equal(context.issues.length, 2);
  assert.deepEqual(
    context.visibleContext.map((item) => item.turn),
    [1, 2, 3],
  );
  assert.equal(context.storyState.marker, 'story-state-4');
  assert.equal(context.originalOutput.normalizedContent.visibleText, '正文 4');
});

test('buildTurnReplayContext loads matching root cause reports', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'story-replay-context-'));
  const logGroupDir = path.join(root, 'a4a2cfc1e411-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId);
  await writeRootCauseFixture(logGroupDir, runId);

  const context = await buildTurnReplayContext({ logGroupDir, runId, turn: 4 });

  assert.equal(context.rootCauseReports.length, 2);
  assert.deepEqual(
    context.rootCauseReports.map((report) => report.issueIndex),
    [1, 2],
  );
  assert.match(context.sourceFiles.rootCauseSummary, /summary\.json$/);
});

test('buildTurnReplayContext falls back to selected previous choice', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'story-replay-context-'));
  const logGroupDir = path.join(root, 'a4a2cfc1e411-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId, { omitPlayerInputTurn: 4 });

  const context = await buildTurnReplayContext({ logGroupDir, runId, turn: 4 });

  assert.deepEqual(context.turnInput, {
    trigger: { kind: 'player-input', playerInput: '选择 4' },
  });
});

test('buildTurnReplayContext allows existing turns without matching issues', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'story-replay-context-'));
  const logGroupDir = path.join(root, 'a4a2cfc1e411-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId);

  const context = await buildTurnReplayContext({ logGroupDir, runId, turn: 3 });

  assert.equal(context.caseId, 'turn-003');
  assert.deepEqual(context.issues, []);
  assert.deepEqual(
    context.visibleContext.map((item) => item.turn),
    [1, 2],
  );
});

async function writeRunFixture(logGroupDir, runId, options = {}) {
  const runDir = path.join(logGroupDir, 'run_logs', runId);
  const reviewDir = path.join(logGroupDir, 'consistency-review', runId);
  await mkdir(runDir, { recursive: true });
  await mkdir(reviewDir, { recursive: true });

  for (let turn = 1; turn <= 4; turn += 1) {
    const turnDir = path.join(runDir, `turn-${String(turn).padStart(2, '0')}`);
    await mkdir(turnDir, { recursive: true });
    await writeJson(path.join(turnDir, '01-summary.json'), {
      turn,
      ...(options.omitPlayerInputTurn === turn ? {} : { playerInput: `玩家输入 ${turn}` }),
      selectedFromPreviousTurn: { text: `选择 ${turn}` },
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
      turn: 4,
      type: 'repeated-scene',
      severity: 'medium',
      currentEvidence: 'issue A',
      conflictingTurns: [1, 4],
    },
    {
      turn: 4,
      type: 'choices',
      severity: 'low',
      currentEvidence: 'issue B',
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

async function writeRootCauseFixture(logGroupDir, runId) {
  const rootCauseDir = path.join(logGroupDir, 'root-cause-analysis', runId);
  await mkdir(rootCauseDir, { recursive: true });
  await writeJson(path.join(rootCauseDir, 'summary.json'), {
    issues: [
      {
        issueIndex: 1,
        turn: 4,
        type: 'repeated-scene',
        rootCause: { label: 'director-anchor' },
      },
      {
        issueIndex: 2,
        turn: 4,
        type: 'choices',
        rootCause: { label: 'choice-binding' },
      },
      {
        issueIndex: 3,
        turn: 3,
        type: 'other',
        rootCause: { label: 'not-target' },
      },
    ],
  });
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
