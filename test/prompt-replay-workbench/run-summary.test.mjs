import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatRunResultText,
  runStatusFromSummary,
} from '../../scripts/prompt-replay-workbench/static/run-summary.js';

test('runStatusFromSummary reports failed replay attempts as failed, not completed', () => {
  const status = runStatusFromSummary({
    failedRuns: 3,
    runCount: 3,
    overallPassRate: 0,
  });

  assert.deepEqual(status, {
    text: 'Failed: 3/3 replay runs failed',
    state: 'error',
  });
});

test('formatRunResultText includes per-turn replay errors', () => {
  const text = formatRunResultText({
    result: {
      replayId: 'run-a',
      resultDir: '/tmp/result',
      summaryPath: '/tmp/result/summary.md',
    },
    summary: {
      turnCount: 2,
      runCount: 2,
      failedRuns: 2,
      judgmentCount: 0,
      overallPassRate: 0,
      cases: [
        {
          turn: 4,
          status: 'failed',
          runs: [{ runIndex: 1, status: 'failed', error: 'missing env: WORKBENCH_REPLAY_API_KEY' }],
        },
        {
          turn: 5,
          status: 'failed',
          runs: [{ runIndex: 1, status: 'failed', error: 'missing env: WORKBENCH_REPLAY_API_KEY' }],
        },
      ],
    },
  });

  assert.match(text, /status: failed/);
  assert.match(text, /failedRuns: 2\/2/);
  assert.match(text, /judgmentCount: 0/);
  assert.match(text, /Turn 4 run 1: missing env: WORKBENCH_REPLAY_API_KEY/);
  assert.match(text, /Turn 5 run 1: missing env: WORKBENCH_REPLAY_API_KEY/);
});
