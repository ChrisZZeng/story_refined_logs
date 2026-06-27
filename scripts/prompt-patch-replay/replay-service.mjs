import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

import { runOreturnReplay } from './oreturn-engine.mjs';
import {
  buildJudgeInput,
  buildRegressionJudgeInput,
  runJudge,
  runRegressionJudge,
} from './judger.mjs';
import {
  buildSummary,
  renderIssueReportMarkdown,
  renderSummaryMarkdown,
  summarizeCase,
} from './report.mjs';
import { currentGitCommit, ensureOreturnReplayWorktree, resolveSourceCommit } from './source-version.mjs';
import { loadReplayTask } from './task-config.mjs';
import { buildTurnReplayContext } from './turn-context.mjs';

export async function runPromptPatchReplay({
  configPath,
  dryRunContextOnly = false,
  cwd = process.cwd(),
  deps = {},
}) {
  const services = {
    loadReplayTask,
    ensureOreturnReplayWorktree,
    currentGitCommit,
    buildTurnReplayContext,
    runOreturnReplay,
    runJudge,
    runRegressionJudge,
    ...deps,
  };
  const resolvedConfigPath = path.resolve(cwd, configPath);
  const { config, patchBundle, patchBundleRaw, patchBundlePath } =
    await services.loadReplayTask(resolvedConfigPath);
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
    : services.ensureOreturnReplayWorktree({
        oreturnRepo: config.source.oreturnRepo,
        sourceCommit,
        allowDirty: config.source.allowDirtyEngine,
      });
  sourceVersion.patchBundlePath = patchBundlePath;
  sourceVersion.patchBundleHash = patchBundleHash;
  sourceVersion.storyRefinedLogsCommit = safeCurrentCommit(cwd, services.currentGitCommit);
  await writeJson(path.join(resultDir, 'resolved-source-version.json'), sourceVersion);

  const repeats = config.repeats ?? 1;
  const passVerdicts = config.judging?.passVerdicts ?? ['fixed'];
  const issueRepair = config.judging?.issueRepair ?? {
    enabled: true,
  };
  const regressionConsistency = config.judging?.regressionConsistency ?? {
    enabled: true,
    target: 'fullTurn',
  };
  const caseResults = await Promise.all(
    config.turns.map((turn) =>
      runReplayCase({
        turn,
        resultDir,
        logGroupDir,
        runId: config.runId,
        repeats,
        dryRunContextOnly,
        sourceVersion,
        sourceRepo: config.source.oreturnRepo,
        patchBundle,
        replayModelConfig: config.models.replay,
        judgeMode: config.judgeMode ?? 'openai-compatible',
        judgeModelConfig: config.models.judge,
        issueRepair,
        regressionConsistency,
        passVerdicts,
        services,
      }),
    ),
  );

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

async function runReplayCase({
  turn,
  resultDir,
  logGroupDir,
  runId,
  repeats,
  dryRunContextOnly,
  sourceVersion,
  sourceRepo,
  patchBundle,
  replayModelConfig,
  judgeMode,
  judgeModelConfig,
  issueRepair,
  regressionConsistency,
  passVerdicts,
  services,
}) {
  const caseOutputDir = path.join(resultDir, 'cases', `turn-${String(turn).padStart(3, '0')}`);
  await mkdir(caseOutputDir, { recursive: true });
  try {
    const context = await services.buildTurnReplayContext({ logGroupDir, runId, turn });
    await writeJson(path.join(caseOutputDir, 'turn-replay-context.json'), context);

    if (dryRunContextOnly) {
      return {
        turn,
        status: 'context-only',
        repeats,
        judgeResults: [],
        issueCount: context.issues.length,
      };
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
          oreturnRepo: sourceVersion.replayEngineOreturnRepo ?? sourceRepo,
          context,
          patchBundle,
          replayModelConfig,
          judgeMode,
          judgeModelConfig,
          issueRepair,
          regressionConsistency,
          services,
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
    return caseResult;
  } catch (error) {
    return {
      turn,
      status: 'failed',
      repeats,
      error: error instanceof Error ? error.message : String(error),
      judgeResults: [],
      runs: [],
    };
  }
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
  issueRepair,
  regressionConsistency,
  services,
}) {
  try {
    const replay = await services.runOreturnReplay({
      oreturnRepo,
      caseOutputDir: outputDir,
      context,
      patchBundle,
      modelConfig: replayModelConfig,
    });

    let regressionConsistencyResult = null;
    if (regressionConsistency?.enabled === true) {
      const regressionInput = buildRegressionJudgeInput({
        context,
        newOutput: replay.newOutput,
        target: regressionConsistency.target ?? 'fullTurn',
      });
      await writeJson(
        path.join(outputDir, 'regression-consistency-judge-input.json'),
        regressionInput,
      );
      regressionConsistencyResult = await services.runRegressionJudge({
        mode: judgeMode,
        modelConfig: judgeModelConfig,
        input: regressionInput,
      });
      await writeJson(
        path.join(outputDir, 'regression-consistency-judge-result.json'),
        regressionConsistencyResult,
      );
    }

    const judgeResults = [];
    if (issueRepair?.enabled !== false) {
      for (let index = 0; index < context.issues.length; index += 1) {
        const issue = context.issues[index];
        const issueId = issue.id ?? `issue-${String(index + 1).padStart(3, '0')}`;
        const issueDir = path.join(outputDir, 'issues', sanitizePathSegment(issueId));
        await mkdir(issueDir, { recursive: true });
        const judgeInput = buildJudgeInput({ issue, context, newOutput: replay.newOutput });
        await writeJson(path.join(issueDir, 'judge-input.json'), judgeInput);
        const judgeResult = await services.runJudge({
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
    }

    return {
      runIndex,
      status: 'completed',
      outputDir,
      issueRepairEnabled: issueRepair?.enabled !== false,
      judgeResults,
      ...(regressionConsistencyResult ? { regressionConsistencyResult } : {}),
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

function safeCurrentCommit(cwd, currentGitCommitImpl = currentGitCommit) {
  try {
    return currentGitCommitImpl(cwd);
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
