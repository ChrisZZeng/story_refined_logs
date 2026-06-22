# Output Contract

本文件约定 coordinator 生成和聚合的文件结构。报告正文用中文编写，enum、机制标签、字段名和路径保持英文。

## Analysis Directory

```text
<analysis-dir>/
  issue-plan.json
  summary.json
  summary.md
  root-cause-table.md
  mechanism-clusters.md
  fix-priority.md
  batches/
    batch-001/
      task.md
      batch-issues.json
      batch-root-cause-summary.json
      batch-root-cause-summary.md
      issues/
        issue-001-turn-07/
          trace.md
          trace-packet.json
          root-cause-report.md
          root-cause-result.json
```

## issue-plan.json

```json
{
  "runDir": "string",
  "reviewDir": "string",
  "analysisDir": "string",
  "issueTracerSkill": "string",
  "timelinePath": "string",
  "issueCount": 0,
  "batches": [
    {
      "batchId": "batch-001",
      "reason": "为什么这些 issue 放在同一批。",
      "issues": [
        {
          "issueIndex": 1,
          "turn": 7,
          "severity": "low",
          "type": "fact-conflict",
          "scope": "visibleText",
          "summary": "玩家可见问题摘要。"
        }
      ]
    }
  ]
}
```

## batch-root-cause-summary.json

```json
{
  "batchId": "batch-001",
  "issueCount": 0,
  "completedCount": 0,
  "validityCounts": {
    "valid": 0,
    "questionable": 0,
    "invalid": 0,
    "missing": 0
  },
  "issues": [
    {
      "issueIndex": 1,
      "turn": 7,
      "severity": "low",
      "type": "fact-conflict",
      "issueValidity": "valid",
      "rootCause": {
        "label": "context-priority",
        "family": "agent-system"
      },
      "confidence": "high",
      "reportPath": "string",
      "resultPath": "string"
    }
  ]
}
```

## summary.json

```json
{
  "runDir": "string",
  "reviewDir": "string",
  "analysisDir": "string",
  "issueCount": 0,
  "completedCount": 0,
  "validityCounts": {
    "valid": 0,
    "questionable": 0,
    "invalid": 0,
    "missing": 0
  },
  "severityCounts": {},
  "issueTypeCounts": {},
  "rootCauseFamilyCounts": {},
  "rootCauseLabelCounts": {},
  "missingResults": [],
  "invalidResults": [],
  "issues": []
}
```

## Root Cause Item

Coordinator 聚合时读取 `issue_tracer` 的 `root-cause-result.json`。至少需要这些字段：

```json
{
  "issueId": "string",
  "turn": 45,
  "issueValidity": "valid",
  "problemSummary": "玩家可见问题摘要。",
  "rootCause": {
    "label": "mechanism-label",
    "family": "agent-system",
    "secondaryFamilies": ["recent-context"],
    "description": "具体机制说明。",
    "fixSurface": ["最直接能阻止该机制复发的系统表面"]
  },
  "recommendedFixArea": "优先修复区域。",
  "confidence": "high"
}
```

`invalid` 或 `questionable` issue 可以没有 `rootCause`，但必须有 `issueValidity`、`problemSummary` 或 `validityAssessment.verdictReason`。
