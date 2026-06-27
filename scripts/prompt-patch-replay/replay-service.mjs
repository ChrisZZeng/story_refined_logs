import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

import { runOreturnReplay } from './oreturn-engine.mjs';
import { buildJudgeInput, runJudge } from './judger.mjs';
import {
  buildSummary,
  renderIssueReportMarkdown,
  renderSummaryMarkdown,
  summarizeCase,
} from './report.mjs';
import { currentGitCommit, ensureOreturnReplayWorktree, resolveSourceCommit } from './source-version.mjs';
import { loadReplayTask } from './task-config.mjs';
import { buildTurnReplayContext } from './turn-context.mjs';

export async function runPromptPatchReplay({ configPath, dryRunContextOnly = false, cwd = process.cwd() }) {
  const resolvedConfigPath = path.resolve(cwd, configPath);
  const { config, patchBundle, patchBundleRaw, patchBundlePath } = await loadReplayTask(resolvedConfigPath);
  const patchBundleHash = hashText(patchBundleRaw);
  const logGroupDir = path.resolve(cwd, config.logGroupDir);
  const runConfigPath = path.join(logGroupDir, 'run_logs', config.runId, '00-run-config.json');
  const runConfig = await readJson(runConfigPath);
  const sourceCommit = resolveSourceCommit({
    configCommit: config.source.oreturnCommit,
    runConfig,
    logGroupDir,
  });

  const resultDir = path.join(logGroupDir, 'prompt-patch-replay', config.replayId);
  await mkdir(resultDir, { recursive: true });
  await writeJson(path.join(resultDir, 'replay-config.json'), config);
  await writeJson(path.join(resultDir, 'patch-bundle.json'), patchBundle);

  const sourceVersion = dryRunContextOnly
    ? {
        sourceOreturnCommit: sourceCommit,
        replayEngineOreturnCommit: null,
        oreturnRepo: path.resolve(cwd, config.source.oreturnRepo),
        replayEngineOreturnRepo: null,
        managedWorktree: false,
        dirty: null,
        matched: null,
        dryRunContextOnly: true,
      }
    : ensureOreturnReplayWorktree({
        oreturnRepo: config.source.oreturnRepo,
        sourceCommit,
        allowDirty: config.source.allowDirtyEngine,
      });
  sourceVersion.patchBundlePath = patchBundlePath;
  sourceVersion.patchBundleHash = patchBundleHash;
  sourceVersion.storyRefinedLogsCommit = safeCurrentCommit(cwd);
  await writeJson(path.join(resultDir, 'resolved-source-version.json'), sourceVersion);

  const caseResults = [];
  const repeats = config.repeats ?? 1;
  const passVerdicts = config.judging?.passVerdicts ?? ['fixed'];
  for (const turn of config.turns) {
    const caseOutputDir = path.join(resultDir, 'cases', `turn-${String(turn).padStart(3, '0')}`);
    await mkdir(caseOutputDir, { recursive: true });
    try {
      const context = await buildTurnReplayContext({ logGroupDir, runId: config.runId, turn });
      await writeJson(path.join(caseOutputDir, 'turn-replay-context.json'), context);

      if (dryRunContextOnly) {
        caseResults.push({
          turn,
          status: 'context-only',
          repeats,
          judgeResults: [],
          issueCount: context.issues.length,
        });
        continue;
      }

      const runs = [];
      for (let runIndex = 1; runIndex <= repeats; runIndex += 1) {
        const runOutputDir =
          repeats === 1
            ? caseOutputDir
            : path.join(caseOutputDir, 'runs', `run-${String(runIndex).padStart(3, '0')}`);
        await mkdir(runOutputDir, { recursive: true });
        runs.push(
          await runReplayAttempt({
            runIndex,
            outputDir: runOutputDir,
            oreturnRepo: sourceVersion.replayEngineOreturnRepo ?? config.source.oreturnRepo,
            context,
            patchBundle,
            replayModelConfig: config.models.replay,
            judgeMode: config.judgeMode ?? 'openai-compatible',
            judgeModelConfig: config.models.judge,
          }),
        );
      }

      const failedRunCount = runs.filter((run) => run.status === 'failed').length;
      const caseResult = {
        turn,
        status:
          failedRunCount === 0
            ? 'completed'
            : failedRunCount === runs.length
              ? 'failed'
              : 'partial-failed',
        repeats,
        runs,
        ...(repeats === 1 ? { judgeResults: runs[0]?.judgeResults ?? [] } : {}),
        issueCount: context.issues.length,
      };
      await writeJson(
        path.join(caseOutputDir, 'aggregate-summary.json'),
        summarizeCase({ caseResult, passVerdicts }),
      );
      caseResults.push(caseResult);
    } catch (error) {
      caseResults.push({
        turn,
        status: 'failed',
        repeats,
        error: error instanceof Error ? error.message : String(error),
        judgeResults: [],
        runs: [],
      });
    }
  }

  const summary = buildSummary({
    replayId: config.replayId,
    runId: config.runId,
    resultDir,
    patchBundle,
    patchBundlePath,
    patchBundleHash,
    sourceVersion,
    caseResults,
    passVerdicts,
  });
  const summaryJsonPath = path.join(resultDir, 'summary.json');
  const summaryPath = path.join(resultDir, 'summary.md');
  await writeJson(summaryJsonPath, summary);
  await writeFile(summaryPath, renderSummaryMarkdown(summary));
  return {
    replayId: config.replayId,
    resultDir,
    summaryPath,
    summaryJsonPath,
    summary,
  };
}

async function runReplayAttempt({
  runIndex,
  outputDir,
  oreturnRepo,
  context,
  patchBundle,
  replayModelConfig,
  judgeMode,
  judgeModelConfig,
}) {
  try {
    const replay = await runOreturnReplay({
      oreturnRepo,
      caseOutputDir: outputDir,
      context,
      patchBundle,
      modelConfig: replayModelConfig,
    });

    const judgeResults = [];
    for (let index = 0; index < context.issues.length; index += 1) {
      const issue = context.issues[index];
      const issueId = issue.id ?? `issue-${String(index + 1).padStart(3, '0')}`;
      const issueDir = path.join(outputDir, 'issues', sanitizePathSegment(issueId));
      await mkdir(issueDir, { recursive: true });
      const judgeInput = buildJudgeInput({ issue, context, newOutput: replay.newOutput });
      await writeJson(path.join(issueDir, 'judge-input.json'), judgeInput);
      const judgeResult = await runJudge({
        mode: judgeMode,
        modelConfig: judgeModelConfig,
        input: judgeInput,
      });
      await writeJson(path.join(issueDir, 'judge-result.json'), judgeResult);
      await writeFile(
        path.join(issueDir, 'report.md'),
        renderIssueReportMarkdown({ issue, judgeResult }),
      );
      judgeResults.push({ issueId, turn: issue.turn, ...judgeResult });
    }

    return {
      runIndex,
      status: 'completed',
      outputDir,
      judgeResults,
      issueCount: context.issues.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await writeJson(path.join(outputDir, 'replay-error.json'), { runIndex, error: message });
    return {
      runIndex,
      status: 'failed',
      outputDir,
      error: message,
      judgeResults: [],
      issueCount: context.issues.length,
    };
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function safeCurrentCommit(cwd) {
  try {
    return currentGitCommit(cwd);
  } catch {
    return null;
  }
}

function sanitizePathSegment(value) {
  return String(value).replaceAll(/[^a-zA-Z0-9._-]+/g, '-');
}

function hashText(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}
