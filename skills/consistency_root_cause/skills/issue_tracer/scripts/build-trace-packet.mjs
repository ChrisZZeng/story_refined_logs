#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${arg}`);
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function requireString(args, key) {
  const value = args[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required --${key}`);
  }
  return value;
}

function toInt(value, key) {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed)) {
    throw new Error(`--${key} must be an integer`);
  }
  return parsed;
}

async function readTextIfExists(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
}

async function readJsonIfExists(filePath) {
  const text = await readTextIfExists(filePath);
  if (text === null) return null;
  return JSON.parse(text);
}

function parseJsonl(text) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
}

async function findTurnDir(runDir, turn) {
  const padded = String(turn).padStart(2, '0');
  const direct = path.join(runDir, `turn-${padded}`);
  const directFiles = await readTextIfExists(path.join(direct, '04-output.json'));
  if (directFiles !== null) return direct;

  const entries = await readdir(runDir, { withFileTypes: true });
  const match = entries.find(
    (entry) => entry.isDirectory() && entry.name === `turn-${padded}`,
  );
  if (match) return path.join(runDir, match.name);

  throw new Error(`Cannot find turn directory for turn ${turn} under ${runDir}`);
}

function summarizePlotPoint(output) {
  const plotPoint = output?.plotPoint ?? output?.resolvedPlotPoint ?? null;
  if (!plotPoint) return null;
  return {
    playerIntent: plotPoint.playerIntent ?? null,
    summary: plotPoint.summary ?? null,
    beats: plotPoint.beats ?? [],
    currentTurnConstraints: plotPoint.currentTurnConstraints ?? [],
    currentStorylineConstraints: plotPoint.currentStorylineConstraints ?? [],
    revealedFacts: plotPoint.revealedFacts ?? [],
    requiredContent: plotPoint.requiredContent ?? [],
    sectionSignalSuggestion: plotPoint.sectionSignalSuggestion ?? null,
  };
}

function summarizeStoryState(storyState) {
  const storyline = storyState?.currentStoryline ?? null;
  if (!storyline) return null;
  return {
    id: storyline.id ?? null,
    name: storyline.name ?? null,
    summary: storyline.summary ?? '',
    constraints: storyline.constraints ?? [],
    notes: storyline.notes ?? [],
    contentPreview:
      typeof storyline.content === 'string'
        ? storyline.content.slice(0, 2000)
        : '',
    interactionFollowupPreview:
      typeof storyline.interactionFollowup === 'string'
        ? storyline.interactionFollowup.slice(0, 1200)
        : '',
  };
}

async function collectTurnArtifacts(runDir, turn) {
  const turnDir = await findTurnDir(runDir, turn);
  const file = (name) => path.join(turnDir, name);
  const output = await readJsonIfExists(file('04-output.json'));
  const storyState = await readJsonIfExists(file('03-story-state.json'));
  const scriptState = await readJsonIfExists(file('02-script-state.json'));
  const events = await readJsonIfExists(file('07-events.json'));
  const llmCalls = await readJsonIfExists(file('06-llm-calls.json'));

  return {
    turn,
    turnDir,
    files: {
      summary: file('01-summary.json'),
      scriptState: file('02-script-state.json'),
      storyState: file('03-story-state.json'),
      output: file('04-output.json'),
      runtimeAfter: file('05-runtime-after.json'),
      llmCalls: file('06-llm-calls.json'),
      directorPrompt: file('06a-director-prompt.md'),
      narratorPrompt: file('06b-narrator-prompt.md'),
      choicePrompt: file('06c-choice-prompt.md'),
      events: file('07-events.json'),
    },
    outputSummary: summarizePlotPoint(output),
    storyStateSummary: summarizeStoryState(storyState),
    scriptStateKeys: scriptState ? Object.keys(scriptState) : [],
    eventCount: Array.isArray(events) ? events.length : events?.events?.length ?? null,
    llmCallCount: Array.isArray(llmCalls) ? llmCalls.length : llmCalls?.calls?.length ?? null,
  };
}

async function loadIssue({ reviewDir, issueFileArg, issueIndexArg, turn }) {
  if (!reviewDir) return { issueFile: null, selectedIssue: null, issuesForTurn: [] };

  const issueFile = issueFileArg
    ? path.resolve(issueFileArg)
    : path.join(reviewDir, 'issues.json');
  let issues = await readJsonIfExists(issueFile);
  let finalIssueFile = issueFile;
  if (!Array.isArray(issues)) {
    finalIssueFile = path.join(reviewDir, 'issues-visible-text.json');
    issues = await readJsonIfExists(finalIssueFile);
  }
  if (!Array.isArray(issues)) {
    return { issueFile: finalIssueFile, selectedIssue: null, issuesForTurn: [] };
  }

  const issueIndex = toInt(issueIndexArg, 'issue-index');
  const selectedIssue =
    issueIndex !== undefined ? issues[issueIndex - 1] ?? null : null;
  const targetTurn = turn ?? selectedIssue?.turn;
  const issuesForTurn =
    targetTurn === undefined
      ? []
      : issues
          .map((issue, index) => ({ index: index + 1, issue }))
          .filter(({ issue }) => issue?.turn === targetTurn);

  return { issueFile: finalIssueFile, selectedIssue, issuesForTurn };
}

async function loadTimelineWindow(reviewDir, targetTurn, windowSize) {
  if (!reviewDir || targetTurn === undefined) return [];
  const timelinePath = path.join(reviewDir, 'visible-timeline.jsonl');
  const text = await readTextIfExists(timelinePath);
  const turns = parseJsonl(text);
  const start = targetTurn - windowSize;
  const end = targetTurn + windowSize;
  return turns.filter((turn) => turn.turn >= start && turn.turn <= end);
}

function renderIssue(issue, index) {
  if (!issue) return 'No selected issue. Turn-only trace packet.\n';
  return [
    `Issue index: ${index ?? 'unknown'}`,
    `Turn: ${issue.turn ?? 'unknown'}`,
    `Scope: ${issue.scope ?? 'unknown'}`,
    `Type: ${issue.type ?? 'unknown'}`,
    `Severity: ${issue.severity ?? 'unknown'}`,
    '',
    `Current evidence: ${issue.currentEvidence ?? ''}`,
    '',
    `Conflicting evidence: ${issue.conflictingEvidence ?? ''}`,
    '',
    `Reason: ${issue.reason ?? ''}`,
  ].join('\n');
}

function renderTimeline(turns) {
  if (turns.length === 0) return 'No timeline window found.\n';
  return turns
    .map((turn) => {
      const choices = Array.isArray(turn.choices)
        ? turn.choices.map((choice) => `- ${choice.text}`).join('\n')
        : '';
      const visibleTail =
        typeof turn.visibleText === 'string'
          ? turn.visibleText.slice(-1200)
          : '';
      return [
        `### Turn ${turn.turn}`,
        '',
        `Player input: ${turn.playerInput ?? ''}`,
        '',
        'Visible text tail:',
        '',
        visibleTail,
        '',
        choices ? `Choices:\n${choices}` : 'Choices: none recorded',
      ].join('\n');
    })
    .join('\n\n');
}

