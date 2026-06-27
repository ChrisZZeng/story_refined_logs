import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { startWorkbenchServer } from '../../scripts/prompt-replay-workbench/server.mjs';

test('startWorkbenchServer serves static index and API routes on localhost', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-server-'));
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath);
  const server = await startWorkbenchServer({
    taskPath,
    host: '127.0.0.1',
    port: 0,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  try {
    const index = await fetchText(`${server.url}/`);
    const task = await fetchJson(`${server.url}/api/task`);

    assert.match(index, /Prompt Replay Workbench/);
    assert.match(index, /setupIssueRepairJudger/);
    assert.match(index, /setupConsistencyJudger/);
    assert.equal(task.config.replayId, 'server-task-a');
  } finally {
    await server.close();
  }
});

async function fetchText(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200);
  return response.json();
}

async function writeTask(taskPath) {
  await writeFile(
    taskPath,
    [
      'replayId: server-task-a',
      'caseSet: { logGroupDir: logs/group-a, runId: run-a, turns: [4] }',
      'source: { oreturnRepo: /tmp/oreturn }',
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
}
