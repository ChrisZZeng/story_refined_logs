#!/usr/bin/env node
import { runPromptPatchReplay } from './prompt-patch-replay/replay-service.mjs';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.config) {
    console.log(usage());
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const result = await runPromptPatchReplay({
    configPath: args.config,
    dryRunContextOnly: args.dryRunContextOnly,
    cwd: process.cwd(),
  });
  console.log(JSON.stringify({ resultDir: result.resultDir, summary: result.summaryPath }, null, 2));
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--config') {
      args.config = argv[++index];
    } else if (value === '--dry-run-context-only') {
      args.dryRunContextOnly = true;
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
    'Usage: node scripts/prompt-patch-replay.mjs --config <replay-task.yaml|replay-config.json> [--dry-run-context-only]',
    '',
    'Runs prompt patch replay for one patch bundle and multiple badcase turns.',
  ].join('\n');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
