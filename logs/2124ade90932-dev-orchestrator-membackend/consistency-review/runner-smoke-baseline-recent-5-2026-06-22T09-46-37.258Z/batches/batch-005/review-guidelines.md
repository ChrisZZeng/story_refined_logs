# 本批次审阅规则

本批次按 `skills/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md` 执行。

- 只使用玩家可见证据：玩家输入、生成前已发生且玩家可感知的事件、玩家实际看到的正文和选项。
- 窗口范围 `31-50` 只作为上下文；只统计重点评估范围 `41-50` 内新出现或被重新固定的玩家可见问题。
- 每个 turn 同时审阅 `visibleText`、`choices` 和 `preLlmEvents`。
- 每条 issue 标注 `scope`：`visibleText`、`choices`、`preLlmEvents` 或 `mixed`。
- 问题类型使用规则中的类型集合：`fact-conflict`、`identity-drift`、`space-time-break`、`user-input-ignored`、`event-negated`、`unsupported-jump`、`repeated-scene`、`language-drift`、`protocol-break`、`quality-regression`、`other`。
- 严重程度：`high` 表示破坏核心剧情理解；`medium` 表示明显影响连续体验；`low` 表示局部连续性或格式质量问题。
- 来源标注：`player-input`、`model-output`、`mixed` 或 `uncertain`。
