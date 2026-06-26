import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  buildBunEvalCommand,
  buildReplayEnv,
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
    },
  });

  assert.equal(env.KEEP, 'yes');
  assert.equal(env.LLM_PROVIDER, 'openai-compatible');
  assert.equal(env.LLM_BASE_URL, 'https://example.test/v1');
  assert.equal(env.LLM_API_KEY, 'secret');
  assert.equal(env.LLM_MODEL, 'model-a');
  assert.equal(env.LLM_THINKING_ENABLED, 'false');
});

test('oreturn eval runner writes partial artifacts on replay failure', () => {
  assert.match(ORETURN_EVAL_RUNNER_SOURCE, /finally/);
  assert.match(ORETURN_EVAL_RUNNER_SOURCE, /replay-error\.json/);
  assert.match(ORETURN_EVAL_RUNNER_SOURCE, /patch-application\.json/);
});
