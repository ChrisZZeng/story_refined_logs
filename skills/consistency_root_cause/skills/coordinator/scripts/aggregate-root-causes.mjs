#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function usage() {
  console.error(`Usage:
  node aggregate-root-causes.mjs <analysis-dir>
`);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function maybeReadJson(filePath) {
  try {
    return { ok: true, value: await readJson(filePath) };
  } catch (error) {
    if (error?.code === 'ENOENT') return { ok: false, missing: true, error };
    return { ok: false, missing: false, error };
  }
}

function issueDirName(issue) {
  const turn = issue.turn == null ? 'unknown' : String(issue.turn).padStart(2, '0');
  return `issue-${String(issue.issueIndex).padStart(3, '0')}-turn-${turn}`;
}

function inc(map, key) {
  const normalized = key || 'unknown';
  map[normalized] = (map[normalized] ?? 0) + 1;
}

function severityWeight(severity) {
  if (severity === 'high') return 5;
  if (severity === 'medium') return 3;
  if (severity === 'low') return 1;
  return 1;
}

function confidenceWeight(confidence) {
  if (confidence === 'high') return 1;
  if (confidence === 'medium') return 0.75;
  if (confidence === 'low') return 0.5;
  return 0.5;
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function table(headers, rows) {
  return [
    `| ${headers.map(escapeCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
  ].join('\n');
}

function resultSummaryText(result) {
  return (
    result?.problemSummary ??
    result?.validityAssessment?.verdictReason ??
    result?.rootCause?.description ??
    ''
  );
}

function buildBatchSummary(batch, issueRows) {
  const validityCounts = { valid: 0, questionable: 0, invalid: 0, missing: 0 };
  for (const row of issueRows) {
    if (row.issueValidity === 'valid') validityCounts.valid += 1;
    else if (row.issueValidity === 'questionable') validityCounts.questionable += 1;
    else if (row.issueValidity === 'invalid') validityCounts.invalid += 1;
    else validityCounts.missing += 1;
  }
  return {
    batchId: batch.batchId,
    issueCount: batch.issues.length,
    completedCount: issueRows.filter((row) => row.issueValidity).length,
    validityCounts,
    issues: issueRows,
  };
}

function batchSummaryMarkdown(summary) {
  const rows = summary.issues.map((issue) => [
    issue.issueIndex,
    issue.turn,
    issue.severity,
    issue.type,
    issue.issueValidity ?? 'missing',
    issue.rootCause?.label ?? '',
    issue.rootCause?.family ?? '',
    issue.confidence ?? '',
    issue.reportPath ?? '',
  ]);
  return `# ${summary.batchId} Root Cause Summary

issueCount: ${summary.issueCount}

completedCount: ${summary.completedCount}

validityCounts: ${JSON.stringify(summary.validityCounts)}

${table(
    ['issue', 'turn', 'severity', 'type', 'validity', 'rootCause.label', 'family', 'confidence', 'report'],
    rows,
  )}
`;
}

function buildMechanismClusters(issues) {
  const clusters = new Map();
  for (const issue of issues) {
    const label = issue.rootCause?.label;
    if (!label) continue;
    if (!clusters.has(label)) {
      clusters.set(label, {
        label,
        family: issue.rootCause?.family ?? 'unknown',
        issues: [],
        score: 0,
        fixSurfaces: new Set(),
      });
    }
    const cluster = clusters.get(label);
    cluster.issues.push(issue);
    cluster.score += severityWeight(issue.severity) * confidenceWeight(issue.confidence);
    for (const surface of issue.rootCause?.fixSurface ?? []) {
      cluster.fixSurfaces.add(surface);
    }
    if (typeof issue.recommendedFixArea === 'string' && issue.recommendedFixArea) {
      cluster.fixSurfaces.add(issue.recommendedFixArea);
    }
  }
  return [...clusters.values()]
    .map((cluster) => ({
      ...cluster,
      fixSurfaces: [...cluster.fixSurfaces],
    }))
    .sort((a, b) => b.score - a.score || b.issues.length - a.issues.length);
}

function summaryMarkdown(summary, clusters) {
  const topRows = [
    ['issues', summary.issueCount],
    ['completed', summary.completedCount],
    ['valid', summary.validityCounts.valid],
    ['questionable', summary.validityCounts.questionable],
    ['invalid', summary.validityCounts.invalid],
    ['missing', summary.validityCounts.missing],
  ];
  const clusterRows = clusters.map((cluster) => [
    cluster.label,
    cluster.family,
    cluster.issues.length,
    cluster.score.toFixed(2),
    cluster.issues.map((issue) => `#${issue.issueIndex}/T${issue.turn}`).join(', '),
  ]);
  return `# Consistency Root Cause Summary

## Overview

${table(['metric', 'value'], topRows)}

## Valid Root Cause Mechanisms

${clusterRows.length ? table(['label', 'family', 'count', 'score', 'issues'], clusterRows) : 'No valid root causes found.'}

## Missing Or Invalid Results

missingResults: ${summary.missingResults.length}

invalidResults: ${summary.invalidResults.length}
`;
}

