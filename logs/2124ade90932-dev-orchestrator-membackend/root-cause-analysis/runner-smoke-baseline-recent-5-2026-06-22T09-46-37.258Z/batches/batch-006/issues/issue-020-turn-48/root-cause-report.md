# Problem

Turn 48 正文首次写出“你还没有看到康纳·凯拉宁的影子。但他应该在这里”，选项随后给出“注意康纳的位置（远观，不互动）”。但此前玩家只知道凯旋门今晚有晚宴、凯旋门的人会露面，不知道康纳是谁，也没有被赋予寻找康纳的目标。

# Validity

issueValidity: `valid`

玩家可见证据成立。turn 47 没有“康纳”或“凯拉宁”，只有晚宴和凯旋门的人会露面。turn 48 同时在正文和选项中把康纳当作已知目标，因此是 unsupported-jump。

# Context Assessment

问题前，玩家接受卡琳娜邀请，跟她去凯旋门晚宴。可见动机是陪同卡琳娜、处理德索洛委托、观察凯旋门的人。具体 NPC “康纳·凯拉宁”没有被介绍。

相关事实：

- `absent`: 康纳在 turn 48 前未被玩家可见介绍。证据是 `visible-timeline.jsonl turn 47`。
- `present-clear`: 4-03 内部剧本写有“康纳必须在环境建立后才出场”“康纳尚未主动接近”和候选“注意康纳的位置”。证据在 `turn-48/02-script-state.json:146-166`。
- `over-constraining`: Director 将康纳写入本轮 `beats`、`requiredContent` 和 `currentTurnConstraints`。证据在 `turn-48/06-llm-calls.json[0]`。
- `contradicted`: Choice prompt 的 final visibleText 已含康纳，但这是同一轮 Narrator 的泄露，不能回头证明玩家此前已知。

# Causal Chain

firstDivergenceArtifact: `turn-48/06-llm-calls.json[0]`

4-03 剧本把康纳作为宴会厅节点的固定人物和候选观察目标。Director 没有把“康纳尚未主动接近”转换为玩家可见安全表达，而是直接输出“康纳在远处尚未接近”“不能提前让康纳主动互动，只能远观”。Narrator 接着写“康纳·凯拉宁”的名字，Choice 再绑定 `choice:spot_connor`。

直接原因是隐藏固定 beat 中的 named NPC 被当作当前可见目标。缺失的 guard 是 named-NPC visible-introduction gate：未被玩家可见介绍的专名不能直接进入正文或选项。

# Root Cause

rootCause.label: `storyline-visible-introduction-gating`

family: `agent-system`

secondaryFamilies: `recent-context`

L3 root mechanism 是固定剧情节点缺少可见引介门控。触发压力是 4-03 宴会节点和候选 action 前景化康纳；缺失防线是没有检查 `introducedToPlayer` 或 `visibleNameEstablished`；失败运动是 Director 将隐藏专名作为背景事实输出，Narrator 和 Choice 把它固化为玩家搜索目标。

# Evidence

玩家可见证据：turn 47 无康纳，turn 48 正文和选项首次出现康纳并预设其为目标。

内部链路证据：`turn-48/02-script-state.json:146-166` 包含康纳约束和候选；`turn-48/06-llm-calls.json[0]` 输出康纳背景；`turn-48/06-llm-calls.json[1]` 写康纳专名；`turn-48/06-llm-calls.json[2]` 输出 `choice:spot_connor`。

# Recommended Fix Area

优先修复 storyline fixed-beat visible-introduction gate、Director requiredContent filtering 和 Choice action candidate visibility checks。未引介 NPC 应先以泛称桥接，或由角色在可见正文中介绍名字，再允许专名和 actionId 出现。

# Confidence

`high`
