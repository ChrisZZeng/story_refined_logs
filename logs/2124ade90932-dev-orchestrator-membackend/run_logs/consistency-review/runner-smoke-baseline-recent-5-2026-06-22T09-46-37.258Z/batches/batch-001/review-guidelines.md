# 本批次审阅规则

规则来源：`skills/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md`。

本次只使用玩家可见证据：玩家输入、生成前玩家可感知事件、玩家实际看到的正文和选项。不使用隐藏剧本、角色卡、导演意图或内部状态判错。

审阅覆盖每个玩家可见 turn 的 `visibleText`、`choices` 和 `preLlmEvents`。每条问题标注 `scope`，取值为 `visibleText`、`choices`、`preLlmEvents` 或 `mixed`。

窗口范围只提供上下文；只有重点评估范围内的问题计入本批次统计。合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实，或明显影响阅读和互动体验的质量退化，才计为 issue。

重点检查维度包括：空间和时间连续性、行动和姿态连续性、物件和信息连续性、交互状态连续性、玩家意图承接、剧情进度连续性、语言/专名/格式稳定性。

问题类型使用规则参考中定义的集合：`fact-conflict`、`identity-drift`、`space-time-break`、`user-input-ignored`、`event-negated`、`unsupported-jump`、`repeated-scene`、`language-drift`、`protocol-break`、`quality-regression`、`other`。

严重程度：`high` 表示破坏核心理解；`medium` 表示明显影响连续体验但仍可理解；`low` 表示局部连续性或质量问题。

来源标注：`player-input`、`model-output`、`mixed` 或 `uncertain`。
