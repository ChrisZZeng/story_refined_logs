# Issue 010 Turn 28 Root Cause Report

## Problem

turn 28 玩家选择“站在原地追问她准备带我去哪”。正文先执行了停步追问，但在卡琳娜回答“公寓”后，自动写成“你抬起了脚。你跟她走了上去”，后续 choices 也全部以已经同行为前提。

## Validity

`issueValidity`: `valid`

玩家的核心行动不是“接受邀请”，而是“先停在原地追问目的地”。turn 27 的选项明确把“跟上卡琳娜，接受她的邀请”和“站在原地追问她准备带我去哪”拆成两个不同选择。turn 28 在回答问题后替玩家做出跟随决定，并把下一轮状态锁入同行，属于有效的 player intent override。

## Context Assessment

问题发生前，卡琳娜在 turn 27 邀请主角“来吧。这里有说话的地方”，并站在那里让玩家决定。玩家选择的不是接受，而是先停步追问目的地。

Relevant facts:

- `present-clear`: turn 27 choice 将“跟上卡琳娜”和“站在原地追问”分开。证据见 `visible-timeline.jsonl` turn 27。
- `present-clear`: turn 28 玩家输入是“站在原地追问她准备带我去哪”。证据见 `turn-28/06a-director-prompt.md:495-496`。
- `over-constraining`: 当前 storyline 持续强调“主角需要卡琳娜这样的本地向导”。证据见 `turn-28/03-story-state.json`、`turn-28/06a-director-prompt.md:326-328`。
- `over-constraining`: Director 输出把本轮总结为“告知目的地并再次以略带压迫感的方式催促主角跟上”，`requiredContent` 写“卡琳娜再次示意主角跟上”。证据见 `turn-28/06b-narrator-prompt.md:530-552`。
- `present-clear`: Narrator prompt 明确写“不要替玩家追加新的决定”。证据见 `turn-28/06b-narrator-prompt.md:574-579`。

Competing pressures:

- 玩家选择只要求先问目的地。
- story constraints 要保留“需要本地向导”的核心暗示。
- Director 将“催促跟上”放入本轮 requiredContent，但没有把“玩家尚未接受邀请”作为 must-satisfy contract。

## Causal Chain

`firstDivergenceArtifact`: `turn-28/04-output.json` 的 `plotPoint`，同内容也见 `turn-28/07-events.json` 的 Director `worker-done`。

Director 识别出 `playerIntent` 是“追问互动”，也在 beat 里写“主角开口追问，停留在原地”；但它随后把第三个 beat 写成“卡琳娜告知是带他去她的公寓，并催促出发”，并在 requiredContent 中要求“卡琳娜再次示意主角跟上”。这把玩家的“先问”软化成了马上进入同行的压力。

Narrator prompt 虽然包含“不要替玩家追加新的决定”，但 Director handoff 已把“跟上”作为自然下一步强烈前景化。Narrator 先写“等着你自己决定是否跟上来”，随后又替玩家决定“你抬起了脚。你跟她走了上去”。Choice generator 再依据正文结尾生成同行状态选项。

Triggering pressure: story-level “需要本地向导”和 Director `requiredContent` 中“再次示意主角跟上”把本轮推向接受邀请。

Missing guard: selected choice 的 core action 没有被绑定为 must-preserve contract；缺少“追问后停在未决状态，除非玩家再次选择接受”的动作边界。

Mechanism statement: 当玩家选择的是非接受型追问时，Director handoff 没有把“未接受邀请”作为硬约束，而把 storyline 的同行目标和 NPC 催促前景化，导致 Narrator 将 NPC 示意误推进为玩家行动，Choice 再把同行状态固化。

Propagation: `turn-28/04-output.json` 正文写“你跟她走了上去”； choices 全部以同行为前提；turn 29 继续以“你跟在她身后三步的位置”开场。

Non-causes:

- Choice generator 不是第一原因，它只是根据已经被 Narrator 写成同行的正文生成选项。
- 不是合理的互动改写；玩家选择被明确拆分为“追问”而非“跟上”。
- 不是 hidden state 或记忆问题。

## Root Cause

`label`: `choice-action-binding`

`family`: `agent-system`

`secondaryFamilies`: []

玩家所选 choice 的核心动作是“停在原地追问”，系统没有把它绑定为本轮必须保持的行动边界。Director 的 handoff 同时承认停步追问，又把 NPC 催促和 storyline 的本地向导压力推到前景，缺少“回答后仍等待玩家确认”的 guard，导致 Narrator 和 Choice 将玩家锁入同行状态。

## Evidence

Player-visible evidence:

- turn 27 choices: “跟上卡琳娜，接受她的邀请”与“站在原地追问她准备带我去哪”是分开的。
- turn 28 玩家输入: “站在原地追问她准备带我去哪”。
- turn 28 visibleText: “她只是站在原地，等着你自己决定是否跟上来”后立刻写“你抬起了脚。你跟她走了上去”。
- turn 29 visibleText: “你跟在她身后三步的位置”。

Internal trace:

- `turn-28/06a-director-prompt.md:495-496` 有玩家输入。
- `turn-28/06b-narrator-prompt.md:530-552` Director 输出把“催促跟上”写进 beat 和 requiredContent。
- `turn-28/06b-narrator-prompt.md:574-579` Narrator 被提示不要替玩家追加决定，但该 guard 被 Director pressure 压过。
- `turn-28/06c-choice-prompt.md:409-429` Choice prompt 以已经“你跟她走了上去”的正文结尾作为最终判断依据。

## Recommended Fix Area

修复 choice/action binding：对每个 selected choice 提取 `coreAction` 和 `forbiddenAssumptions`。当 choice 表示“询问、观察、犹豫、等待、确认”时，Director/Narrator 必须在本轮结束时保持未决状态，除非玩家输入本身包含接受/移动/执行。Choice generator 也应保留接受、拒绝、继续追问等选项，而不是把未确认状态固化。

## Confidence

`high`
