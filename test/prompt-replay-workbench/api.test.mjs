import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createWorkbenchApiHandler } from '../../scripts/prompt-replay-workbench/api.mjs';

test('GET /api/task returns normalized task config without patch text expansion details', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath, { regressionConsistencyEnabled: false });
  const resolvedSource = {
    sourceOreturnCommit: 'abcdef0123456789',
    replayEngineOreturnCommit: 'abcdef0123456789ffffffffffffffffffffffff',
    oreturnRepo: '/tmp/oreturn',
    replayEngineOreturnRepo: path.join(dir, '.worktrees', 'oreturn-abcdef0123456789'),
    managedWorktreeRoot: path.join(dir, '.worktrees'),
    managedWorktree: true,
    dirty: false,
    matched: true,
  };
  const handler = createWorkbenchApiHandler({
    taskPath,
    loadPromptSources: async () => [],
    resolvePromptSourceVersion: async () => resolvedSource,
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const response = await request(handler, 'GET', '/api/task');

  assert.equal(response.status, 200);
  assert.equal(response.body.config.replayId, 'api-task-a');
  assert.deepEqual(response.body.config.turns, [4]);
  assert.equal(response.body.patchBundle.id, 'bundle-a');
  assert.deepEqual(response.body.resolvedSource, resolvedSource);
});

test('GET /api/task resolves source version through the default managed worktree resolver', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const oreturnRepo = path.join(dir, 'oreturn');
  await mkdir(oreturnRepo, { recursive: true });
  git(['init'], oreturnRepo);
  git(['config', 'user.email', 'test@example.com'], oreturnRepo);
  git(['config', 'user.name', 'Test User'], oreturnRepo);
  await writeFile(path.join(oreturnRepo, 'README.md'), 'fixture\n');
  git(['add', 'README.md'], oreturnRepo);
  git(['commit', '-m', 'fixture'], oreturnRepo);
  const sourceCommit = git(['rev-parse', 'HEAD'], oreturnRepo);

  const logGroupDir = path.join(dir, 'logs', `${sourceCommit.slice(0, 12)}-fixture`);
  await mkdir(path.join(logGroupDir, 'run_logs', 'run-a'), { recursive: true });
  await writeJson(path.join(logGroupDir, 'run_logs', 'run-a', '00-run-config.json'), {
    sourceCommit,
  });
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath, { logGroupDir, oreturnRepo });
  const handler = createWorkbenchApiHandler({
    taskPath,
    cwd: dir,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const response = await request(handler, 'GET', '/api/task');

  assert.equal(response.status, 200);
  assert.equal(response.body.resolvedSource.sourceOreturnCommit, sourceCommit);
  assert.equal(response.body.resolvedSource.replayEngineOreturnCommit, sourceCommit);
  assert.equal(response.body.resolvedSource.matched, true);
  assert.equal(response.body.resolvedSource.managedWorktree, true);
  assert.match(response.body.resolvedSource.replayEngineOreturnRepo, /\.worktrees\/prompt-patch-replay\/oreturn-/);
});

