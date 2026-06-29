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
import {
  currentGitCommit,
  ensureOreturnReplayWorktree,
  resolveOreturnRepoHead,
  resolveSourceCommit,
  tryResolveSourceCommit,
} from './source-version.mjs';
import { loadReplayTask } from './task-config.mjs';
import { buildTurnReplayContext } from './turn-context.mjs';

export async function runPromptPatchReplay({
  configPath,
  dryRunContextOnly = false,
  cwd = process.cwd(),
  signal,
  deps = {},
}) {
  throwIfAborted(signal);
  const services = {
    loadReplayTask,
    ensureOreturnReplayWorktree,
    resolveOreturnRepoHead,
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
  const followBadcaseCommit = config.source.followBadcaseCommit !== false;
  const sourceCommit = (followBadcaseCommit ? resolveSourceCommit : tryResolveSourceCommit)({
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
        followBadcaseCommit,
        sourceCommitMode: followBadcaseCommit ? 'badcase-log' : 'repo-head',
        dirty: null,
        matched: null,
        dryRunContextOnly: true,
      }
    : resolveReplaySourceVersion({ config, sourceCommit, followBadcaseCommit, services });
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
  const limiters = {
    replay: createLimiter(config.concurrency?.replayAttempts ?? 1),
    judge: createLimiter(config.concurrency?.judgeRequests ?? 2),
  };
  const casePromises = config.turns.map((turn) =>
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
      limiters,
      signal,
      services,
    }),
  );
  const caseResults = await allOrAbort(casePromises);

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

function resolveReplaySourceVersion({ config, sourceCommit, followBadcaseCommit, services }) {
  if (!followBadcaseCommit) {
    return services.resolveOreturnRepoHead({
      oreturnRepo: config.source.oreturnRepo,
      badcaseCommit: sourceCommit,
      allowDirty: config.source.allowDirtyEngine,
    });
  }
  return services.ensureOreturnReplayWorktree({
    oreturnRepo: config.source.oreturnRepo,
    sourceCommit,
    allowDirty: config.source.allowDirtyEngine,
  });
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
  limiters,
  signal,
  services,
}) {
  const caseOutputDir = path.join(resultDir, 'cases', `turn-${String(turn).padStart(3, '0')}`);
  await mkdir(caseOutputDir, { recursive: true });
  try {
    throwIfAborted(signal);
    const context = await services.buildTurnReplayContext({ logGroupDir, runId, turn });
    await writeJson(path.join(caseOutputDir, 'turn-replay-context.json'), context);
    throwIfAborted(signal);

    if (dryRunContextOnly) {
      return {
        turn,
        status: 'context-only',
        repeats,
        judgeResults: [],
        issueCount: context.issues.length,
      };
    }

    const runPromises = Array.from({ length: repeats }, async (_item, index) => {
      const runIndex = index + 1;
      const runOutputDir =
        repeats === 1
          ? caseOutputDir
          : path.join(caseOutputDir, 'runs', `run-${String(runIndex).padStart(3, '0')}`);
      await mkdir(runOutputDir, { recursive: true });
      return runReplayAttempt({
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
        limiters,
        signal,
        services,
      });
    });
    const runs = await allOrAbort(runPromises);

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
    if (isAbortError(error)) throw error;
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
  limiters,
  signal,
  services,
}) {
  try {
    const replay = await limiters.replay(() => {
      throwIfAborted(signal);
      return services.runOreturnReplay({
        oreturnRepo,
        caseOutputDir: outputDir,
        context,
        patchBundle,
        modelConfig: replayModelConfig,
        signal,
      });
    });
    throwIfAborted(signal);

    const regressionTask = regressionConsistency?.enabled === true
      ? runRegressionJudgeTask({
          outputDir,
          context,
          newOutput: replay.newOutput,
          regressionConsistency,
          judgeMode,
          judgeModelConfig,
          limiters,
          signal,
          services,
        })
      : Promise.resolve(null);

    const issueTasks = issueRepair?.enabled === false
      ? []
      : context.issues.map((issue, index) =>
          runIssueJudgeTask({
            outputDir,
            issue,
            issueIndex: index,
            context,
            newOutput: replay.newOutput,
            judgeMode,
            judgeModelConfig,
            limiters,
            signal,
            services,
          }),
        );
    const issueResultsTask = allOrAbort(issueTasks);
    const [regressionConsistencyResult, judgeResults] = await allOrAbort([
      regressionTask,
      issueResultsTask,
    ]);

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
    if (isAbortError(error)) throw error;
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

async function runRegressionJudgeTask({
  outputDir,
  context,
  newOutput,
  regressionConsistency,
  judgeMode,
  judgeModelConfig,
  limiters,
  signal,
  services,
}) {
  throwIfAborted(signal);
  const regressionInput = buildRegressionJudgeInput({
    context,
    newOutput,
    target: regressionConsistency.target ?? 'fullTurn',
  });
  await writeJson(
    path.join(outputDir, 'regression-consistency-judge-input.json'),
    regressionInput,
  );
  const regressionConsistencyResult = await limiters.judge(() => {
    throwIfAborted(signal);
    return services.runRegressionJudge({
      mode: judgeMode,
      modelConfig: judgeModelConfig,
      input: regressionInput,
      onRawResponse: (rawResponse) => writeJson(
        path.join(outputDir, 'regression-consistency-judge-raw-response.json'),
        rawResponse,
      ),
    });
  });
  throwIfAborted(signal);
  await writeJson(
    path.join(outputDir, 'regression-consistency-judge-result.json'),
    regressionConsistencyResult,
  );
  return regressionConsistencyResult;
}

async function runIssueJudgeTask({
  outputDir,
  issue,
  issueIndex,
  context,
  newOutput,
  judgeMode,
  judgeModelConfig,
  limiters,
  signal,
  services,
}) {
  throwIfAborted(signal);
  const issueId = issue.id ?? `issue-${String(issueIndex + 1).padStart(3, '0')}`;
  const issueDir = path.join(outputDir, 'issues', sanitizePathSegment(issueId));
  await mkdir(issueDir, { recursive: true });
  const judgeInput = buildJudgeInput({ issue, context, newOutput });
  await writeJson(path.join(issueDir, 'judge-input.json'), judgeInput);
  const judgeResult = await limiters.judge(() => {
    throwIfAborted(signal);
    return services.runJudge({
      mode: judgeMode,
      modelConfig: judgeModelConfig,
      input: judgeInput,
      onRawResponse: (rawResponse) => writeJson(
        path.join(issueDir, 'judge-raw-response.json'),
        rawResponse,
      ),
    });
  });
  throwIfAborted(signal);
  await writeJson(path.join(issueDir, 'judge-result.json'), judgeResult);
  await writeFile(
    path.join(issueDir, 'report.md'),
    renderIssueReportMarkdown({ issue, judgeResult }),
  );
  return { issueId, turn: issue.turn, ...judgeResult };
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

function throwIfAborted(signal) {
  if (!signal?.aborted) return;
  throw abortError(signal.reason);
}

function isAbortError(error) {
  return error?.name === 'AbortError' || error?.code === 'ABORT_ERR';
}

function abortError(reason) {
  if (reason instanceof Error) return reason;
  const error = new Error(reason ? String(reason) : 'Operation aborted');
  error.name = 'AbortError';
  error.code = 'ABORT_ERR';
  return error;
}

async function allOrAbort(promises) {
  try {
    return await Promise.all(promises);
  } catch (error) {
    if (isAbortError(error)) {
      await Promise.allSettled(promises);
    }
    throw error;
  }
}

export function createLimiter(max) {
  if (!Number.isInteger(max) || max < 1) {
    throw new Error('limiter max must be a positive integer');
  }
  let active = 0;
  const queue = [];

  function drain() {
    while (active < max && queue.length > 0) {
      const item = queue.shift();
      active += 1;
      Promise.resolve()
        .then(item.fn)
        .then(item.resolve, item.reject)
        .finally(() => {
          active -= 1;
          drain();
        });
    }
  }

  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      drain();
    });
  };
}
