# Review Guidelines Used

本批次按 `narrative-consistency-batch-reviewer` skill 及其 `references/review_guidelines.md` 执行。

审阅边界：

- 只使用玩家可见证据：玩家输入、生成前可见事件、正文和选项。
- 不使用隐藏剧本、角色卡秘密、导演私有意图或内部运行时状态判错。
- 窗口范围只提供上下文；只有重点评估范围内的新问题计入统计。
- 合理新增细节不算冲突；否定、改写或破坏此前玩家可见事实时才算问题。
- 明确轻微连续性错误也应记录为 `low`。
- 玩家输入本身造成的冲突也应记录，并在 `source` 中标明。

审阅维度：

- 空间和时间连续性。
- 行动、姿态和正在进行操作的承接。
- 物件、线索、装备和已知信息的稳定性。
- 对话、调查、威胁等交互状态的承接。
- 玩家意图是否被理解和回应。
- 剧情进度是否重复、回退或跳跃。
- 语言、专名、称谓和输出格式稳定性。

Issue 字段要求：

- `scope`: `visibleText`, `choices`, `preLlmEvents`, 或 `mixed`。
- `source`: `player-input`, `model-output`, `mixed`, 或 `uncertain`。
- 问题类型使用 skill 约定的类型，如 `fact-conflict`, `space-time-break`, `user-input-ignored`, `unsupported-jump`, `repeated-scene`, `language-drift`, `protocol-break`, `quality-regression`, `other`。
