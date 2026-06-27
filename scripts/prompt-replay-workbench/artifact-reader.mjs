import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function readReplaySummary({ resultDir }) {
  return readJson(path.join(resultDir, 'summary.json'));
}

export async function readCaseArtifact({ resultDir, turn }) {
  const caseDir = caseArtifactDir({ resultDir, turn });
  const [context, aggregate] = await Promise.all([
    readJson(path.join(caseDir, 'turn-replay-context.json')),
    readOptionalJson(path.join(caseDir, 'aggregate-summary.json')),
  ]);
  return {
    turn,
    caseDir,
    context,
    aggregate,
    runs: await listRunArtifacts({ caseDir }),
  };
}

export async function readRunArtifact({ resultDir, turn, runIndex = 1 }) {
  const caseDir = caseArtifactDir({ resultDir, turn });
  const runDir = await runArtifactDir({ caseDir, runIndex });
  const [output, llmCalls, issues] = await Promise.all([
    readOptionalJson(path.join(runDir, 'new-04-output.json')),
    readOptionalJson(path.join(runDir, 'llm-calls.json')).then((value) => value ?? []),
    readIssueArtifacts(path.join(runDir, 'issues')),
  ]);
  return {
    turn,
    runIndex,
    runDir,
    output,
    llmCalls,
    issues,
  };
}

function caseArtifactDir({ resultDir, turn }) {
  return path.join(resultDir, 'cases', `turn-${String(turn).padStart(3, '0')}`);
}

async function runArtifactDir({ caseDir, runIndex }) {
  const repeatedRunDir = path.join(caseDir, 'runs', `run-${String(runIndex).padStart(3, '0')}`);
  if (runIndex !== 1) return repeatedRunDir;
  return (await pathExists(repeatedRunDir)) ? repeatedRunDir : caseDir;
}

async function listRunArtifacts({ caseDir }) {
  const runsDir = path.join(caseDir, 'runs');
  const entries = await readOptionalDir(runsDir);
  if (entries.length === 0) {
    return [{ runIndex: 1, runDir: caseDir }];
  }
  return entries
    .filter((entry) => /^run-\d+$/.test(entry))
    .sort()
    .map((entry) => ({
      runIndex: Number(entry.slice('run-'.length)),
      runDir: path.join(runsDir, entry),
    }));
}

async function readIssueArtifacts(issuesDir) {
  const issueIds = await readOptionalDir(issuesDir);
  const issues = [];
  for (const issueId of issueIds.sort()) {
    const issueDir = path.join(issuesDir, issueId);
    issues.push({
      issueId,
      issueDir,
      judgeInput: await readOptionalJson(path.join(issueDir, 'judge-input.json')),
      judgeResult: await readOptionalJson(path.join(issueDir, 'judge-result.json')),
      reportPath: path.join(issueDir, 'report.md'),
    });
  }
  return issues;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function readOptionalDir(dirPath) {
  try {
    return await readdir(dirPath);
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}
