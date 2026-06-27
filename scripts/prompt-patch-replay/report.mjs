const VERDICTS = ['fixed', 'improved', 'unchanged', 'regressed', 'uncertain'];

export function buildSummary({
  replayId,
  runId,
  resultDir,
  patchBundle,
  patchBundlePath,
  patchBundleHash,
  sourceVersion,
  caseResults,
  passVerdicts = ['fixed'],
}) {
  const verdictCounts = Object.fromEntries(VERDICTS.map((verdict) => [verdict, 0]));
  let issueCount = 0;
  let judgmentCount = 0;
  let failedCases = 0;
  let runCount = 0;
  let passedRuns = 0;
  let failedRuns = 0;
  let repeatCount = 1;
  let regressionJudgmentCount = 0;
  let regressionViolationRuns = 0;
  const summarizedCases = [];

  for (const caseResult of caseResults) {
    const summarizedCase = summarizeCase({ caseResult, passVerdicts });
    summarizedCases.push(summarizedCase);
    repeatCount = Math.max(repeatCount, summarizedCase.repeats ?? 1);
    if (summarizedCase.status === 'failed') failedCases += 1;
    issueCount += summarizedCase.issueCount ?? 0;
    judgmentCount += summarizedCase.judgmentCount ?? 0;
    runCount += summarizedCase.runCount ?? 0;
    passedRuns += summarizedCase.passedRuns ?? 0;
    failedRuns += summarizedCase.failedRuns ?? 0;
    regressionJudgmentCount += summarizedCase.regressionJudgmentCount ?? 0;
    regressionViolationRuns += summarizedCase.regressionViolationRuns ?? 0;
    for (const run of summarizedCase.runs ?? []) {
      for (const judgeResult of run.judgeResults ?? []) {
        if (verdictCounts[judgeResult.verdict] !== undefined) {
          verdictCounts[judgeResult.verdict] += 1;
        }
      }
    }
  }

  return {
    replayId,
    runId,
    resultDir,
    patchBundleId: patchBundle.id,
    patchBundlePath,
    patchBundleHash,
    sourceVersion,
    turnCount: caseResults.length,
    repeatCount,
    issueCount,
    judgmentCount,
    runCount,
    passedRuns,
    failedRuns,
    regressionJudgmentCount,
    regressionViolationRuns,
    overallPassRate: runCount === 0 ? 0 : passedRuns / runCount,
    failedCases,
    passVerdicts,
    verdictCounts,
    cases: summarizedCases,
  };
}

export function renderSummaryMarkdown(summary) {
  const lines = [
    '# Prompt Patch Replay Summary',
    '',
    `- replayId: ${summary.replayId}`,
    `- runId: ${summary.runId}`,
    `- patchBundleId: ${summary.patchBundleId}`,
    `- patchBundlePath: ${summary.patchBundlePath ?? '(unknown)'}`,
    `- patchBundleHash: ${summary.patchBundleHash ?? '(unknown)'}`,
    `- resultDir: ${summary.resultDir}`,
    `- story_refined_logs commit: ${summary.sourceVersion.storyRefinedLogsCommit ?? '(unknown)'}`,
    `- sourceOreturnCommit: ${summary.sourceVersion.sourceOreturnCommit ?? '(unknown)'}`,
    `- replayEngineOreturnCommit: ${summary.sourceVersion.replayEngineOreturnCommit ?? '(unknown)'}`,
    `- turns: ${summary.turnCount}`,
    `- repeatCount: ${summary.repeatCount ?? 1}`,
    `- issues: ${summary.issueCount}`,
    `- judgments: ${summary.judgmentCount ?? summary.issueCount}`,
    `- regressionJudgments: ${summary.regressionJudgmentCount ?? 0}`,
    `- regressionViolationRuns: ${summary.regressionViolationRuns ?? 0}`,
    `- runs: ${summary.runCount ?? summary.turnCount}`,
    `- passedRuns: ${summary.passedRuns ?? 0}`,
    `- failedRuns: ${summary.failedRuns ?? 0}`,
    `- overallPassRate: ${formatRate(summary.overallPassRate ?? 0)}`,
    `- failedCases: ${summary.failedCases}`,
    '',
    '## Verdicts',
    '',
    ...VERDICTS.map((verdict) => `- ${verdict}: ${summary.verdictCounts[verdict] ?? 0}`),
    '',
    '## Cases',
    '',
    '| turn | status | repeats | passedRuns | passRate | issue pass rates | verdicts | error |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const item of summary.cases) {
    const verdicts = collectCaseVerdicts(item).join(', ') || '-';
    const issueRates =
      (item.issues ?? [])
        .map((issue) => `${issue.issueId}: ${formatRate(issue.passRate)}`)
        .join('<br>') || '-';
    lines.push(
      `| ${item.turn} | ${item.status} | ${item.repeats ?? 1} | ${item.passedRuns ?? 0}/${item.runCount ?? 0} | ${formatRate(item.passRate ?? 0)} | ${issueRates} | ${verdicts} | ${item.error ?? ''} |`,
    );
  }

  return `${lines.join('\n')}\n`;
}

