# Root Cause Report

## Problem
玩家已经站在窗边，turn 117 却写出像从坐姿起身的“你站起来”，并在选项中继续提供“走到窗边”。

## Validity
- issueValidity: `valid`
- verdictReason: 该问题成立。turn 116 结尾明确是“你站在窗边，把呼吸调匀”，turn 117 的玩家输入只是检查防水袋封口，不包含坐下或离开窗边；turn 117 正文和选项却把当前位置/姿态当作未在窗边。
- playerVisibleSupport: turn 116 末尾：“你站在窗边，把呼吸调匀”；turn 117 正文：“你站起来”；turn 117 选项：“走到窗边，最后一次确定天色”。
- caveats: “你站起来”也可勉强解释为从弯腰检查中直起身，但文本没有写弯腰；和重复‘走到窗边’选项合在一起，足以构成低严重度的连续性断裂。

## Context Assessment
turn 116 结束时，主角站在窗边，防水袋在手边，胶卷和相机已检查过，目标仍是等待出发/卡琳娜相关信号。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 主角在 turn 116 末尾已经站在窗边。 | `present-clear` | `visible-timeline.jsonl`<br>`turn-116/04-output.json`<br>`turn-117/06b-narrator-prompt.md`<br>`turn-117/06c-choice-prompt.md` | 该事实在上一轮正文末尾和 Choice prompt 的“本轮玩家已经看到的正文”中都很清楚。 |
| 早先几轮主角曾坐在窗边或靠在窗框夹角里。 | `stale` | `turn-112/04-output.json`<br>`turn-113/04-output.json`<br>`turn-117/06b-narrator-prompt.md` | 旧姿态在 recentTurns 长段中仍存在，可能把“检查装备”拉向起身/坐回的动作模板。 |
| Director 对 turn 117 只规定检查防水袋和天色渐亮，没有显式当前姿态约束。 | `absent` | `turn-117/04-output.json`<br>`turn-117/06-llm-calls.json` | Director 输出缺少“already at the window / already standing”的硬约束，Narrator 需要自行从长上下文判断。 |
| Choice prompt 要求以本轮正文结尾判断可做动作，但没有禁止 move-to-current-location 的验证器。 | `present-clear` | `turn-117/06c-choice-prompt.md`<br>`turn-117/06-llm-calls.json` | Choice call 仍输出“走到窗边”并绑定 choice:check_the_dawn，说明规则没有形成可执行的选项过滤。 |

- competingPressures: 旧的坐姿/闭目等待文本仍在 recent context；检查防水袋后整理装备的动作惯性；候选动作 check_the_dawn 被自然语言化为‘走到窗边’；没有结构化 current posture/location anchor

## Causal Chain
- `firstDivergenceArtifact`: turn-117/06-llm-calls.json call[1] (Narrator) 首先输出“你站起来”；turn-117/06-llm-calls.json call[2] (Choice) 继续输出“走到窗边”
- `triggeringPressure`: Director handoff 把本轮压缩为“检查防水袋封口，等待卡琳娜消息”，没有保留上一轮末尾的站立窗边状态；recent prose 中更早的坐姿/休息动作和候选 check_the_dawn 又提供了移动模板。
- `missingGuard`: 缺少同时供 Narrator 与 Choice 使用的 current posture/location anchor；Choice 阶段缺少“目的地等于当前位置时必须改写或丢弃”的 action-binding guard。
- `mechanismStatement`: 当前姿态和当前位置只埋在长 recent prose 中，而没有作为 hard handoff 字段进入 Narrator/Choice，导致 Narrator 用旧等待姿态写出起身，Choice 又把检查天色绑定成走向已经所在的窗边。
- `directCause`: Narrator 与 Choice 都没有把 turn 116 末尾“站在窗边”当成不可违背的当前状态。
- `propagation`: turn 117 正文中姿态重置；同轮选项继续提供到当前地点的移动，下一轮玩家选择拉窗帘时仍停留在窗边等待循环。
- `nonCauses`: 不是玩家输入造成；玩家只要求检查防水袋。；不是必须的剧情推进；检查装备完全可以在已站窗边的状态下完成。；不是长期记忆缺失；正确位置就在上一轮末尾。

## Root Cause
- `label`: `current-scene-anchor`
- `family`: `agent-system`
- `secondaryFamilies`: `recent-context`
- `description`: 触发压力是旧坐姿和候选 check_the_dawn 的移动语义；缺失防线是缺少当前姿态/位置的硬锚点以及 move-to-current-location 选项过滤；失败运动是 Narrator 与 Choice 各自从长上下文里重建场景，重建结果覆盖了上一轮末尾的站窗边状态。
- `fixSurface`: context assembly: 生成 playerPosture/currentLocation/currentNearbyObjects 的 concise anchor；Narrator prompt: 要求正文首段从 current anchor 起笔，不能重新设定姿态；Choice action binding: 对候选 actionId 的自然语言文本进行当前位置兼容性检查

## Evidence
- `playerVisible`: turn 116 末尾为站在窗边；turn 117 正文出现“你站起来”；turn 117 选项要求“走到窗边”。
- `internalTrace`: turn-117/04-output.json 的 plotPoint 没有姿态/位置 guard；turn-117/06-llm-calls.json call[1] 生成重置姿态；call[2] 生成带 actionId=choice:check_the_dawn 的重复移动选项。

## Recommended Fix Area
优先修复 currentSceneAnchor 与 Choice option compatibility validator，确保当前地点/姿态在正文和选项阶段一致。

## Confidence
`high`
