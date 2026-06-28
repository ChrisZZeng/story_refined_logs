import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPendingReplayProgress,
  buildReplayProgress,
  replayOutputText,
  replayJudgeText,
} from '../../scripts/prompt-replay-workbench/static/replay-progress.js';

test('buildPendingReplayProgress lists each configured turn while a blocking run is active', () => {
  const progress = buildPendingReplayProgress({
    turns: [4, 5, 9],
    repeats: 2,
    promptEditCount: 1,
  });

  assert.equal(progress.statusText, 'Running 1 prompt edit across 3 turns x 2 repeats');
  assert.equal(progress.totals.label, '0/6 runs completed');
  assert.deepEqual(
    progress.cases.map((item) => ({
      turn: item.turn,
      status: item.status,
      runs: item.runs.map((run) => run.label),
    })),
    [
      { turn: 4, status: 'waiting', runs: ['Run 1 pending', 'Run 2 pending'] },
      { turn: 5, status: 'waiting', runs: ['Run 1 pending', 'Run 2 pending'] },
      { turn: 9, status: 'waiting', runs: ['Run 1 pending', 'Run 2 pending'] },
    ],
  );
});

test('buildReplayProgress summarizes completed cases and repeated run verdicts', () => {
  const progress = buildReplayProgress({
    replayId: 'replay-a',
    turnCount: 2,
    runCount: 3,
    passedRuns: 2,
    failedRuns: 1,
    judgmentCount: 3,
    overallPassRate: 2 / 3,
    cases: [
      {
        turn: 4,
        status: 'completed',
        passRate: 1,
        runs: [
          {
            runIndex: 1,
            status: 'completed',
            passed: true,
            judgeResults: [{ issueId: 'issue-001', verdict: 'fixed' }],
          },
        ],
      },
      {
        turn: 5,
        status: 'partial-failed',
        passRate: 0.5,
        runs: [
          {
            runIndex: 1,
            status: 'completed',
            passed: true,
            judgeResults: [{ issueId: 'issue-001', verdict: 'fixed' }],
          },
          {
            runIndex: 2,
            status: 'failed',
            error: 'missing env',
          },
        ],
      },
    ],
  });

  assert.equal(progress.statusText, 'Failed: 1/3 replay runs failed');
  assert.equal(progress.totals.label, '2/3 runs passed');
  assert.deepEqual(
    progress.cases.map((item) => ({
      turn: item.turn,
      status: item.status,
      verdict: item.verdict,
      runs: item.runs.map((run) => run.label),
    })),
    [
      { turn: 4, status: 'completed', verdict: '100.00%', runs: ['Run 1 fixed'] },
      { turn: 5, status: 'partial-failed', verdict: '50.00%', runs: ['Run 1 fixed', 'Run 2 failed: missing env'] },
    ],
  );
});

test('buildReplayProgress marks regression violations as non-passing runs', () => {
  const progress = buildReplayProgress({
    runCount: 5,
    passedRuns: 4,
    failedRuns: 0,
    judgmentCount: 5,
    overallPassRate: 4 / 5,
    cases: [
      {
        turn: 37,
        status: 'completed',
        passRate: 4 / 5,
        runs: [
          {
            runIndex: 5,
            status: 'completed',
            passed: false,
            judgeResults: [{ issueId: 'issue-001', verdict: 'fixed' }],
            regressionConsistencyResult: {
              isViolation: true,
              confidence: 'medium',
              violations: [{ type: 'factual_contradiction' }],
            },
            overall: {
              passed: false,
              consistencyRegression: {
                enabled: true,
                passed: false,
                isViolation: true,
                violationCount: 1,
              },
            },
          },
        ],
      },
    ],
  });

  assert.equal(progress.state, 'warn');
  assert.equal(progress.statusText, 'Completed: 80.00% pass rate');
  assert.equal(progress.cases[0].state, 'not-passed');
  assert.deepEqual(progress.cases[0].runs[0], {
    runIndex: 5,
    status: 'completed',
    state: 'not-passed',
    label: 'Run 5 regression violation x1; issue: fixed',
  });
});

test('replay artifact formatters expose new output and judge details for manual review', () => {
  const runArtifact = {
    output: {
      normalizedContent: {
        rawHtml: '<p data-speaker="卡琳娜">“到此为止。”</p>',
        visibleText: '到此为止。',
      },
    },
    issues: [
      {
        issueId: 'issue-001',
        judgeResult: {
          verdict: 'fixed',
          confidence: 'high',
          reason: '玩家输入被正确响应。',
          remainingProblems: [],
          newRegressions: ['speaker tag still suspicious'],
        },
      },
    ],
    regressionConsistency: {
      result: {
        isViolation: true,
        confidence: 'high',
        reasoning: '当前输出新增了钥匙来源冲突。',
        violations: [
          {
            type: 'factual_contradiction',
            evidence_history: '钥匙已经丢失。',
            evidence_current: '你拿起刚出现的钥匙。',
            explanation: '钥匙没有来源解释。',
          },
        ],
      },
    },
  };

  assert.equal(replayOutputText(runArtifact), '<p data-speaker="卡琳娜">“到此为止。”</p>');
  assert.match(replayJudgeText(runArtifact), /issue-001 \| fixed \| confidence: high/);
  assert.match(replayJudgeText(runArtifact), /玩家输入被正确响应。/);
  assert.match(replayJudgeText(runArtifact), /New regressions:\n- speaker tag still suspicious/);
  assert.match(replayJudgeText(runArtifact), /Regression Consistency \| violation: yes \| confidence: high/);
  assert.match(replayJudgeText(runArtifact), /factual_contradiction: 钥匙没有来源解释。/);
});
