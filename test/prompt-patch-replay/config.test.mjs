import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validatePatchBundle,
  validateReplayConfig,
} from '../../scripts/prompt-patch-replay/config.mjs';

test('validatePatchBundle accepts explicit original and replacement text', () => {
  const bundle = validatePatchBundle({
    id: 'bundle-a',
    patches: [
      {
        id: 'rule-a',
        originalText: 'old paragraph',
        replacementText: 'new paragraph',
      },
    ],
  });

  assert.equal(bundle.id, 'bundle-a');
  assert.equal(bundle.patches[0].id, 'rule-a');
});

test('validatePatchBundle rejects missing original text', () => {
  assert.throws(
    () =>
      validatePatchBundle({
        id: 'bundle-a',
        patches: [{ id: 'rule-a', replacementText: 'new' }],
      }),
    /patches\[0\]\.originalText/,
  );
});

test('validateReplayConfig accepts mode1 replay config', () => {
  const config = validateReplayConfig({
    replayId: 'replay-a',
    logGroupDir: 'logs/group-a',
    runId: 'run-a',
    turns: [3, 9],
    patchBundlePath: 'patches/a.json',
    source: {
      oreturnRepo: '/repo/oreturn',
      oreturnCommit: 'abcdef123456',
      versionPolicy: 'require-matching-worktree',
    },
    models: {
      replay: {
        provider: 'openai-compatible',
        baseUrl: 'http://llm/v1',
        apiKeyEnv: 'REPLAY_KEY',
        model: 'replay-model',
        thinkingEnabled: false,
      },
      judge: {
        provider: 'openai-compatible',
        baseUrl: 'http://judge/v1',
        apiKeyEnv: 'JUDGE_KEY',
        model: 'judge-model',
      },
    },
  });

  assert.deepEqual(config.turns, [3, 9]);
  assert.equal(config.source.versionPolicy, 'require-matching-worktree');
  assert.equal(config.models.replay.thinkingEnabled, false);
});

test('validateReplayConfig defaults version policy', () => {
  const config = validateReplayConfig({
    replayId: 'replay-a',
    logGroupDir: 'logs/group-a',
    runId: 'run-a',
    turns: [3],
    patchBundlePath: 'patches/a.json',
    source: {
      oreturnRepo: '/repo/oreturn',
      oreturnCommit: 'abcdef123456',
    },
    models: {
      replay: {
        provider: 'openai-compatible',
        baseUrl: 'http://llm/v1',
        apiKeyEnv: 'REPLAY_KEY',
        model: 'replay-model',
      },
      judge: {
        provider: 'openai-compatible',
        baseUrl: 'http://judge/v1',
        apiKeyEnv: 'JUDGE_KEY',
        model: 'judge-model',
      },
    },
  });

  assert.equal(config.source.versionPolicy, 'require-matching-worktree');
});

test('validateReplayConfig accepts repeats and pass verdicts', () => {
  const config = validateReplayConfig({
    replayId: 'replay-a',
    logGroupDir: 'logs/group-a',
    runId: 'run-a',
    turns: [3],
    repeats: 5,
    patchBundlePath: 'patches/a.json',
    source: {
      oreturnRepo: '/repo/oreturn',
    },
    models: {
      replay: {
        provider: 'openai-compatible',
        baseUrl: 'http://llm/v1',
        apiKeyEnv: 'REPLAY_KEY',
        model: 'replay-model',
      },
      judge: {
        provider: 'openai-compatible',
        baseUrl: 'http://judge/v1',
        apiKeyEnv: 'JUDGE_KEY',
        model: 'judge-model',
      },
    },
    judging: {
      passVerdicts: ['fixed', 'improved'],
    },
  });

  assert.equal(config.repeats, 5);
  assert.deepEqual(config.judging.passVerdicts, ['fixed', 'improved']);
});

test('validateReplayConfig accepts regression consistency judge options', () => {
  const config = validateReplayConfig({
    replayId: 'replay-a',
    logGroupDir: 'logs/group-a',
    runId: 'run-a',
    turns: [3],
    patchBundlePath: 'patches/a.json',
    source: {
      oreturnRepo: '/repo/oreturn',
    },
    models: {
      replay: {
        provider: 'openai-compatible',
        baseUrl: 'http://llm/v1',
        apiKeyEnv: 'REPLAY_KEY',
        model: 'replay-model',
      },
      judge: {
        provider: 'openai-compatible',
        baseUrl: 'http://judge/v1',
        apiKeyEnv: 'JUDGE_KEY',
        model: 'judge-model',
      },
    },
    judging: {
      regressionConsistency: { enabled: true, target: 'fullTurn' },
    },
  });

  assert.deepEqual(config.judging.passVerdicts, ['fixed']);
  assert.deepEqual(config.judging.regressionConsistency, { enabled: true, target: 'fullTurn' });
});

test('validateReplayConfig accepts explicit regression consistency judge disable', () => {
  const config = validateReplayConfig({
    replayId: 'replay-a',
    logGroupDir: 'logs/group-a',
    runId: 'run-a',
    turns: [3],
    patchBundlePath: 'patches/a.json',
    source: {
      oreturnRepo: '/repo/oreturn',
    },
    models: {
      replay: {
        provider: 'openai-compatible',
        baseUrl: 'http://llm/v1',
        apiKeyEnv: 'REPLAY_KEY',
        model: 'replay-model',
      },
      judge: {
        provider: 'openai-compatible',
        baseUrl: 'http://judge/v1',
        apiKeyEnv: 'JUDGE_KEY',
        model: 'judge-model',
      },
    },
    judging: {
      regressionConsistency: { enabled: false, target: 'fullTurn' },
    },
  });

  assert.deepEqual(config.judging.regressionConsistency, { enabled: false, target: 'fullTurn' });
});

test('validateReplayConfig enables regression consistency judge by default', () => {
  const config = validateReplayConfig({
    replayId: 'replay-a',
    logGroupDir: 'logs/group-a',
    runId: 'run-a',
    turns: [3],
    patchBundlePath: 'patches/a.json',
    source: {
      oreturnRepo: '/repo/oreturn',
    },
    models: {
      replay: {
        provider: 'openai-compatible',
        baseUrl: 'http://llm/v1',
        apiKeyEnv: 'REPLAY_KEY',
        model: 'replay-model',
      },
      judge: {
        provider: 'openai-compatible',
        baseUrl: 'http://judge/v1',
        apiKeyEnv: 'JUDGE_KEY',
        model: 'judge-model',
      },
    },
  });

  assert.deepEqual(config.judging.regressionConsistency, { enabled: true, target: 'fullTurn' });
});
