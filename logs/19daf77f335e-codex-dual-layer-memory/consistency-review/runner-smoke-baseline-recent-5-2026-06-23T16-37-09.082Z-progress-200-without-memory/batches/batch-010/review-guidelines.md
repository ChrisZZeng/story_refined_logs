# 审阅规则参考

本批次依据 `evaluation_suite/tools/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md` 审阅。关键规则如下：

- 只使用玩家可见证据：玩家输入、preLlmEvents、visibleText、choices。
- 窗口范围 81-100 只作为上下文；只统计重点评估范围 91-100 内的问题。
- 覆盖完整玩家可见 turn，包括 visibleText、choices、preLlmEvents。
- 每条 issue 标注 scope：visibleText、choices、preLlmEvents 或 mixed。
- 合理新增细节不算问题；否定、改写或破坏此前玩家可见事实时才算不一致。
- 若玩家输入自身带入冲突也记录，并用 source 标注来源。
- 问题类型使用 fact-conflict、identity-drift、space-time-break、user-input-ignored、event-negated、unsupported-jump、repeated-scene、language-drift、protocol-break、quality-regression 或 other。
- 严重程度使用 high、medium、low。
