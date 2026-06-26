import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, symlinkSync } from 'node:fs';
import path from 'node:path';

const COMMIT_PREFIX = /^[0-9a-f]{7,40}(?=-|$)/i;

export function parseCommitFromLogGroupName(nameOrPath) {
  const base = path.basename(String(nameOrPath));
  const match = base.match(COMMIT_PREFIX);
  return match?.[0] ?? null;
}

export function resolveSourceCommit({ configCommit, runConfig, logGroupDir }) {
  const candidates = [
    runConfig?.oreturnCommit,
    runConfig?.sourceCommit,
    runConfig?.gitCommit,
    runConfig?.commit,
    runConfig?.source?.oreturnCommit,
    runConfig?.source?.commit,
  ];
  let runConfigCommit = null;
  for (const candidate of candidates) {
    if (isNonEmptyString(candidate)) {
      runConfigCommit = candidate;
      break;
    }
  }

  const logGroupCommit = parseCommitFromLogGroupName(logGroupDir);
  const resolved = runConfigCommit ?? logGroupCommit ?? null;
  if (runConfigCommit !== null && logGroupCommit !== null && !commitsMatch(runConfigCommit, logGroupCommit)) {
    throw new Error(
      `run config source commit ${runConfigCommit} conflicts with log group commit ${logGroupCommit}`,
    );
  }
  if (resolved !== null) {
    if (isNonEmptyString(configCommit) && !commitsMatch(resolved, configCommit)) {
      throw new Error(
        `config source commit ${configCommit} conflicts with log source commit ${resolved}`,
      );
    }
    return resolved;
  }

  if (isNonEmptyString(configCommit)) return configCommit;

  throw new Error('Cannot resolve source oreturn commit from config, run config, or log group name');
}

export function validateOreturnVersion({ oreturnRepo, sourceCommit, allowDirty = false }) {
  const repoRoot = path.resolve(oreturnRepo);
  git(['rev-parse', '--is-inside-work-tree'], repoRoot);
  git(['cat-file', '-e', `${sourceCommit}^{commit}`], repoRoot);

  const replayEngineOreturnCommit = git(['rev-parse', 'HEAD'], repoRoot);
  const dirty = git(['status', '--porcelain'], repoRoot).length > 0;
  if (dirty && !allowDirty) {
    throw new Error(`oreturnRepo has uncommitted changes: ${repoRoot}`);
  }
  if (!replayEngineOreturnCommit.startsWith(sourceCommit)) {
    throw new Error(
      `replay engine commit ${replayEngineOreturnCommit} does not match source commit ${sourceCommit}`,
    );
  }

  return {
    sourceOreturnCommit: sourceCommit,
    replayEngineOreturnCommit,
    oreturnRepo: repoRoot,
    dirty,
    matched: true,
  };
}

export function ensureOreturnReplayWorktree({
  oreturnRepo,
  sourceCommit,
  managedRoot = path.resolve(process.cwd(), '.worktrees', 'prompt-patch-replay'),
  allowDirty = false,
}) {
  const repoRoot = path.resolve(oreturnRepo);
  const worktreeRoot = path.resolve(managedRoot);
  const worktreePath = path.join(worktreeRoot, `oreturn-${sourceCommit}`);

  git(['rev-parse', '--is-inside-work-tree'], repoRoot);
  git(['cat-file', '-e', `${sourceCommit}^{commit}`], repoRoot);
  mkdirSync(worktreeRoot, { recursive: true });

  if (!existsSync(worktreePath)) {
    git(['worktree', 'add', '--detach', worktreePath, sourceCommit], repoRoot);
  } else {
    git(['rev-parse', '--is-inside-work-tree'], worktreePath);
  }
  linkDependencyDir({
    sourceDir: path.join(repoRoot, 'node_modules'),
    targetDir: path.join(worktreePath, 'node_modules'),
  });
  linkDependencyDir({
    sourceDir: path.join(repoRoot, 'packages', 'core', 'node_modules'),
    targetDir: path.join(worktreePath, 'packages', 'core', 'node_modules'),
  });

  const replayEngineOreturnCommit = git(['rev-parse', 'HEAD'], worktreePath);
  const dirty = git(['status', '--porcelain', '--untracked-files=no'], worktreePath).length > 0;
  if (dirty && !allowDirty) {
    throw new Error(`managed oreturn replay worktree has uncommitted changes: ${worktreePath}`);
  }
  if (!replayEngineOreturnCommit.startsWith(sourceCommit)) {
    throw new Error(
      `managed replay worktree commit ${replayEngineOreturnCommit} does not match source commit ${sourceCommit}`,
    );
  }

  return {
    sourceOreturnCommit: sourceCommit,
    replayEngineOreturnCommit,
    oreturnRepo: repoRoot,
    replayEngineOreturnRepo: worktreePath,
    managedWorktreeRoot: worktreeRoot,
    managedWorktree: true,
    dirty,
    matched: true,
  };
}

export function currentGitCommit(cwd) {
  return git(['rev-parse', 'HEAD'], cwd);
}

export function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function commitsMatch(left, right) {
  return left.startsWith(right) || right.startsWith(left);
}

function linkDependencyDir({ sourceDir, targetDir }) {
  if (!existsSync(sourceDir) || existsSync(targetDir)) return;
  try {
    const targetStat = lstatSync(targetDir);
    if (targetStat.isSymbolicLink()) return;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  symlinkSync(sourceDir, targetDir, 'dir');
}