test('bootstrap defaults and load switch the active workbench task', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const initialTaskPath = path.join(dir, 'initial-task.yaml');
  const logGroupDir = path.join(dir, 'logs', 'abcdef0-dev');
  await writeTask(initialTaskPath, { replayId: 'initial-task', logGroupDir, turns: [4] });
  await writeRunContextFixture(logGroupDir, 'run-a');
  const handler = createWorkbenchApiHandler({
    taskPath: initialTaskPath,
    cwd: dir,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const defaults = await request(handler, 'GET', '/api/bootstrap/defaults');
  assert.equal(defaults.status, 200);
  assert.equal(defaults.body.config.replayId, 'initial-task');
  assert.equal(defaults.body.hasActiveTask, true);

  const loaded = await request(handler, 'POST', '/api/bootstrap/load', {
    replayId: 'manual-task',
    logGroupDir,
    runId: 'run-a',
    turns: '4',
    repeats: 2,
    oreturnRepo: '/tmp/oreturn',
    versionPolicy: 'require-matching-worktree',
    models: {
      replay: {
        provider: 'openai-compatible',
        baseUrl: 'https://example.test/v1',
        apiKeyEnv: 'REPLAY_API_KEY',
        model: 'model-a',
      },
      judge: {
        provider: 'openai-compatible',
        baseUrl: 'https://example.test/v1',
        apiKeyEnv: 'JUDGE_API_KEY',
        model: 'model-b',
      },
    },
    judging: {
      issueRepair: { enabled: false },
      regressionConsistency: { enabled: true, target: 'fullTurn' },
    },
  });

  assert.equal(loaded.status, 200);
  assert.match(loaded.body.taskPath, /\.workbench-tasks\/manual-task-manual\.yaml$/);
  assert.equal(loaded.body.config.replayId, 'manual-task');
  assert.deepEqual(loaded.body.config.turns, [4]);
  assert.equal(loaded.body.config.repeats, 2);
  assert.deepEqual(loaded.body.config.judging.issueRepair, { enabled: false });
  assert.deepEqual(loaded.body.config.judging.regressionConsistency, { enabled: true, target: 'fullTurn' });

  const active = await request(handler, 'GET', '/api/task');
  assert.equal(active.body.config.replayId, 'manual-task');
  assert.equal(active.body.config.source.oreturnRepo, '/tmp/oreturn');
  assert.deepEqual(active.body.config.judging.issueRepair, { enabled: false });

  const snapshotText = await readFile(loaded.body.taskPath, 'utf8');
  assert.match(snapshotText, /replayId: manual-task/);
  assert.match(snapshotText, /runId: run-a/);
  assert.match(snapshotText, /issueRepair:\n\s+enabled: false/);
  assert.match(snapshotText, /regressionConsistency:\n\s+enabled: true\n\s+target: fullTurn/);
});

test('direct model tokens are kept in memory and injected only while running replay', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const logGroupDir = path.join(dir, 'logs', 'abcdef0-dev');
  const taskPath = path.join(dir, 'initial-task.yaml');
  await writeTask(taskPath, { logGroupDir, turns: [4] });
  const seenEnv = [];
  const originalReplayEnv = process.env.WORKBENCH_REPLAY_API_KEY;
  const originalJudgeEnv = process.env.WORKBENCH_JUDGE_API_KEY;
  delete process.env.WORKBENCH_REPLAY_API_KEY;
  delete process.env.WORKBENCH_JUDGE_API_KEY;

  const handler = createWorkbenchApiHandler({
    taskPath,
    cwd: dir,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async () => {
      seenEnv.push({
        replay: process.env.WORKBENCH_REPLAY_API_KEY,
        judge: process.env.WORKBENCH_JUDGE_API_KEY,
      });
      return { replayId: 'manual-token-task', resultDir: '/tmp/result', summaryPath: '/tmp/result/summary.md' };
    },
  });

  const loaded = await request(handler, 'POST', '/api/bootstrap/load', {
    replayId: 'manual-token-task',
    logGroupDir,
    runId: 'run-a',
    turns: '4',
    oreturnRepo: '/tmp/oreturn',
    models: {
      replay: {
        keySource: 'direct',
        apiKey: 'replay-secret-token',
        baseUrl: 'https://example.test/v1',
        model: 'model-a',
      },
      judge: {
        keySource: 'direct',
        apiKey: 'judge-secret-token',
        baseUrl: 'https://example.test/v1',
        model: 'model-b',
      },
    },
  });

  assert.equal(loaded.status, 200);
  assert.equal(loaded.body.config.models.replay.apiKeyEnv, 'WORKBENCH_REPLAY_API_KEY');
  assert.equal(loaded.body.config.models.judge.apiKeyEnv, 'WORKBENCH_JUDGE_API_KEY');
  assert.equal(JSON.stringify(loaded.body).includes('secret-token'), false);

  const snapshotText = await readFile(loaded.body.taskPath, 'utf8');
  assert.equal(snapshotText.includes('replay-secret-token'), false);
  assert.equal(snapshotText.includes('judge-secret-token'), false);
  assert.match(snapshotText, /apiKeyEnv: WORKBENCH_REPLAY_API_KEY/);
  assert.match(snapshotText, /apiKeyEnv: WORKBENCH_JUDGE_API_KEY/);

  const replay = await request(handler, 'POST', '/api/replay/run', {});

  assert.equal(replay.status, 200);
  assert.deepEqual(seenEnv, [
    {
      replay: 'replay-secret-token',
      judge: 'judge-secret-token',
    },
  ]);
  assert.equal(process.env.WORKBENCH_REPLAY_API_KEY, undefined);
  assert.equal(process.env.WORKBENCH_JUDGE_API_KEY, undefined);

  if (originalReplayEnv !== undefined) process.env.WORKBENCH_REPLAY_API_KEY = originalReplayEnv;
  if (originalJudgeEnv !== undefined) process.env.WORKBENCH_JUDGE_API_KEY = originalJudgeEnv;
});

