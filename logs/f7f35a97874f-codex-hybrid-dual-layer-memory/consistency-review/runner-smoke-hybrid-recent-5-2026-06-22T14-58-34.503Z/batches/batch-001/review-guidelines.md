# 审阅规则快照

本批次使用 `narrative-consistency-batch-reviewer` skill 及其 `references/review_guidelines.md`。

关键规则：

- 只使用玩家可见证据：玩家输入、生成前已发生且玩家可感知的事件、玩家实际看到的正文和选项。
- 审阅完整玩家可见 turn，包括 `visibleText`、`choices` 和 `preLlmEvents`。
- 只统计重点评估范围内的问题；窗口上文只作为上下文和冲突证据。
- 每条 issue 标注 `scope`：`visibleText`、`choices`、`preLlmEvents` 或 `mixed`。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才算不一致。
- 玩家输入本身带入冲突也要记录，并用 `source` 区分问题主要来源。

本批次重点检查空间时间连续性、行动和姿态连续性、物件和信息状态、交互状态、玩家意图承接、剧情进度、语言专名和格式稳定性。
