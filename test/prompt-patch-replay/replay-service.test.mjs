import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  createLimiter,
  runPromptPatchReplay,
} from '../../scripts/prompt-patch-replay/replay-service.mjs';

test('runPromptPatchReplay writes context-only dry-run artifacts and returns paths', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-service-'));
  const logGroupDir = path.join(root, 'abcdef0-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId);
  const taskPath = path.join(root, 'replay-task.yaml');
  await writeFile(
    taskPath,
    [
      'replayId: service-dry-run',
      'caseSet:',
      `  logGroupDir: ${JSON.stringify(logGroupDir)}`,
      `  runId: ${runId}`,
      '  turns: [4]',
      'source:',
      '  oreturnRepo: /tmp/oreturn-does-not-need-to-exist-for-context-only',
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

  const result = await runPromptPatchReplay({
    configPath: taskPath,
    dryRunContextOnly: true,
    cwd: process.cwd(),
  });

  assert.equal(result.replayId, 'service-dry-run');
  assert.match(result.resultDir, /prompt-patch-replay\/service-dry-run$/);
  assert.equal(result.summaryPath, path.join(result.resultDir, 'summary.md'));

  const summary = JSON.parse(await readFile(path.join(result.resultDir, 'summary.json'), 'utf8'));
  assert.equal(summary.replayId, 'service-dry-run');
  assert.equal(summary.turnCount, 1);
  assert.equal(summary.issueCount, 1);
  assert.equal(summary.cases[0].status, 'context-only');

  const sourceVersion = JSON.parse(
    await readFile(path.join(result.resultDir, 'resolved-source-version.json'), 'utf8'),
  );
  assert.equal(sourceVersion.sourceOreturnCommit, 'abcdef0');
  assert.equal(sourceVersion.dryRunContextOnly, true);

  const context = JSON.parse(
    await readFile(
      path.join(result.resultDir, 'cases', 'turn-004', 'turn-replay-context.json'),
      'utf8',
    ),
  );
  assert.equal(context.turn, 4);
  assert.equal(context.issues.length, 1);
});

test('runPromptPatchReplay starts badcase turns concurrently and preserves summary order', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-service-parallel-'));
  const logGroupDir = path.join(root, 'abcdef0-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId, { maxTurn: 5, issueTurns: [4, 5] });
  const taskPath = path.join(root, 'replay-task.yaml');
  await writeFile(
    taskPath,
    [
      'replayId: service-parallel',
      'caseSet:',
      `  logGroupDir: ${JSON.stringify(logGroupDir)}`,
      `  runId: ${runId}`,
      '  turns: [4, 5]',
      'source:',
      '  oreturnRepo: /tmp/oreturn-faked-by-test',
      'concurrency:',
      '  replayAttempts: 2',
      '  judgeRequests: 2',
      'models:',
      '  replay: { baseUrl: http://llm/v1, apiKeyEnv: REPLAY_KEY, model: replay-model }',
      '  judge: { useReplayModel: true }',
      'judgeMode: fake',
      'patchBundle:',
      '  id: bundle-a',
      '  patches:',
      '    - id: rule-a',
      '      originalText: old prompt',
      '      replacementText: new prompt',
      '',
    ].join('\n'),
  );

  const replayStarts = [];
  let resolveTurnFiveStarted;
  const turnFiveStarted = new Promise((resolve) => {
    resolveTurnFiveStarted = resolve;
  });

  const result = await runPromptPatchReplay({
    configPath: taskPath,
    cwd: process.cwd(),
    deps: {
      ensureOreturnReplayWorktree: () => ({
        sourceOreturnCommit: 'abcdef0',
        replayEngineOreturnCommit: 'abcdef0123456789',
        oreturnRepo: '/tmp/oreturn-faked-by-test',
        replayEngineOreturnRepo: '/tmp/oreturn-faked-by-test',
        managedWorktree: true,
        dirty: false,
        matched: true,
      }),
      runOreturnReplay: async ({ context }) => {
        replayStarts.push(context.turn);
        if (context.turn === 5) resolveTurnFiveStarted();
        if (context.turn === 4) {
          await Promise.race([
            turnFiveStarted,
            delay(75).then(() => {
              throw new Error('turn 5 did not start before turn 4 completed');
            }),
          ]);
        }
        return {
          newOutput: { normalizedContent: { visibleText: `new output ${context.turn}` } },
        };
      },
    },
  });

  assert.deepEqual([...replayStarts].sort((left, right) => left - right), [4, 5]);
  assert.deepEqual(result.summary.cases.map((item) => item.turn), [4, 5]);
  assert.deepEqual(result.summary.cases.map((item) => item.status), ['completed', 'completed']);
});

test('createLimiter caps active tasks and releases slots after rejection', async () => {
  const limit = createLimiter(2);
  let active = 0;
  let maxActive = 0;
  const tasks = Array.from({ length: 5 }, (_item, index) =>
    limit(async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      try {
        await delay(15);
        if (index === 2) throw new Error('boom');
        return index;
      } finally {
        active -= 1;
      }
    }),
  );

  const results = await Promise.allSettled(tasks);
  assert.equal(maxActive, 2);
  assert.equal(results.filter((item) => item.status === 'fulfilled').length, 4);
  assert.equal(results.filter((item) => item.status === 'rejected').length, 1);
  assert.equal(await limit(async () => 'after-failure'), 'after-failure');
});

test('runPromptPatchReplay limits concurrent replay attempts and preserves repeat order', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-service-repeat-limit-'));
  const logGroupDir = path.join(root, 'abcdef0-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId);
  const taskPath = path.join(root, 'replay-task.yaml');
  await writeFile(
    taskPath,
    [
      'replayId: service-repeat-limit',
      'caseSet:',
      `  logGroupDir: ${JSON.stringify(logGroupDir)}`,
      `  runId: ${runId}`,
      '  turns: [4]',
      '  repeats: 3',
      'concurrency:',
      '  replayAttempts: 2',
      '  judgeRequests: 2',
      'source:',
      '  oreturnRepo: /tmp/oreturn-faked-by-test',
      'models:',
      '  replay: { baseUrl: http://llm/v1, apiKeyEnv: REPLAY_KEY, model: replay-model }',
      '  judge: { useReplayModel: true }',
      'judging:',
      '  issueRepair: { enabled: false }',
      '  regressionConsistency: { enabled: false }',
      'judgeMode: fake',
      'patchBundle:',
      '  id: bundle-a',
      '  patches:',
      '    - id: rule-a',
      '      originalText: old prompt',
      '      replacementText: new prompt',
      '',
    ].join('\n'),
  );

  let active = 0;
  let maxActive = 0;
  const result = await runPromptPatchReplay({
    configPath: taskPath,
    cwd: process.cwd(),
    deps: {
      ensureOreturnReplayWorktree: fakeSourceVersion,
      runOreturnReplay: async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        try {
          await delay(25);
          return {
            newOutput: { normalizedContent: { visibleText: 'new output' } },
          };
        } finally {
          active -= 1;
        }
      },
    },
  });

  assert.equal(maxActive, 2);
  assert.deepEqual(result.summary.cases[0].runs.map((run) => run.runIndex), [1, 2, 3]);
  assert.equal(result.summary.cases[0].status, 'completed');
});