test('bootstrap defaults work without an initial active task', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const handler = createWorkbenchApiHandler({
    cwd: dir,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const defaults = await request(handler, 'GET', '/api/bootstrap/defaults');
  assert.equal(defaults.status, 200);
  assert.equal(defaults.body.hasActiveTask, false);
  assert.equal(defaults.body.config.replayId, 'prompt-replay-workbench');
  assert.deepEqual(defaults.body.config.judging.issueRepair, { enabled: true });
  assert.deepEqual(defaults.body.config.judging.regressionConsistency, { enabled: true, target: 'fullTurn' });

  const task = await request(handler, 'GET', '/api/task');
  assert.equal(task.status, 400);
  assert.equal(task.body.code, 'WORKBENCH_TASK_NOT_CONFIGURED');
});

test('POST /api/replay/run delegates to replay service with current task path', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath);
  const calls = [];
  const handler = createWorkbenchApiHandler({
    taskPath,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async (args) => {
      calls.push(args);
      return { replayId: 'api-task-a', resultDir: '/tmp/result', summaryPath: '/tmp/result/summary.md' };
    },
  });

  const response = await request(handler, 'POST', '/api/replay/run', { dryRunContextOnly: true });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    replayId: 'api-task-a',
    resultDir: '/tmp/result',
    summaryPath: '/tmp/result/summary.md',
  });
  assert.deepEqual(calls, [{ configPath: taskPath, dryRunContextOnly: true, cwd: process.cwd() }]);
});

test('POST /api/replay/run turns prompt edits into an inline workbench task snapshot', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath);
  const calls = [];
  const handler = createWorkbenchApiHandler({
    taskPath,
    cwd: dir,
    now: () => new Date('2026-06-26T01:02:03.004Z'),
    loadPromptSources: async () => [],
    runPromptPatchReplay: async (args) => {
      calls.push(args);
      return { replayId: 'api-task-a-workbench-2026-06-26T01-02-03-004Z', resultDir: '/tmp/result', summaryPath: '/tmp/result/summary.md' };
    },
  });

  const response = await request(handler, 'POST', '/api/replay/run', {
    promptEdits: [
      {
        id: 'choice.system',
        originalText: 'old prompt',
        draftText: 'new prompt',
      },
    ],
  });

  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.match(calls[0].configPath, /\.workbench-tasks\/api-task-a-workbench-2026-06-26T01-02-03-004Z\.yaml$/);
  assert.equal(calls[0].dryRunContextOnly, false);

  const snapshot = await readFile(calls[0].configPath, 'utf8');
  assert.match(snapshot, /replayId: api-task-a-workbench-2026-06-26T01-02-03-004Z/);
  assert.match(snapshot, /id: prompt-source-choice-system/);
  assert.match(snapshot, /originalText: old prompt/);
  assert.match(snapshot, /replacementText: new prompt/);
  assert.match(snapshot, /regressionConsistency:\n\s+enabled: true\n\s+target: fullTurn/);
});

