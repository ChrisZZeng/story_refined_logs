import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  buildBunEvalCommand,
  buildReplayEnv,
  runCommand,
  writeReplayInput,
} from '../../scripts/prompt-patch-replay/oreturn-engine.mjs';
import { ORETURN_EVAL_RUNNER_SOURCE } from '../../scripts/prompt-patch-replay/oreturn-eval-runner-source.mjs';

test('buildBunEvalCommand targets oreturn packages/core with bun eval', () => {
  const command = buildBunEvalCommand({
    oreturnRepo: '/repo/oreturn',
    evalSource: 'console.log("ok")',
  });

  assert.equal(command.command, 'bun');
  assert.equal(command.cwd, path.join('/repo/oreturn', 'packages/core'));
  assert.deepEqual(command.args, ['--eval', 'console.log("ok")']);
});

test('writeReplayInput writes turn input, story state, and patch bundle', async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'story-replay-engine-'));
  const inputPath = await writeReplayInput({
    outDir,
    context: {
      turnInput: { trigger: { kind: 'player-input', playerInput: 'go' } },
      storyState: { marker: 'state' },
    },
    patchBundle: { id: 'bundle', patches: [] },
  });

  const parsed = JSON.parse(await readFile(inputPath, 'utf8'));
  assert.equal(parsed.turnInput.trigger.playerInput, 'go');
  assert.equal(parsed.storyState.marker, 'state');
  assert.equal(parsed.patchBundle.id, 'bundle');
});

test('buildReplayEnv maps replay model config to oreturn LLM env', () => {
  const env = buildReplayEnv({
    baseEnv: { KEEP: 'yes', REPLAY_API_KEY: 'secret' },
    modelConfig: {
      provider: 'openai-compatible',
      baseUrl: 'https://example.test/v1',
      apiKeyEnv: 'REPLAY_API_KEY',
      model: 'model-a',
      thinkingEnabled: false,
      reasoningEffort: 'minimal',
    },
  });

  assert.equal(env.KEEP, 'yes');
  assert.equal(env.LLM_PROVIDER, 'openai-compatible');
  assert.equal(env.LLM_BASE_URL, 'https://example.test/v1');
  assert.equal(env.LLM_API_KEY, 'secret');
  assert.equal(env.LLM_MODEL, 'model-a');
  assert.equal(env.LLM_THINKING_ENABLED, 'false');
  assert.equal(env.LLM_REASONING_EFFORT, 'minimal');
  assert.equal(env.LLM_DIRECTOR_MODEL, 'model-a');
  assert.equal(env.LLM_NARRATOR_MODEL, 'model-a');
  assert.equal(env.LLM_CHOICES_MODEL, 'model-a');
  assert.equal(env.LLM_STATE_FOLD_MODEL, 'model-a');
});

test('buildReplayEnv maps replay step model overrides to prefixed oreturn env', () => {
  const env = buildReplayEnv({
    baseEnv: {
      REPLAY_API_KEY: 'global-secret',
      DIRECTOR_API_KEY: 'director-secret',
      STATE_FOLD_API_KEY: 'state-secret',
      LLM_DIRECTOR_MODEL: 'stale-director-model',
    },
    modelConfig: {
      provider: 'openai-compatible',
      baseUrl: 'https://global.test/v1',
      apiKeyEnv: 'REPLAY_API_KEY',
      model: 'global-model',
      steps: {
        director: {
          provider: 'openai-compatible',
          baseUrl: 'https://director.test/v1',
          apiKeyEnv: 'DIRECTOR_API_KEY',
          model: 'director-model',
          thinkingEnabled: true,
          reasoningEffort: 'high',
        },
        stateFold: {
          provider: 'openai-compatible',
          baseUrl: 'https://state.test/v1',
          apiKeyEnv: 'STATE_FOLD_API_KEY',
          model: 'state-model',
        },
      },
    },
  });

  assert.equal(env.LLM_MODEL, 'global-model');
  assert.equal(env.LLM_DIRECTOR_BASE_URL, 'https://director.test/v1');
  assert.equal(env.LLM_DIRECTOR_API_KEY, 'director-secret');
  assert.equal(env.LLM_DIRECTOR_MODEL, 'director-model');
  assert.equal(env.LLM_DIRECTOR_THINKING_ENABLED, 'true');
  assert.equal(env.LLM_DIRECTOR_REASONING_EFFORT, 'high');
  assert.equal(env.LLM_NARRATOR_MODEL, 'global-model');
  assert.equal(env.LLM_CHOICES_API_KEY, 'global-secret');
  assert.equal(env.LLM_STATE_FOLD_MODEL, 'state-model');
  assert.equal(env.LLM_STATE_FOLD_API_KEY, 'state-secret');
  assert.equal(env.LLM_STATE_FOLD_THINKING_ENABLED, '');
  assert.equal(env.LLM_STATE_FOLD_REASONING_EFFORT, '');
});

test('oreturn eval runner writes partial artifacts on replay failure', () => {
  assert.match(ORETURN_EVAL_RUNNER_SOURCE, /finally/);
  assert.match(ORETURN_EVAL_RUNNER_SOURCE, /replay-error\.json/);
  assert.match(ORETURN_EVAL_RUNNER_SOURCE, /patch-application\.json/);
  assert.match(ORETURN_EVAL_RUNNER_SOURCE, /buildModelFromEnv\('LLM_DIRECTOR'\)/);
  assert.match(ORETURN_EVAL_RUNNER_SOURCE, /buildModelFromEnv\('LLM_STATE_FOLD'\)/);
});

test('runCommand resolves on zero exit and rejects non-zero exit', async () => {
  await runCommand(process.execPath, ['-e', 'process.exit(0)'], {});

  await assert.rejects(
    () => runCommand(process.execPath, ['-e', 'process.exit(3)'], {}),
    /exited with code 3/,
  );
});

test('runCommand aborts a running child process', async () => {
  const controller = new AbortController();
  const running = runCommand(
    process.execPath,
    ['-e', 'setTimeout(() => {}, 10000)'],
    { signal: controller.signal, stdio: 'ignore', graceMs: 10 },
  );

  setTimeout(() => {
    const error = new Error('test abort');
    error.name = 'AbortError';
    error.code = 'ABORT_ERR';
    controller.abort(error);
  }, 20);

  await assert.rejects(running, /test abort/);
});
