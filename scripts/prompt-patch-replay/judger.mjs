const VERDICTS = new Set(['fixed', 'improved', 'unchanged', 'regressed', 'uncertain']);
const CONFIDENCE = new Set(['high', 'medium', 'low']);

export function buildJudgeInput({ issue, context, newOutput }) {
  return {
    issue,
    originalOutput: context.originalOutput,
    newOutput,
    visibleContext: context.visibleContext ?? [],
    sourceFiles: context.sourceFiles ?? {},
  };
}

export function parseJudgeResult(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('judge result must be an object');
  }
  if (!VERDICTS.has(value.verdict)) {
    throw new Error('judge result verdict is invalid');
  }
  if (!CONFIDENCE.has(value.confidence)) {
    throw new Error('judge result confidence is invalid');
  }
  if (typeof value.reason !== 'string' || value.reason.trim().length === 0) {
    throw new Error('judge result reason must be non-empty');
  }
  return {
    verdict: value.verdict,
    confidence: value.confidence,
    reason: value.reason,
    remainingProblems: Array.isArray(value.remainingProblems) ? value.remainingProblems : [],
    newRegressions: Array.isArray(value.newRegressions) ? value.newRegressions : [],
  };
}

export async function runJudge({ mode = 'openai-compatible', modelConfig, input, fetchImpl = fetch }) {
  if (mode === 'fake') {
    return {
      verdict: 'uncertain',
      confidence: 'low',
      reason: 'fake judge mode does not evaluate semantic repair.',
      remainingProblems: [],
      newRegressions: [],
    };
  }
  if (mode !== 'openai-compatible') {
    throw new Error(`Unsupported judge mode: ${mode}`);
  }
  return runOpenAiCompatibleJudge({ modelConfig, input, fetchImpl });
}

async function runOpenAiCompatibleJudge({ modelConfig, input, fetchImpl }) {
  const apiKey = process.env[modelConfig.apiKeyEnv];
  if (!apiKey) throw new Error(`Missing API key env: ${modelConfig.apiKeyEnv}`);
  const response = await fetchImpl(`${trimTrailingSlash(modelConfig.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelConfig.model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildJudgeSystemPrompt() },
        { role: 'user', content: JSON.stringify(input, null, 2) },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`judge request failed: HTTP ${response.status}`);
  }
  const body = await response.json();
  const content = body.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('judge response did not include choices[0].message.content');
  }
  return parseJudgeResult(JSON.parse(content));
}

function buildJudgeSystemPrompt() {
  return [
    '你是一名互动小说 badcase 修复复核员。',
    '你只判断 newOutput 是否修复了 issue 中描述的原始问题。',
    '请同时留意 newOutput 是否引入明显新退化。',
    '只输出 JSON 对象，字段为 verdict、confidence、reason、remainingProblems、newRegressions。',
    'verdict 必须是 fixed、improved、unchanged、regressed、uncertain 之一。',
    'confidence 必须是 high、medium、low 之一。',
  ].join('\n');
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}
