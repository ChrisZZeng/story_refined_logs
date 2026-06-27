import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);

test('prompt-replay-workbench CLI prints usage with --help', async () => {
  const scriptPath = path.resolve('scripts/prompt-replay-workbench.mjs');

  const { stdout } = await execFileAsync(process.execPath, [scriptPath, '--help'], {
    cwd: process.cwd(),
  });

  assert.match(stdout, /Usage: node scripts\/prompt-replay-workbench\.mjs \[--config/);
  assert.match(stdout, /Prompt Replay Workbench/);
});
