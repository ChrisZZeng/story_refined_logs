# 本批次审阅规则

本批次使用 `skills/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md` 作为审阅规则来源。

核心口径：

- 只使用玩家可见证据：玩家输入、生成前已发生且玩家可感知的事件、玩家实际看到的正文和选项。
- 窗口范围 `1-20` 只提供上下文；只统计重点评估范围 `11-20` 内出现的新问题。
- 审阅每个玩家可见 turn 的 `visibleText`、`choices` 和 `preLlmEvents`。
- 每条 issue 标注 `scope`，取值为 `visibleText`、`choices`、`preLlmEvents` 或 `mixed`。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才计为一致性问题。
- 明确影响阅读的残句、格式异常或机械重复可计为质量问题。
- 严重程度：`high` 破坏核心理解，`medium` 明显影响连续体验，`low` 为局部轻微冲突或表达问题。
