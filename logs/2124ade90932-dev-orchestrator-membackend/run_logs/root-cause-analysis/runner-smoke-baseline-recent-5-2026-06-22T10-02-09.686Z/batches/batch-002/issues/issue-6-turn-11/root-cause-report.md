# Issue 6 / Turn 11 Root Cause Report

## Problem

本 issue 指向 turn 11 的 `visibleText`：卡尔“从叶片间抬起头来”，也就是位于窗台薄荷叶之间。紧邻的 turn 10 结尾刚写过卡尔“从窗台上跳下来”，绕到“沙发的另一端”蹲坐。turn 11 没有承接它回到窗台的动作。

## Validity

`issueValidity`: `valid`

这是轻微但真实的空间连续性漂移。玩家可见层面里，turn 10 结尾把卡尔的位置更新到沙发另一端；turn 11 以玩家点头后的即时对话继续，没有明显时间跳跃或离场空隙，却把卡尔写成已经在窗台薄荷叶间。猫当然可以移动，但文本没有给出移动桥接，且“从叶片间抬起头来”暗示它一直在那里，因此评测判断成立。

保留 caveat：问题不阻断主线，也可以被玩家勉强理解为卡尔在空白间隙里自己跳回窗台，所以 severity 低是合理的。

## Context Assessment

问题发生前，玩家实际看到的状态是：卡琳娜和帕兹在公寓里谈敏特照片；turn 10 末尾，卡尔从窗台跳下，绕到沙发另一端蹲坐。turn 11 的玩家输入只是点头承认担心敏特出事，场景仍在同一房间、同一段对话中。

关键事实与可用性：

- 卡尔在 turn 10 结尾的位置是沙发另一端。该事实在 `turn-11/06b-narrator-prompt.md` 的“最近几轮玩家经历”中 `present-clear`，而且靠近本轮生成输入。
- 公寓里窗台和薄荷是强环境意象。该信息在 turn 7、turn 8、turn 10、turn 11 prompt 中反复出现，为 Narrator 提供了可复用的场景描写素材。
- runtime 状态没有记录卡尔位置。`turn-10/05-runtime-after.json` 和 `turn-11/05-runtime-after.json` 对实体状态仅有粗粒度字段，没有“卡尔当前位置=沙发另一端”这样的 scene anchor。
- Director 的 turn 11 输出要求追问照片并在末尾用敲门声打断，没有明确要求使用卡尔动作，也没有提醒“若写卡尔，必须从沙发另一端承接”。

竞争压力主要来自“通过物理细节呈现内在状态”的写作规范、卡尔角色卡中的动作暗示习惯、以及公寓窗台薄荷这一反复出现的环境意象。

## Causal Chain

最早偏离出现在 `turn-11/06-llm-calls.json[1].text`，Narrator 写出“窗台上那只黑猫——卡尔——从叶片间抬起头来”。Director 的结构化输出没有把卡尔放回窗台；runtime 也没有事件把它移动回去。

触发压力是：Narrator 需要在对话推进中保持感官细节和物理动作；公寓窗台、薄荷叶和卡尔观察主角的动作在 prompt 里反复出现，形成了一个容易复用的描写模式。

缺失防线是：系统没有为当前场景实体提供显式位置锚点，也没有在 Narrator 生成前将“卡尔当前在沙发另一端”转化成硬约束。虽然最近正文里有该事实，但它只是长篇 recent text 的一部分，没有成为可检查的 scene state。

失败运动是：Narrator 沿用“窗台薄荷 + 卡尔观察”的熟悉组合来提供环境反应，忽略了 turn 10 末尾刚刚更新的位置，于是在紧邻轮次中产生位置跳变。

非主因：

- 不是 `memory-persistence` 长程缺失；turn 10 的末尾位置在 turn 11 prompt 中可见。
- 不是 `Choice` 绑定错误；玩家只是点头承认担忧。
- 不是 runtime event 推动；events 和 runtime-after 没有记录卡尔移动。

## Root Cause

`rootCause.label`: `current-scene-anchor`

`family`: `agent-system`

L3 机制是当前场景实体位置缺少显式、可执行的 scene anchor。turn 11 Narrator 虽然能在 recent text 中看到卡尔刚到沙发另一端，但该事实没有被提升为“当前卡尔位置”的结构化上下文，也没有在 prompt 中形成使用卡尔动作时必须承接的硬约束。与此同时，窗台薄荷和卡尔观察是高复用的场景意象，模型在局部生成中回到了更显眼的意象组合，导致低强度空间连续性漂移。

## Evidence

玩家可见证据：

- `visible-timeline.jsonl`, turn 10：卡尔从窗台跳下来，绕到沙发另一端蹲坐。
- `visible-timeline.jsonl`, turn 11：卡尔又成为“窗台上那只黑猫”，从叶片间抬头。

内部链路证据：

- `turn-11/06b-narrator-prompt.md` 的 recent turns 包含 turn 10 末尾的沙发位置，因此信息不是完全缺失。
- `turn-11/06-llm-calls.json[0].object` 的 Director 输出没有要求卡尔动作，requiredContent 聚焦卡琳娜回应、追问照片和敲门声。
- `turn-11/06-llm-calls.json[1].text` 首次生成卡尔在窗台叶片间抬头。
- `turn-10/05-runtime-after.json`、`turn-11/05-runtime-after.json` 没有卡尔位置字段，说明位置没有成为结构化状态。

## Recommended Fix Area

优先修复 current scene entity anchoring。在 story state 或 runtime scene state 中维护本场景显著实体的位置，例如 `卡尔.location = 沙发另一端`，并在 Narrator prompt 中短句前置。若 Narrator 生成新的实体动作，应要求从当前 anchor 出发，或在后处理里检查同一实体在相邻轮次的位置跳变是否缺少桥接动作。

## Confidence

`confidence`: `medium`
