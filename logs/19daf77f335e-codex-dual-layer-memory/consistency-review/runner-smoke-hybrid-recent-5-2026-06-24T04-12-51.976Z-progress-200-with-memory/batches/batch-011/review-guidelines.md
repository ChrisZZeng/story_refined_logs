# Review Guidelines Used

本批次按 `batch_reviewer` skill 的玩家可见证据边界审阅：只检查玩家输入、生成前已发生且玩家可见或影响玩家体验的事件、玩家实际看到的正文和选项。

## Scope

- `visibleText`：问题发生在正文中。
- `choices`：问题发生在选项中。
- `preLlmEvents`：问题发生在生成前已发生事件中。
- `mixed`：问题横跨多个玩家可见部分。

## 判定边界

- 合理新增细节不是冲突；只有它否定、改写或破坏此前玩家可见事实时才算不一致。
- 明确的轻微连续性错误也要报告为 `low`。
- 明显影响阅读、破坏协议、语言漂移、称呼漂移、重复演出、跳跃或上下文断裂都应报告。
- 如果问题主要由玩家输入带入，也要记录，并在 `source` 中标注。
- 如果证据不足，可以标为 `uncertain`。

## 常用类型

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

## 严重程度

- `high`：直接破坏核心剧情理解、角色身份、地点关系、关键事件或语言可读性。
- `medium`：明显影响连续体验，但玩家仍能大致理解发生了什么。
- `low`：局部动作、物品、姿态或表达上的轻微冲突，值得记录但不必视为严重失败。

## Source

- `player-input`
- `model-output`
- `mixed`
- `uncertain`
