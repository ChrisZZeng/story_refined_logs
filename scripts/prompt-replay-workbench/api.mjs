import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import YAML from 'yaml';

import { loadReplayTask } from '../prompt-patch-replay/task-config.mjs';
import { runPromptPatchReplay as defaultRunPromptPatchReplay } from '../prompt-patch-replay/replay-service.mjs';
import { ensureOreturnReplayWorktree, resolveSourceCommit } from '../prompt-patch-replay/source-version.mjs';
import { buildTurnReplayContext } from '../prompt-patch-replay/turn-context.mjs';
import { buildPatchBundleFromPromptSources, createPromptSourceDiff } from './patch-builder.mjs';
import { loadPromptSources as defaultLoadPromptSources } from './prompt-source.mjs';
import { readCaseArtifact, readReplaySummary, readRunArtifact } from './artifact-reader.mjs';
import { withPromptSourceAccess } from './static/prompt-source-access.js';

const DEFAULT_PROMPT_SOURCES_CONFIG = new URL('./default-prompt-sources.yaml', import.meta.url).pathname;
const WORKBENCH_TASK_DIR = '.workbench-tasks';
const LAST_MANUAL_SETUP_FILE = 'latest-manual-setup.json';

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

  return async function handleWorkbenchApi(request) {
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
        const promptSourceRepo = requirePromptSourceWorktree(resolvedSource);
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
        const result = await withTemporaryEnv(activeSecrets, () => runPromptPatchReplay({
          configPath: effectiveTaskPath,
          dryRunContextOnly: body.dryRunContextOnly === true,
          cwd,
        }));
        return jsonResponse({
          replayId: result.replayId,
          resultDir: result.resultDir,
          summaryPath: result.summaryPath,
        });
      }

      if (request.method === 'GET') {
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
}

function isBadRequestCode(code) {
  return [
    'WORKBENCH_TASK_NOT_CONFIGURED',
    'WORKBENCH_CONFIG_INVALID',
    'PATCH_SOURCE_TURN_SCOPED_MULTI_TURN',
  ].includes(code);
}

function requirePromptSourceWorktree(resolvedSource) {
  if (resolvedSource?.managedWorktree === true && resolvedSource?.replayEngineOreturnRepo) {
    return resolvedSource.replayEngineOreturnRepo;
  }
  const error = new Error('Prompt sources require a resolved managed oreturn worktree; refusing to read from the main oreturn repo.');
  error.code = 'PROMPT_SOURCE_VERSION_UNRESOLVED';
  throw error;
}

async function defaultResolvePromptSourceVersion({ task, cwd }) {
  const logGroupDir = path.resolve(cwd, task.config.logGroupDir);
  const runConfigPath = path.join(logGroupDir, 'run_logs', task.config.runId, '00-run-config.json');
  const runConfig = await readJson(runConfigPath);
  const sourceCommit = resolveSourceCommit({
    configCommit: task.config.source.oreturnCommit,
    runConfig,
    logGroupDir,
  });
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
    },
    models: {
      replay: defaultModelConfig('REPLAY_API_KEY'),
      judge: defaultModelConfig('JUDGE_API_KEY'),
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
    },
    models,
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

function manualSetupConfig({ body, replayId, logGroupDir, runId, turns, repeats, oreturnRepo, versionPolicy }) {
  return {
    replayId,
    logGroupDir,
    runId,
    turns,
    repeats,
    oreturnRepo,
    versionPolicy,
    models: {
      replay: manualModelSetupConfig(body.models?.replay, defaultModelConfig('REPLAY_API_KEY')),
      judge: manualModelSetupConfig(body.models?.judge, defaultModelConfig('JUDGE_API_KEY')),
    },
    ...(body.judging !== undefined ? { judging: body.judging } : {}),
    ...(body.judgeMode !== undefined ? { judgeMode: body.judgeMode } : {}),
  };
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
      ...(model?.thinkingEnabled !== undefined ? { thinkingEnabled: model.thinkingEnabled } : {}),
    };
  }
  return {
    keySource: model?.keySource ?? 'env',
    provider: model?.provider ?? defaults.provider,
    baseUrl: model?.baseUrl ?? defaults.baseUrl,
    apiKeyEnv: model?.apiKeyEnv ?? defaults.apiKeyEnv,
    model: model?.model ?? defaults.model,
    ...(model?.thinkingEnabled !== undefined ? { thinkingEnabled: model.thinkingEnabled } : {}),
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
  const replay = normalizeModel(models?.replay, defaultModelConfig('REPLAY_API_KEY'), 'WORKBENCH_REPLAY_API_KEY');
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

function normalizeModel(model, defaults, directEnvName) {
  if (model?.keySource === 'direct') {
    return {
      config: {
        provider: model?.provider ?? defaults.provider,
        baseUrl: model?.baseUrl ?? defaults.baseUrl,
        apiKeyEnv: directEnvName,
        model: model?.model ?? defaults.model,
        ...(model?.thinkingEnabled !== undefined ? { thinkingEnabled: model.thinkingEnabled } : {}),
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
      ...(model?.thinkingEnabled !== undefined ? { thinkingEnabled: model.thinkingEnabled } : {}),
    },
    secrets: {},
  };
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
