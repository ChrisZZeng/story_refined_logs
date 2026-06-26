# Prompt Patch Replay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first version of the prompt patch badcase replay CLI for `story_refined_logs`.

**Architecture:** `story_refined_logs` owns config parsing, source-version validation, `TurnReplayContext` construction, patch application records, judger, reports, and output directories. The actual turn generation is delegated to `oreturn` by running `bun --cwd <oreturn>/packages/core --eval <runner-source>`, so package imports such as `#internal/...` resolve without writing files into `oreturn`.

**Tech Stack:** Node.js ESM `.mjs`, `node:test`, Bun for the `oreturn` replay engine, OpenAI-compatible HTTP for judger calls.

---

## File Structure

- Create `package.json`: add `node --test` scripts for this repo.
- Create `scripts/prompt-patch-replay.mjs`: CLI entry point.
- Create `scripts/prompt-patch-replay/config.mjs`: config and patch bundle validation.
- Create `scripts/prompt-patch-replay/source-version.mjs`: resolve and validate the `oreturn` source commit.
- Create `scripts/prompt-patch-replay/turn-context.mjs`: build `TurnReplayContext` from `run_logs` and `consistency-review`.
- Create `scripts/prompt-patch-replay/prompt-patcher.mjs`: apply precise prompt patches and record applications.
- Create `scripts/prompt-patch-replay/oreturn-engine.mjs`: invoke Bun eval runner against `oreturn`.
- Create `scripts/prompt-patch-replay/oreturn-eval-runner-source.mjs`: source text used by Bun `--eval`.
- Create `scripts/prompt-patch-replay/judger.mjs`: targeted judge input construction, fake judge, and OpenAI-compatible judge.
- Create `scripts/prompt-patch-replay/report.mjs`: write per-issue reports and top-level summaries.
- Create `test/prompt-patch-replay/*.test.mjs`: focused Node tests with fixtures.

## Task 1: Test Harness and Config Validation

**Files:**
- Create: `package.json`
- Create: `scripts/prompt-patch-replay/config.mjs`
- Test: `test/prompt-patch-replay/config.test.mjs`

- [ ] **Step 1: Write failing config tests**

Create `test/prompt-patch-replay/config.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePatchBundle, validateReplayConfig } from '../../scripts/prompt-patch-replay/config.mjs';

test('validatePatchBundle accepts explicit original and replacement text', () => {
  const bundle = validatePatchBundle({
    id: 'bundle-a',
    patches: [{ id: 'rule-a', originalText: 'old paragraph', replacementText: 'new paragraph' }],
  });
  assert.equal(bundle.id, 'bundle-a');
  assert.equal(bundle.patches[0].id, 'rule-a');
});

test('validatePatchBundle rejects missing original text', () => {
  assert.throws(
    () => validatePatchBundle({ id: 'bundle-a', patches: [{ id: 'rule-a', replacementText: 'new' }] }),
    /patches\[0\]\.originalText/,
  );
});

test('validateReplayConfig accepts mode1 replay config', () => {
  const config = validateReplayConfig({
    replayId: 'replay-a',
    logGroupDir: 'logs/group-a',
    runId: 'run-a',
    turns: [3, 9],
    patchBundlePath: 'patches/a.json',
    source: {
      oreturnRepo: '/repo/oreturn',
      oreturnCommit: 'abcdef123456',
      versionPolicy: 'require-matching-worktree',
    },
    models: {
      replay: { provider: 'openai-compatible', baseUrl: 'http://llm/v1', apiKeyEnv: 'REPLAY_KEY', model: 'replay-model' },
      judge: { provider: 'openai-compatible', baseUrl: 'http://judge/v1', apiKeyEnv: 'JUDGE_KEY', model: 'judge-model' },
    },
  });
  assert.deepEqual(config.turns, [3, 9]);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test test/prompt-patch-replay/config.test.mjs`

Expected: FAIL with module not found for `scripts/prompt-patch-replay/config.mjs`.

- [ ] **Step 3: Implement config validation**

Create `package.json`:

```json
{
  "name": "story-refined-logs",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

Create `scripts/prompt-patch-replay/config.mjs` with exported `validatePatchBundle` and `validateReplayConfig`. Each function should throw `Error` messages naming the missing field path shown in the tests. Return normalized objects with `versionPolicy` defaulting to `require-matching-worktree`.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `node --test test/prompt-patch-replay/config.test.mjs`

Expected: PASS.

## Task 2: Source Version Resolution

**Files:**
- Create: `scripts/prompt-patch-replay/source-version.mjs`
- Test: `test/prompt-patch-replay/source-version.test.mjs`

- [ ] **Step 1: Write failing source-version tests**

Test `resolveSourceCommit` precedence:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSourceCommit, parseCommitFromLogGroupName } from '../../scripts/prompt-patch-replay/source-version.mjs';

test('parseCommitFromLogGroupName reads branch-version prefix', () => {
  assert.equal(parseCommitFromLogGroupName('a4a2cfc1e411-dev-orchestrator-opt-0624'), 'a4a2cfc1e411');
});

test('resolveSourceCommit prefers explicit config commit', () => {
  const commit = resolveSourceCommit({
    configCommit: 'explicit123',
    runConfig: { oreturnCommit: 'run123' },
    logGroupDir: 'logs/a4a2cfc1e411-dev-orchestrator-opt-0624',
  });
  assert.equal(commit, 'explicit123');
});

test('resolveSourceCommit falls back to run config then log group prefix', () => {
  assert.equal(resolveSourceCommit({ runConfig: { sourceCommit: 'run123' }, logGroupDir: 'logs/a4a2cfc1e411-dev' }), 'run123');
  assert.equal(resolveSourceCommit({ runConfig: {}, logGroupDir: 'logs/a4a2cfc1e411-dev' }), 'a4a2cfc1e411');
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test test/prompt-patch-replay/source-version.test.mjs`

Expected: FAIL with module not found.

- [ ] **Step 3: Implement source-version helpers**

Implement:

- `parseCommitFromLogGroupName(nameOrPath)`
- `resolveSourceCommit({ configCommit, runConfig, logGroupDir })`
- `git(args, cwd)` using `child_process.execFileSync`
- `validateOreturnVersion({ oreturnRepo, sourceCommit, allowDirty })`

`validateOreturnVersion` returns `{ sourceOreturnCommit, replayEngineOreturnCommit, oreturnRepo, dirty, matched }` and throws if the commit does not exist, current commit differs, or dirty is true without `allowDirty`.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `node --test test/prompt-patch-replay/source-version.test.mjs`

Expected: PASS.

## Task 3: Prompt Patcher

**Files:**
- Create: `scripts/prompt-patch-replay/prompt-patcher.mjs`
- Test: `test/prompt-patch-replay/prompt-patcher.test.mjs`

- [ ] **Step 1: Write failing patcher tests**

Cover unique hit, no hit, and multi-hit:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPatchBundleToCall } from '../../scripts/prompt-patch-replay/prompt-patcher.mjs';

const bundle = { id: 'b', patches: [{ id: 'p', originalText: 'old paragraph', replacementText: 'new paragraph' }] };

test('applies a patch to a message content and records field path', () => {
  const result = applyPatchBundleToCall({
    patchBundle: bundle,
    stage: 'narrator',
    callKind: 'streamText',
    params: { messages: [{ role: 'user', content: 'before old paragraph after' }] },
  });
  assert.equal(result.params.messages[0].content, 'before new paragraph after');
  assert.equal(result.applications[0].fieldPath, 'messages[0].content');
});

test('fails when patch is not found', () => {
  assert.throws(
    () => applyPatchBundleToCall({ patchBundle: bundle, stage: 'director', callKind: 'generateObject', params: { prompt: 'no match' } }),
    /not found/,
  );
});

