# 输出字段约定

## 目录约定

一次评测目录为 `logs/<branch+version>/`。`runDir` 指向 `logs/<branch+version>/run_logs/<run-id>`，评测输出目录通常是 `logs/<branch+version>/consistency-review/<run-id>`。Coordinator 不直接调用 `oreturn`；来自 `oreturn` 的 playthrough 需要先导出成这个文件化 `run_logs/<run-id>/turn-*` 结构。

## visible-timeline.jsonl

每行是一轮玩家可见经历：

```json
{
  "turn": 1,
  "turnDir": "turn-01",
  "playerInput": "玩家本轮输入。",
  "playerInputSource": "playerInput",
  "preLlmEvents": [],
  "visibleText": "玩家实际看到的正文。",
  "choices": [],
  "plotSummary": "可选，本轮导演或运行摘要。",
  "sourceFiles": {
    "summary": "turn-01/01-summary.json",
    "scriptState": "turn-01/02-script-state.json",
    "output": "turn-01/04-output.json"
  }
}
```

`playerInputSource` 用来说明 `playerInput` 的来源。自由输入通常是 `playerInput`；选项驱动的旧日志可能是 `selectedFromPreviousTurn`，表示这轮由上一轮玩家选择的选项推进。

`visible-timeline.jsonl` 只放玩家可见内容和必要索引，不放隐藏剧本、导演私有意图、完整 prompt 或运行时内部状态。

## batch-plan.json

```json
{
  "timelinePath": "visible-timeline.jsonl",
  "turnCount": 50,
  "batches": [
    {
      "id": "batch-001",
      "windowRange": { "start": 1, "end": 10 },
      "evalRange": { "start": 1, "end": 10 },
      "outputDir": "batches/batch-001",
      "taskPath": "batches/batch-001/task.md"
    }
  ]
}
```

## batch-issues.json

```json
[
  {
    "windowRange": { "start": 1, "end": 10 },
    "evalRange": { "start": 1, "end": 10 },
    "turn": 1,
    "scope": "visibleText",
    "type": "space-time-break",
    "severity": "low",
    "currentEvidence": "当前轮中的证据。",
    "conflictingEvidence": "此前玩家可见上下文或当前玩家输入中的冲突证据。",
    "conflictingTurns": [0],
    "source": "model-output",
    "reason": "一句话说明为什么这构成问题。"
  }
]
```

`scope` 可取 `visibleText`、`choices`、`preLlmEvents`、`mixed`。聚合层会用 `scope` 同时生成正文报告和完整玩家体验报告。

## summary.json

```json
{
  "runDir": "string",
  "turnCount": 0,
  "batchCount": 0,
  "reports": {
    "visibleText": {
      "reportMode": "visibleText",
      "firstInconsistentTurn": null,
      "inconsistentTurnCount": 0,
      "issueCount": 0
    },
    "fullTurn": {
      "reportMode": "fullTurn",
      "firstInconsistentTurn": null,
      "inconsistentTurnCount": 0,
      "issueCount": 0,
      "issueScopeCounts": { "visibleText": 0, "choices": 0 }
    }
  }
}
```

聚合脚本还会额外输出：

- `issues-visible-text.json`：只包含 `scope === "visibleText"` 的问题。
- `summary-visible-text.json` / `summary-visible-text.md`：正文一致性报告。
- `summary-full-turn.json` / `summary-full-turn.md`：完整玩家可见体验报告。
