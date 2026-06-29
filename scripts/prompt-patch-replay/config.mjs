const VERSION_POLICY = 'require-matching-worktree';
const VERDICTS = ['fixed', 'improved', 'unchanged', 'regressed', 'uncertain'];
const REPLAY_STEP_MODEL_KEYS = ['director', 'narrator', 'choices', 'stateFold'];
const REASONING_EFFORTS = ['minimal', 'low', 'medium', 'high'];

export function validatePatchBundle(value) {
  assertObject(value, 'patchBundle');
  assertNonEmptyString(value.id, 'id');
  if (!Array.isArray(value.patches) || value.patches.length === 0) {
    throw new Error('patches must be a non-empty array');
  }

  return {
    id: value.id,
    ...(typeof value.description === 'string' ? { description: value.description } : {}),
    patches: value.patches.map((patch, index) => validatePatch(patch, index)),
  };
}

export function validateReplayConfig(value) {
  assertObject(value, 'config');
  assertNonEmptyString(value.replayId, 'replayId');
  assertNonEmptyString(value.logGroupDir, 'logGroupDir');
  assertNonEmptyString(value.runId, 'runId');
  if (value.patchBundlePath !== null) {
    assertNonEmptyString(value.patchBundlePath, 'patchBundlePath');
  }
  if (!Array.isArray(value.turns) || value.turns.length === 0) {
    throw new Error('turns must be a non-empty array');
  }
  const turns = value.turns.map((turn, index) => {
    if (!Number.isInteger(turn) || turn < 1) {
      throw new Error(`turns[${index}] must be a positive integer`);
    }
    return turn;
  });

  return {
    replayId: value.replayId,
    logGroupDir: value.logGroupDir,
    runId: value.runId,
    turns,
    repeats: validateRepeats(value.repeats),
    patchBundlePath: value.patchBundlePath,
    source: validateSource(value.source),
    models: validateModels(value.models),
    concurrency: validateConcurrency(value.concurrency),
    judging: validateJudging(value.judging),
    ...(value.judgeMode !== undefined ? { judgeMode: value.judgeMode } : {}),
  };
}

function validatePatch(patch, index) {
  assertObject(patch, `patches[${index}]`);
  assertNonEmptyString(patch.id, `patches[${index}].id`);
  assertNonEmptyString(patch.originalText, `patches[${index}].originalText`);
  assertString(patch.replacementText, `patches[${index}].replacementText`);
  const matchMode = patch.matchMode ?? 'text';
  if (!['text', 'field'].includes(matchMode)) {
    throw new Error(`patches[${index}].matchMode must be text or field`);
  }
  if (patch.turn !== undefined && (!Number.isInteger(patch.turn) || patch.turn < 1)) {
    throw new Error(`patches[${index}].turn must be a positive integer`);
  }
  if (
    patch.sourceTurn !== undefined &&
    (!Number.isInteger(patch.sourceTurn) || patch.sourceTurn < 1)
  ) {
    throw new Error(`patches[${index}].sourceTurn must be a positive integer`);
  }
  if (patch.stage !== undefined) assertNonEmptyString(patch.stage, `patches[${index}].stage`);
  if (patch.callKind !== undefined) assertNonEmptyString(patch.callKind, `patches[${index}].callKind`);
  if (patch.fieldPath !== undefined) assertNonEmptyString(patch.fieldPath, `patches[${index}].fieldPath`);
  if (patch.preserveTags !== undefined) {
    validatePreserveTags(patch.preserveTags, `patches[${index}].preserveTags`);
  }
  return {
    id: patch.id,
    ...(matchMode !== 'text' ? { matchMode } : {}),
    ...(patch.turn !== undefined ? { turn: patch.turn } : {}),
    ...(patch.sourceTurn !== undefined ? { sourceTurn: patch.sourceTurn } : {}),
    ...(patch.stage !== undefined ? { stage: patch.stage } : {}),
    ...(patch.callKind !== undefined ? { callKind: patch.callKind } : {}),
    ...(patch.fieldPath !== undefined ? { fieldPath: patch.fieldPath } : {}),
    ...(patch.preserveTags !== undefined ? { preserveTags: patch.preserveTags } : {}),
    originalText: patch.originalText,
    replacementText: patch.replacementText,
  };
}

function validatePreserveTags(value, path) {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
  for (const [index, tag] of value.entries()) {
    assertNonEmptyString(tag, `${path}[${index}]`);
  }
}

function validateSource(source) {
  assertObject(source, 'source');
  assertNonEmptyString(source.oreturnRepo, 'source.oreturnRepo');
  if (source.oreturnCommit !== undefined) {
    assertNonEmptyString(source.oreturnCommit, 'source.oreturnCommit');
  }
  const versionPolicy = source.versionPolicy ?? VERSION_POLICY;
  if (versionPolicy !== VERSION_POLICY) {
    throw new Error(`source.versionPolicy must be ${VERSION_POLICY}`);
  }
  const followBadcaseCommit = source.followBadcaseCommit !== false;
  const allowDirtyEngine =
    source.allowDirtyEngine !== undefined
      ? Boolean(source.allowDirtyEngine)
      : followBadcaseCommit
        ? undefined
        : true;
  return {
    oreturnRepo: source.oreturnRepo,
    ...(source.oreturnCommit !== undefined ? { oreturnCommit: source.oreturnCommit } : {}),
    versionPolicy,
    followBadcaseCommit,
    ...(allowDirtyEngine !== undefined ? { allowDirtyEngine } : {}),
  };
}