function rootCauseTableMarkdown(issues) {
  const rows = issues.map((issue) => [
    issue.issueIndex,
    issue.turn,
    issue.severity,
    issue.type,
    issue.issueValidity ?? 'missing',
    issue.rootCause?.label ?? '',
    issue.rootCause?.family ?? '',
    issue.confidence ?? '',
    issue.reportPath ?? '',
    resultSummaryText(issue.result).slice(0, 240),
  ]);
  return `# Root Cause Table

${table(
    ['issue', 'turn', 'severity', 'type', 'validity', 'label', 'family', 'confidence', 'report', 'summary'],
    rows,
  )}
`;
}

function mechanismClustersMarkdown(clusters) {
  const sections = clusters.map((cluster) => {
    const issueRows = cluster.issues.map((issue) => [
      issue.issueIndex,
      issue.turn,
      issue.severity,
      issue.type,
      issue.confidence,
      issue.reportPath,
    ]);
    return `## ${cluster.label}

family: ${cluster.family}

score: ${cluster.score.toFixed(2)}

fixSurface:
${cluster.fixSurfaces.map((surface) => `- ${surface}`).join('\n') || '- 未提供'}

${table(['issue', 'turn', 'severity', 'type', 'confidence', 'report'], issueRows)}
`;
  });
  return `# Mechanism Clusters

${sections.join('\n') || 'No valid root cause clusters.'}
`;
}

function fixPriorityMarkdown(clusters) {
  const rows = clusters.map((cluster, index) => [
    index + 1,
    cluster.label,
    cluster.family,
    cluster.issues.length,
    cluster.score.toFixed(2),
    cluster.fixSurfaces.join('<br>') || '未提供',
  ]);
  return `# Fix Priority

优先级按 severity 加权、confidence 折扣和出现次数综合排序。它只用于批次优化排序，不替代单条报告里的证据链。

${rows.length ? table(['rank', 'label', 'family', 'issueCount', 'score', 'fixSurface'], rows) : 'No valid root causes to prioritize.'}
`;
}

