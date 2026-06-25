# 本批次使用的审阅规则

本批次按 `narrative-consistency-batch-reviewer` skill 及其 `references/review_guidelines.md` 执行。审阅对象是玩家可见经历，而不是隐藏剧本、角色卡或运行时内部状态。

判定边界：

- 只检查玩家已经输入的内容、生成前已发生的玩家可见事件、玩家实际看到的正文和选项。
- 合理新增细节不算冲突；只有新内容否定、改写或破坏此前玩家可见事实时，才算不一致。
- 轻微但明确的连续性错误也记录为 `low`。
- 如果玩家输入本身和此前可见上下文冲突，也记录问题，并在 `source` 中标明来源。
- 证据不足时不猜测，可将问题或轮次标为 `uncertain`。

本批次逐轮检查这些维度：

- 空间和时间连续性。
- 行动和姿态连续性。
- 物件和信息连续性。
- 交互状态连续性。
- 玩家意图承接。
- 剧情进度连续性。
- 语言、专名和格式稳定性。

问题类型使用 skill 规定的枚举：`fact-conflict`、`identity-drift`、`space-time-break`、`user-input-ignored`、`event-negated`、`unsupported-jump`、`repeated-scene`、`language-drift`、`protocol-break`、`quality-regression`、`other`。

严重程度使用：

- `high`：直接破坏核心剧情理解、角色身份、地点关系、关键事件或语言可读性。
- `medium`：明显影响连续体验，但玩家仍能大致理解发生了什么。
- `low`：局部动作、物品、姿态或表达上的轻微冲突，值得记录但不必视为严重失败。

每条 issue 都必须标注 `scope`：`visibleText`、`choices`、`preLlmEvents` 或 `mixed`。