test('GET /api/prompt-sources loads observed prompt fields from the selected badcase turn', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const logGroupDir = path.join(dir, 'logs', 'abcdef0-dev');
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath, { logGroupDir, turns: [4] });
  await writeRunContextFixture(logGroupDir, 'run-a');
  const handler = createWorkbenchApiHandler({
    taskPath,
    cwd: dir,
    loadPromptSources: async () => {
      throw new Error('should read observed turn prompts, not source files');
    },
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const response = await request(handler, 'GET', '/api/prompt-sources?turn=4');

  assert.equal(response.status, 200);
  assert.deepEqual(
    response.body.sources.map((source) => source.id),
    [
      'turn-004.director.system',
      'turn-004.director.messages-0-content',
      'turn-004.narrator.system',
      'turn-004.narrator.messages-0-content',
      'turn-004.narrator.messages-1-content',
    ],
  );
  assert.equal(response.body.sources[0].label, 'Director / System');
  assert.equal(response.body.sources[0].turn, 4);
  assert.equal(response.body.sources[0].stage, 'director');
  assert.equal(response.body.sources[0].callKind, 'generateObject');
  assert.equal(response.body.sources[0].fieldPath, 'system');
  assert.equal(response.body.sources[0].patchMode, 'field');
  assert.equal(response.body.sources[0].patchScope, 'all');
  assert.equal(response.body.sources[0].patchScopeKind, 'stable-instruction');
  assert.equal(response.body.sources[0].editable, true);
  assert.equal(response.body.sources[0].access, 'editable');
  assert.equal(response.body.sources[0].originalText, 'observed director system');
  assert.equal(response.body.sources[1].label, 'Director / player_input');
  assert.equal(response.body.sources[1].patchScope, 'all');
  assert.equal(response.body.sources[1].patchScopeKind, 'slot-aware');
  assert.equal(response.body.sources[1].editable, true);
  assert.equal(response.body.sources[1].access, 'editable');
  assert.deepEqual(response.body.sources[1].preserveTags, ['player_input']);
  assert.equal(response.body.sources[3].label, 'Narrator / creative_brief');
  assert.equal(response.body.sources[3].patchScope, 'turn');
  assert.equal(response.body.sources[3].patchScopeKind, 'turn-scoped-material');
  assert.equal(response.body.sources[3].editable, true);
  assert.equal(response.body.sources[3].access, 'editable');
  assert.equal(response.body.sources[3].originalText, '<creative_brief>\nobserved director output\n</creative_brief>');
});

test('GET /api/prompt-sources marks turn-scoped observed material blocked for multi-turn replay tasks', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const logGroupDir = path.join(dir, 'logs', 'abcdef0-dev');
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath, { logGroupDir, turns: [4, 9] });
  await writeRunContextFixture(logGroupDir, 'run-a');
  const handler = createWorkbenchApiHandler({
    taskPath,
    cwd: dir,
    loadPromptSources: async () => {
      throw new Error('should read observed turn prompts, not source files');
    },
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const response = await request(handler, 'GET', '/api/prompt-sources?turn=4');

  assert.equal(response.status, 200);
  const creativeBrief = response.body.sources.find((source) => source.label === 'Narrator / creative_brief');
  assert.equal(creativeBrief.editable, false);
  assert.equal(creativeBrief.access, 'view-only');
  assert.equal(creativeBrief.editBlockReasonCode, 'MULTI_TURN_TURN_SCOPED_PROMPT');
  assert.match(creativeBrief.editBlockReason, /exactly one turn/);
});

test('GET /api/prompt-sources uses resolved managed worktree repo and default config path', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath);
  const managedRepo = path.join(dir, '.worktrees', 'prompt-patch-replay', 'oreturn-a4a2cfc1e411');
  const calls = [];
  const handler = createWorkbenchApiHandler({
    taskPath,
    resolvePromptSourceVersion: async ({ task, cwd }) => {
      assert.equal(task.config.source.oreturnRepo, '/tmp/oreturn');
      assert.equal(cwd, process.cwd());
      return {
        sourceOreturnCommit: 'a4a2cfc1e411f64cf8149a2727c0c3a16d9c05e1',
        replayEngineOreturnCommit: 'a4a2cfc1e411f64cf8149a2727c0c3a16d9c05e1',
        oreturnRepo: '/tmp/oreturn',
        replayEngineOreturnRepo: managedRepo,
        managedWorktreeRoot: path.join(dir, '.worktrees', 'prompt-patch-replay'),
        managedWorktree: true,
        dirty: false,
        matched: true,
      };
    },
    loadPromptSources: async (args) => {
      calls.push(args);
      return [];
    },
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const response = await request(handler, 'GET', '/api/prompt-sources');

  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.match(calls[0].configPath, /default-prompt-sources\.yaml$/);
  assert.equal(calls[0].oreturnRepo, managedRepo);
});

