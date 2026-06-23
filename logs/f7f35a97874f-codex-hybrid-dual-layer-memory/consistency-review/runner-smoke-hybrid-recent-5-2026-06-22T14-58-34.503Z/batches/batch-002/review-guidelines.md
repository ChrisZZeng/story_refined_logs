# 审阅规则参考

本批次按 `batch_reviewer` skill 的玩家可见一致性规则审阅：

- 只使用玩家输入、preLlmEvents、visibleText 和 choices 作为证据。
- 不使用隐藏剧本、内部状态或未展示给玩家的信息判错。
- 窗口范围 1-20 只提供上下文；只统计重点评估范围 11-20 内的问题。
- 审阅完整玩家可见 turn，包括 visibleText、choices 和 preLlmEvents。
- 每条问题必须标注 scope：visibleText、choices、preLlmEvents 或 mixed。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才计入。
- 玩家输入导致的冲突也可计入，但需标明 source。

严重程度：

- high：破坏核心剧情理解、角色身份、地点关系、关键事件或语言可读性。
- medium：明显影响连续体验，但玩家仍能大致理解发生了什么。
- low：局部动作、物品、姿态或表达上的轻微冲突。

