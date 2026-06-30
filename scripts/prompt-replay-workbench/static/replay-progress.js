import { formatRate } from './run-summary.js';

export function buildPendingReplayProgress({
  turns = [],
  repeats = 1,
  promptEditCount = 0,
  regressionConsistencyOnly = false,
} = {}) {
  const turnCount = turns.length;
  const totalRuns = Math.max(0, turnCount * Number(repeats || 1));
  return {
    state: 'busy',
    statusText: regressionConsistencyOnly
      ? `Running Regression Consistency only across ${turnCount} turns x ${Number(repeats || 1)} repeats`
      : `Running ${promptEditCount} prompt edit${promptEditCount === 1 ? '' : 's'} across ${turnCount} turns x ${Number(repeats || 1)} repeats`,
    totals: {
      label: `0/${totalRuns} runs completed`,
      detail: 'Waiting for replay and judge artifacts',
    },
    cases: turns.map((turn) => ({
      turn,
      status: 'waiting',
      verdict: 'pending',
      runs: Array.from({ length: Number(repeats || 1) }, (_, index) => ({
        runIndex: index + 1,
        status: 'pending',
        label: `Run ${index + 1} pending`,
      })),
    })),
  };
}

export function buildReplayProgress(summary) {
  const failedRuns = Number(summary?.failedRuns ?? 0);
  const runCount = Number(summary?.runCount ?? summary?.cases?.length ?? 0);
  const passedRuns = Number(summary?.passedRuns ?? Math.max(0, runCount - failedRuns));
  const passRateValue = summary?.overallPassRate;
  const hasNonPassingRuns =
    runCount > 0 &&
    (passedRuns < runCount || (typeof passRateValue === 'number' && passRateValue < 1));
  const state = failedRuns > 0 ? 'error' : hasNonPassingRuns ? 'warn' : 'ok';
  return {
    state,
    statusText: failedRuns > 0
      ? `Failed: ${failedRuns}/${runCount || failedRuns} replay runs failed`
      : `Completed: ${formatRate(passRateValue)} pass rate`,
    totals: {
      label: `${passedRuns}/${runCount || passedRuns} runs passed`,
      detail: `${summary?.judgmentCount ?? 0} judgments`,
    },
    cases: (summary?.cases ?? []).map((item) => ({
      turn: item.turn,
      status: item.status ?? 'unknown',
      state: formatCaseState(item),
      verdict: formatCaseVerdict(item),
      runs: (item.runs ?? []).map((run) => ({
        runIndex: run.runIndex,
        status: run.status ?? 'unknown',
        state: formatRunState(run),
        label: formatRunLabel(run),
      })),
    })),
  };
}

export function replayOutputText(runArtifact) {
  const output = runArtifact?.output;
  return output?.normalizedContent?.rawHtml
    ?? output?.narrative
    ?? output?.normalizedContent?.visibleText
    ?? JSON.stringify(output ?? {}, null, 2);
}

export function replayJudgeText(runArtifact) {
  const issues = runArtifact?.issues ?? [];
  const blocks = issues.map((issue) => {
    const result = issue.judgeResult ?? {};
    return [
      `${issue.issueId ?? 'issue'} | ${result.verdict ?? '-'} | confidence: ${result.confidence ?? '-'}`,
      result.reason ?? '',
      listBlock('Remaining problems', result.remainingProblems),
      listBlock('New regressions', result.newRegressions),
    ].filter(Boolean).join('\n');
  });
  const regressionText = regressionConsistencyText(runArtifact?.regressionConsistency?.result);
  if (regressionText) blocks.push(regressionText);
  return blocks.length > 0 ? blocks.join('\n\n') : 'No judge results.';
}

function formatCaseVerdict(item) {
  if (typeof item?.passRate === 'number') return formatRate(item.passRate);
  const verdicts = new Set();
  for (const run of item?.runs ?? []) {
    for (const judgeResult of run.judgeResults ?? []) {
      if (judgeResult.verdict) verdicts.add(judgeResult.verdict);
    }
  }
  return Array.from(verdicts).join(', ') || item?.status || '-';
}

function formatRunLabel(run) {
  if (run?.error) return `Run ${run.runIndex ?? '-'} failed: ${run.error}`;
  const verdicts = Array.from(new Set((run?.judgeResults ?? []).map((item) => item.verdict).filter(Boolean)));
  const verdictText = verdicts.join(', ');
  if (hasRegressionViolation(run)) {
    const violationCount = regressionViolationCount(run);
    const countText = violationCount > 0 ? ` x${violationCount}` : '';
    const issueText = verdictText ? `; issue: ${verdictText}` : '';
    return `Run ${run?.runIndex ?? '-'} regression violation${countText}${issueText}`;
  }
  if (run?.overall?.passed === false || run?.passed === false) {
    return `Run ${run?.runIndex ?? '-'} not passed${verdictText ? `: ${verdictText}` : ''}`;
  }
  return `Run ${run?.runIndex ?? '-'} ${verdictText || run?.status || '-'}`;
}

function formatCaseState(item) {
  if (item?.status === 'failed' || item?.status === 'partial-failed') return item.status;
  if (typeof item?.passRate === 'number' && item.passRate < 1) return 'not-passed';
  if ((item?.runs ?? []).some((run) => formatRunState(run) === 'not-passed')) return 'not-passed';
  return item?.status ?? 'unknown';
}

function formatRunState(run) {
  if (run?.error || run?.status === 'failed') return 'failed';
  if (hasRegressionViolation(run) || run?.overall?.passed === false || run?.passed === false) return 'not-passed';
  if (run?.overall?.passed === true || run?.passed === true) return 'passed';
  return run?.status ?? 'unknown';
}

function hasRegressionViolation(run) {
  return run?.overall?.consistencyRegression?.passed === false
    || run?.regressionConsistencyResult?.isViolation === true;
}

function regressionViolationCount(run) {
  const overallCount = run?.overall?.consistencyRegression?.violationCount;
  if (Number.isFinite(overallCount)) return overallCount;
  const violations = run?.regressionConsistencyResult?.violations;
  return Array.isArray(violations) ? violations.length : 0;
}

function listBlock(title, items) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return `${title}:\n${items.map((item) => `- ${item}`).join('\n')}`;
}

function regressionConsistencyText(result) {
  if (!result) return '';
  return [
    `Regression Consistency | violation: ${result.isViolation ? 'yes' : 'no'} | confidence: ${result.confidence ?? '-'}`,
    result.reasoning ?? '',
    regressionViolationsBlock(result.violations),
  ].filter(Boolean).join('\n');
}

function regressionViolationsBlock(violations) {
  if (!Array.isArray(violations) || violations.length === 0) return '';
  return [
    'Violations:',
    ...violations.map((item) =>
      [
        `- ${item.type ?? 'violation'}: ${item.explanation ?? ''}`.trim(),
        item.evidence_history ? `  history: ${item.evidence_history}` : '',
        item.evidence_current ? `  current: ${item.evidence_current}` : '',
      ].filter(Boolean).join('\n'),
    ),
  ].join('\n');
}
