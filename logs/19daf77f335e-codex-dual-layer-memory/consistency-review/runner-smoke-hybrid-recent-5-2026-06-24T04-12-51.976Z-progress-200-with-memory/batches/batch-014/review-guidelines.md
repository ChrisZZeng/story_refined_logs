# Review Guidelines

本批次采用 `narrative-consistency-batch-reviewer` 的审阅规则，重点检查玩家可见体验中的连续性、一致性和明显质量问题。

核心原则：

- 只使用玩家可见证据：`visibleText`、`choices`、`preLlmEvents` 以及玩家输入。
- 窗口上文可以作为冲突证据，但只有重点评估范围内的问题计入本批次统计。
- 合理新增细节不算冲突；只有它否定、改写或破坏此前玩家可见事实时才算问题。
- 轻微的动作承接、物件状态、称呼、语言或节奏断裂也要记录，只是按 `low` 级别处理。
- 如果证据不足，不猜测；可标记为 `uncertain`，并说明缺少什么证据。

问题类型沿用 skill 约定：

- `fact-conflict`
- `identity-drift`
- `space-time-break`
- `user-input-ignored`
- `event-negated`
- `unsupported-jump`
- `repeated-scene`
- `language-drift`
- `protocol-break`
- `quality-regression`
- `other`

来源标注沿用 skill 约定：

- `player-input`
- `model-output`
- `mixed`
- `uncertain`
