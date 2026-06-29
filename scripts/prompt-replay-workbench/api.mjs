import { chmod, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import YAML from 'yaml';

import { loadReplayTask } from '../prompt-patch-replay/task-config.mjs';
import { runPromptPatchReplay as defaultRunPromptPatchReplay } from '../prompt-patch-replay/replay-service.mjs';
import {
  ensureOreturnReplayWorktree,
  resolveOreturnRepoHead,
  resolveSourceCommit,
  tryResolveSourceCommit,
} from '../prompt-patch-replay/source-version.mjs';
import { buildTurnReplayContext } from '../prompt-patch-replay/turn-context.mjs';
import { buildPatchBundleFromPromptSources, createPromptSourceDiff } from './patch-builder.mjs';
import { loadPromptSources as defaultLoadPromptSources } from './prompt-source.mjs';
import { readCaseArtifact, readReplaySummary, readRunArtifact } from './artifact-reader.mjs';
import { withPromptSourceAccess } from './static/prompt-source-access.js';

const DEFAULT_PROMPT_SOURCES_CONFIG = new URL('./default-prompt-sources.yaml', import.meta.url).pathname;
const WORKBENCH_TASK_DIR = '.workbench-tasks';
const LAST_MANUAL_SETUP_FILE = 'latest-manual-setup.json';
const REPLAY_STEP_MODEL_KEYS = ['director', 'narrator', 'choices', 'stateFold'];
const REASONING_EFFORTS = ['minimal', 'low', 'medium', 'high'];
const REPLAY_STEP_MODEL_ENV = {
  director: 'WORKBENCH_REPLAY_DIRECTOR_API_KEY',
  narrator: 'WORKBENCH_REPLAY_NARRATOR_API_KEY',
  choices: 'WORKBENCH_REPLAY_CHOICES_API_KEY',
  stateFold: 'WORKBENCH_REPLAY_STATE_FOLD_API_KEY',
};

export function createWorkbenchApiHandler({
  taskPath,
  promptSourcesConfigPath = DEFAULT_PROMPT_SOURCES_CONFIG,
  cwd = process.cwd(),
  now = () => new Date(),
  loadPromptSources = defaultLoadPromptSources,
  resolvePromptSourceVersion = defaultResolvePromptSourceVersion,
  runPromptPatchReplay = defaultRunPromptPatchReplay,
}) {
  let activeTaskPath = taskPath ? path.resolve(taskPath) : null;
  let activeSecrets = {};
  let activeSetupConfig = null;
  const replayJobs = createReplayJobQueue({ runPromptPatchReplay, cwd });

  const handleWorkbenchApi = async function handleWorkbenchApi(request) {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      if (request.method === 'GET' && url.pathname === '/api/bootstrap/defaults') {
        if (!activeTaskPath) {
          const restoredTask = await restoreLastManualSetup({ cwd });
          if (restoredTask) {
            activeTaskPath = restoredTask.taskPath;
            activeSecrets = restoredTask.secrets;
            activeSetupConfig = restoredTask.setupConfig;
          }
        }
        return jsonResponse(await readBootstrapDefaults({ activeTaskPath, cwd, activeSetupConfig }));
      }

      if (request.method === 'POST' && url.pathname === '/api/bootstrap/load') {
        const taskSnapshot = await writeManualTaskSnapshot({
          body: request.body ?? {},
          cwd,
        });
        activeTaskPath = taskSnapshot.taskPath;
        activeSecrets = taskSnapshot.secrets;
        activeSetupConfig = taskSnapshot.setupConfig;
        const task = await loadReplayTask(activeTaskPath);
        return jsonResponse({
          taskPath: activeTaskPath,
          config: task.config,
        });
      }

      if (request.method === 'GET' && url.pathname === '/api/task') {
        const task = await loadReplayTask(requireActiveTaskPath(activeTaskPath));
        return jsonResponse({
          config: task.config,
          patchBundle: task.patchBundle,
          patchBundlePath: task.patchBundlePath,
          resolvedSource: await safeResolvePromptSourceVersion({ task, cwd, resolvePromptSourceVersion }),
        });
      }

      if (request.method === 'GET' && url.pathname === '/api/cases') {
        return jsonResponse(await readTaskCases({ taskPath: requireActiveTaskPath(activeTaskPath), cwd }));
      }

      if (request.method === 'GET' && url.pathname === '/api/prompt-sources') {
        const task = await loadReplayTask(requireActiveTaskPath(activeTaskPath));
        const observedTurn = parseOptionalTurn(url.searchParams.get('turn'));
        if (observedTurn !== null) {
          return jsonResponse({
            sources: await readObservedPromptSources({ task, turn: observedTurn, cwd }),
            resolvedSource: await safeResolvePromptSourceVersion({ task, cwd, resolvePromptSourceVersion }),
          });
        }
        const resolvedSource = await resolvePromptSourceVersion({ task, cwd });
        const promptSourceRepo = requirePromptSourceRepo(resolvedSource);
        const sources = await loadPromptSources({
          configPath: promptSourcesConfigPath,
          oreturnRepo: promptSourceRepo,
          allowUnavailable: true,
        });
        return jsonResponse({ sources: sources.map(withPromptSourceAccess), resolvedSource });
      }

      if (request.method === 'POST' && url.pathname === '/api/prompt-sources/preview-diff') {
        const body = request.body ?? {};
        return jsonResponse({
          diff: createPromptSourceDiff({
            originalText: String(body.originalText ?? ''),
            draftText: String(body.draftText ?? ''),
          }),
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/replay/run') {
        const body = request.body ?? {};
        const effectiveTaskPath = Array.isArray(body.promptEdits) && body.promptEdits.length > 0
          ? await writeWorkbenchTaskSnapshot({ taskPath: requireActiveTaskPath(activeTaskPath), promptEdits: body.promptEdits, cwd, now })
          : requireActiveTaskPath(activeTaskPath);
        const task = await loadReplayTask(effectiveTaskPath);
        const job = replayJobs.enqueue({
          replayId: task.config.replayId,
          configPath: effectiveTaskPath,
          dryRunContextOnly: body.dryRunContextOnly === true,
          promptEditCount: Array.isArray(body.promptEdits) ? body.promptEdits.length : 0,
          secrets: { ...activeSecrets },
        });
        return jsonResponse(replayJobResponse(job), { status: 202 });
      }

      if (request.method === 'GET') {
        if (url.pathname === '/api/replay/jobs') {
          return jsonResponse({ jobs: replayJobs.list().map(replayJobResponse) });
        }

        if (url.pathname === '/api/replay/history') {
          return jsonResponse(await listReplayHistory({
            taskPath: requireActiveTaskPath(activeTaskPath),
            cwd,
          }));
        }

        const jobMatch = url.pathname.match(/^\/api\/replay\/jobs\/([^/]+)$/);
        if (jobMatch) {
          const job = replayJobs.get(jobMatch[1]);
          if (!job) return jsonResponse({ error: 'Replay job not found' }, { status: 404 });
          return jsonResponse(replayJobResponse(job));
        }

        const summaryMatch = url.pathname.match(/^\/api\/replay\/([^/]+)\/summary$/);
        if (summaryMatch) {
          return jsonResponse(await readReplaySummary({
            resultDir: await resolveResultDir({ taskPath: requireActiveTaskPath(activeTaskPath), replayId: summaryMatch[1], cwd }),
          }));
        }

        const caseMatch = url.pathname.match(/^\/api\/replay\/([^/]+)\/cases\/(\d+)$/);
        if (caseMatch) {
          return jsonResponse(await readCaseArtifact({
            resultDir: await resolveResultDir({ taskPath: requireActiveTaskPath(activeTaskPath), replayId: caseMatch[1], cwd }),
            turn: Number(caseMatch[2]),
          }));
        }

        const runMatch = url.pathname.match(/^\/api\/replay\/([^/]+)\/cases\/(\d+)\/runs\/(\d+)$/);
        if (runMatch) {
          return jsonResponse(await readRunArtifact({
            resultDir: await resolveResultDir({ taskPath: requireActiveTaskPath(activeTaskPath), replayId: runMatch[1], cwd }),
            turn: Number(runMatch[2]),
            runIndex: Number(runMatch[3]),
          }));
        }
      }

      return jsonResponse({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      return jsonResponse(
        {
          error: error instanceof Error ? error.message : String(error),
          code: error?.code,
        },
        { status: isBadRequestCode(error?.code) ? 400 : 500 },
      );
    }
  };
  handleWorkbenchApi.shutdown = (options) => replayJobs.shutdown(options);
  return handleWorkbenchApi;
}

function createReplayJobQueue({ runPromptPatchReplay, cwd }) {
  let nextJobId = 1;
  let activeJob = null;
  let activePromise = null;
  let shuttingDown = false;
  const jobs = new Map();
  const pending = [];

  function enqueue({ replayId, configPath, dryRunContextOnly, promptEditCount, secrets }) {
    const job = {
      jobId: `job-${String(nextJobId).padStart(6, '0')}`,
      replayId,
      status: 'queued',
      configPath,
      dryRunContextOnly,
      promptEditCount,
      secrets,
      resultDir: null,
      summaryPath: null,
      error: null,
      code: null,
      controller: new AbortController(),
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
    };
    nextJobId += 1;
    jobs.set(job.jobId, job);
    pending.push(job);
    schedule();
    return job;
  }

  function get(jobId) {
    return jobs.get(jobId) ?? null;
  }

  function list() {
    return [...jobs.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  function schedule() {
    if (shuttingDown || activeJob || pending.length === 0) return;
    const job = pending.shift();
    activeJob = job;
    job.status = 'running';
    job.startedAt = new Date().toISOString();
    activePromise = runJob(job).finally(() => {
      activeJob = null;
      activePromise = null;
      schedule();
    });
    void activePromise;
  }

  async function runJob(job) {
    try {
      const result = await withTemporaryEnv(job.secrets, () => runPromptPatchReplay({
        configPath: job.configPath,
        dryRunContextOnly: job.dryRunContextOnly,
        cwd,
        signal: job.controller.signal,
      }));
      if (job.controller.signal.aborted) {
        throw abortError(job.controller.signal.reason);
      }
      job.replayId = result.replayId;
      job.resultDir = result.resultDir;
      job.summaryPath = result.summaryPath;
      job.status = 'completed';
    } catch (error) {
      job.status = isAbortError(error) ? 'cancelled' : 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.code = error?.code;
    } finally {
      job.finishedAt = new Date().toISOString();
    }
  }

  async function shutdown({
    reason = 'Workbench server stopped before replay completed',
    timeoutMs = 10000,
  } = {}) {
    shuttingDown = true;
    const abortReason = abortError(reason);
    for (const job of pending.splice(0)) {
      job.status = 'cancelled';
      job.error = abortReason.message;
      job.code = abortReason.code;
      job.finishedAt = new Date().toISOString();
      job.controller.abort(abortReason);
    }
    if (activeJob && !activeJob.controller.signal.aborted) {
      activeJob.controller.abort(abortReason);
    }
    if (activePromise) {
      await Promise.race([
        activePromise.catch(() => {}),
        delay(timeoutMs),
      ]);
    }
  }

  return { enqueue, get, list, shutdown };
}

function replayJobResponse(job) {
  return {
    jobId: job.jobId,
    replayId: job.replayId,
    status: job.status,
    dryRunContextOnly: job.dryRunContextOnly,
    promptEditCount: job.promptEditCount ?? 0,
    createdAt: job.createdAt,
    ...(job.startedAt ? { startedAt: job.startedAt } : {}),
    ...(job.finishedAt ? { finishedAt: job.finishedAt } : {}),
    ...(job.resultDir ? { resultDir: job.resultDir } : {}),
    ...(job.summaryPath ? { summaryPath: job.summaryPath } : {}),
    ...(job.error ? { error: job.error } : {}),
    ...(job.code ? { code: job.code } : {}),
  };
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

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isBadRequestCode(code) {
  return [
    'WORKBENCH_TASK_NOT_CONFIGURED',
    'WORKBENCH_CONFIG_INVALID',
    'PATCH_SOURCE_TURN_SCOPED_MULTI_TURN',
  ].includes(code);
}

function requirePromptSourceRepo(resolvedSource) {
  if (resolvedSource?.replayEngineOreturnRepo) {
    return resolvedSource.replayEngineOreturnRepo;
  }
  const error = new Error('Prompt sources require a resolved oreturn source repo.');
  error.code = 'PROMPT_SOURCE_VERSION_UNRESOLVED';
  throw error;
}

async function defaultResolvePromptSourceVersion({ task, cwd }) {
  const logGroupDir = path.resolve(cwd, task.config.logGroupDir);
  const runConfigPath = path.join(logGroupDir, 'run_logs', task.config.runId, '00-run-config.json');
  const runConfig = await readJson(runConfigPath);
  const followBadcaseCommit = task.config.source.followBadcaseCommit !== false;
  const sourceCommit = (followBadcaseCommit ? resolveSourceCommit : tryResolveSourceCommit)({
    configCommit: task.config.source.oreturnCommit,
    runConfig,
    logGroupDir,
  });
  if (!followBadcaseCommit) {
    return resolveOreturnRepoHead({
      oreturnRepo: task.config.source.oreturnRepo,
      badcaseCommit: sourceCommit,
      allowDirty: task.config.source.allowDirtyEngine,
    });
  }
  return ensureOreturnReplayWorktree({
    oreturnRepo: task.config.source.oreturnRepo,
    sourceCommit,
    managedRoot: path.resolve(cwd, '.worktrees', 'prompt-patch-replay'),
    allowDirty: task.config.source.allowDirtyEngine,
  });
}

async function safeResolvePromptSourceVersion({ task, cwd, resolvePromptSourceVersion }) {
  try {
    return await resolvePromptSourceVersion({ task, cwd });
  } catch (error) {
    return {
      sourceOreturnCommit: task.config.source.oreturnCommit ?? null,
      oreturnRepo: path.resolve(cwd, task.config.source.oreturnRepo),
      replayEngineOreturnRepo: null,
      managedWorktree: null,
      followBadcaseCommit: task.config.source.followBadcaseCommit !== false,
      dirty: null,
      matched: false,
      error: error instanceof Error ? error.message : String(error),
      code: error?.code,
    };
  }
}

async function readBootstrapDefaults({ activeTaskPath, cwd, activeSetupConfig = null }) {
  if (activeTaskPath) {
    const task = await loadReplayTask(activeTaskPath);
    return {
      hasActiveTask: true,
      taskPath: activeTaskPath,
      config: task.config,
      ...(activeSetupConfig ? { setupConfig: activeSetupConfig } : {}),
    };
  }
  return {
    hasActiveTask: false,
    taskPath: null,
    config: defaultBootstrapConfig({ cwd }),
  };
}

function defaultBootstrapConfig({ cwd }) {
  return {
    replayId: 'prompt-replay-workbench',
    logGroupDir: 'logs/<branch-commit-memory-architecture>',
    runId: '<run-id>',
    turns: [],
    repeats: 1,
    source: {
      oreturnRepo: path.resolve(cwd, '../oreturn'),
      versionPolicy: 'require-matching-worktree',
      followBadcaseCommit: true,
    },
    models: {
      replay: defaultReplayModelConfig('REPLAY_API_KEY'),
      judge: defaultModelConfig('JUDGE_API_KEY'),
    },
    concurrency: {
      replayAttempts: 20,
      judgeRequests: 50,
    },
    judging: {
      issueRepair: { enabled: true },
      regressionConsistency: { enabled: true, target: 'fullTurn' },
    },
  };
}

function defaultModelConfig(apiKeyEnv) {
  return {
    keySource: 'direct',
    provider: 'openai-compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKeyEnv,
    model: 'deepseek-v4-flash',
  };
}

function defaultReplayModelConfig(apiKeyEnv) {
  return {
    ...defaultModelConfig(apiKeyEnv),
    thinkingEnabled: false,
    reasoningEffort: 'minimal',
  };
}

function requireActiveTaskPath(activeTaskPath) {
  if (activeTaskPath) return activeTaskPath;
  const error = new Error('Workbench task is not configured. Load a replay task from the setup page first.');
  error.code = 'WORKBENCH_TASK_NOT_CONFIGURED';
  throw error;
}

async function writeManualTaskSnapshot({ body, cwd }) {
  const taskSnapshot = buildManualTaskSnapshot({ body, cwd });
  await writeManualTaskFiles({ cwd, taskSnapshot, persistSetup: true });
  return taskSnapshot;
}

async function restoreLastManualSetup({ cwd }) {
  const setupState = await readLastManualSetup({ cwd });
  if (!setupState) return null;
  try {
    const taskSnapshot = buildManualTaskSnapshot({ body: setupState.setupConfig, cwd });
    await writeManualTaskFiles({ cwd, taskSnapshot, persistSetup: false });
    return taskSnapshot;
  } catch {
    return null;
  }
}

function buildManualTaskSnapshot({ body, cwd }) {
  const replayId = sanitizeReplayId(requiredString(body.replayId, 'replayId'));
  const { models, secrets } = normalizeModels(body.models);
  const logGroupDir = requiredString(body.logGroupDir, 'logGroupDir');
  const runId = requiredString(body.runId, 'runId');
  const turns = parseTurns(body.turns);
  const repeats = parseRepeats(body.repeats);
  const oreturnRepo = requiredString(body.oreturnRepo ?? body.source?.oreturnRepo, 'oreturnRepo');
  const versionPolicy = String(body.versionPolicy ?? body.source?.versionPolicy ?? 'require-matching-worktree');
  const followBadcaseCommit = normalizeFollowBadcaseCommit(
    body.followBadcaseCommit ?? body.source?.followBadcaseCommit,
  );
  const snapshot = {
    replayId,
    caseSet: {
      logGroupDir,
      runId,
      turns,
      repeats,
    },
    source: {
      oreturnRepo,
      versionPolicy,
      followBadcaseCommit,
      ...(!followBadcaseCommit ? { allowDirtyEngine: true } : {}),
    },
    models,
    ...(body.concurrency !== undefined ? { concurrency: body.concurrency } : {}),
    judging: body.judging,
    ...(body.judgeMode !== undefined ? { judgeMode: body.judgeMode } : {}),
    patchBundle: {
      id: `${replayId}-workbench-placeholder-patches`,
      description: 'Generated by Prompt Replay Workbench setup',
      patches: [
        {
          id: 'workbench-placeholder',
          originalText: '__WORKBENCH_PLACEHOLDER_PATCH__',
          replacementText: '__WORKBENCH_PLACEHOLDER_PATCH__',
        },
      ],
    },
  };
  const setupConfig = manualSetupConfig({
    body,
    replayId,
    logGroupDir,
    runId,
    turns,
    repeats,
    oreturnRepo,
    versionPolicy,
    followBadcaseCommit,
  });
  return {
    taskPath: path.join(workbenchTaskDir(cwd), `${replayId}-manual.yaml`),
    config: snapshot,
    secrets,
    setupConfig,
  };
}

async function writeManualTaskFiles({ cwd, taskSnapshot, persistSetup }) {
  const snapshotDir = workbenchTaskDir(cwd);
  await mkdir(snapshotDir, { recursive: true });
  await writeFile(taskSnapshot.taskPath, YAML.stringify(taskSnapshot.config));
  if (persistSetup) {
    await writeLastManualSetup({ cwd, taskSnapshot });
  }
}

function manualSetupConfig({
  body,
  replayId,
  logGroupDir,
  runId,
  turns,
  repeats,
  oreturnRepo,
  versionPolicy,
  followBadcaseCommit,
}) {
  return {
    replayId,
    logGroupDir,
    runId,
    turns,
    repeats,
    oreturnRepo,
    versionPolicy,
    followBadcaseCommit,
    models: {
      replay: manualReplayModelSetupConfig(body.models?.replay, defaultReplayModelConfig('REPLAY_API_KEY')),
      judge: manualModelSetupConfig(body.models?.judge, defaultModelConfig('JUDGE_API_KEY')),
    },
    ...(body.concurrency !== undefined ? { concurrency: body.concurrency } : {}),
    ...(body.judging !== undefined ? { judging: body.judging } : {}),
    ...(body.judgeMode !== undefined ? { judgeMode: body.judgeMode } : {}),
  };
}

function normalizeFollowBadcaseCommit(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') {
    return !['false', 'off', '0', 'no'].includes(value.toLowerCase());
  }
  return value !== false;
}

function manualReplayModelSetupConfig(model, defaults) {
  const replay = manualModelSetupConfig(model, defaults);
  const steps = manualStepModelSetupConfigs(model?.steps, defaults);
  return Object.keys(steps).length > 0 ? { ...replay, steps } : replay;
}

function manualStepModelSetupConfigs(steps, defaults) {
  if (!steps || typeof steps !== 'object' || Array.isArray(steps)) return {};
  return Object.fromEntries(
    REPLAY_STEP_MODEL_KEYS
      .filter((stepName) => steps[stepName] !== undefined)
      .map((stepName) => [stepName, manualModelSetupConfig(steps[stepName], defaults)]),
  );
}

function manualModelSetupConfig(model, defaults) {
  if (model?.keySource === 'direct') {
    return {
      keySource: 'direct',
      provider: model?.provider ?? defaults.provider,
      baseUrl: model?.baseUrl ?? defaults.baseUrl,
      apiKey: requiredString(model?.apiKey, 'apiKey'),
      apiKeyEnv: model?.apiKeyEnv ?? defaults.apiKeyEnv,
      model: model?.model ?? defaults.model,
      ...modelAdvancedOptions(model, defaults),
    };
  }
  return {
    keySource: model?.keySource ?? 'env',
    provider: model?.provider ?? defaults.provider,
    baseUrl: model?.baseUrl ?? defaults.baseUrl,
    apiKeyEnv: model?.apiKeyEnv ?? defaults.apiKeyEnv,
    model: model?.model ?? defaults.model,
    ...modelAdvancedOptions(model, defaults),
  };
}

async function writeLastManualSetup({ cwd, taskSnapshot }) {
  const setupPath = lastManualSetupPath(cwd);
  await writeFile(
    setupPath,
    `${JSON.stringify({
      version: 1,
      taskPath: taskSnapshot.taskPath,
      setupConfig: taskSnapshot.setupConfig,
    }, null, 2)}\n`,
    { mode: 0o600 },
  );
  await chmod(setupPath, 0o600);
}

async function readLastManualSetup({ cwd }) {
  try {
    const value = JSON.parse(await readFile(lastManualSetupPath(cwd), 'utf8'));
    if (!value || typeof value !== 'object' || typeof value.setupConfig !== 'object') return null;
    return value;
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    return null;
  }
}

function workbenchTaskDir(cwd) {
  return path.resolve(cwd, WORKBENCH_TASK_DIR);
}

function lastManualSetupPath(cwd) {
  return path.join(workbenchTaskDir(cwd), LAST_MANUAL_SETUP_FILE);
}

function requiredString(value, field) {
  const text = String(value ?? '').trim();
  if (text) return text;
  const error = new Error(`${field} is required`);
  error.code = 'WORKBENCH_CONFIG_INVALID';
  throw error;
}

function parseTurns(value) {
  const values = Array.isArray(value)
    ? value
    : String(value ?? '').split(',');
  const turns = values
    .map((item) => Number(String(item).trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
  if (turns.length > 0) return turns;
  const error = new Error('turns must include at least one positive integer');
  error.code = 'WORKBENCH_CONFIG_INVALID';
  throw error;
}

function parseOptionalTurn(value) {
  if (value === null || value === undefined || value === '') return null;
  const turn = Number(value);
  if (Number.isInteger(turn) && turn > 0) return turn;
  const error = new Error('turn must be a positive integer');
  error.code = 'WORKBENCH_CONFIG_INVALID';
  throw error;
}

function parseRepeats(value) {
  const repeats = Number(value ?? 1);
  return Number.isInteger(repeats) && repeats > 0 ? repeats : 1;
}

function normalizeModels(models) {
  const replay = normalizeReplayModel(models?.replay, defaultReplayModelConfig('REPLAY_API_KEY'));
  const judge = normalizeModel(models?.judge, defaultModelConfig('JUDGE_API_KEY'), 'WORKBENCH_JUDGE_API_KEY');
  return {
    models: {
      replay: replay.config,
      judge: judge.config,
    },
    secrets: {
      ...replay.secrets,
      ...judge.secrets,
    },
  };
}

function normalizeReplayModel(model, defaults) {
  const replay = normalizeModel(model, defaults, 'WORKBENCH_REPLAY_API_KEY');
  const stepResults = normalizeStepModels(model?.steps, defaults);
  const steps = Object.fromEntries(
    Object.entries(stepResults).map(([stepName, result]) => [stepName, result.config]),
  );
  return {
    config: {
      ...replay.config,
      ...(Object.keys(steps).length > 0 ? { steps } : {}),
    },
    secrets: {
      ...replay.secrets,
      ...Object.fromEntries(
        Object.values(stepResults).flatMap((result) => Object.entries(result.secrets)),
      ),
    },
  };
}

function normalizeStepModels(steps, defaults) {
  if (!steps || typeof steps !== 'object' || Array.isArray(steps)) return {};
  const normalized = {};
  for (const [stepName, stepModel] of Object.entries(steps)) {
    if (!REPLAY_STEP_MODEL_KEYS.includes(stepName)) {
      const error = new Error(`models.replay.steps.${stepName} must be one of ${REPLAY_STEP_MODEL_KEYS.join(', ')}`);
      error.code = 'WORKBENCH_CONFIG_INVALID';
      throw error;
    }
    normalized[stepName] = normalizeModel(stepModel, defaults, REPLAY_STEP_MODEL_ENV[stepName]);
  }
  return normalized;
}

function normalizeModel(model, defaults, directEnvName) {
  if (model?.keySource === 'direct') {
    return {
      config: {
        provider: model?.provider ?? defaults.provider,
        baseUrl: model?.baseUrl ?? defaults.baseUrl,
        apiKeyEnv: directEnvName,
        model: model?.model ?? defaults.model,
        ...modelAdvancedOptions(model, defaults),
      },
      secrets: {
        [directEnvName]: requiredString(model?.apiKey, `${directEnvName}.apiKey`),
      },
    };
  }
  return {
    config: {
      provider: model?.provider ?? defaults.provider,
      baseUrl: model?.baseUrl ?? defaults.baseUrl,
      apiKeyEnv: model?.apiKeyEnv ?? defaults.apiKeyEnv,
      model: model?.model ?? defaults.model,
      ...modelAdvancedOptions(model, defaults),
    },
    secrets: {},
  };
}

function modelAdvancedOptions(model, defaults) {
  const thinkingEnabled = model?.thinkingEnabled ?? defaults.thinkingEnabled;
  const reasoningEffort = model?.reasoningEffort ?? defaults.reasoningEffort;
  return {
    ...(thinkingEnabled !== undefined ? { thinkingEnabled: normalizeThinkingEnabled(thinkingEnabled) } : {}),
    ...(reasoningEffort !== undefined ? { reasoningEffort: normalizeReasoningEffort(reasoningEffort) } : {}),
  };
}

function normalizeThinkingEnabled(value) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function normalizeReasoningEffort(value) {
  if (REASONING_EFFORTS.includes(value)) return value;
  const error = new Error(`reasoningEffort must be one of ${REASONING_EFFORTS.join(', ')}`);
  error.code = 'WORKBENCH_CONFIG_INVALID';
  throw error;
}

function sanitizeReplayId(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'prompt-replay-workbench';
}

async function withTemporaryEnv(secrets, fn) {
  const previousValues = new Map();
  for (const [key, value] of Object.entries(secrets ?? {})) {
    previousValues.set(key, process.env[key]);
    process.env[key] = value;
  }
  try {
    return await fn();
  } finally {
    for (const [key, value] of previousValues) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function readTaskCases({ taskPath, cwd }) {
  const task = await loadReplayTask(taskPath);
  const logGroupDir = path.resolve(cwd, task.config.logGroupDir);
  const cases = [];
  for (const turn of task.config.turns) {
    const context = await buildTurnReplayContext({ logGroupDir, runId: task.config.runId, turn });
    cases.push(await projectCaseContext(context));
  }
  return { cases };
}

async function readObservedPromptSources({ task, turn, cwd }) {
  const logGroupDir = path.resolve(cwd, task.config.logGroupDir);
  const callsPath = path.join(logGroupDir, 'run_logs', task.config.runId, formatTurnDir(turn), '06-llm-calls.json');
  const calls = await readJson(callsPath);
  if (!Array.isArray(calls)) {
    const error = new Error(`Expected ${callsPath} to contain an array of LLM calls`);
    error.code = 'WORKBENCH_PROMPT_CALLS_INVALID';
    throw error;
  }

  return calls.flatMap((call, callIndex) =>
    promptSourcesForCall({
      turn,
      call,
      callIndex,
      stage: call.stage ?? inferStage(callIndex),
      replayTurnCount: task.config.turns.length,
    }),
  );
}

function promptSourcesForCall({ turn, call, callIndex, stage, replayTurnCount }) {
  const callKind = call.kind ?? 'unknown';
  const sources = [];
  if (typeof call.system === 'string') {
    sources.push(observedPromptSource({
      turn,
      callIndex,
      stage,
      callKind,
      fieldPath: 'system',
      text: call.system,
      label: `${stageTitle(stage)} / System`,
      replayTurnCount,
    }));
  }
  if (typeof call.prompt === 'string' && call.prompt.length > 0) {
    sources.push(observedPromptSource({
      turn,
      callIndex,
      stage,
      callKind,
      fieldPath: 'prompt',
      text: call.prompt,
      label: `${stageTitle(stage)} / Prompt`,
      replayTurnCount,
    }));
  }
  if (Array.isArray(call.messages)) {
    call.messages.forEach((message, messageIndex) => {
      if (typeof message?.content !== 'string') return;
      const fieldPath = `messages[${messageIndex}].content`;
      sources.push(observedPromptSource({
        turn,
        callIndex,
        stage,
        callKind,
        fieldPath,
        text: message.content,
        label: `${stageTitle(stage)} / ${messageLabel(message.content, messageIndex)}`,
        replayTurnCount,
      }));
    });
  }
  return sources;
}

function observedPromptSource({ turn, callIndex, stage, callKind, fieldPath, text, label, replayTurnCount }) {
  const scope = observedPromptScope({ fieldPath, text });
  return withPromptSourceAccess({
    id: `turn-${String(turn).padStart(3, '0')}.${stage}.${fieldPathToId(fieldPath)}`,
    label,
    sourceKind: 'observed-llm-call',
    patchMode: 'field',
    ...scope,
    turn,
    stage,
    callIndex,
    callKind,
    fieldPath,
    originalText: text,
    draftText: text,
    dirty: false,
    sourceHash: hashText(text),
  }, { replayTurnCount });
}

function observedPromptScope({ fieldPath, text }) {
  if (fieldPath === 'system') {
    return {
      patchScope: 'all',
      patchScopeKind: 'stable-instruction',
      patchScopeLabel: 'all badcase turns',
    };
  }

  const tag = leadingXmlTag(text);
  if (tag === 'player_input') {
    return {
      patchScope: 'all',
      patchScopeKind: 'slot-aware',
      patchScopeLabel: 'all badcase turns, preserving <player_input>',
      preserveTags: ['player_input'],
    };
  }

  return {
    patchScope: 'turn',
    patchScopeKind: 'turn-scoped-material',
    patchScopeLabel: 'current turn only',
  };
}

function fieldPathToId(fieldPath) {
  return fieldPath.replaceAll(/[^a-zA-Z0-9]+/g, '-').replaceAll(/^-|-$/g, '');
}

function stageTitle(stage) {
  return String(stage ?? 'unknown').replace(/(^|[-_\s])([a-z])/g, (_match, prefix, char) => `${prefix}${char.toUpperCase()}`);
}

function messageLabel(content, index) {
  const tag = leadingXmlTag(content);
  return tag ?? `Message ${index + 1}`;
}

function leadingXmlTag(content) {
  return /^<([a-zA-Z][\w:-]*)>/.exec(content.trim())?.[1] ?? null;
}

function inferStage(index) {
  return ['director', 'narrator', 'choice'][index] ?? `call-${index + 1}`;
}

function hashText(value) {
  return `sha256:${crypto.createHash('sha256').update(value).digest('hex')}`;
}

async function projectCaseContext(context) {
  const visibleContext = await enrichVisibleContextWithRawNarrative(context);
  return {
    caseId: context.caseId,
    runId: context.runId,
    turn: context.turn,
    turnInput: context.turnInput,
    issues: context.issues.map((issue, index) => projectIssue({ issue, index, visibleContext })),
    rootCauseReports: context.rootCauseReports,
    visibleContext,
    originalOutput: context.originalOutput,
    originalRawNarrativeHtml: rawNarrativeHtml(context.originalOutput),
    sourceFiles: context.sourceFiles,
  };
}

function projectIssue({ issue, index, visibleContext }) {
  const relatedTurnNumbers = new Set(
    (issue.conflictingTurns ?? [])
      .map((turn) => Number(turn))
      .filter((turn) => Number.isInteger(turn) && turn > 0 && turn !== Number(issue.turn)),
  );
  return {
    id: issue.id ?? `issue-${String(index + 1).padStart(3, '0')}`,
    ...issue,
    relatedTurns: visibleContext.filter((record) => relatedTurnNumbers.has(Number(record.turn))),
  };
}

async function enrichVisibleContextWithRawNarrative(context) {
  return Promise.all((context.visibleContext ?? []).map(async (record) => {
    const outputPath = path.join(context.runDir, formatTurnDir(record.turn), '04-output.json');
    const output = await readOptionalJson(outputPath);
    return {
      ...record,
      rawNarrativeHtml: rawNarrativeHtml(output),
    };
  }));
}

function rawNarrativeHtml(output) {
  return output?.normalizedContent?.rawHtml
    ?? output?.narrative
    ?? output?.writes?.find((write) => write?.target === 'turnContent')?.content?.rawHtml
    ?? null;
}

function formatTurnDir(turn) {
  return `turn-${String(turn).padStart(2, '0')}`;
}

async function resolveResultDir({ taskPath, replayId, cwd }) {
  const task = await loadReplayTask(taskPath);
  return path.resolve(cwd, task.config.logGroupDir, 'prompt-patch-replay', replayId);
}

async function listReplayHistory({ taskPath, cwd }) {
  const task = await loadReplayTask(taskPath);
  const historyRoot = path.resolve(cwd, task.config.logGroupDir, 'prompt-patch-replay');
  const entries = await readOptionalDirEntries(historyRoot);
  const items = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const resultDir = path.join(historyRoot, entry.name);
    const summaryPath = path.join(resultDir, 'summary.json');
    const configPath = path.join(resultDir, 'replay-config.json');
    const [summary, config, summaryStat, configStat, resultStat] = await Promise.all([
      readOptionalJson(summaryPath),
      readOptionalJson(configPath),
      readOptionalStat(summaryPath),
      readOptionalStat(configPath),
      stat(resultDir),
    ]);
    const updatedAt = summaryStat?.mtime ?? configStat?.mtime ?? resultStat.mtime;
    const replayId = summary?.replayId ?? config?.replayId ?? entry.name;
    items.push({
      replayId,
      status: summary ? 'completed' : 'incomplete',
      runId: summary?.runId ?? config?.runId ?? null,
      turns: config?.turns ?? summary?.cases?.map((item) => item.turn).filter((turn) => Number.isInteger(Number(turn))) ?? [],
      repeatCount: summary?.repeatCount ?? config?.repeats ?? 1,
      resultDir,
      summaryPath: path.join(resultDir, 'summary.md'),
      summaryJsonPath: summaryPath,
      updatedAt: updatedAt.toISOString(),
      ...(summary
        ? {
            turnCount: summary.turnCount,
            runCount: summary.runCount,
            passedRuns: summary.passedRuns,
            failedRuns: summary.failedRuns,
            overallPassRate: summary.overallPassRate,
            judgmentCount: summary.judgmentCount,
            regressionViolationRuns: summary.regressionViolationRuns,
          }
        : {}),
    });
  }
  items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  return { historyRoot, items };
}

async function writeWorkbenchTaskSnapshot({ taskPath, promptEdits, cwd, now }) {
  const task = await loadReplayTask(taskPath);
  const timestamp = formatTimestamp(now());
  const replayId = `${task.config.replayId}-workbench-${timestamp}`;
  const patchBundle = buildPatchBundleFromPromptSources({
    bundleId: `${replayId}-patches`,
    description: 'Generated by Prompt Replay Workbench',
    sources: promptEdits,
    replayTurnCount: task.config.turns.length,
  });
  const snapshot = {
    replayId,
    caseSet: {
      logGroupDir: task.config.logGroupDir,
      runId: task.config.runId,
      turns: task.config.turns,
      repeats: task.config.repeats,
    },
    source: task.config.source,
    models: task.config.models,
    concurrency: task.config.concurrency,
    judging: enableWorkbenchRegressionConsistency(task.config.judging),
    ...(task.config.judgeMode !== undefined ? { judgeMode: task.config.judgeMode } : {}),
    patchBundle,
  };
  const snapshotDir = path.resolve(cwd, '.workbench-tasks');
  await mkdir(snapshotDir, { recursive: true });
  const snapshotPath = path.join(snapshotDir, `${replayId}.yaml`);
  await writeFile(snapshotPath, YAML.stringify(snapshot));
  return snapshotPath;
}

function enableWorkbenchRegressionConsistency(judging) {
  return {
    ...(judging ?? {}),
    passVerdicts: judging?.passVerdicts ?? ['fixed'],
    regressionConsistency: {
      ...(judging?.regressionConsistency ?? {}),
      enabled: true,
      target: judging?.regressionConsistency?.target ?? 'fullTurn',
    },
  };
}

async function readOptionalJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function readOptionalDirEntries(dirPath) {
  try {
    return await readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

async function readOptionalStat(filePath) {
  try {
    return await stat(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function formatTimestamp(date) {
  return date.toISOString().replaceAll(':', '-').replace('.', '-');
}

function jsonResponse(value, { status = 200 } = {}) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: `${JSON.stringify(value)}\n`,
  };
}
