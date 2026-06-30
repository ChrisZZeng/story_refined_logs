import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function buildTurnReplayContext({ logGroupDir, runId, turn }) {
  const runDir = path.resolve(logGroupDir, 'run_logs', runId);
  const reviewDir = path.resolve(logGroupDir, 'consistency-review', runId);
  const turnDir = path.join(runDir, formatTurnDir(turn));

  const summaryPath = path.join(turnDir, '01-summary.json');
  const storyStatePath = path.join(turnDir, '03-story-state.json');
  const outputPath = path.join(turnDir, '04-output.json');
  const issuesPath = path.join(reviewDir, 'issues.json');
  const timelinePath = path.join(reviewDir, 'visible-timeline.jsonl');
  const rootCauseSummaryPath = path.resolve(logGroupDir, 'root-cause-analysis', runId, 'summary.json');

  const [summary, storyState, originalOutput, allIssues, timeline] = await Promise.all([
    readJson(summaryPath),
    readJson(storyStatePath),
    readJson(outputPath),
    readJson(issuesPath),
    readJsonl(timelinePath),
  ]);

  const issues = allIssues.filter((issue) => Number(issue.turn) === turn);
  const rootCauseReports = await loadRootCauseReports({
    summaryPath: rootCauseSummaryPath,
    allIssues,
    issues,
  });

  return {
    caseId: `turn-${String(turn).padStart(3, '0')}`,
    runId,
    turn,
    runDir,
    reviewDir,
    turnInput: deriveTurnInput(summary),
    storyState,
    originalOutput,
    issues,
    rootCauseReports,
    visibleContext: collectVisibleContext({ timeline, turn, issues }),
    sourceFiles: {
      summary: summaryPath,
      storyState: storyStatePath,
      originalOutput: outputPath,
      issues: issuesPath,
      visibleTimeline: timelinePath,
      ...(rootCauseReports.length > 0 ? { rootCauseSummary: rootCauseSummaryPath } : {}),
    },
  };
}

export function deriveTurnInput(summary) {
  if (typeof summary.playerInput === 'string' && summary.playerInput.length > 0) {
    return { trigger: { kind: 'player-input', playerInput: summary.playerInput } };
  }
  const selected = summary.selectedFromPreviousTurn?.text;
  if (typeof selected === 'string' && selected.length > 0) {
    return { trigger: { kind: 'player-input', playerInput: selected } };
  }
  throw new Error('Cannot derive TurnInput from 01-summary.json');
}

export function collectVisibleContext({ timeline, turn, issues }) {
  const wanted = new Set();
  for (let previous = Math.max(1, turn - 3); previous < turn; previous += 1) {
    wanted.add(previous);
  }
  for (const issue of issues) {
    for (const conflictingTurn of issue.conflictingTurns ?? []) {
      if (Number.isInteger(conflictingTurn) && conflictingTurn > 0 && conflictingTurn !== turn) {
        wanted.add(conflictingTurn);
      }
    }
  }

  return timeline
    .filter((record) => wanted.has(Number(record.turn)))
    .sort((left, right) => Number(left.turn) - Number(right.turn));
}

function formatTurnDir(turn) {
  return `turn-${String(turn).padStart(2, '0')}`;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function readJsonl(filePath) {
  return (await readFile(filePath, 'utf8'))
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function loadRootCauseReports({ summaryPath, allIssues, issues }) {
  const summary = await readOptionalJson(summaryPath);
  if (!Array.isArray(summary?.issues)) return [];

  const issueIndexes = new Set(
    issues
      .map((issue) => allIssues.indexOf(issue) + 1)
      .filter((index) => index > 0),
  );
  const issueKeys = new Set(
    issues.map((issue) => `${Number(issue.turn)}:${issue.type ?? ''}`),
  );

  return summary.issues
    .filter((report) => {
      const issueIndex = Number(report.issueIndex);
      if (issueIndexes.has(issueIndex)) return true;
      return issueKeys.has(`${Number(report.turn)}:${report.type ?? ''}`);
    })
    .map((report) => ({
      source: summaryPath,
      ...report,
    }));
}
