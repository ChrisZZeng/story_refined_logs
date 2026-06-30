import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DIRECT_TOKEN_KEY_SOURCE,
  ENV_KEY_SOURCE,
  modelPayload,
  replayModelPayload,
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
  assert.equal(state.thinkingEnabled, false);
  assert.equal(state.reasoningEffort, 'minimal');
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

test('setup model form restores persisted direct token from setup config', () => {
  const state = setupModelFormState({
    configModel: {
      keySource: DIRECT_TOKEN_KEY_SOURCE,
      baseUrl: 'https://example.test/v1',
      apiKey: 'saved-token',
      model: 'model-a',
    },
  });

  assert.equal(state.keySource, DIRECT_TOKEN_KEY_SOURCE);
  assert.equal(state.apiKeyToken, 'saved-token');
});

test('setup model form supports environment variable key source', () => {
  const state = setupModelFormState({
    configModel: {
      keySource: ENV_KEY_SOURCE,
      baseUrl: 'https://example.test/v1',
      apiKeyEnv: 'REPLAY_API_KEY',
      model: 'model-a',
    },
    currentToken: 'ignored-token',
  });

  assert.equal(state.keySource, ENV_KEY_SOURCE);
  assert.equal(state.apiKeyEnv, 'REPLAY_API_KEY');
  assert.equal(state.apiKeyToken, '');
});

test('setup model form restores thinking and reasoning controls', () => {
  const state = setupModelFormState({
    configModel: {
      keySource: ENV_KEY_SOURCE,
      baseUrl: 'https://example.test/v1',
      apiKeyEnv: 'REPLAY_API_KEY',
      model: 'model-a',
      thinkingEnabled: true,
      reasoningEffort: 'high',
    },
  });

  assert.equal(state.thinkingEnabled, true);
  assert.equal(state.reasoningEffort, 'high');
});

test('setup model form restores provider selection', () => {
  const state = setupModelFormState({
    configModel: {
      provider: 'anthropic',
      baseUrl: 'https://anthropic.test',
      apiKeyEnv: 'ANTHROPIC_API_KEY',
      model: 'claude-model',
    },
  });

  assert.equal(state.provider, 'anthropic');
});

test('setup model form normalizes removed none reasoning effort to default', () => {
  const state = setupModelFormState({
    configModel: {
      baseUrl: 'https://example.test/v1',
      apiKeyEnv: 'REPLAY_API_KEY',
      model: 'model-a',
      reasoningEffort: 'none',
    },
  });

  assert.equal(state.reasoningEffort, 'minimal');
  assert.equal(
    modelPayload({
      baseUrl: 'https://example.test/v1',
      apiKey: 'direct-token',
      model: 'model-a',
      reasoningEffort: 'none',
    }).reasoningEffort,
    'minimal',
  );
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
      thinkingEnabled: false,
      reasoningEffort: 'minimal',
    },
  );
});

test('setup model payload can submit an environment variable model', () => {
  assert.deepEqual(
    modelPayload({
      baseUrl: 'https://example.test/v1',
      keySource: ENV_KEY_SOURCE,
      apiKeyEnv: 'REPLAY_API_KEY',
      model: 'model-a',
    }),
    {
      keySource: ENV_KEY_SOURCE,
      provider: 'openai-compatible',
      baseUrl: 'https://example.test/v1',
      apiKeyEnv: 'REPLAY_API_KEY',
      model: 'model-a',
      thinkingEnabled: false,
      reasoningEffort: 'minimal',
    },
  );
});

test('setup model payload includes explicit thinking and reasoning controls', () => {
  assert.deepEqual(
    modelPayload({
      baseUrl: 'https://example.test/v1',
      apiKey: 'direct-token',
      model: 'model-a',
      thinkingEnabled: 'true',
      reasoningEffort: 'medium',
    }),
    {
      keySource: DIRECT_TOKEN_KEY_SOURCE,
      provider: 'openai-compatible',
      baseUrl: 'https://example.test/v1',
      apiKey: 'direct-token',
      model: 'model-a',
      thinkingEnabled: true,
      reasoningEffort: 'medium',
    },
  );
});

test('setup model payload can submit a non-openai replay provider', () => {
  assert.deepEqual(
    modelPayload({
      provider: 'bedrock-native',
      baseUrl: 'https://bedrock-runtime.us-east-1.amazonaws.com',
      apiKey: 'direct-token',
      model: 'anthropic.claude-model',
      thinkingEnabled: false,
      reasoningEffort: 'minimal',
    }),
    {
      keySource: DIRECT_TOKEN_KEY_SOURCE,
      provider: 'bedrock-native',
      baseUrl: 'https://bedrock-runtime.us-east-1.amazonaws.com',
      apiKey: 'direct-token',
      model: 'anthropic.claude-model',
      thinkingEnabled: false,
      reasoningEffort: 'minimal',
    },
  );
});

test('setup model payload can omit bedrock base url', () => {
  assert.equal(
    modelPayload({
      provider: 'bedrock-native',
      baseUrl: '',
      apiKey: 'direct-token',
      model: 'anthropic.claude-model',
    }).baseUrl,
    null,
  );
});

test('replay model payload includes optional step overrides', () => {
  assert.deepEqual(
    replayModelPayload({
      baseModel: {
        keySource: DIRECT_TOKEN_KEY_SOURCE,
        provider: 'openai-compatible',
        baseUrl: 'https://example.test/v1',
        apiKey: 'direct-token',
        model: 'global-model',
        thinkingEnabled: false,
        reasoningEffort: 'minimal',
      },
      stepModels: {
        director: {
          keySource: ENV_KEY_SOURCE,
          provider: 'openai-compatible',
          baseUrl: 'https://director.test/v1',
          apiKeyEnv: 'DIRECTOR_KEY',
          model: 'director-model',
          thinkingEnabled: true,
          reasoningEffort: 'high',
        },
      },
    }),
    {
      keySource: DIRECT_TOKEN_KEY_SOURCE,
      provider: 'openai-compatible',
      baseUrl: 'https://example.test/v1',
      apiKey: 'direct-token',
      model: 'global-model',
      thinkingEnabled: false,
      reasoningEffort: 'minimal',
      steps: {
        director: {
          keySource: ENV_KEY_SOURCE,
          provider: 'openai-compatible',
          baseUrl: 'https://director.test/v1',
          apiKeyEnv: 'DIRECTOR_KEY',
          model: 'director-model',
          thinkingEnabled: true,
          reasoningEffort: 'high',
        },
      },
    },
  );
});
