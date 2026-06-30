import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import YAML from 'yaml';

import { validatePatchBundle, validateReplayConfig } from './config.mjs';

const REPLAY_STEP_MODEL_KEYS = ['director', 'narrator', 'choices', 'stateFold'];

export async function loadReplayTask(taskPath) {
  const resolvedTaskPath = path.resolve(taskPath);
  const taskDir = path.dirname(resolvedTaskPath);
  const rawTaskText = await readFile(resolvedTaskPath, 'utf8');
  const rawTask = parseTaskFile({ filePath: resolvedTaskPath, text: rawTaskText });

  if (typeof rawTask.patchBundlePath === 'string') {
    const config = validateReplayConfig(rawTask);
    const patchBundlePath = path.resolve(taskDir, config.patchBundlePath);
    const patchBundleRaw = await readFile(patchBundlePath, 'utf8');
    const patchBundle = validatePatchBundle(JSON.parse(patchBundleRaw));
    return { config, patchBundle, patchBundleRaw, patchBundlePath };
  }

  const patchBundle = validatePatchBundle(await resolveInlinePatchBundle(rawTask.patchBundle, taskDir));
  const config = validateReplayConfig(normalizeInlineReplayConfig(rawTask));
  const patchBundleRaw = `${JSON.stringify(patchBundle, null, 2)}\n`;
  return {
    config,
    patchBundle,
    patchBundleRaw,
    patchBundlePath: resolvedTaskPath,
  };
}

function parseTaskFile({ filePath, text }) {
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    return YAML.parse(text);
  }
  return JSON.parse(text);
}

function normalizeInlineReplayConfig(value) {
  assertObject(value, 'task');
  const caseSet = value.caseSet ?? {};
  const replayModel = normalizeReplayModel(value.models?.replay, 'models.replay');
  return {
    replayId: value.replayId,
    logGroupDir: value.logGroupDir ?? caseSet.logGroupDir,
    runId: value.runId ?? caseSet.runId,
    turns: value.turns ?? caseSet.turns,
    repeats: value.repeats ?? caseSet.repeats,
    patchBundlePath: null,
    source: value.source,
    models: {
      replay: replayModel,
      judge:
        value.models?.judge?.useReplayModel === true
          ? replayModel
          : normalizeModel(value.models?.judge, 'models.judge'),
    },
    ...(value.concurrency !== undefined || caseSet.concurrency !== undefined
      ? { concurrency: value.concurrency ?? caseSet.concurrency }
      : {}),
    ...(value.judging !== undefined ? { judging: value.judging } : {}),
    ...(value.judgeMode !== undefined ? { judgeMode: value.judgeMode } : {}),
  };
}

function normalizeModel(model, fieldPath) {
  assertObject(model, fieldPath);
  return {
    provider: model.provider ?? 'openai-compatible',
    baseUrl: model.baseUrl,
    apiKeyEnv: model.apiKeyEnv,
    model: model.model,
    ...(model.thinkingEnabled !== undefined ? { thinkingEnabled: model.thinkingEnabled } : {}),
    ...(model.reasoningEffort !== undefined ? { reasoningEffort: model.reasoningEffort } : {}),
  };
}

function normalizeReplayModel(model, fieldPath) {
  const replay = normalizeModel(model, fieldPath);
  if (model.steps === undefined) return replay;
  assertObject(model.steps, `${fieldPath}.steps`);
  const steps = {};
  for (const [stepName, stepModel] of Object.entries(model.steps)) {
    if (!REPLAY_STEP_MODEL_KEYS.includes(stepName)) {
      throw new Error(`${fieldPath}.steps.${stepName} must be one of ${REPLAY_STEP_MODEL_KEYS.join(', ')}`);
    }
    steps[stepName] = normalizeModel(stepModel, `${fieldPath}.steps.${stepName}`);
  }
  return Object.keys(steps).length > 0 ? { ...replay, steps } : replay;
}

async function resolveInlinePatchBundle(value, taskDir) {
  assertObject(value, 'patchBundle');
  if (!Array.isArray(value.patches)) {
    throw new Error('patchBundle.patches must be an array');
  }
  return {
    id: value.id,
    ...(typeof value.description === 'string' ? { description: value.description } : {}),
    patches: await Promise.all(
      value.patches.map((patch, index) => resolvePatchText({ patch, index, taskDir })),
    ),
  };
}

async function resolvePatchText({ patch, index, taskDir }) {
  assertObject(patch, `patches[${index}]`);
  const originalText = await resolveTextValue({
    patch,
    index,
    textField: 'originalText',
    fileField: 'originalFile',
    taskDir,
  });
  const replacementText = await resolveTextValue({
    patch,
    index,
    textField: 'replacementText',
    fileField: 'replacementFile',
    taskDir,
    allowEmpty: true,
  });
  assertHash({
    actualText: originalText,
    expectedHash: patch.originalHash,
    fieldPath: `patches[${index}].originalHash`,
  });
  assertHash({
    actualText: replacementText,
    expectedHash: patch.replacementHash,
    fieldPath: `patches[${index}].replacementHash`,
  });
  return {
    id: patch.id,
    ...(patch.matchMode !== undefined ? { matchMode: patch.matchMode } : {}),
    ...(patch.turn !== undefined ? { turn: patch.turn } : {}),
    ...(patch.sourceTurn !== undefined ? { sourceTurn: patch.sourceTurn } : {}),
    ...(patch.stage !== undefined ? { stage: patch.stage } : {}),
    ...(patch.callKind !== undefined ? { callKind: patch.callKind } : {}),
    ...(patch.fieldPath !== undefined ? { fieldPath: patch.fieldPath } : {}),
    ...(patch.preserveTags !== undefined ? { preserveTags: patch.preserveTags } : {}),
    originalText,
    replacementText,
  };
}

async function resolveTextValue({ patch, index, textField, fileField, taskDir, allowEmpty = false }) {
  const hasText = patch[textField] !== undefined;
  const hasFile = patch[fileField] !== undefined;
  if (hasText && hasFile) {
    throw new Error(`patches[${index}] cannot set both ${textField} and ${fileField}`);
  }
  if (!hasText && !hasFile) {
    throw new Error(`patches[${index}] must set ${textField} or ${fileField}`);
  }
  if (hasText) {
    if (typeof patch[textField] !== 'string') {
      throw new Error(`patches[${index}].${textField} must be a string`);
    }
    if (!allowEmpty && patch[textField].trim().length === 0) {
      throw new Error(`patches[${index}].${textField} must be non-empty`);
    }
    return patch[textField];
  }
  if (typeof patch[fileField] !== 'string' || patch[fileField].trim().length === 0) {
    throw new Error(`patches[${index}].${fileField} must be a non-empty string`);
  }
  return readFile(path.resolve(taskDir, patch[fileField]), 'utf8');
}

function assertHash({ actualText, expectedHash, fieldPath }) {
  if (expectedHash === undefined) return;
  if (typeof expectedHash !== 'string') {
    throw new Error(`${fieldPath} must be a string`);
  }
  const actualHash = hashText(actualText);
  if (actualHash !== expectedHash) {
    throw new Error(`${fieldPath} expected ${expectedHash}, got ${actualHash}`);
  }
}

function hashText(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function assertObject(value, fieldPath) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${fieldPath} must be an object`);
  }
}
