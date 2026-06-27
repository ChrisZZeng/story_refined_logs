# 本批次使用的审阅规则

规则来源：

`/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md`

本批次只检查玩家可见证据，包括玩家已经输入的内容、生成前已经发生且会影响玩家体验的事件，以及玩家实际看到的正文和选项。不使用隐藏剧本、角色卡秘密、导演私有意图或内部运行时状态判错。

窗口范围用于提供上下文，重点评估范围才计入问题统计。本批次窗口范围和重点评估范围均为 1-10，因此 1-10 轮内的问题全部计入；窗口之外内容不通读，仅在需要长程冲突证据时回查玩家可见时间线。

每条问题必须标注 `scope`：

- `visibleText`：问题发生在正文中。
- `choices`：问题发生在选项中。
- `preLlmEvents`：问题发生在生成前已发生事件中。
- `mixed`：问题横跨多个玩家可见部分。

问题类型使用规则参考中的类型，包括 `fact-conflict`、`identity-drift`、`space-time-break`、`user-input-ignored`、`event-negated`、`unsupported-jump`、`repeated-scene`、`language-drift`、`protocol-break`、`quality-regression` 和 `other`。

严重程度按玩家体验影响划分：

- `high`：直接破坏核心剧情理解、角色身份、地点关系、关键事件或语言可读性。
- `medium`：明显影响连续体验，但玩家仍能大致理解发生了什么。
- `low`：局部动作、物品、姿态或表达上的轻微冲突，值得记录但不必视为严重失败。

来源标注使用：

- `player-input`：问题主要由玩家输入和此前可见上下文冲突造成。
- `model-output`：问题主要由模型输出造成。
- `mixed`：玩家输入带入冲突，模型输出又放大或固定了这个冲突。
- `uncertain`：能确认玩家体验有问题，但来源无法可靠判断。
