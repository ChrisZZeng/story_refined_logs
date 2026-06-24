# 本批次使用的审阅规则

依据 `narrative-consistency-batch-reviewer` skill 及其 `references/review_guidelines.md`：

- 只使用玩家可见证据：玩家输入、生成前玩家可见事件、正文 `visibleText`、选项 `choices`。
- 不使用隐藏剧本、角色卡、导演意图或内部状态判错。
- 窗口范围 151-170 只用于上下文；本批次只统计重点评估范围 161-170 内的问题。
- 覆盖完整玩家可见 turn，包括 `visibleText`、`choices` 和 `preLlmEvents`。
- 每条 issue 必须标注 `scope`：`visibleText`、`choices`、`preLlmEvents` 或 `mixed`。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才计为不一致。
- 明确的轻微连续性错误也记录为 `low`。
- 如果玩家输入本身带入冲突，也记录玩家可见体验问题，并在 `source` 中说明来源。
