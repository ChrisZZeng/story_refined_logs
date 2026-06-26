import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { lstat, mkdtemp, mkdir, readFile, readlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  ensureOreturnReplayWorktree,
  parseCommitFromLogGroupName,
  resolveSourceCommit,
} from '../../scripts/prompt-patch-replay/source-version.mjs';

test('parseCommitFromLogGroupName reads branch-version prefix', () => {
  assert.equal(
    parseCommitFromLogGroupName('a4a2cfc1e411-dev-orchestrator-opt-0624'),
    'a4a2cfc1e411',
  );
});

test('parseCommitFromLogGroupName works with a path', () => {
  assert.equal(
    parseCommitFromLogGroupName('logs/a4a2cfc1e411-dev-orchestrator-opt-0624'),
    'a4a2cfc1e411',
  );
});

test('resolveSourceCommit uses run config before explicit config when they match', () => {
  const commit = resolveSourceCommit({
    configCommit: 'a4a2cfc1e411',
    runConfig: { oreturnCommit: 'a4a2cfc1e411abcdef' },
    logGroupDir: 'logs/a4a2cfc1e411-dev',
  });

  assert.equal(commit, 'a4a2cfc1e411abcdef');
});

test('resolveSourceCommit rejects explicit config commit that conflicts with logs', () => {
  assert.throws(
    () =>
      resolveSourceCommit({
        configCommit: 'ffffffffffff',
        runConfig: { oreturnCommit: 'a4a2cfc1e411abcdef' },
        logGroupDir: 'logs/a4a2cfc1e411-dev',
      }),
    /conflicts/,
  );
});

test('resolveSourceCommit falls back to run config then log group prefix', () => {
  assert.equal(
    resolveSourceCommit({
      runConfig: { sourceCommit: 'a4a2cfc1e411abcdef' },
      logGroupDir: 'logs/a4a2cfc1e411-dev',
    }),
    'a4a2cfc1e411abcdef',
  );
  assert.equal(
    resolveSourceCommit({
      runConfig: {},
      logGroupDir: 'logs/a4a2cfc1e411-dev',
    }),
    'a4a2cfc1e411',
  );
});

test('resolveSourceCommit falls back to config only when logs have no source commit', () => {
  assert.equal(
    resolveSourceCommit({
      configCommit: 'explicit123',
      runConfig: {},
      logGroupDir: 'logs/no-commit-here',
    }),
    'explicit123',
  );
});

test('resolveSourceCommit throws when no source is available', () => {
  assert.throws(
    () => resolveSourceCommit({ runConfig: {}, logGroupDir: 'logs/no-commit-here' }),
    /Cannot resolve source oreturn commit/,
  );
});

test('ensureOreturnReplayWorktree creates an isolated worktree at the source commit', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'story-replay-worktree-'));
  const repo = path.join(tempRoot, 'oreturn');
  const managedRoot = path.join(tempRoot, 'managed');
  await initRepo(repo);
  const sourceCommit = git(['rev-parse', '--short=12', 'HEAD'], repo);

  await writeFile(path.join(repo, 'main.txt'), 'changed in user worktree\n');

  const result = ensureOreturnReplayWorktree({
    oreturnRepo: repo,
    sourceCommit,
    managedRoot,
  });

  assert.equal(result.sourceOreturnCommit, sourceCommit);
  assert.equal(result.managedWorktree, true);
  assert.equal(result.oreturnRepo, path.resolve(repo));
  assert.equal(result.replayEngineOreturnRepo, path.join(managedRoot, `oreturn-${sourceCommit}`));
  assert.ok(result.replayEngineOreturnCommit.startsWith(sourceCommit));
  assert.equal(await readFile(path.join(result.replayEngineOreturnRepo, 'main.txt'), 'utf8'), 'initial\n');
});

test('ensureOreturnReplayWorktree reuses an existing matching worktree', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'story-replay-worktree-'));
  const repo = path.join(tempRoot, 'oreturn');
  const managedRoot = path.join(tempRoot, 'managed');
  await initRepo(repo);
  const sourceCommit = git(['rev-parse', '--short=12', 'HEAD'], repo);

  const first = ensureOreturnReplayWorktree({ oreturnRepo: repo, sourceCommit, managedRoot });
  const second = ensureOreturnReplayWorktree({ oreturnRepo: repo, sourceCommit, managedRoot });

  assert.equal(second.replayEngineOreturnRepo, first.replayEngineOreturnRepo);
  assert.ok(second.replayEngineOreturnCommit.startsWith(sourceCommit));
});

test('ensureOreturnReplayWorktree links dependency directories from the source repo', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'story-replay-worktree-'));
  const repo = path.join(tempRoot, 'oreturn');
  const managedRoot = path.join(tempRoot, 'managed');
  await initRepo(repo);
  await mkdir(path.join(repo, 'node_modules'), { recursive: true });
  await mkdir(path.join(repo, 'packages', 'core', 'node_modules'), { recursive: true });
  const sourceCommit = git(['rev-parse', '--short=12', 'HEAD'], repo);

  const result = ensureOreturnReplayWorktree({ oreturnRepo: repo, sourceCommit, managedRoot });

  const rootLink = path.join(result.replayEngineOreturnRepo, 'node_modules');
  const coreLink = path.join(result.replayEngineOreturnRepo, 'packages', 'core', 'node_modules');
  assert.equal((await lstat(rootLink)).isSymbolicLink(), true);
  assert.equal((await lstat(coreLink)).isSymbolicLink(), true);
  assert.equal(await readlink(rootLink), path.join(repo, 'node_modules'));
  assert.equal(await readlink(coreLink), path.join(repo, 'packages', 'core', 'node_modules'));
});

test('ensureOreturnReplayWorktree fails when existing managed worktree is at another commit', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'story-replay-worktree-'));
  const repo = path.join(tempRoot, 'oreturn');
  const managedRoot = path.join(tempRoot, 'managed');
  await initRepo(repo);
  const firstCommit = git(['rev-parse', '--short=12', 'HEAD'], repo);
  await writeFile(path.join(repo, 'main.txt'), 'second\n');
  git(['add', 'main.txt'], repo);
  git(['commit', '-m', 'second'], repo);
  const secondCommit = git(['rev-parse', '--short=12', 'HEAD'], repo);
  await mkdir(managedRoot, { recursive: true });
  git(['worktree', 'add', '--detach', path.join(managedRoot, `oreturn-${firstCommit}`), secondCommit], repo);

  assert.throws(
    () => ensureOreturnReplayWorktree({ oreturnRepo: repo, sourceCommit: firstCommit, managedRoot }),
    /does not match source commit/,
  );
});

async function initRepo(repo) {
  await mkdirp(repo);
  git(['init'], repo);
  git(['config', 'user.email', 'test@example.com'], repo);
  git(['config', 'user.name', 'Test User'], repo);
  await writeFile(path.join(repo, 'main.txt'), 'initial\n');
  await mkdir(path.join(repo, 'packages', 'core'), { recursive: true });
  await writeFile(path.join(repo, 'packages', 'core', 'package.json'), '{"name":"core"}\n');
  await writeFile(path.join(repo, '.gitignore'), 'node_modules/\n');
  git(['add', 'main.txt'], repo);
  git(['add', 'packages/core/package.json', '.gitignore'], repo);
  git(['commit', '-m', 'initial'], repo);
}

async function mkdirp(dir) {
  await import('node:fs/promises').then(({ mkdir }) => mkdir(dir, { recursive: true }));
}

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
