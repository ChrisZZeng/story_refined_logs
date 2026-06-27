import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSummary,
  renderIssueReportMarkdown,
  renderSummaryMarkdown,
} from '../../scripts/prompt-patch-replay/report.mjs';

test('buildSummary counts verdicts and failed cases', () => {
  const summary = buildSummary({
    replayId: 'replay-a',
    runId: 'run-a',
    resultDir: '/tmp/result',
    patchBundle: { id: 'bundle-a' },
    patchBundlePath: '/tmp/patch-bundle.json',
    patchBundleHash: 'sha256:abc',
    sourceVersion: {
      storyRefinedLogsCommit: 'story-commit',
      sourceOreturnCommit: 'source',
      replayEngineOreturnCommit: 'source',
    },
    caseResults: [
      { turn: 3, status: 'completed', judgeResults: [{ verdict: 'fixed' }, { verdict: 'improved' }] },
      { turn: 9, status: 'failed', error: 'patch not found', judgeResults: [] },
    ],
  });

  assert.equal(summary.verdictCounts.fixed, 1);
  assert.equal(summary.verdictCounts.improved, 1);
  assert.equal(summary.failedCases, 1);
  assert.equal(summary.patchBundlePath, '/tmp/patch-bundle.json');
  assert.equal(summary.patchBundleHash, 'sha256:abc');
});

test('buildSummary counts context-only issues before judging', () => {
  const summary = buildSummary({
    replayId: 'replay-a',
    runId: 'run-a',
    resultDir: '/tmp/result',
    patchBundle: { id: 'bundle-a' },
    patchBundlePath: '/tmp/patch-bundle.json',
    patchBundleHash: 'sha256:abc',
    sourceVersion: {},
    caseResults: [
      { turn: 3, status: 'context-only', issueCount: 2, judgeResults: [] },
      { turn: 4, status: 'failed', issueCount: 1, judgeResults: [] },
    ],
  });

  assert.equal(summary.issueCount, 3);
});

test('buildSummary computes pass rates for repeated runs', () => {
  const summary = buildSummary({
    replayId: 'replay-a',
    runId: 'run-a',
    resultDir: '/tmp/result',
    patchBundle: { id: 'bundle-a' },
    patchBundlePath: '/tmp/patch-bundle.json',
    patchBundleHash: 'sha256:abc',
    sourceVersion: {},
    passVerdicts: ['fixed'],
    caseResults: [
      {
        turn: 3,
        status: 'completed',
        issueCount: 2,
        repeats: 2,
        runs: [
          {
            runIndex: 1,
            status: 'completed',
            judgeResults: [
              { issueId: 'issue-001', verdict: 'fixed' },
              { issueId: 'issue-002', verdict: 'fixed' },
            ],
          },
          {
            runIndex: 2,
            status: 'completed',
            judgeResults: [
              { issueId: 'issue-001', verdict: 'fixed' },
              { issueId: 'issue-002', verdict: 'regressed' },
            ],
          },
        ],
      },
    ],
  });

  assert.equal(summary.repeatCount, 2);
  assert.equal(summary.issueCount, 2);
  assert.equal(summary.judgmentCount, 4);
  assert.equal(summary.runCount, 2);
  assert.equal(summary.passedRuns, 1);
  assert.equal(summary.overallPassRate, 0.5);
  assert.equal(summary.cases[0].passedRuns, 1);
  assert.equal(summary.cases[0].passRate, 0.5);
  assert.equal(summary.cases[0].issues[0].passRate, 1);
  assert.equal(summary.cases[0].issues[1].passRate, 0.5);
});

