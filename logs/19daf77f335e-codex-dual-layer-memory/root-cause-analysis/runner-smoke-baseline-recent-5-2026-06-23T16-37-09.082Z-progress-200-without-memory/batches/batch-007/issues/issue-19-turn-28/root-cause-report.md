# Root Cause Report: issue-19-turn-28

## Problem
turn 28 把玩家写成从“宴会厅的大门”离开，由女仆开门，随后从灯火通明的宴会厅走回暗街，并到达“卡尔的小屋”。玩家可见长线此前建立的是卡琳娜在暗街铁门后的公寓/房间；“卡尔的小屋”也没有作为已知地点出现过。

## Validity
issueValidity: `valid`

玩家可见证据足以成立：turn 5-6 从暗街深处的铁门进入一个不大的房间，场景锚点是旧沙发、茶几、书架、窗台绿植、黑猫和半掩窗帘。turn 19 仍称“公寓恢复了安静”，turn 25 仍有沙发、黑猫、窗外雨声和暖气管。没有可见的接受晚宴邀请、出门、穿越城市、进入宴会厅、认识卡尔小屋等转场。turn 28 却把宴会厅、女仆、回暗街路线和卡尔小屋作为既有事实。

注意：turn 26-27 已经开始被错误的宴会厅语境污染；本 issue 的 turn 28 是该污染进一步显性化为离场路线和新目的地。

## Context Assessment
- `present-clear`: 卡琳娜谈话的原始玩家可见场景是暗街铁门后的公寓/房间，见 `visible-timeline.jsonl` 的 turn 5-6、turn 19、turn 25。
- `absent`: 玩家可见正文没有展示“接受晚宴邀请 -> 出门 -> 进入宴会厅”的桥接，也没有介绍“卡尔的小屋”。
- `over-constraining`: `turn-24/05-runtime-after.json` 已激活 `4-03-第一章`；`turn-25/03-story-state.json` currentStoryline 是“进入宴会厅”；`turn-28/03-story-state.json` currentStoryline 是 `5-03-第一章`，并强制宴会厅/康纳对峙素材。
- `present-clear`: 玩家输入只是“仍然决定告辞，改日再说”，并未选择前往卡尔小屋。

Competing pressures: currentStoryline 和 historyStoryline 强势要求宴会厅、康纳和晚宴后续；玩家拒绝康纳线迫使 Director 寻找退出路径；recent visible text 中原始公寓锚点存在但已被 turn 26-27 的宴会厅输出污染；隐藏资料中有“暗街是卡尔与卡琳娜的据点”等可诱发“卡尔小屋”的素材。

## Causal Chain
最早可证实的内部偏离在 `turn-24/05-runtime-after.json`：4-02 尚未可见地完成邀请/选择，却被推进到 `4-03-第一章`。随后 `turn-25/03-story-state.json` 把“进入宴会厅”设为当前故事线；turn 25 Director 虽然约束“不在此轮实际推进地点变化”，runtime 仍在 turn 25 后继续推进到 `5-01`。到 turn 28，prompt 已把 `5-03-第一章` 作为当前故事线，且 historyStoryline 将 `4-03`、`5-01`、`5-02` 摘要成已发生。

直接偏离发生在 `turn-28/06-llm-calls.json` call-1：Director 输出 `scene: "暗街-卡尔小屋"`，beats 包含“主角离开宴会厅”和“主角回到暗街卡尔小屋”。Narrator 在 call-2 按该骨架写出宴会厅大门、女仆、木门、城市另一端和卡尔小屋窗口。Choice 在 call-3 继续给出“径直走进卡尔的小屋”等选项，turn 28 runtime-after 再激活 `6-01-第一章`，turn 29 继续在小屋外展开。

这不是单纯 Narrator 幻觉；错误路线在 Director handoff 中已经成形。也不是玩家选择导致；玩家只选择告辞，没有选择宴会厅路线或卡尔小屋。

## Root Cause
rootCause.label: `storyline-lifecycle`  
family: `agent-system`  
secondaryFamilies: [`recent-context`]

L3 机制：剧情节点的 activation/completion 生命周期没有绑定玩家可见前提。`4-02` 的邀请/选择、`4-03` 的进入宴会厅、`5-02/5-03` 的康纳事件未被正文兑现，却被 runtime 和 prompt 视作已发生。缺少 scene-anchor/precondition guard 与 hidden-to-visible reveal gate，使强势 currentStoryline 压过最近可见的公寓语境，并允许未揭示的“卡尔小屋”被 Director 当作可见目的地。

## Evidence
- Player-visible: `visible-timeline.jsonl` turn 6 建立铁门后的不大房间；turn 19-25 仍是公寓/沙发/茶几/书架/暖气片/黑猫；turn 28 出现宴会厅大门、女仆、回暗街和卡尔小屋。
- Internal trace: `turn-24/05-runtime-after.json` 激活 `4-03`; `turn-25/03-story-state.json` currentStoryline 为“进入宴会厅”; `turn-28/03-story-state.json` currentStoryline 为 `5-03`; `turn-28/06-llm-calls.json` call-1/2/3 分别把错误路线安排、写出并锁入选项。

## Recommended Fix Area
优先修复 storyline runtime 的节点生命周期校验：节点完成和后继节点激活前，检查 required visible anchors 是否已在正文或事件中落地。同步增加 current-scene anchor model、prompt conflict priority，以及隐藏地点/人物关系的 reveal gate。

## Confidence
`high`
