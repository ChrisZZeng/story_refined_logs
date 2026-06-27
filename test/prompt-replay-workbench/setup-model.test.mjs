import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DIRECT_TOKEN_KEY_SOURCE,
  modelPayload,
  setupModelFormState,
} from '../../scripts/prompt-replay-workbench/static/setup-model.js';

test('setup model form defaults to direct token instead of env var', () => {
  const state = setupModelFormState({
    configModel: {
      baseUrl: 'https://example.test/v1',
      apiKeyEnv: 'REPLAY_API_KEY',
      model: 'model-a',
    },
  });

  assert.equal(state.keySource, DIRECT_TOKEN_KEY_SOURCE);
  assert.equal(state.apiKeyToken, '');
  assert.equal(state.apiKeyEnv, 'REPLAY_API_KEY');
});

test('setup model form keeps an existing direct token when repopulated from normalized task config', () => {
  const state = setupModelFormState({
    configModel: {
      baseUrl: 'https://example.test/v1',
      apiKeyEnv: 'WORKBENCH_REPLAY_API_KEY',
      model: 'model-a',
    },
    currentToken: 'already-entered-token',
  });

  assert.equal(state.keySource, DIRECT_TOKEN_KEY_SOURCE);
  assert.equal(state.apiKeyToken, 'already-entered-token');
});

test('setup model payload always submits a direct token model', () => {
  assert.deepEqual(
    modelPayload({
      baseUrl: 'https://example.test/v1',
      apiKey: 'direct-token',
      model: 'model-a',
    }),
    {
      keySource: DIRECT_TOKEN_KEY_SOURCE,
      provider: 'openai-compatible',
      baseUrl: 'https://example.test/v1',
      apiKey: 'direct-token',
      model: 'model-a',
    },
  );
});
