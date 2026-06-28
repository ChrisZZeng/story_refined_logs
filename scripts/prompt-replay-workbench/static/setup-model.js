export const DIRECT_TOKEN_KEY_SOURCE = 'direct';
export const ENV_KEY_SOURCE = 'env';

export function setupModelFormState({ configModel, currentToken = '' } = {}) {
  const keySource = configModel?.keySource === ENV_KEY_SOURCE ? ENV_KEY_SOURCE : DIRECT_TOKEN_KEY_SOURCE;
  return {
    baseUrl: configModel?.baseUrl ?? '',
    keySource,
    apiKeyEnv: configModel?.apiKeyEnv ?? '',
    apiKeyToken: keySource === DIRECT_TOKEN_KEY_SOURCE ? (configModel?.apiKey ?? currentToken) : '',
    model: configModel?.model ?? '',
  };
}

export function modelPayload({ baseUrl, keySource = DIRECT_TOKEN_KEY_SOURCE, apiKey, apiKeyEnv, model }) {
  if (keySource === ENV_KEY_SOURCE) {
    return {
      keySource: ENV_KEY_SOURCE,
      provider: 'openai-compatible',
      baseUrl,
      apiKeyEnv,
      model,
    };
  }
  return {
    keySource: DIRECT_TOKEN_KEY_SOURCE,
    provider: 'openai-compatible',
    baseUrl,
    apiKey,
    model,
  };
}
