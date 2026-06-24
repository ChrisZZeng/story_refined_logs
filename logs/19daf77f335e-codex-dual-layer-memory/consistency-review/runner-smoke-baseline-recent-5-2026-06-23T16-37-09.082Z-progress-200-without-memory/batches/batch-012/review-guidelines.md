# 审阅规则参考

本批次使用 `evaluation_suite/tools/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md` 中的规则。

- 只依据玩家可见证据：玩家输入、生成前可见事件、正文和选项。
- 窗口范围 `101-120` 只作为上下文；只统计重点评估范围 `111-120` 内的问题。
- 每条 issue 标注 `scope`：`visibleText`、`choices`、`preLlmEvents` 或 `mixed`。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才记为不一致。
- 轻微连续性错误也记录为 `low`，例如动作承接、物品位置、已经建立的交互状态被含混改写。
- 玩家输入本身带入冲突时也记录，并在 `source` 里说明来源。