test('POST /api/replay/run rejects turn-scoped prompt edits for multi-turn replay tasks', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath, { turns: [4, 9] });
  const handler = createWorkbenchApiHandler({
    taskPath,
    cwd: dir,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const response = await request(handler, 'POST', '/api/replay/run', {
    promptEdits: [
      {
        id: 'turn-004.director.context',
        sourceKind: 'observed-llm-call',
        patchMode: 'field',
        patchScope: 'turn',
        turn: 4,
        stage: 'director',
        callKind: 'generateObject',
        fieldPath: 'messages[3].content',
        originalText: '<context>old</context>',
        draftText: '<context>new</context>',
      },
    ],
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'PATCH_SOURCE_TURN_SCOPED_MULTI_TURN');
  assert.match(response.body.error, /single-turn replay task/);
});

test('GET /api/prompt-sources fails instead of falling back to the main repo', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath);
  let loadedSources = false;
  const handler = createWorkbenchApiHandler({
    taskPath,
    resolvePromptSourceVersion: async () => ({
      sourceOreturnCommit: 'a4a2cfc1e411',
      replayEngineOreturnCommit: null,
      oreturnRepo: '/tmp/oreturn',
      replayEngineOreturnRepo: null,
      managedWorktree: false,
      dirty: null,
      matched: false,
    }),
    loadPromptSources: async () => {
      loadedSources = true;
      return [];
    },
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const response = await request(handler, 'GET', '/api/prompt-sources');

  assert.equal(response.status, 500);
  assert.equal(response.body.code, 'PROMPT_SOURCE_VERSION_UNRESOLVED');
  assert.equal(loadedSources, false);
});

test('POST /api/prompt-sources/preview-diff returns line diff', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath);
  const handler = createWorkbenchApiHandler({
    taskPath,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const response = await request(handler, 'POST', '/api/prompt-sources/preview-diff', {
    originalText: 'keep\nold\n',
    draftText: 'keep\nnew\n',
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.diff, [
    { type: 'equal', text: 'keep\n' },
    { type: 'delete', text: 'old\n' },
    { type: 'insert', text: 'new\n' },
  ]);
});

test('GET replay artifact endpoints read summary, case, and run artifacts', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const logGroupDir = path.join(dir, 'logs', 'abcdef0-dev');
  const resultDir = path.join(logGroupDir, 'prompt-patch-replay', 'api-task-a');
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath, { logGroupDir });
  await writeArtifactFixture(resultDir);
  const handler = createWorkbenchApiHandler({
    taskPath,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const summary = await request(handler, 'GET', '/api/replay/api-task-a/summary');
  const caseArtifact = await request(handler, 'GET', '/api/replay/api-task-a/cases/5');
  const runArtifact = await request(handler, 'GET', '/api/replay/api-task-a/cases/5/runs/1');

  assert.equal(summary.status, 200);
  assert.equal(summary.body.replayId, 'api-task-a');
  assert.equal(caseArtifact.body.context.turn, 5);
  assert.equal(runArtifact.body.output.normalizedContent.visibleText, 'new text');
});

test('GET /api/cases returns badcase contexts with related issue turns', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'workbench-api-'));
  const logGroupDir = path.join(dir, 'logs', 'abcdef0-dev');
  const taskPath = path.join(dir, 'replay-task.yaml');
  await writeTask(taskPath, { logGroupDir, turns: [4] });
  await writeRunContextFixture(logGroupDir, 'run-a');
  const handler = createWorkbenchApiHandler({
    taskPath,
    loadPromptSources: async () => [],
    runPromptPatchReplay: async () => {
      throw new Error('should not run replay');
    },
  });

  const response = await request(handler, 'GET', '/api/cases');

  assert.equal(response.status, 200);
  assert.equal(response.body.cases.length, 1);
  assert.equal(response.body.cases[0].turn, 4);
  assert.equal(response.body.cases[0].issues[0].id, 'issue-001');
  assert.equal(response.body.cases[0].issues[0].relatedTurns[0].turn, 2);
  assert.equal(response.body.cases[0].issues[0].relatedTurns[0].visibleText, '正文 2');
  assert.equal(response.body.cases[0].issues[0].relatedTurns[0].rawNarrativeHtml, '<p data-speaker="角色2" data-to="玩家">正文 2</p>');
  assert.equal(response.body.cases[0].visibleContext.length, 3);
  assert.equal(response.body.cases[0].visibleContext[0].rawNarrativeHtml, '<p data-speaker="角色1" data-to="玩家">正文 1</p>');
  assert.equal(response.body.cases[0].originalOutput.normalizedContent.visibleText, '正文 4');
  assert.equal(response.body.cases[0].originalRawNarrativeHtml, '<p data-speaker="角色4" data-to="玩家">正文 4</p>');
});

async function request(handler, method, url, body) {
  const response = await handler({
    method,
    url,
    body,
    headers: {},
  });
  return {
    status: response.status,
    body: response.body === undefined ? undefined : JSON.parse(response.body),
  };
}

