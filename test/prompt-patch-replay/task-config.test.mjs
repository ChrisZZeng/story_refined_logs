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
      '    reasoningEffort: minimal',
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
  assert.equal(task.config.source.followBadcaseCommit, true);
  assert.equal(task.config.models.replay.provider, 'openai-compatible');
  assert.equal(task.config.models.replay.reasoningEffort, 'minimal');
  assert.deepEqual(task.config.models.judge, task.config.models.replay);
  assert.equal(task.patchBundle.patches[0].originalText, originalText);
  assert.equal(task.patchBundle.patches[0].replacementText, replacementText);
  assert.equal(task.patchBundlePath, path.join(dir, 'replay-task.yaml'));
});

test('loadReplayTask accepts an inline empty patch bundle', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-task-'));
  await writeFile(
    path.join(dir, 'replay-task.yaml'),
    [
      'replayId: yaml-task-no-edits',
      'caseSet: { logGroupDir: logs/group-a, runId: run-a, turns: [5] }',
      'source: { oreturnRepo: /repo/oreturn }',
      'models:',
      '  replay: { baseUrl: http://llm/v1, apiKeyEnv: REPLAY_KEY, model: replay-model }',
      '  judge: { useReplayModel: true }',
      'judging:',
      '  issueRepair: { enabled: false }',
      '  regressionConsistency: { enabled: true, target: fullTurn }',
      'patchBundle:',
      '  id: bundle-a',
      '  patches: []',
      '',
    ].join('\n'),
  );

  const task = await loadReplayTask(path.join(dir, 'replay-task.yaml'));

  assert.deepEqual(task.patchBundle.patches, []);
  assert.deepEqual(task.config.judging.issueRepair, { enabled: false });
});

test('loadReplayTask preserves source commit follow toggle', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-task-'));
  await writeFile(
    path.join(dir, 'replay-task.yaml'),
    [
      'replayId: yaml-task-source-mode',
      'caseSet: { logGroupDir: logs/group-a, runId: run-a, turns: [5] }',
      'source: { oreturnRepo: /repo/oreturn, followBadcaseCommit: false }',
      'models:',
      '  replay: { baseUrl: http://llm/v1, apiKeyEnv: REPLAY_KEY, model: replay-model }',
      '  judge: { useReplayModel: true }',
      'patchBundle:',
      '  id: bundle-a',
      '  patches:',
      '    - id: rule-a',
      '      originalText: old prompt',
      '      replacementText: new prompt',
      '',
    ].join('\n'),
  );

  const task = await loadReplayTask(path.join(dir, 'replay-task.yaml'));

  assert.equal(task.config.source.followBadcaseCommit, false);
  assert.equal(task.config.source.allowDirtyEngine, true);
});

test('loadReplayTask preserves replay step model overrides', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-task-'));
  await writeFile(
    path.join(dir, 'replay-task.yaml'),
    [
      'replayId: yaml-task-steps',
      'caseSet: { logGroupDir: logs/group-a, runId: run-a, turns: [5] }',
      'source: { oreturnRepo: /repo/oreturn }',
      'models:',
      '  replay:',
      '    baseUrl: http://llm/v1',
      '    apiKeyEnv: REPLAY_KEY',
      '    model: replay-model',
      '    steps:',
      '      director: { baseUrl: http://director/v1, apiKeyEnv: DIRECTOR_KEY, model: director-model, thinkingEnabled: true, reasoningEffort: high }',
      '      choices: { baseUrl: http://choices/v1, apiKeyEnv: CHOICES_KEY, model: choices-model }',
      '  judge: { baseUrl: http://judge/v1, apiKeyEnv: JUDGE_KEY, model: judge-model }',
      'patchBundle:',
      '  id: bundle-a',
      '  patches:',
      '    - id: rule-a',
      '      originalText: old prompt',
      '      replacementText: new prompt',
      '',
    ].join('\n'),
  );

  const task = await loadReplayTask(path.join(dir, 'replay-task.yaml'));

  assert.equal(task.config.models.replay.steps.director.provider, 'openai-compatible');
  assert.equal(task.config.models.replay.steps.director.model, 'director-model');
  assert.equal(task.config.models.replay.steps.director.thinkingEnabled, true);
  assert.equal(task.config.models.replay.steps.director.reasoningEffort, 'high');
  assert.equal(task.config.models.replay.steps.choices.apiKeyEnv, 'CHOICES_KEY');
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
