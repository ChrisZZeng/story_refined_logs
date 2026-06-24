# Review Guidelines Used

本批次按 `narrative-consistency-batch-reviewer` skill 及其 `references/review_guidelines.md` 审阅。

核心边界：

- 只使用玩家可见证据：玩家输入、生成前已发生且玩家可感知的事件、玩家实际看到的正文和选项。
- 不使用隐藏剧本、角色卡秘密、导演私有意图或内部运行状态判错。
- 窗口范围 171-190 只作为上下文，只有重点评估范围 181-190 计入本批次问题。
- 每轮覆盖 `visibleText`、`choices`、`preLlmEvents`；每条 issue 标注 `scope`。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才计为一致性问题。
- 玩家输入带入的冲突也可记录，但需标注来源。本批次发现的问题均主要来自模型输出。

使用的问题类型与严重程度遵循 skill 规则：`fact-conflict`、`space-time-break`、`language-drift` 等；严重程度分为 `high`、`medium`、`low`。
