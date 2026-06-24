# 审阅规则摘要

本批次遵循 `narrative-consistency-batch-reviewer` 的规则，只使用玩家可见证据：

- 只审阅窗口范围内的玩家可见 turn，并且只统计重点评估范围内的问题。
- 每个 turn 都要同时看 `visibleText`、`choices`、`preLlmEvents`。
- 只记录会影响玩家体验的一致性问题、明显质量问题、语言或格式漂移。
- 允许用窗口上文作为冲突证据，但不把窗口外的问题计入本批次。
- 问题必须标注 `scope`、`type`、`severity`、`source`，并写清当前证据与冲突证据。

可用类型包括但不限于：

- `fact-conflict`
- `identity-drift`
- `space-time-break`
- `user-input-ignored`
- `event-negated`
- `unsupported-jump`
- `repeated-scene`
- `language-drift`
- `protocol-break`
- `quality-regression`
- `other`

