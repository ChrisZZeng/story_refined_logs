export const DIRECT_TOKEN_KEY_SOURCE = 'direct';

export function setupModelFormState({ configModel, currentToken = '' } = {}) {
  return {
    baseUrl: configModel?.baseUrl ?? '',
    keySource: DIRECT_TOKEN_KEY_SOURCE,
    apiKeyEnv: configModel?.apiKeyEnv ?? '',
    apiKeyToken: currentToken,
    model: configModel?.model ?? '',
  };
}

export function modelPayload({ baseUrl, apiKey, model }) {
  return {
    keySource: DIRECT_TOKEN_KEY_SOURCE,
    provider: 'openai-compatible',
    baseUrl,
    apiKey,
    model,
  };
}