export function renderIssueReportMarkdown({ issue, judgeResult }) {
  return [
    '# Issue Replay Judge Report',
    '',
    `- turn: ${issue.turn}`,
    `- type: ${issue.type ?? '(unknown)'}`,
    `- severity: ${issue.severity ?? '(unknown)'}`,
    `- verdict: ${judgeResult.verdict}`,
    `- confidence: ${judgeResult.confidence}`,
    '',
    '## Reason',
    '',
    judgeResult.reason,
    '',
    '## Remaining Problems',
    '',
    renderList(judgeResult.remainingProblems ?? []),
    '',
    '## New Regressions',
    '',
    renderList(judgeResult.newRegressions ?? []),
    '',
  ].join('\n');
}

function renderList(items) {
  return items.length === 0 ? '（无）' : items.map((item) => `- ${item}`).join('\n');
}

export function summarizeCase({ caseResult, passVerdicts = ['fixed'] }) {
  const repeats = caseResult.repeats ?? 1;
  const runs = normalizeRuns(caseResult);
  const issueCount = caseResult.issueCount ?? uniqueIssueIds(runs).length;
  const issueMap = new Map();
  let passedRuns = 0;
  let failedRuns = 0;
  let judgmentCount = 0;
  let regressionJudgmentCount = 0;
  let regressionViolationRuns = 0;

  for (const run of runs) {
    if (run.status === 'failed') failedRuns += 1;
    const judgeResults = run.judgeResults ?? [];
    judgmentCount += judgeResults.length;
    if (run.regressionConsistencyResult) {
      regressionJudgmentCount += 1;
      if (run.regressionConsistencyResult.isViolation === true) regressionViolationRuns += 1;
    }
    run.overall = buildRunOverall({ run, passVerdicts });
    if (run.overall.passed) passedRuns += 1;
    run.passed = run.overall.passed;

    judgeResults.forEach((judgeResult, index) => {
      const issueId = judgeResult.issueId ?? `issue-${String(index + 1).padStart(3, '0')}`;
      if (!issueMap.has(issueId)) {
        issueMap.set(issueId, {
          issueId,
          runCount: 0,
          passedRuns: 0,
          verdictCounts: Object.fromEntries(VERDICTS.map((verdict) => [verdict, 0])),
        });
      }
      const issueSummary = issueMap.get(issueId);
      issueSummary.runCount += 1;
      if (passVerdicts.includes(judgeResult.verdict)) issueSummary.passedRuns += 1;
      if (issueSummary.verdictCounts[judgeResult.verdict] !== undefined) {
        issueSummary.verdictCounts[judgeResult.verdict] += 1;
      }
    });
  }

  const runCount = runs.length;
  const issues = [...issueMap.values()].map((issue) => ({
    ...issue,
    passRate: issue.runCount === 0 ? 0 : issue.passedRuns / issue.runCount,
  }));

  return {
    ...caseResult,
    repeats,
    runs,
    issueCount,
    judgmentCount,
    regressionJudgmentCount,
    regressionViolationRuns,
    runCount,
    passedRuns,
    failedRuns,
    passRate: runCount === 0 ? 0 : passedRuns / runCount,
    issues,
  };
}

