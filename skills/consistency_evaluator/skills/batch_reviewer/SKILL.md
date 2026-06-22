---
name: narrative-consistency-batch-reviewer
description: Use when reviewing one bounded batch/window of interactive narrative run logs for player-visible consistency or quality issues, with structured per-batch issues written to disk for later aggregation.
---

# Narrative Consistency Batch Reviewer

用这个 skill 审阅互动叙事运行日志中的一个批次窗口。

本 skill 不负责完整运行的切分、并发、去重或总统计。你只负责在给定窗口里审阅指定轮次，并把结构化结果落盘，供外层 coordinator 聚合。

评估目标不是判断隐藏剧本或内部状态是否正确，而是判断玩家可见体验是否出现上下文不一致或明显质量问题。评估证据只来自玩家输入、生成前已发生事件，以及玩家实际看到的内容。

## Scope 标注

一次批次审阅要覆盖完整玩家可见 turn，包括 `visibleText`、`choices` 和 `preLlmEvents`。每个问题都必须写 `scope` 字段：

- `visibleText`：问题发生在正文中。
- `choices`：问题发生在选项中。
- `preLlmEvents`：问题发生在生成前已发生事件中。
- `mixed`：问题横跨多个玩家可见部分。

## 工作流程

1. 确认本批次输入：运行目录、玩家可见时间线文件、窗口范围、重点评估范围和输出目录。窗口范围用于提供上下文，重点评估范围才计入本批次问题统计。
2. 读取窗口范围内的玩家可见时间线。不要为了审一个批次而通读完整运行日志。
3. 像审稿一样顺序阅读窗口内容，从空间、行动、物件、交互状态、因果推进、语言格式等维度查找上下文不一致和明显影响体验的质量问题。
4. 只统计重点评估范围内的问题。窗口上文中的问题可以作为冲突证据，但不要重复计入本批次，除非它在重点评估范围内造成了新的玩家可见问题。
5. 审阅每一轮时，都要判断它是否可能和更早的玩家可见内容存在长程冲突。线索可能来自人物、地点、物件、关系、事件、称谓、规则、已知信息或仍在进行的互动。你可以根据日志结构自行选择回查方式，关键是找到可引用的玩家可见证据。
6. 发现问题时，回到原始日志或玩家可见时间线摘取证据。每个问题都要写清楚当前证据、冲突证据、问题类型、scope、严重程度和原因。
7. 如果某个问题主要由玩家输入本身带入，也要记录。评估目标是玩家可见体验是否不一致，不是只给模型输出追责；但原因里要说明问题来源是玩家输入、模型输出，还是二者共同造成。
8. 将本批次的审阅方法、窗口时间线、问题清单和批次汇总落盘。

## 证据边界

只能使用玩家可见证据：

- 玩家已经输入的内容。
- 模型生成前已经发生，并且应该被玩家感知或影响玩家体验的事件。
- 玩家实际看到的正文和选项。

不要拿隐藏剧本事实、角色卡、导演私有意图、内部运行时状态或未展示给玩家的系统字段判错，除非这些信息已经出现在玩家可见正文或事件里。

详细审阅规则见 `references/review_guidelines.md`。当你不确定某类问题是否应该算不一致时，读取这个文件。

## 输出约定

输出目录放在任务指定的位置。建议输出这些文件：

- `<out-dir>/review-guidelines.md`：本次审阅使用的规则文本。
- `<out-dir>/batch-method.md`：这次具体如何读取日志、选择范围、还原玩家可见窗口。
- `<out-dir>/window-timeline.md`：窗口范围内的玩家可见经历，便于人工复盘。
- `<out-dir>/batch-issues.json`：本批次发现的问题清单。
- `<out-dir>/batch-summary.json`：本批次指标。
- `<out-dir>/batch-summary.md`：给人读的批次报告。

本批次的 `batch-summary.json` 应该包含：

```json
{
  "runDir": "string",
  "timelinePath": "string",
  "windowRange": { "start": 1, "end": 10 },
  "evalRange": { "start": 1, "end": 10 },
  "evaluatedTurnCount": 0,
  "firstInconsistentTurn": null,
  "inconsistentTurnCount": 0,
  "issueCount": 0,
  "uncertainTurnCount": 0,
  "inconsistentTurns": [],
  "uncertainTurns": []
}
```

`batch-issues.json` 中每个问题建议使用这个结构：

```json
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
```

`source` 可取：

- `player-input`：问题主要由玩家输入和此前可见上下文冲突造成。
- `model-output`：问题主要由模型输出造成。
- `mixed`：玩家输入带入冲突，模型输出又放大或固定了这个冲突。
- `uncertain`：能确认玩家体验有问题，但来源无法可靠判断。

`scope` 可取：

- `visibleText`：问题发生在正文中。
- `choices`：问题发生在选项中。
- `preLlmEvents`：问题发生在生成前已发生事件中。
- `mixed`：问题横跨多个玩家可见部分。
