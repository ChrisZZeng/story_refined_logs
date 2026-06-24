# 本批审阅规则

本批使用 `narrative-consistency-batch-reviewer` skill 及其 `references/review_guidelines.md`。

- 只使用玩家可见证据：玩家输入、生成前可见事件、实际展示的正文和选项。
- 覆盖每个 turn 的 `visibleText`、`choices` 和 `preLlmEvents`。
- 窗口 31-50 只提供上下文；问题统计只计入重点评估范围 41-50。
- 窗口上文中的问题不重复计入，除非它们在 41-50 中造成新的玩家可见问题。
- 每条 issue 标注 `scope`、`type`、`severity`、`source`、当前证据和冲突证据。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才计入。
- 明确的轻微连续性错误也记录为 `low`；明显影响理解的事实、地点、身份或事件冲突标为 `medium` 或 `high`。