function buildRunOverall({ run, passVerdicts }) {
  const judgeResults = run.judgeResults ?? [];
  const issueRepairEnabled = run.issueRepairEnabled !== false;
  const issueFixPassed =
    run.status === 'completed' &&
    (
      issueRepairEnabled === false ||
      (
        judgeResults.length > 0 &&
        judgeResults.every((judgeResult) => passVerdicts.includes(judgeResult.verdict))
      )
    );
  const regressionResult = run.regressionConsistencyResult;
  const consistencyPassed = !regressionResult || regressionResult.isViolation !== true;
  const consistencyEnabled = Boolean(regressionResult);
  return {
    issueFix: {
      enabled: issueRepairEnabled,
      passed: issueFixPassed,
      verdicts: judgeResults.map((judgeResult) => judgeResult.verdict).filter(Boolean),
    },
    consistencyRegression: {
      enabled: consistencyEnabled,
      passed: consistencyPassed,
      ...(consistencyEnabled
        ? {
            isViolation: regressionResult.isViolation === true,
            confidence: regressionResult.confidence,
            violationCount: regressionResult.violations?.length ?? 0,
          }
        : {}),
    },
    passed: issueFixPassed && consistencyPassed,
    reason: overallReason({ issueRepairEnabled, issueFixPassed, consistencyEnabled, consistencyPassed }),
  };
}

function overallReason({ issueRepairEnabled, issueFixPassed, consistencyEnabled, consistencyPassed }) {
  if (!issueRepairEnabled && consistencyEnabled && !consistencyPassed) return '原 issue judge 已禁用，但发现新增一致性回归';
  if (!issueRepairEnabled && consistencyEnabled) return '原 issue judge 已禁用，且未发现新增一致性问题';
  if (!issueRepairEnabled) return '原 issue judge 已禁用';
  if (!issueFixPassed) return '原 issue 未达到当前 pass verdict 口径';
  if (consistencyEnabled && !consistencyPassed) return '原 issue 已通过，但发现新增一致性回归';
  if (consistencyEnabled) return '原 issue 已通过，且未发现新增一致性问题';
  return '原 issue 已通过';
}

function normalizeRuns(caseResult) {
  if (Array.isArray(caseResult.runs)) {
    return caseResult.runs.map((run) => ({ ...run }));
  }
  if (caseResult.status === 'context-only') return [];
  return [
    {
      runIndex: 1,
      status: caseResult.status,
      error: caseResult.error,
      judgeResults: caseResult.judgeResults ?? [],
      ...(caseResult.outputDir !== undefined ? { outputDir: caseResult.outputDir } : {}),
    },
  ];
}

function uniqueIssueIds(runs) {
  const ids = new Set();
  for (const run of runs) {
    (run.judgeResults ?? []).forEach((judgeResult, index) => {
      ids.add(judgeResult.issueId ?? `issue-${String(index + 1).padStart(3, '0')}`);
    });
  }
  return [...ids];
}

function collectCaseVerdicts(item) {
  if (Array.isArray(item.judgeResults) && item.judgeResults.length > 0) {
    return item.judgeResults.map((result) => result.verdict);
  }
  return (item.runs ?? []).flatMap((run) =>
    (run.judgeResults ?? []).map((judgeResult) => `run-${String(run.runIndex).padStart(3, '0')}:${judgeResult.verdict}`),
  );
}

function formatRate(value) {
  return `${(Number(value ?? 0) * 100).toFixed(2)}%`;
}
