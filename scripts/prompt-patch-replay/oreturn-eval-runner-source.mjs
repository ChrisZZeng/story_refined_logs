export const ORETURN_EVAL_RUNNER_SOURCE = String.raw`
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createNovelCreatorStrategy } from '#internal/orchestrator/strategies/novel-creator/novel-creator-strategy';
import { runStrategy } from '#internal/orchestrator/controller';
import { createAISdkLLMCall } from '#internal/orchestrator/adapters/ai-sdk-llm';
import { buildModelFromEnv } from '#scripts/_model';

const inputPath = process.env.STORY_REPLAY_INPUT;
const outputDir = process.env.STORY_REPLAY_OUTPUT_DIR;
const patcherModule = process.env.STORY_PATCHER_MODULE;

if (!inputPath || !outputDir || !patcherModule) {
  throw new Error('STORY_REPLAY_INPUT, STORY_REPLAY_OUTPUT_DIR, and STORY_PATCHER_MODULE are required');
}

const { applyAvailablePatchesToCall, assertAllPatchesApplied } = await import(pathToFileURL(patcherModule).href);
const input = JSON.parse(await readFile(inputPath, 'utf8'));
const calls = [];
const applications = [];
const appliedPatchIds = new Set();
const replayWrites = [];
const events = [];

const replayContextProvider = {
  async load() {
    return input.storyState;
  },
  async commit(writes) {
    replayWrites.push(...writes);
  },
};

let output;
let replayError = null;
try {
  const baseLlm = createAISdkLLMCall();
  const llm = wrapLlm(baseLlm, input.patchBundle, input.turn, calls, applications, appliedPatchIds);
  const models = {
    director: buildModelFromEnv('LLM_DIRECTOR'),
    narrator: buildModelFromEnv('LLM_NARRATOR'),
    choices: buildModelFromEnv('LLM_CHOICES'),
    stateFold: buildModelFromEnv('LLM_STATE_FOLD'),
  };
  const strategy = createNovelCreatorStrategy({ llm, models });

  for await (const event of runStrategy({
    strategy: {
      ...strategy,
      async execute(strategyInput, ctx) {
        output = await strategy.execute(strategyInput, ctx);
        return output;
      },
    },
    memoryStore: replayContextProvider,
    input: input.turnInput,
  })) {
    events.push(event);
  }

  assertAllPatchesApplied({ patchBundle: input.patchBundle, applications, turn: input.turn });
} catch (error) {
  replayError = serializeError(error);
  throw error;
} finally {
  await mkdir(outputDir, { recursive: true });
  if (output !== undefined) {
    await writeJson(path.join(outputDir, 'new-04-output.json'), output);
  }
  await writeJson(path.join(outputDir, 'llm-calls.json'), calls);
  await writeJson(path.join(outputDir, 'patch-application.json'), { applications });
  await writeJson(path.join(outputDir, 'replay-writes.json'), replayWrites);
  await writeJson(path.join(outputDir, 'replay-events.json'), events);
  if (replayError !== null) {
    await writeJson(path.join(outputDir, 'replay-error.json'), replayError);
  }
}

function wrapLlm(base, patchBundle, turn, sink, applicationSink, appliedPatchIds) {
  return {
    async generateText(params) {
      const stage = inferStage(sink.length);
      const patched = patchCall({ patchBundle, turn, stage, callKind: 'generateText', params, sink });
      const record = startCall(sink, 'generateText', patched.stage, patched.params, patched.applications);
      try {
        const result = await base.generateText(patched.params);
        finishCall(record, result);
        return result;
      } catch (error) {
        failCall(record, error);
        throw error;
      } finally {
        applicationSink.push(...patched.applications);
      }
    },
    async *streamText(params) {
      const stage = inferStage(sink.length);
      const patched = patchCall({ patchBundle, turn, stage, callKind: 'streamText', params, sink });
      const record = startCall(sink, 'streamText', patched.stage, patched.params, patched.applications);
      try {
        let finalText = '';
        for await (const event of base.streamText(patched.params)) {
          if (event.kind === 'text-delta') finalText += event.text;
          if (event.kind === 'done') finalText = event.text;
          yield event;
        }
        finishCall(record, { text: finalText });
      } catch (error) {
        failCall(record, error);
        throw error;
      } finally {
        applicationSink.push(...patched.applications);
      }
    },
    async generateObject(params) {
      const stage = inferStage(sink.length);
      const patched = patchCall({ patchBundle, turn, stage, callKind: 'generateObject', params, sink });
      const record = startCall(sink, 'generateObject', patched.stage, patched.params, patched.applications);
      try {
        const result = await base.generateObject(patched.params);
        finishCall(record, result);
        return result;
      } catch (error) {
        failCall(record, error);
        throw error;
      } finally {
        applicationSink.push(...patched.applications);
      }
    },
  };
}

function patchCall({ patchBundle, turn, stage, callKind, params, sink }) {
  let result;
  try {
    result = applyAvailablePatchesToCall({
      patchBundle,
      appliedPatchIds,
      turn,
      stage,
      callKind,
      params,
    });
  } catch (error) {
    startPatchFailureCall(sink, callKind, stage, params, error);
    throw error;
  }
  for (const application of result.applications) {
    if (application.propagated !== true) {
      appliedPatchIds.add(application.patchId);
    }
  }
  return { stage, params: result.params, applications: result.applications };
}

function startCall(sink, kind, stage, params, patchApplications) {
  const record = {
    kind,
    stage,
    startedAt: new Date().toISOString(),
    system: params.system ?? null,
    prompt: params.prompt ?? null,
    messages: params.messages ?? null,
    patchApplications,
  };
  sink.push(record);
  return record;
}

function startPatchFailureCall(sink, kind, stage, params, error) {
  const record = startCall(sink, kind, stage, params, []);
  record.patchError = error instanceof Error ? error.message : String(error);
  record.finishedAt = new Date().toISOString();
  return record;
}

function finishCall(record, result) {
  record.finishedAt = new Date().toISOString();
  record.finishReason = result.finishReason ?? null;
  record.usage = result.usage ?? null;
  record.text = result.text ?? null;
  record.object = result.object ?? null;
}

function failCall(record, error) {
  record.finishedAt = new Date().toISOString();
  record.error = error instanceof Error ? error.message : String(error);
}

function inferStage(index) {
  return ['director', 'narrator', 'choice'][index] ?? 'unknown';
}

async function writeJson(filePath, value) {
  await writeFile(filePath, JSON.stringify(value, null, 2) + '\n');
}

function serializeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    };
  }
  return { name: 'Error', message: String(error), stack: null };
}
`;
