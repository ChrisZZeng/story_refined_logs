import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

import { loadReplayTask } from '../../scripts/prompt-patch-replay/task-config.mjs';

test('loadReplayTask reads a single yaml task with patch text files', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-task-'));
  await mkdir(path.join(dir, 'patches'));
  const originalText = 'old prompt paragraph\nwith exact spacing\n';
  const replacementText = 'new prompt paragraph\nwith exact spacing\n';
  await writeFile(path.join(dir, 'patches', 'rule.before.md'), originalText);
  await writeFile(path.join(dir, 'patches', 'rule.after.md'), replacementText);
  const originalHash = `sha256:${createHash('sha256').update(originalText).digest('hex')}`;
  await writeFile(
    path.join(dir, 'replay-task.yaml'),
    [
      'replayId: yaml-task-a',
      'caseSet:',
      '  logGroupDir: logs/group-a',
      '  runId: run-a',
      '  turns: [5, 8]',
      '  repeats: 3',
      'source:',
      '  oreturnRepo: /repo/oreturn',
      'models:',
      '  replay:',
      '    baseUrl: http://llm/v1',
      '    apiKeyEnv: REPLAY_KEY',
      '    model: replay-model',
      '    thinkingEnabled: false',
      '  judge:',
      '    useReplayModel: true',
      'patchBundle:',
      '  id: bundle-a',
      '  patches:',
      '    - id: rule-a',
      '      originalFile: patches/rule.before.md',
      '      replacementFile: patches/rule.after.md',
      `      originalHash: ${originalHash}`,
      '',
    ].join('\n'),
  );

  const task = await loadReplayTask(path.join(dir, 'replay-task.yaml'));

  assert.deepEqual(task.config.turns, [5, 8]);
  assert.equal(task.config.repeats, 3);
  assert.equal(task.config.patchBundlePath, null);
  assert.equal(task.config.models.replay.provider, 'openai-compatible');
  assert.deepEqual(task.config.models.judge, task.config.models.replay);
  assert.equal(task.patchBundle.patches[0].originalText, originalText);
  assert.equal(task.patchBundle.patches[0].replacementText, replacementText);
  assert.equal(task.patchBundlePath, path.join(dir, 'replay-task.yaml'));
});

test('loadReplayTask rejects stale original file hash', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-task-'));
  await mkdir(path.join(dir, 'patches'));
  await writeFile(path.join(dir, 'patches', 'rule.before.md'), 'actual original\n');
  await writeFile(path.join(dir, 'patches', 'rule.after.md'), 'replacement\n');
  await writeFile(
    path.join(dir, 'replay-task.yaml'),
    [
      'replayId: yaml-task-a',
      'caseSet: { logGroupDir: logs/group-a, runId: run-a, turns: [5] }',
      'source: { oreturnRepo: /repo/oreturn }',
      'models:',
      '  replay: { baseUrl: http://llm/v1, apiKeyEnv: REPLAY_KEY, model: replay-model }',
      '  judge: { useReplayModel: true }',
      'patchBundle:',
      '  id: bundle-a',
      '  patches:',
      '    - id: rule-a',
      '      originalFile: patches/rule.before.md',
      '      replacementFile: patches/rule.after.md',
      '      originalHash: sha256:not-the-current-hash',
      '',
    ].join('\n'),
  );

  await assert.rejects(
    () => loadReplayTask(path.join(dir, 'replay-task.yaml')),
    /patches\[0\]\.originalHash/,
  );
});