function validateModels(models) {
  assertObject(models, 'models');
  return {
    replay: validateReplayModel(models.replay, 'models.replay'),
    judge: validateOpenAiModel(models.judge, 'models.judge'),
  };
}

function validateRepeats(value) {
  if (value === undefined) return 1;
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('repeats must be a positive integer');
  }
  return value;
}

function validateConcurrency(value) {
  if (value === undefined) {
    return {
      replayAttempts: 1,
      judgeRequests: 2,
    };
  }
  assertObject(value, 'concurrency');
  return {
    replayAttempts: validatePositiveInteger(
      value.replayAttempts ?? 1,
      'concurrency.replayAttempts',
    ),
    judgeRequests: validatePositiveInteger(
      value.judgeRequests ?? 2,
      'concurrency.judgeRequests',
    ),
  };
}

function validatePositiveInteger(value, path) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${path} must be a positive integer`);
  }
  return value;
}

function validateJudging(judging) {
  if (judging === undefined) {
    return {
      issueRepair: { enabled: true },
      passVerdicts: ['fixed'],
      regressionConsistency: { enabled: true, target: 'fullTurn' },
    };
  }
  assertObject(judging, 'judging');
  const passVerdicts = validatePassVerdicts(judging.passVerdicts);
  return {
    issueRepair: validateIssueRepair(judging.issueRepair),
    passVerdicts,
    regressionConsistency: validateRegressionConsistency(judging.regressionConsistency),
  };
}

function validatePassVerdicts(value) {
  if (value === undefined) return ['fixed'];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('judging.passVerdicts must be a non-empty array');
  }
  return value.map((verdict, index) => {
    if (!VERDICTS.includes(verdict)) {
      throw new Error(`judging.passVerdicts[${index}] must be one of ${VERDICTS.join(', ')}`);
    }
    return verdict;
  });
}

function validateIssueRepair(value) {
  if (value === undefined) return { enabled: true };
  assertObject(value, 'judging.issueRepair');
  return {
    enabled: value.enabled !== false,
  };
}

function validateRegressionConsistency(value) {
  if (value === undefined) return { enabled: true, target: 'fullTurn' };
  assertObject(value, 'judging.regressionConsistency');
  const target = value.target ?? 'fullTurn';
  if (target !== 'fullTurn') {
    throw new Error('judging.regressionConsistency.target must be fullTurn');
  }
  return {
    enabled: value.enabled === true,
    target,
  };
}

function validateOpenAiModel(model, path) {
  assertObject(model, path);
  if (model.provider !== 'openai-compatible') {
    throw new Error(`${path}.provider must be openai-compatible`);
  }
  assertNonEmptyString(model.baseUrl, `${path}.baseUrl`);
  assertNonEmptyString(model.apiKeyEnv, `${path}.apiKeyEnv`);
  assertNonEmptyString(model.model, `${path}.model`);
  if (model.thinkingEnabled !== undefined && typeof model.thinkingEnabled !== 'boolean') {
    throw new Error(`${path}.thinkingEnabled must be a boolean`);
  }
  if (model.reasoningEffort !== undefined && !REASONING_EFFORTS.includes(model.reasoningEffort)) {
    throw new Error(`${path}.reasoningEffort must be one of ${REASONING_EFFORTS.join(', ')}`);
  }
  return {
    provider: 'openai-compatible',
    baseUrl: model.baseUrl,
    apiKeyEnv: model.apiKeyEnv,
    model: model.model,
    ...(model.thinkingEnabled !== undefined ? { thinkingEnabled: model.thinkingEnabled } : {}),
    ...(model.reasoningEffort !== undefined ? { reasoningEffort: model.reasoningEffort } : {}),
  };
}

function validateReplayModel(model, path) {
  const replay = validateOpenAiModel(model, path);
  if (model.steps === undefined) return replay;
  assertObject(model.steps, `${path}.steps`);
  const steps = {};
  for (const [stepName, stepModel] of Object.entries(model.steps)) {
    if (!REPLAY_STEP_MODEL_KEYS.includes(stepName)) {
      throw new Error(`${path}.steps.${stepName} must be one of ${REPLAY_STEP_MODEL_KEYS.join(', ')}`);
    }
    steps[stepName] = validateOpenAiModel(stepModel, `${path}.steps.${stepName}`);
  }
  return Object.keys(steps).length > 0 ? { ...replay, steps } : replay;
}

function assertObject(value, path) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
}

function assertNonEmptyString(value, path) {
  assertString(value, path);
  if (value.trim().length === 0) throw new Error(`${path} must be non-empty`);
}

function assertString(value, path) {
  if (typeof value !== 'string') throw new Error(`${path} must be a string`);
}
