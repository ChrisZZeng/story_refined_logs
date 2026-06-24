# 审阅规则参考

本批次依据 `skills/consistency_evaluator/skills/batch_reviewer/SKILL.md` 及其 `references/review_guidelines.md` 执行。

核心口径：

- 只审玩家可见内容：`visibleText`、`choices`、`preLlmEvents`，以及玩家输入本身。
- 只统计重点评估范围内的问题；窗口上文只作上下文和冲突证据。
- 发现问题时，必须能回指到玩家可见证据，不使用隐藏剧本、内部状态或私有意图判错。
- 问题需要标注 `scope`、`type`、`severity`、`source`，并写清当前证据与冲突证据。
- 如果没有稳定的一致性问题，也不强行产出问题项。
