import { spawn } from 'node:child_process';
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
  signal,
}) {
  const inputPath = await writeReplayInput({ outDir: caseOutputDir, context, patchBundle });
  const command = buildBunEvalCommand({ oreturnRepo });
  await runCommand(command.command, command.args, {
    cwd: command.cwd,
    env: {
      ...(modelConfig ? buildReplayEnv({ baseEnv: env, modelConfig }) : env),
      STORY_REPLAY_INPUT: inputPath,
      STORY_REPLAY_OUTPUT_DIR: caseOutputDir,
      STORY_PATCHER_MODULE: patcherModulePath,
    },
    stdio: 'inherit',
    signal,
  });

  const [newOutput, llmCalls, patchApplication, replayWrites] = await Promise.all([
    readJson(path.join(caseOutputDir, 'new-04-output.json')),
    readJson(path.join(caseOutputDir, 'llm-calls.json')),
    readJson(path.join(caseOutputDir, 'patch-application.json')),
    readJson(path.join(caseOutputDir, 'replay-writes.json')),
  ]);

  return { newOutput, llmCalls, patchApplication, replayWrites };
}

export function runCommand(command, args, options) {
  const {
    signal,
    killSignal = 'SIGTERM',
    forceKillSignal = 'SIGKILL',
    graceMs = 5000,
    ...spawnOptions
  } = options ?? {};
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError(signal.reason));
      return;
    }
    let settled = false;
    let abortReason = null;
    const child = spawn(command, args, {
      ...spawnOptions,
      detached: process.platform === 'win32' ? spawnOptions.detached : true,
      stdio: spawnOptions.stdio ?? 'inherit',
    });

    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort);
    };
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn(value);
    };
    const onAbort = () => {
      abortReason = abortError(signal.reason);
      terminateProcessTree(child, { killSignal, forceKillSignal, graceMs });
    };

    signal?.addEventListener('abort', onAbort, { once: true });
    child.once('error', (error) => {
      settle(reject, abortReason ?? error);
    });
    child.once('exit', (code, signal) => {
      if (abortReason) {
        settle(reject, abortReason);
        return;
      }
      if (code === 0) {
        settle(resolve);
        return;
      }
      settle(reject, new Error(`${command} exited with ${code === null ? `signal ${signal}` : `code ${code}`}`));
    });
  });
}

export function terminateProcessTree(child, {
  killSignal = 'SIGTERM',
  forceKillSignal = 'SIGKILL',
  graceMs = 5000,
} = {}) {
  if (!child?.pid) return;
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    killer.on('error', () => {
      child.kill();
    });
    return;
  }

  try {
    process.kill(-child.pid, killSignal);
  } catch {
    try {
      child.kill(killSignal);
    } catch {
      // The process may already have exited.
    }
  }
  const timer = setTimeout(() => {
    try {
      process.kill(-child.pid, forceKillSignal);
    } catch {
      try {
        child.kill(forceKillSignal);
      } catch {
        // The process may already have exited.
      }
    }
  }, graceMs);
  timer.unref?.();
}

function abortError(reason) {
  if (reason instanceof Error) return reason;
  const error = new Error(reason ? String(reason) : 'Operation aborted');
  error.name = 'AbortError';
  error.code = 'ABORT_ERR';
  return error;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}