async function writeTask(taskPath, overrides = {}) {
  const logGroupDir = overrides.logGroupDir ?? 'logs/group-a';
  const turns = overrides.turns ?? [4];
  const replayId = overrides.replayId ?? 'api-task-a';
  const oreturnRepo = overrides.oreturnRepo ?? '/tmp/oreturn';
  const judgingLines = overrides.regressionConsistencyEnabled === undefined
    ? []
    : [
        'judging:',
        '  passVerdicts: [fixed]',
        '  regressionConsistency:',
        `    enabled: ${overrides.regressionConsistencyEnabled}`,
        '    target: fullTurn',
      ];
  await writeFile(
    taskPath,
    [
      `replayId: ${replayId}`,
      `caseSet: { logGroupDir: ${JSON.stringify(logGroupDir)}, runId: run-a, turns: [${turns.join(', ')}] }`,
      `source: { oreturnRepo: ${JSON.stringify(oreturnRepo)} }`,
      'models:',
      '  replay: { baseUrl: http://llm/v1, apiKeyEnv: REPLAY_KEY, model: replay-model }',
      '  judge: { useReplayModel: true }',
      ...judgingLines,
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

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

async function writeArtifactFixture(resultDir) {
  const caseDir = path.join(resultDir, 'cases', 'turn-005');
  await mkdir(path.join(caseDir, 'issues', 'issue-001'), { recursive: true });
  await writeJson(path.join(resultDir, 'summary.json'), {
    replayId: 'api-task-a',
    cases: [{ turn: 5 }],
  });
  await writeJson(path.join(caseDir, 'turn-replay-context.json'), { turn: 5 });
  await writeJson(path.join(caseDir, 'aggregate-summary.json'), { turn: 5, passRate: 1 });
  await writeJson(path.join(caseDir, 'new-04-output.json'), {
    normalizedContent: { visibleText: 'new text' },
  });
  await writeJson(path.join(caseDir, 'llm-calls.json'), []);
  await writeJson(path.join(caseDir, 'issues', 'issue-001', 'judge-result.json'), {
    verdict: 'fixed',
  });
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeRunContextFixture(logGroupDir, runId) {
  const runDir = path.join(logGroupDir, 'run_logs', runId);
  const reviewDir = path.join(logGroupDir, 'consistency-review', runId);
  await mkdir(runDir, { recursive: true });
  await mkdir(reviewDir, { recursive: true });
  await writeJson(path.join(runDir, '00-run-config.json'), {});

  for (let turn = 1; turn <= 4; turn += 1) {
    const turnDir = path.join(runDir, `turn-${String(turn).padStart(2, '0')}`);
    await mkdir(turnDir, { recursive: true });
    await writeJson(path.join(turnDir, '01-summary.json'), {
      turn,
      playerInput: `玩家输入 ${turn}`,
    });
    await writeJson(path.join(turnDir, '03-story-state.json'), {
      marker: `story-state-${turn}`,
    });
    await writeJson(path.join(turnDir, '04-output.json'), {
      normalizedContent: {
        visibleText: `正文 ${turn}`,
        rawHtml: `<p data-speaker="角色${turn}" data-to="玩家">正文 ${turn}</p>`,
      },
      choices: { options: [{ text: `选项 ${turn}` }] },
    });
  }
  await writeJson(path.join(runDir, 'turn-04', '06-llm-calls.json'), [
    {
      kind: 'generateObject',
      system: 'observed director system',
      messages: [
        {
          role: 'user',
          content: '<player_input>\n玩家输入 4\n</player_input>',
        },
      ],
    },
    {
      kind: 'streamText',
      system: 'observed narrator system',
      messages: [
        {
          role: 'user',
          content: '<creative_brief>\nobserved director output\n</creative_brief>',
        },
        {
          role: 'user',
          content: '<context>\nobserved context\n</context>',
        },
      ],
    },
  ]);

  await writeJson(path.join(reviewDir, 'issues.json'), [
    {
      id: 'issue-001',
      turn: 4,
      type: 'continuity_break',
      severity: 'medium',
      currentEvidence: '当前证据',
      reason: '和 turn 2 冲突',
      conflictingTurns: [2],
    },
  ]);

  await writeFile(
    path.join(reviewDir, 'visible-timeline.jsonl'),
    [1, 2, 3, 4]
      .map((turn) =>
        JSON.stringify({
          turn,
          playerInput: `玩家输入 ${turn}`,
          visibleText: `正文 ${turn}`,
          choices: [{ text: `选项 ${turn}` }],
        }),
      )
      .join('\n') + '\n',
  );
}
