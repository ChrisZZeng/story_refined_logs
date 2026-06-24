# 审阅规则摘要

本批次使用 `narrative-consistency-batch-reviewer` skill 及其 `references/review_guidelines.md`。

- 只使用玩家可见证据：玩家输入、生成前可见事件、正文和选项。
- 窗口范围 111-130 只提供上下文；只统计重点评估范围 121-130 内的问题。
- 每轮覆盖 `visibleText`、`choices` 和 `preLlmEvents`。
- 每条 issue 标注 `scope`、问题类型、严重程度、当前证据、冲突证据、冲突轮次、来源和原因。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才计入。
- 明确的轻微连续性错误计为 `low`；明显影响连续体验计为 `medium`；破坏核心理解计为 `high`。

