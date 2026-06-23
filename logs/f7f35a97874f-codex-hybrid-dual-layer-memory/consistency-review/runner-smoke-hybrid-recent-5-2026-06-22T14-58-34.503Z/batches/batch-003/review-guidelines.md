# 审阅规则参考

本批次按 narrative-consistency-batch-reviewer skill 审阅。只使用玩家可见证据：玩家输入、生成前可见事件、正文与选项；不使用隐藏剧本或内部状态。

只统计重点评估范围 21-30 内的问题。窗口 11-20 只作为上下文和冲突证据。审阅覆盖每个玩家可见 turn 的 `visibleText`、`choices` 和 `preLlmEvents`。

问题按 scope 标注为 `visibleText`、`choices`、`preLlmEvents` 或 `mixed`；来源标注为 `player-input`、`model-output`、`mixed` 或 `uncertain`。

主要检查维度包括空间时间连续性、动作承接、物件和线索状态、交互状态、玩家意图承接、剧情进度、语言专名与格式稳定性。