async function main() {
  const analysisDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
  if (!analysisDir) {
    usage();
    process.exitCode = 1;
    return;
  }

  const plan = await readJson(path.join(analysisDir, 'issue-plan.json'));
  const allIssues = [];
  const missingResults = [];
  const invalidResults = [];
  const validityCounts = { valid: 0, questionable: 0, invalid: 0, missing: 0 };
  const severityCounts = {};
  const issueTypeCounts = {};
  const rootCauseFamilyCounts = {};
  const rootCauseLabelCounts = {};

  for (const batch of plan.batches ?? []) {
    const batchDir = path.join(analysisDir, 'batches', batch.batchId);
    const batchIssueRows = [];

    for (const issue of batch.issues) {
      inc(severityCounts, issue.severity);
      inc(issueTypeCounts, issue.type);

      const issueDir = path.join(batchDir, 'issues', issueDirName(issue));
      const resultPath = path.join(issueDir, 'root-cause-result.json');
      const reportPath = path.join(issueDir, 'root-cause-report.md');
      const readResult = await maybeReadJson(resultPath);

      if (!readResult.ok) {
        const row = {
          ...issue,
          batchId: batch.batchId,
          issueValidity: null,
          resultPath,
          reportPath,
          error: readResult.missing ? 'missing result' : String(readResult.error?.message ?? readResult.error),
        };
        missingResults.push(row);
        allIssues.push(row);
        batchIssueRows.push(row);
        validityCounts.missing += 1;
        continue;
      }

      const result = readResult.value;
      const issueValidity = result.issueValidity ?? null;
      const row = {
        ...issue,
        batchId: batch.batchId,
        issueValidity,
        rootCause: result.rootCause
          ? {
              label: result.rootCause.label ?? null,
              family: result.rootCause.family ?? null,
              secondaryFamilies: result.rootCause.secondaryFamilies ?? [],
              fixSurface: result.rootCause.fixSurface ?? [],
            }
          : null,
        confidence: result.confidence ?? null,
        recommendedFixArea: result.recommendedFixArea ?? null,
        resultPath,
        reportPath,
        result,
      };

      if (issueValidity === 'valid') {
        validityCounts.valid += 1;
        if (row.rootCause?.family) inc(rootCauseFamilyCounts, row.rootCause.family);
        if (row.rootCause?.label) inc(rootCauseLabelCounts, row.rootCause.label);
        if (!row.rootCause?.label || !row.rootCause?.family) {
          invalidResults.push({ ...row, error: 'valid issue missing rootCause label or family' });
        }
      } else if (issueValidity === 'questionable') {
        validityCounts.questionable += 1;
      } else if (issueValidity === 'invalid') {
        validityCounts.invalid += 1;
      } else {
        validityCounts.missing += 1;
        invalidResults.push({ ...row, error: 'missing or invalid issueValidity' });
      }

      allIssues.push(row);
      batchIssueRows.push(row);
    }

    const batchSummary = buildBatchSummary(batch, batchIssueRows);
    await mkdir(batchDir, { recursive: true });
    await writeFile(
      path.join(batchDir, 'batch-root-cause-summary.json'),
      `${JSON.stringify(batchSummary, null, 2)}\n`,
    );
    await writeFile(
      path.join(batchDir, 'batch-root-cause-summary.md'),
      batchSummaryMarkdown(batchSummary),
    );
  }

  const completedCount = allIssues.filter((issue) => issue.issueValidity).length;
  const clusters = buildMechanismClusters(allIssues.filter((issue) => issue.issueValidity === 'valid'));
  const summary = {
    generatedAt: new Date().toISOString(),
    runDir: plan.runDir,
    reviewDir: plan.reviewDir,
    analysisDir,
    issueCount: plan.issueCount ?? allIssues.length,
    completedCount,
    validityCounts,
    severityCounts,
    issueTypeCounts,
    rootCauseFamilyCounts,
    rootCauseLabelCounts,
    missingResults,
    invalidResults,
    issues: allIssues,
    mechanismClusters: clusters,
  };

  await writeFile(path.join(analysisDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(path.join(analysisDir, 'summary.md'), summaryMarkdown(summary, clusters));
  await writeFile(path.join(analysisDir, 'root-cause-table.md'), rootCauseTableMarkdown(allIssues));
  await writeFile(path.join(analysisDir, 'mechanism-clusters.md'), mechanismClustersMarkdown(clusters));
  await writeFile(path.join(analysisDir, 'fix-priority.md'), fixPriorityMarkdown(clusters));

  console.log(`Wrote ${path.join(analysisDir, 'summary.json')}`);
  console.log(`Completed: ${completedCount}/${summary.issueCount}; valid: ${validityCounts.valid}`);
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exitCode = 1;
});
