import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ORETURN_EVAL_RUNNER_SOURCE } from './oreturn-eval-runner-source.mjs';

const modulePath = fileURLToPath(import.meta.url);
const patcherModulePath = path.join(path.dirname(modulePath), 'prompt-patcher.mjs');

export function buildBunEvalCommand({ oreturnRepo, evalSource = ORETURN_EVAL_RUNNER_SOURCE }) {
  return {
    command: 'bun',
    args: ['--eval', evalSource],
    cwd: path.join(oreturnRepo, 'packages/core'),
  };
}

export async function writeReplayInput({ outDir, context, patchBundle }) {
  await mkdir(outDir, { recursive: true });
  const inputPath = path.join(outDir, 'replay-input.json');
  await writeFile(
    inputPath,
    JSON.stringify(
      {
        turn: context.turn,
        turnInput: context.turnInput,
        storyState: context.storyState,
        patchBundle,
      },
      null,
      2,
    ) + '\n',
  );
  return inputPath;
}

export function buildReplayEnv({ baseEnv = process.env, modelConfig }) {
  const apiKey = baseEnv[modelConfig.apiKeyEnv];
  if (!apiKey) {
    throw new Error(`missing env: ${modelConfig.apiKeyEnv}`);
  }

  return {
    ...baseEnv,
    LLM_PROVIDER: modelConfig.provider,
    LLM_BASE_URL: modelConfig.baseUrl,
    LLM_API_KEY: apiKey,
    LLM_MODEL: modelConfig.model,
    ...(modelConfig.thinkingEnabled !== undefined && modelConfig.thinkingEnabled !== null
      ? { LLM_THINKING_ENABLED: String(modelConfig.thinkingEnabled) }
      : {}),
  };
}

export async function runOreturnReplay({
  oreturnRepo,
  caseOutputDir,
  context,
  patchBundle,
  modelConfig,
  env = process.env,
}) {
  const inputPath = await writeReplayInput({ outDir: caseOutputDir, context, patchBundle });
  const command = buildBunEvalCommand({ oreturnRepo });
  execFileSync(command.command, command.args, {
    cwd: command.cwd,
    env: {
      ...(modelConfig ? buildReplayEnv({ baseEnv: env, modelConfig }) : env),
      STORY_REPLAY_INPUT: inputPath,
      STORY_REPLAY_OUTPUT_DIR: caseOutputDir,
      STORY_PATCHER_MODULE: patcherModulePath,
    },
    stdio: 'inherit',
  });

  const [newOutput, llmCalls, patchApplication, replayWrites] = await Promise.all([
    readJson(path.join(caseOutputDir, 'new-04-output.json')),
    readJson(path.join(caseOutputDir, 'llm-calls.json')),
    readJson(path.join(caseOutputDir, 'patch-application.json')),
    readJson(path.join(caseOutputDir, 'replay-writes.json')),
  ]);

  return { newOutput, llmCalls, patchApplication, replayWrites };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}