test('fails when patch is found more than once', () => {
  assert.throws(
    () => applyPatchBundleToCall({ patchBundle: bundle, stage: 'choice', callKind: 'generateObject', params: { prompt: 'old paragraph old paragraph' } }),
    /multiple matches/,
  );
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test test/prompt-patch-replay/prompt-patcher.test.mjs`

Expected: FAIL with module not found.

- [ ] **Step 3: Implement prompt patcher**

Implement exact string replacement across `system`, `prompt`, and `messages[*].content`. Use `node:crypto` SHA-256 hashes for `originalHash` and `replacementHash`. Return cloned params and application records.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `node --test test/prompt-patch-replay/prompt-patcher.test.mjs`

Expected: PASS.

## Task 4: TurnReplayContext Builder

**Files:**
- Create: `scripts/prompt-patch-replay/turn-context.mjs`
- Test: `test/prompt-patch-replay/turn-context.test.mjs`

- [ ] **Step 1: Write failing context tests**

Create temporary fixture directories with one run, three turns, `issues.json`, and `visible-timeline.jsonl`. Assert:

- turn input prefers `playerInput`
- selected choice fallback works
- issues are selected by `turn`
- visible context contains previous three turns plus `conflictingTurns`

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test test/prompt-patch-replay/turn-context.test.mjs`

Expected: FAIL with module not found.

- [ ] **Step 3: Implement context builder**

Implement `buildTurnReplayContext({ logGroupDir, runId, turn })`. It reads:

- `run_logs/<run-id>/turn-XX/01-summary.json`
- `run_logs/<run-id>/turn-XX/03-story-state.json`
- `run_logs/<run-id>/turn-XX/04-output.json`
- `consistency-review/<run-id>/issues.json`
- `consistency-review/<run-id>/visible-timeline.jsonl`

Return `TurnReplayContext` with source file paths and matching issues.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `node --test test/prompt-patch-replay/turn-context.test.mjs`

Expected: PASS.

## Task 5: Oreturn Engine Adapter

**Files:**
- Create: `scripts/prompt-patch-replay/oreturn-engine.mjs`
- Create: `scripts/prompt-patch-replay/oreturn-eval-runner-source.mjs`
- Test: `test/prompt-patch-replay/oreturn-engine.test.mjs`

- [ ] **Step 1: Write failing engine tests**

Test that `buildBunEvalCommand({ oreturnRepo })` returns cwd `<oreturnRepo>/packages/core`, command `bun`, and args containing `--eval`. Test that `buildReplayInput` includes `turnInput`, `storyState`, and `patchBundle`.

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test test/prompt-patch-replay/oreturn-engine.test.mjs`

Expected: FAIL with module not found.

- [ ] **Step 3: Implement engine adapter**

`oreturn-engine.mjs` should:

- write `replay-input.json` under the case output directory
- run `bun --cwd <oreturnRepo>/packages/core --eval <source>`
- pass `STORY_REPLAY_INPUT`, `STORY_REPLAY_OUTPUT_DIR`, and `STORY_PATCHER_MODULE` via env
- read back `new-04-output.json`, `llm-calls.json`, `patch-application.json`, and `replay-writes.json`

`oreturn-eval-runner-source.mjs` should export `ORETURN_EVAL_RUNNER_SOURCE` as a string. The runner imports `createNovelCreatorStrategy`, `runStrategy`, `createAISdkLLMCall`, and `buildModelFromEnv`, then wraps the LLM with `applyPatchBundleToCall`.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `node --test test/prompt-patch-replay/oreturn-engine.test.mjs`

Expected: PASS.

## Task 6: Judger

**Files:**
- Create: `scripts/prompt-patch-replay/judger.mjs`
- Test: `test/prompt-patch-replay/judger.test.mjs`

- [ ] **Step 1: Write failing judger tests**

Test `buildJudgeInput` includes issue, old output, new output, and visible context. Test `parseJudgeResult` accepts only `fixed`, `improved`, `unchanged`, `regressed`, `uncertain`.

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test test/prompt-patch-replay/judger.test.mjs`

Expected: FAIL with module not found.

- [ ] **Step 3: Implement judger**

Implement:

- `buildJudgeInput({ issue, context, newOutput })`
- `parseJudgeResult(value)`
- `runJudge({ mode, modelConfig, input })`

Support `mode: "fake"` for tests and `mode: "openai-compatible"` for real calls with `fetch`. The real call should request JSON output and parse the first choice message content.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `node --test test/prompt-patch-replay/judger.test.mjs`

Expected: PASS.

## Task 7: Reports and CLI Orchestration

**Files:**
- Create: `scripts/prompt-patch-replay/report.mjs`
- Create: `scripts/prompt-patch-replay.mjs`
- Test: `test/prompt-patch-replay/report.test.mjs`

- [ ] **Step 1: Write failing report tests**

Test that `buildSummary` counts verdicts and failed cases, and `renderSummaryMarkdown` includes replay id, run id, turn count, issue count, and result directory.

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test test/prompt-patch-replay/report.test.mjs`

Expected: FAIL with module not found.

- [ ] **Step 3: Implement report and CLI**

CLI usage:

```bash
node scripts/prompt-patch-replay.mjs --config path/to/replay-config.json
```

The CLI should:

1. load config and patch bundle
2. validate source version
3. create `logs/<branch-version>/prompt-patch-replay/<replay-id>/`
4. write `replay-config.json`, `patch-bundle.json`, `resolved-source-version.json`
5. build each `TurnReplayContext`
6. run `oreturn` replay for each turn unless `--dry-run-context-only` is passed
7. run judger for each issue
8. write per-issue reports
9. write `summary.json` and `summary.md`

- [ ] **Step 4: Run report tests to verify GREEN**

Run: `node --test test/prompt-patch-replay/report.test.mjs`

Expected: PASS.

## Task 8: Full Verification

**Files:**
- Modify only if verification exposes defects.

- [ ] **Step 1: Run all Node tests**

Run: `npm test`

Expected: all `test/prompt-patch-replay/*.test.mjs` pass.

- [ ] **Step 2: Run context-only smoke**

Create a temporary config pointing at an existing log group and a no-op patch bundle, then run:

```bash
node scripts/prompt-patch-replay.mjs --config /tmp/story-replay-config.json --dry-run-context-only
```

Expected: output directory contains config, patch bundle, resolved source version if version validation is enabled, case context files, and summary.

- [ ] **Step 3: Git status review**

Run: `git status --short`.

Expected: only intended new implementation files, tests, package file, and plan are modified or added; unrelated `designs.txt` and `.DS_Store` remain untracked and untouched.
