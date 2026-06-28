export function runStatusFromSummary(summary) {
  const failedRuns = Number(summary?.failedRuns ?? 0);
  const runCount = Number(summary?.runCount ?? summary?.cases?.length ?? 0);
  if (failedRuns > 0) {
    return {
      text: `Failed: ${failedRuns}/${runCount || failedRuns} replay runs failed`,
      state: 'error',
    };
  }
  const passRateValue = summary?.overallPassRate;
  const passRate = formatRate(passRateValue);
  const passedRuns = Number(summary?.passedRuns ?? runCount);
  const hasNonPassingRuns =
    runCount > 0 &&
    (passedRuns < runCount || (typeof passRateValue === 'number' && passRateValue < 1));
  return {
    text: `Completed: ${passRate} pass rate`,
    state: hasNonPassingRuns ? 'warn' : 'ok',
  };
}

export function formatRunResultText({ result, summary }) {
  const failedRuns = Number(summary?.failedRuns ?? 0);
  const runCount = Number(summary?.runCount ?? summary?.cases?.length ?? 0);
  const status = failedRuns > 0 ? 'failed' : 'completed';
  const lines = [
    `status: ${status}`,
    `replayId: ${result.replayId}`,
    `resultDir: ${result.resultDir}`,
    `summary: ${result.summaryPath}`,
    `turnCount: ${summary.turnCount ?? summary.cases?.length ?? '-'}`,
    `runCount: ${runCount || '-'}`,
    `failedRuns: ${failedRuns}/${runCount || failedRuns || '-'}`,
    `judgmentCount: ${summary.judgmentCount ?? '-'}`,
    `overallPassRate: ${formatRate(summary.overallPassRate)}`,
  ];

  const errors = replayErrors(summary);
  if (errors.length > 0) {
    lines.push('', 'Replay errors:', ...errors.map((error) => `- ${error}`));
  }

  return lines.join('\n');
}

function replayErrors(summary) {
  const errors = [];
  for (const item of summary?.cases ?? []) {
    for (const run of item.runs ?? []) {
      if (run?.error) {
        errors.push(`Turn ${item.turn} run ${run.runIndex ?? '-'}: ${run.error}`);
      }
    }
  }
  return errors;
}

export function formatRate(value) {
  return typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : '-';
}
