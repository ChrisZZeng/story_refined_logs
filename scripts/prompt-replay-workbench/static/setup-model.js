export const DIRECT_TOKEN_KEY_SOURCE = 'direct';
export const ENV_KEY_SOURCE = 'env';
export const DEFAULT_PROVIDER = 'openai-compatible';
export const DEFAULT_THINKING_ENABLED = false;
export const DEFAULT_REASONING_EFFORT = 'minimal';
export const LLM_PROVIDERS = ['openai-compatible', 'anthropic', 'bedrock-native'];
export const REASONING_EFFORTS = ['minimal', 'low', 'medium', 'high'];
export const STEP_MODEL_TYPES = [
  { id: 'director', label: 'Director' },
  { id: 'narrator', label: 'Narrator' },
  { id: 'choices', label: 'Choices' },
  { id: 'stateFold', label: 'State Fold' },
];

export function setupModelFormState({ configModel, currentToken = '' } = {}) {
  const keySource = configModel?.keySource === ENV_KEY_SOURCE ? ENV_KEY_SOURCE : DIRECT_TOKEN_KEY_SOURCE;
  return {
    provider: LLM_PROVIDERS.includes(configModel?.provider)
      ? configModel.provider
      : DEFAULT_PROVIDER,
    baseUrl: configModel?.baseUrl ?? '',
    keySource,
    apiKeyEnv: configModel?.apiKeyEnv ?? '',
    apiKeyToken: keySource === DIRECT_TOKEN_KEY_SOURCE ? (configModel?.apiKey ?? currentToken) : '',
    model: configModel?.model ?? '',
    thinkingEnabled: configModel?.thinkingEnabled ?? DEFAULT_THINKING_ENABLED,
    reasoningEffort: REASONING_EFFORTS.includes(configModel?.reasoningEffort)
      ? configModel.reasoningEffort
      : DEFAULT_REASONING_EFFORT,
  };
}

export function modelPayload({
  provider = DEFAULT_PROVIDER,
  baseUrl,
  keySource = DIRECT_TOKEN_KEY_SOURCE,
  apiKey,
  apiKeyEnv,
  model,
  thinkingEnabled = DEFAULT_THINKING_ENABLED,
  reasoningEffort = DEFAULT_REASONING_EFFORT,
  includeAdvanced = true,
}) {
  const providerName = LLM_PROVIDERS.includes(provider) ? provider : DEFAULT_PROVIDER;
  const baseUrlText = String(baseUrl ?? '').trim();
  const shared = {
    provider: providerName,
    baseUrl: providerName === 'bedrock-native' && baseUrlText === ''
      ? null
      : baseUrl,
    model,
    ...(includeAdvanced
      ? {
          thinkingEnabled: normalizeThinkingEnabled(thinkingEnabled),
          reasoningEffort: REASONING_EFFORTS.includes(reasoningEffort) ? reasoningEffort : DEFAULT_REASONING_EFFORT,
        }
      : {}),
  };
  if (keySource === ENV_KEY_SOURCE) {
    return {
      keySource: ENV_KEY_SOURCE,
      apiKeyEnv,
      ...shared,
    };
  }
  return {
    keySource: DIRECT_TOKEN_KEY_SOURCE,
    apiKey,
    ...shared,
  };
}

export function replayModelPayload({ baseModel, stepModels = {} }) {
  const steps = Object.fromEntries(
    Object.entries(stepModels).filter(([, model]) => model !== null && model !== undefined),
  );
  return {
    ...baseModel,
    ...(Object.keys(steps).length > 0 ? { steps } : {}),
  };
}

function normalizeThinkingEnabled(value) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}
