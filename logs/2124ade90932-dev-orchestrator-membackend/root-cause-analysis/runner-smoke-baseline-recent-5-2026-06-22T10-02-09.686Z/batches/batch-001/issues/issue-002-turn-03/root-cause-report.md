# Issue 2 Turn 3 Root Cause Report

## Problem

issueIndex=2，turn=3，type=`repeated-scene`，scope=`visibleText`。

turn 2 小贩已经告诉玩家：“你要找人的话，不妨往暗街那边走一走。那边……什么消息都有。只要你能找到对的路。” turn 3 同一小贩又说：“暗街。卡琳娜阁下住在那边。如果你真想打听消息——那边什么都有，只要你能找到对的路。” 这把刚给过的暗街指引重新演成新信息。

## Validity

`issueValidity`: `valid`

只看玩家可见证据，问题成立。turn 3 的话确实新增了“卡琳娜住在暗街”和“卡琳娜掌握情报”的信息，但“暗街有消息，只要找到对的路”与 turn 2 几乎逐字重复。由于两轮相邻，且说话者都是同一名小贩，这会产生轻微重复演出和分支合流感。

## Context Assessment

问题发生前，玩家在 turn 2 已经选择询问敏特，小贩以试探后给出“暗街”线索，玩家也在可见正文中“记住了这个名字”。turn 3 玩家选择追卡琳娜失败后回到小贩处，此时合理的新信息应聚焦“卡琳娜与暗街/情报的关系”，而不是再次把暗街当作未知入口介绍。

相关事实：

- `present-clear`: turn 2 可见正文已经给出暗街线索和“那边什么消息都有，只要你能找到对的路”。来源：`visible-timeline.jsonl`，`turn-02/04-output.json`。
- `present-clear`: turn 3 prompt 的 `recentTurns` 包含 turn 2 可见正文。来源：`turn-03/03-story-state.json`，`turn-03/06b-narrator-prompt.md`。
- `over-constraining`: turn 3 当前 storyline 内容要求“小贩”说明卡琳娜住在暗街、情报有价、外来者不受欢迎。来源：`turn-03/03-story-state.json`。
- `over-constraining`: Director 在 turn 3 把这些内容转成 `requiredContent`。来源：`turn-03/06-llm-calls.json`。

竞争压力主要来自节点切换后的固定内容：turn 2 结束后 runtime 已进入 `1-01-第一章`，该节点仍要求小贩承担“暗街线索”和“卡琳娜情报入口”的说明功能。

## Causal Chain

第一处偏离是 `turn-03/03-story-state.json` 中新激活的 `currentStoryline`：它没有把 turn 2 已经消耗的暗街线索标为已给出，而是继续要求小贩说明卡琳娜和暗街的情报功能。

Director 随后在 `turn-03/06-llm-calls.json` 中把“说明卡琳娜住在暗街、情报有价、提醒外来者”列为本轮 required content。Narrator 再根据该方向生成小贩台词，并复用了 turn 2 已出现的“那边什么都有，只要你能找到对的路”句式。

触发压力是新节点的固定交代内容仍然把暗街线索当成未消费信息。缺失防线是 storyline lifecycle 没有记录“暗街是消息入口”已经在上一轮由同一 NPC 说出，也没有要求后续只能补充卡琳娜的新信息。失败运动是：节点固定内容压过了 recent visible 的去重约束，Narrator 以同一角色重复交代同一线索。

非主因：

- 不是长期记忆丢失；重复信息就在最近一轮中。
- 不是玩家输入导致；玩家追的是卡琳娜，不是再次询问暗街。
- 不是单纯文风问题；重复来自节点内容生命周期没有消费。

## Root Cause

`rootCause.label`: `fixed-beat-consumption`

`family`: `agent-system`

这是固定剧情 beat 消费状态缺口。turn 2 已经把“暗街有消息、需要找到对的路”作为小贩线索输出给玩家，但后续 `1-01-第一章` 仍把同类信息作为必须交代的节点内容，没有将已输出的暗街线索改写为“补充卡琳娜住处/情报价值”，也没有延迟或桥接。系统缺少按最近可见输出消费固定 beat 的 lifecycle guard。

## Evidence

玩家可见证据：`visible-timeline.jsonl` turn 2 和 turn 3 展示同一小贩连续两轮重复“暗街有消息，只要找到对的路”的信息。

内部链路证据：`turn-02/05-runtime-after.json` 显示 turn 2 后进入 `1-01-第一章`；`turn-03/03-story-state.json` 的当前 storyline 要求小贩说明卡琳娜住在暗街；`turn-03/06-llm-calls.json` Director 将其列为 required content；Narrator 在同一文件中生成了重复台词；`turn-03/04-output.json` 将其提交给玩家。

## Recommended Fix Area

优先修复 storyline / fixed beat lifecycle：节点进入时应根据 recent visible 标记已消费的信息点，或让 Director 把重复 beat 改写成“新增信息补充”。对同一 NPC、相邻 turn 的线索交代增加去重约束。

## Confidence

`high`
