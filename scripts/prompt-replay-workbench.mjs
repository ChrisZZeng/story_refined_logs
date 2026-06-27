#!/usr/bin/env node
import path from 'node:path';

import { startWorkbenchServer } from './prompt-replay-workbench/server.mjs';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    process.exitCode = 0;
    return;
  }

  const server = await startWorkbenchServer({
    taskPath: args.config ? path.resolve(args.config) : undefined,
    promptSourcesConfigPath: args.promptSources
      ? path.resolve(args.promptSources)
      : undefined,
    host: args.host ?? '127.0.0.1',
    port: args.port ?? 0,
    cwd: process.cwd(),
  });

  console.log(`Prompt Replay Workbench: ${server.url}`);
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--config') {
      args.config = argv[++index];
    } else if (value === '--prompt-sources') {
      args.promptSources = argv[++index];
    } else if (value === '--host') {
      args.host = argv[++index];
    } else if (value === '--port') {
      args.port = Number(argv[++index]);
    } else if (value === '--help' || value === '-h') {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }
  return args;
}

function usage() {
  return [
    'Prompt Replay Workbench',
    '',
    'Usage: node scripts/prompt-replay-workbench.mjs [--config <replay-task.yaml>] [--prompt-sources <prompt-sources.yaml>] [--port <port>]',
    '',
    'Starts a local browser workbench for configuring replay tasks, editing prompt sources, and running prompt patch replay.',
  ].join('\n');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
