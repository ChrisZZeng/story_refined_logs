# Review Guidelines Used

本批次按 `narrative-consistency-batch-reviewer` skill 审阅。核心规则如下：

- 只使用玩家可见证据：玩家输入、生成前已发生且玩家可感知的事件、玩家实际看到的正文和选项。
- 覆盖完整玩家可见 turn：`visibleText`、`choices`、`preLlmEvents`。
- 只统计重点评估范围 41-50 内的问题；窗口 31-40 仅作为上下文和冲突证据。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才算不一致。
- 明确的轻微连续性错误也要报告为 `low`，例如动作承接不一致、物品或位置状态回滚、玩家动作被改写。
- 每条问题必须标注 `scope`、`type`、`severity`、`source`、当前证据、冲突证据和原因。
- `scope` 取值：`visibleText`、`choices`、`preLlmEvents`、`mixed`。
- `source` 取值：`player-input`、`model-output`、`mixed`、`uncertain`。

本批次检查维度包括空间和时间连续性、行动和姿态连续性、物件和信息连续性、交互状态连续性、玩家意图承接、剧情进度连续性、语言专名和格式稳定性。
