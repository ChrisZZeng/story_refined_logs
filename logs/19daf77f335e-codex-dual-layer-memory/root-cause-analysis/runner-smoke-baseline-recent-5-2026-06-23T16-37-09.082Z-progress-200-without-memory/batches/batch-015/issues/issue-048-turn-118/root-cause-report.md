# Root Cause Report

## Problem
四点半门口会合已经临近，但剧情继续把主角留在室内等待卡琳娜消息，甚至推进到天亮，没有承认门口会合或错过约定。

## Validity
- issueValidity: `valid`
- verdictReason: 该问题成立。turn 109 和 turn 110 明确约定“四点半，门口见”，turn 115 明确“四点半快到了”；到 turn 118 已经“天亮了”，正文仍是“等卡琳娜的消息”，选项也继续等待卡琳娜到来。
- playerVisibleSupport: turn 109：“明天天亮之前……四点半，门口见”；turn 110：“四点半。门口见”；turn 115：“四点半快到了”；turn 118：“天亮了……等卡琳娜的消息”，选项含“站在窗边继续等待卡琳娜的到来”。
- caveats: 玩家在 turn 116 和 turn 117 选择继续检查装备，系统可以短暂响应这些操作；但当时间从‘四点半快到了’推进到‘天亮了’时，必须处理门口约定的到达、延误或错过。

## Context Assessment
主角已准备好相机、防水袋、胶卷和铃铛；按玩家可见计划，接近四点半应去门口与卡琳娜会合，而不是无限期等消息。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 卡琳娜明确给出四点半门口会合。 | `present-clear` | `visible-timeline.jsonl`<br>`turn-109/04-output.json`<br>`turn-110/04-output.json` | 这是玩家可见的时间/地点目标，不依赖隐藏信息。 |
| turn 115 已把时间推进到四点半快到。 | `present-clear` | `turn-115/04-output.json`<br>`turn-118/03-story-state.json`<br>`turn-118/06b-narrator-prompt.md` | 到 turn 118 的 recentTurns 中仍能看到 turn 115 的‘四点半快到了’，但精确的‘门口见’已不在最近几轮窗口内。 |
| 系统内部 storyline summary 没有把 exact rendezvous time/location 持续作为 active objective 保存。 | `absent` | `turn-116/03-story-state.json`<br>`turn-117/03-story-state.json`<br>`turn-118/03-story-state.json` | summary 只保留‘准备/等待天亮出发’一类泛化描述，turn 117 后甚至写成‘等待卡琳娜消息’。 |
| 没有 deadline/preLlm event 在四点半临近或天亮时触发会合、迟到或错过处理。 | `absent` | `turn-116/07-events.json`<br>`turn-117/07-events.json`<br>`turn-118/07-events.json` | 相关 turns 的 pre-LLM events 均为空，时间推进只由叙述光线变化驱动。 |
| 从 turn 116 开始，输出把目标改写为等待卡琳娜消息。 | `contradicted` | `turn-116/04-output.json`<br>`turn-117/04-output.json`<br>`turn-118/04-output.json` | 这个目标与早先‘门口见’并不等价；它把外出会合改成室内等待。 |

- competingPressures: 玩家连续选择检查装备/等待相关小动作；阶段六温馨安心基调和慢铺晨光节奏；currentTurnConstraints 多次禁止提前揭示卡琳娜或出发信号；没有时间门限的硬事件或关键选择出口

## Causal Chain
- `firstDivergenceArtifact`: turn-116/06-llm-calls.json call[1] (Narrator) 首次把状态写成“只等卡琳娜的消息”；到 turn-118/04-output.json 发展为天亮后继续等待消息
- `triggeringPressure`: Director/Narrator 被玩家的装备检查动作和慢铺晨光节奏牵引，并受到“不提前揭示卡琳娜/出发信号”的约束；同时 exact door rendezvous 没有作为 active deadline/objective 持续进入 handoff。
- `missingGuard`: 缺少 time-gated rendezvous lifecycle：当四点半临近时必须 bridge to door、触发 Karina/door event，或显式处理迟到/错过；Choice 也缺少在 deadline 临近时压制继续室内等待的规则。
- `mechanismStatement`: 四点半门口会合被系统当成普通背景摘要而非 active deadline，慢速等待循环又被允许继续推进光线时间，于是 Narrator/Choice 把应触发的会合改写成室内等待消息，最终在天亮后仍不处理门口约定。
- `directCause`: 时间约束没有进入可执行的剧情生命周期，导致 turn 116 起目标漂移为‘等消息’，turn 118 在‘天亮了’时仍继续同一等待循环。
- `propagation`: turn 116 正文和选项引入等待消息；turn 117 Director summary 写入‘等待卡琳娜消息’；turn 118 Director/Narrator/Choice 继续‘等卡琳娜的消息/到来’，并把时间推进到天亮。
- `nonCauses`: 不是玩家拒绝去门口；玩家只是执行系统提供的检查/等待动作。；不是缺少玩家可见约定；约定在 turn 109/110 清楚出现。；不是单个 Narrator 句子问题；错误通过 Director summary、Choice 和 currentStoryline 连续传播。

## Root Cause
- `label`: `storyline-lifecycle`
- `family`: `agent-system`
- `secondaryFamilies`: `recent-context`
- `description`: 触发压力是慢铺等待和禁止提前揭示卡琳娜/出发信号的局部约束；缺失防线是没有把‘四点半门口见’保存为 active time-gated objective 并在临界时间触发/过期；失败运动是系统让等待循环跨过 deadline，把门口会合改写为室内等消息。
- `fixSurface`: storyline objective schema: 支持 active rendezvous(time, location, counterparty, deadlineStatus)；pre-LLM event scheduler: 时间达到/接近 deadline 时注入 door-meeting 或 missed-rendezvous 事件；Choice gating: deadline 临近时优先提供去门口/确认迟到，禁用无期限室内等待；statefold/currentStoryline: 不要把 exact time/location 压缩成泛化‘等待天亮出发’

## Evidence
- `playerVisible`: turn 109/110 的“四点半，门口见”；turn 115 的“四点半快到了”；turn 118 的“天亮了……等卡琳娜的消息”和继续等待选项。
- `internalTrace`: turn-116/04-output.json 正文首次写‘只等卡琳娜的消息’；turn-117/04-output.json plotPoint summary 写‘等待卡琳娜消息’；turn-118/04-output.json plotPoint/Narrative/Choices 继续等待消息/到来；turn-116 至 turn-118 的 07-events.json 没有 deadline event。

## Recommended Fix Area
优先修复 storyline lifecycle 和时间门限事件：把玩家可见的约定时间、地点、对象存成 active objective，并在 Choice/Narrator 前强制处理。

## Confidence
`high`