function renderArtifactSummary(artifact) {
  const lines = [
    `## Turn ${artifact.turn} Artifacts`,
    '',
    `Turn dir: \`${artifact.turnDir}\``,
    '',
    'Key files:',
    ...Object.entries(artifact.files).map(([key, value]) => `- ${key}: \`${value}\``),
    '',
  ];
  if (artifact.storyStateSummary) {
    lines.push('Current storyline:', '');
    lines.push(JSON.stringify(artifact.storyStateSummary, null, 2), '');
  }
  if (artifact.outputSummary) {
    lines.push('Director output summary:', '');
    lines.push(JSON.stringify(artifact.outputSummary, null, 2), '');
  }
  lines.push(`Event count: ${artifact.eventCount ?? 'unknown'}`);
  lines.push(`LLM call count: ${artifact.llmCallCount ?? 'unknown'}`);
  return lines.join('\n');
}

function draftRootCauseItem(issue, issueIndex, targetTurn) {
  return {
    issueId: issueIndex ? `issue-${issueIndex}` : `turn-${targetTurn}`,
    turn: targetTurn,
    issueValidity: 'valid',
    problemSummary: '',
    validityAssessment: {
      verdictReason: '',
      playerVisibleSupport: '',
      caveats: [],
    },
    contextAssessment: {
      actualStateBeforeIssue: '',
      relevantFacts: [
        {
          claim: '',
          availability: '',
          artifacts: [],
          notes: '',
        },
      ],
      competingPressures: [],
    },
    causalChain: {
      firstDivergenceArtifact: '',
      directCause: '',
      propagation: '',
      nonCauses: [],
    },
    rootCause: {
      label: '',
      family: '',
      secondaryFamilies: [],
      description: '',
      fixSurface: [],
    },
    evidence: {
      playerVisible: '',
      internalTrace: '',
    },
    recommendedFixArea: '',
    confidence: '',
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = path.resolve(requireString(args, 'run'));
  const reviewDir =
    typeof args.review === 'string' ? path.resolve(args.review) : null;
  const outDir = path.resolve(args.out ?? 'root-cause-trace');
  const windowSize = toInt(args.window, 'window') ?? 2;

  const issueIndex = toInt(args['issue-index'], 'issue-index');
  const explicitTurn = toInt(args.turn, 'turn');
  const { issueFile, selectedIssue, issuesForTurn } = await loadIssue({
    reviewDir,
    issueFileArg: args['issue-file'],
    issueIndexArg: args['issue-index'],
    turn: explicitTurn,
  });

  const targetTurn = explicitTurn ?? selectedIssue?.turn;
  if (!Number.isInteger(targetTurn)) {
    throw new Error('Provide --turn or --issue-index with a review issue containing turn');
  }

  await mkdir(outDir, { recursive: true });
  const timelineWindow = await loadTimelineWindow(reviewDir, targetTurn, windowSize);
  const artifactTurns = [targetTurn - 1, targetTurn, targetTurn + 1].filter(
    (turn) => turn > 0,
  );
  const artifacts = [];
  for (const turn of artifactTurns) {
    try {
      artifacts.push(await collectTurnArtifacts(runDir, turn));
    } catch (error) {
      artifacts.push({ turn, error: error.message });
    }
  }

  const packet = {
    generatedAt: new Date().toISOString(),
    runDir,
    reviewDir,
    issueFile,
    selectedIssueIndex: issueIndex ?? null,
    targetTurn,
    selectedIssue,
    issuesForTurn,
    timelineWindow,
    artifacts,
  };

  const traceMarkdown = [
    '# Root Cause Trace Packet',
    '',
    `Run: \`${runDir}\``,
    reviewDir ? `Review: \`${reviewDir}\`` : 'Review: not provided',
    issueFile ? `Issue file: \`${issueFile}\`` : 'Issue file: not provided',
    `Target turn: ${targetTurn}`,
    '',
    '## Selected Issue',
    '',
    renderIssue(selectedIssue, issueIndex),
    '',
    '## Timeline Window',
    '',
    renderTimeline(timelineWindow),
    '',
    '## Required Analysis Checks',
    '',
    '1. Validity gate: decide whether the evaluated issue is valid, questionable, or invalid using only player-visible evidence.',
    '2. Context assessment: reconstruct the actual state before the issue and mark each relevant fact/intention/constraint as absent, present-clear, present-buried, present-ambiguous, contradicted, stale, over-constraining, or not-needed.',
    '3. Competing pressures: note fixed script, storyline, selected choice, player input, pacing, style, secret boundaries, current scene affordances, or world rules that could explain the output.',
    '4. Causal chain: identify the first artifact that diverged, then trace propagation. If the evaluator is the first bad artifact, report an invalid/questionable issue instead of forcing a root cause.',
    '5. Failure mechanism: name the concrete optimizable mechanism, such as storyline-lifecycle, fixed-beat-consumption, context-priority, handoff-contract, choice-action-binding, state-writeback, memory-persistence, or model-local.',
    '6. Root cause: classify only valid issues. Use worker names as divergence points, not root-cause classes, and do not let the coarse class hide the mechanism.',
    '',
    ...artifacts.map((artifact) =>
      artifact.error
        ? `## Turn ${artifact.turn} Artifacts\n\nError: ${artifact.error}`
        : renderArtifactSummary(artifact),
    ),
  ].join('\n');

  await writeFile(
    path.join(outDir, 'trace-packet.json'),
    JSON.stringify(packet, null, 2),
  );
  await writeFile(path.join(outDir, 'trace.md'), traceMarkdown);
  await writeFile(
    path.join(outDir, 'root-cause-draft.json'),
    JSON.stringify([draftRootCauseItem(selectedIssue, issueIndex, targetTurn)], null, 2),
  );

  console.log(JSON.stringify({ outDir, targetTurn, issueIndex: issueIndex ?? null }));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