test('runPromptPatchReplay runs regression and issue judges concurrently with stable issue order', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-service-judge-limit-'));
  const logGroupDir = path.join(root, 'abcdef0-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId, { issueTurns: [4, 4, 4] });
  const taskPath = path.join(root, 'replay-task.yaml');
  await writeFile(
    taskPath,
    [
      'replayId: service-judge-limit',
      'caseSet:',
      `  logGroupDir: ${JSON.stringify(logGroupDir)}`,
      `  runId: ${runId}`,
      '  turns: [4]',
      'concurrency:',
      '  replayAttempts: 1',
      '  judgeRequests: 4',
      'source:',
      '  oreturnRepo: /tmp/oreturn-faked-by-test',
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

  let active = 0;
  let maxActive = 0;
  async function trackJudge(result) {
    active += 1;
    maxActive = Math.max(maxActive, active);
    try {
      await delay(25);
      return result;
    } finally {
      active -= 1;
    }
  }

  const result = await runPromptPatchReplay({
    configPath: taskPath,
    cwd: process.cwd(),
    deps: {
      ensureOreturnReplayWorktree: fakeSourceVersion,
      runOreturnReplay: async () => ({
        newOutput: { normalizedContent: { visibleText: 'new output' } },
      }),
      runRegressionJudge: async () => trackJudge({
        isViolation: false,
        confidence: 'high',
        violations: [],
        reasoning: 'ok',
      }),
      runJudge: async () => trackJudge({
        verdict: 'fixed',
        confidence: 'high',
        reason: 'fixed',
        remainingProblems: [],
        newRegressions: [],
      }),
    },
  });

  assert.equal(maxActive, 4);
  assert.equal(result.summary.regressionJudgmentCount, 1);
  assert.equal(result.summary.judgmentCount, 3);
  assert.deepEqual(
    result.summary.cases[0].runs[0].judgeResults.map((item) => item.issueId),
    ['issue-001', 'issue-002', 'issue-003'],
  );
});

test('runPromptPatchReplay writes raw judge response artifacts', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-service-raw-judge-'));
  const logGroupDir = path.join(root, 'abcdef0-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId);
  const taskPath = path.join(root, 'replay-task.yaml');
  await writeFile(
    taskPath,
    [
      'replayId: service-raw-judge',
      'caseSet:',
      `  logGroupDir: ${JSON.stringify(logGroupDir)}`,
      `  runId: ${runId}`,
      '  turns: [4]',
      'source:',
      '  oreturnRepo: /tmp/oreturn-faked-by-test',
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

  const result = await runPromptPatchReplay({
    configPath: taskPath,
    cwd: process.cwd(),
    deps: {
      ensureOreturnReplayWorktree: fakeSourceVersion,
      runOreturnReplay: async () => ({
        newOutput: { normalizedContent: { visibleText: 'new output' } },
      }),
      runRegressionJudge: async ({ onRawResponse }) => {
        await onRawResponse({ content: '{"is_violation":false}', requestId: 'regression-1' });
        return {
          isViolation: false,
          confidence: 'high',
          violations: [],
          reasoning: 'ok',
        };
      },
      runJudge: async ({ onRawResponse }) => {
        await onRawResponse({ content: '{"verdict":"fixed"}', requestId: 'issue-1' });
        return {
          verdict: 'fixed',
          confidence: 'high',
          reason: 'fixed',
          remainingProblems: [],
          newRegressions: [],
        };
      },
    },
  });

  const caseDir = path.join(result.resultDir, 'cases', 'turn-004');
  const regressionRaw = JSON.parse(
    await readFile(path.join(caseDir, 'regression-consistency-judge-raw-response.json'), 'utf8'),
  );
  const issueRaw = JSON.parse(
    await readFile(path.join(caseDir, 'issues', 'issue-001', 'judge-raw-response.json'), 'utf8'),
  );
  assert.equal(regressionRaw.requestId, 'regression-1');
  assert.equal(issueRaw.requestId, 'issue-1');
});

test('runPromptPatchReplay skips issue repair judge when disabled', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prompt-replay-service-issue-disabled-'));
  const logGroupDir = path.join(root, 'abcdef0-dev');
  const runId = 'runner-a';
  await writeRunFixture(logGroupDir, runId);
  const taskPath = path.join(root, 'replay-task.yaml');
  await writeFile(
    taskPath,
    [
      'replayId: service-issue-disabled',
      'caseSet:',
      `  logGroupDir: ${JSON.stringify(logGroupDir)}`,
      `  runId: ${runId}`,
      '  turns: [4]',
      'source:',
      '  oreturnRepo: /tmp/oreturn-faked-by-test',
      'models:',
      '  replay: { baseUrl: http://llm/v1, apiKeyEnv: REPLAY_KEY, model: replay-model }',
      '  judge: { useReplayModel: true }',
      'judging:',
      '  issueRepair: { enabled: false }',
      '  regressionConsistency: { enabled: false }',
      'judgeMode: fake',
      'patchBundle:',
      '  id: bundle-a',
      '  patches:',
      '    - id: rule-a',
      '      originalText: old prompt',
      '      replacementText: new prompt',
      '',
    ].join('\n'),
  );

  const result = await runPromptPatchReplay({
    configPath: taskPath,
    cwd: process.cwd(),
    deps: {
      ensureOreturnReplayWorktree: () => ({
        sourceOreturnCommit: 'abcdef0',
        replayEngineOreturnCommit: 'abcdef0123456789',
        oreturnRepo: '/tmp/oreturn-faked-by-test',
        replayEngineOreturnRepo: '/tmp/oreturn-faked-by-test',
        managedWorktree: true,
        dirty: false,
        matched: true,
      }),
      runOreturnReplay: async () => ({
        newOutput: { normalizedContent: { visibleText: 'new output' } },
      }),
      runJudge: async () => {
        throw new Error('issue judge should not run');
      },
      runRegressionJudge: async () => {
        throw new Error('regression judge should not run');
      },
    },
  });

  assert.equal(result.summary.cases[0].status, 'completed');
  assert.equal(result.summary.judgmentCount, 0);
  assert.equal(result.summary.passedRuns, 1);
  assert.deepEqual(result.summary.cases[0].runs[0].judgeResults, []);
  assert.equal(result.summary.cases[0].runs[0].overall.issueFix.enabled, false);
});

async function writeRunFixture(logGroupDir, runId, { maxTurn = 4, issueTurns = [4] } = {}) {
  const runDir = path.join(logGroupDir, 'run_logs', runId);
  const reviewDir = path.join(logGroupDir, 'consistency-review', runId);
  await mkdir(runDir, { recursive: true });
  await mkdir(reviewDir, { recursive: true });
  await writeJson(path.join(runDir, '00-run-config.json'), {});

  for (let turn = 1; turn <= maxTurn; turn += 1) {
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
      normalizedContent: { visibleText: `正文 ${turn}` },
      choices: { options: [] },
    });
  }

  await writeJson(path.join(reviewDir, 'issues.json'), [
    ...issueTurns.map((turn, index) => ({
      id: `issue-${String(index + 1).padStart(3, '0')}`,
      turn,
      type: 'continuity',
      currentEvidence: `issue ${turn}`,
    })),
  ]);

  await writeFile(
    path.join(reviewDir, 'visible-timeline.jsonl'),
    Array.from({ length: maxTurn }, (_, index) => index + 1)
      .map((turn) =>
        JSON.stringify({
          turn,
          playerInput: `玩家输入 ${turn}`,
          visibleText: `正文 ${turn}`,
          choices: [],
        }),
      )
      .join('\n') + '\n',
  );
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function fakeSourceVersion() {
  return {
    sourceOreturnCommit: 'abcdef0',
    replayEngineOreturnCommit: 'abcdef0123456789',
    oreturnRepo: '/tmp/oreturn-faked-by-test',
    replayEngineOreturnRepo: '/tmp/oreturn-faked-by-test',
    managedWorktree: true,
    dirty: false,
    matched: true,
  };
}
