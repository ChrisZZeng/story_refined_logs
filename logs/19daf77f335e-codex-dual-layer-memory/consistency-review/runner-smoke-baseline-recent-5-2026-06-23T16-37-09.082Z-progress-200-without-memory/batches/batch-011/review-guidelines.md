# 审阅规则摘录

本批次按 narrative-consistency-batch-reviewer skill 审阅。评估对象仅限玩家可见证据：玩家输入、生成前已发生且玩家可感知的事件、玩家实际看到的正文与选项。

窗口范围 91-110 只用于上下文和冲突证据；本批次只统计重点评估范围 101-110 内新出现或被重新固定的玩家可见问题。

每条 issue 均标注 scope：

- `visibleText`：问题发生在正文中。
- `choices`：问题发生在选项中。
- `preLlmEvents`：问题发生在生成前已发生事件中。
- `mixed`：问题横跨多个玩家可见部分。

主要判定维度包括空间与时间连续性、行动与姿态连续性、物件和信息连续性、交互状态连续性、玩家意图承接、剧情进度连续性、语言和格式稳定性。

问题来源按 `player-input`、`model-output`、`mixed`、`uncertain` 标注。严重程度按 `high`、`medium`、`low` 标注。