test('buildSummary requires regression consistency pass when result is present', () => {
  const summary = buildSummary({
    replayId: 'replay-a',
    runId: 'run-a',
    resultDir: '/tmp/result',
    patchBundle: { id: 'bundle-a' },
    patchBundlePath: '/tmp/patch-bundle.json',
    patchBundleHash: 'sha256:abc',
    sourceVersion: {},
    passVerdicts: ['fixed'],
    caseResults: [
      {
        turn: 3,
        status: 'completed',
        issueCount: 1,
        repeats: 2,
        runs: [
          {
            runIndex: 1,
            status: 'completed',
            judgeResults: [{ issueId: 'issue-001', verdict: 'fixed' }],
            regressionConsistencyResult: { isViolation: false, confidence: 'high', violations: [] },
          },
          {
            runIndex: 2,
            status: 'completed',
            judgeResults: [{ issueId: 'issue-001', verdict: 'fixed' }],
            regressionConsistencyResult: {
              isViolation: true,
              confidence: 'high',
              violations: [{ type: 'continuity_break' }],
            },
          },
        ],
      },
    ],
  });

  assert.equal(summary.regressionJudgmentCount, 2);
  assert.equal(summary.regressionViolationRuns, 1);
  assert.equal(summary.passedRuns, 1);
  assert.equal(summary.overallPassRate, 0.5);
  assert.equal(summary.cases[0].runs[0].overall.passed, true);
  assert.equal(summary.cases[0].runs[1].overall.issueFix.passed, true);
  assert.equal(summary.cases[0].runs[1].overall.consistencyRegression.passed, false);
  assert.equal(summary.cases[0].runs[1].overall.passed, false);
});

test('renderSummaryMarkdown includes repeated run pass rates', () => {
  const markdown = renderSummaryMarkdown({
    replayId: 'replay-a',
    runId: 'run-a',
    resultDir: '/tmp/result',
    patchBundleId: 'bundle-a',
    patchBundlePath: '/tmp/patch-bundle.json',
    patchBundleHash: 'sha256:abc',
    repeatCount: 3,
    turnCount: 1,
    issueCount: 1,
    judgmentCount: 3,
    runCount: 3,
    passedRuns: 2,
    failedRuns: 0,
    overallPassRate: 2 / 3,
    failedCases: 0,
    verdictCounts: { fixed: 2, improved: 0, unchanged: 1, regressed: 0, uncertain: 0 },
    sourceVersion: {
      storyRefinedLogsCommit: 'story-commit',
      sourceOreturnCommit: 'source',
      replayEngineOreturnCommit: 'source',
    },
    cases: [
      {
        turn: 3,
        status: 'completed',
        repeats: 3,
        passedRuns: 2,
        passRate: 2 / 3,
        issues: [{ issueId: 'issue-001', passRate: 2 / 3 }],
      },
    ],
  });

  assert.match(markdown, /repeatCount: 3/);
  assert.match(markdown, /overallPassRate: 66.67%/);
  assert.match(markdown, /issue-001: 66.67%/);
});

test('renderSummaryMarkdown includes run identity and result dir', () => {
  const markdown = renderSummaryMarkdown({
    replayId: 'replay-a',
    runId: 'run-a',
    resultDir: '/tmp/result',
    patchBundleId: 'bundle-a',
    patchBundlePath: '/tmp/patch-bundle.json',
    patchBundleHash: 'sha256:abc',
    turnCount: 2,
    issueCount: 2,
    failedCases: 0,
    verdictCounts: { fixed: 1, improved: 0, unchanged: 1, regressed: 0, uncertain: 0 },
    sourceVersion: {
      storyRefinedLogsCommit: 'story-commit',
      sourceOreturnCommit: 'source',
      replayEngineOreturnCommit: 'source',
    },
    cases: [],
  });

  assert.match(markdown, /replay-a/);
  assert.match(markdown, /run-a/);
  assert.match(markdown, /\/tmp\/result/);
  assert.match(markdown, /sha256:abc/);
});

test('renderIssueReportMarkdown includes verdict and reason', () => {
  const markdown = renderIssueReportMarkdown({
    issue: { turn: 3, type: 'repeated-scene' },
    judgeResult: { verdict: 'fixed', confidence: 'high', reason: '已修复。' },
  });

  assert.match(markdown, /fixed/);
  assert.match(markdown, /已修复/);
});
