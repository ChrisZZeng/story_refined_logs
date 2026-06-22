#!/usr/bin/env node
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = { runDir: undefined, out: undefined };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--out') {
      args.out = argv[++i];
    } else if (!args.runDir) {
      args.runDir = value;
    }
  }
  if (!args.runDir) {
    throw new Error('Usage: build-visible-timeline.mjs <run-dir> [--out <visible-timeline.jsonl>]');
  }
  return args;
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return undefined;
    throw new Error(`Failed to read JSON: ${filePath}\n${error.message}`);
  }
}

function turnNumberFromDir(name) {
  const match = /^turn-(\d+)$/.exec(name);
  return match ? Number(match[1]) : undefined;
}

async function listTurnDirs(runDir) {
  const entries = await readdir(runDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, turn: turnNumberFromDir(entry.name) }))
    .filter((entry) => Number.isFinite(entry.turn))
    .sort((left, right) => left.turn - right.turn);
}

function pickVisibleText(output) {
  return (
    output?.normalizedContent?.visibleText ??
    output?.visibleText ??
    output?.normalizedContent?.rawHtml ??
    output?.narrative ??
    ''
  );
}

function pickChoices(summary, output) {
  const fromSummary = summary?.choices?.options;
  if (Array.isArray(fromSummary)) {
    return fromSummary.map((choice) => ({
      text: choice?.text ?? '',
      actionId: choice?.actionId,
    }));
  }

  const fromOutput = output?.choices?.options ?? output?.choices;
  if (Array.isArray(fromOutput)) {
    return fromOutput.map((choice) => ({
      text: choice?.text ?? String(choice ?? ''),
      actionId: choice?.actionId,
    }));
  }

  return [];
}

function pickPreLlmEvents(scriptState, storyState) {
  const events = scriptState?.preLlmEvents?.events ?? storyState?.preLlmEvents?.events ?? [];
  return Array.isArray(events) ? events : [];
}

function pickPlayerInput(summary) {
  if (typeof summary?.playerInput === 'string' && summary.playerInput.length > 0) {
    return { value: summary.playerInput, source: 'playerInput' };
  }

  const selectedText = summary?.selectedFromPreviousTurn?.text;
  if (typeof selectedText === 'string' && selectedText.length > 0) {
    return { value: selectedText, source: 'selectedFromPreviousTurn' };
  }

  return { value: null, source: null };
}

function relativeFile(runDir, filePath) {
  return path.relative(runDir, filePath);
}

async function buildTurnRecord(runDir, turnDir) {
  const dir = path.join(runDir, turnDir.name);
  const summaryPath = path.join(dir, '01-summary.json');
  const scriptStatePath = path.join(dir, '02-script-state.json');
  const storyStatePath = path.join(dir, '03-story-state.json');
  const outputPath = path.join(dir, '04-output.json');

  const [summary, scriptState, storyState, output] = await Promise.all([
    readJsonIfExists(summaryPath),
    readJsonIfExists(scriptStatePath),
    readJsonIfExists(storyStatePath),
    readJsonIfExists(outputPath),
  ]);
  const playerInput = pickPlayerInput(summary);

  return {
    turn: summary?.turn ?? turnDir.turn,
    turnDir: turnDir.name,
    playerInput: playerInput.value,
    playerInputSource: playerInput.source,
    preLlmEvents: pickPreLlmEvents(scriptState, storyState),
    visibleText: pickVisibleText(output),
    choices: pickChoices(summary, output),
    plotSummary: summary?.plotSummary ?? null,
    selectedAction: summary?.selectedAction ?? null,
    sourceFiles: {
      summary: relativeFile(runDir, summaryPath),
      scriptState: relativeFile(runDir, scriptStatePath),
      storyState: relativeFile(runDir, storyStatePath),
      output: relativeFile(runDir, outputPath),
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = path.resolve(args.runDir);
  const outPath = path.resolve(args.out ?? path.join(runDir, 'visible-timeline.jsonl'));
  const turnDirs = await listTurnDirs(runDir);

  if (turnDirs.length === 0) {
    throw new Error(`No turn-* directories found in ${runDir}`);
  }

  const records = await Promise.all(turnDirs.map((turnDir) => buildTurnRecord(runDir, turnDir)));
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`);

  console.log(JSON.stringify({ out: outPath, turnCount: records.length }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
