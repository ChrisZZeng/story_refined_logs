# Root Cause Report - issue-9 turn 36

## Problem
turn 36 在卡琳娜上一轮已经把杯子放回桌面后，又写成她松开握杯手指、杯底再次落到桌面，形成轻微的物件动作重复。

## Validity
- issueValidity: `valid`
- verdictReason: 该问题可由玩家可见文本直接确认。turn 35 末尾已经完成“卡琳娜把杯子放回桌面上”的动作，turn 36 开头没有任何可见动作让她重新拿起杯子，却再次写“杯底落在桌面上”。
- playerVisibleSupport: turn 35 visibleText: 卡琳娜把杯子放回桌面上；turn 36 visibleText: 她握着杯子的手指松开，杯底落在桌面上。两处相邻，且玩家输入只是回答“认真”。
- caveats:
- 这是低严重度连续性问题：不改变剧情走向，但会让杯子状态和动作承接显得重复。
- turn 36 同时写到玩家自己的杯沿停稳；该部分不构成问题，问题仅在卡琳娜的杯子。

## Context Assessment
- actualStateBeforeIssue: 问题发生前，宴会厅对峙结束；玩家站在小桌旁，手里有空杯；卡琳娜的杯子已经被放回桌面，她正看着玩家追问刚才的话是否认真。
- relevantFacts:
- `present-clear` 卡琳娜的杯子在 turn 35 已经回到桌面，杯底落桌动作已经消费完。
  artifacts: `visible-timeline.jsonl`, `turn-36/06b-narrator-prompt.md`, `turn-35/04-output.json`
  notes: 该事实在 Narrator prompt 的最近几轮正文中出现，但埋在长段宴会描写末尾，未被结构化成当前物件状态。
- `present-clear` turn 36 玩家只确认自己是认真的，没有让卡琳娜重新拿杯或再次放杯。
  artifacts: `visible-timeline.jsonl`, `turn-36/03-story-state.json`, `turn-36/06b-narrator-prompt.md`
  notes: 玩家输入清楚，Director 安排也只要求确认、离开宴会厅、去公园。
- `present-clear` 本轮应推进卡琳娜离场并在公园询问宴会观感，而不是重演上一轮的杯子动作。
  artifacts: `turn-36/04-output.json`, `turn-36/06b-narrator-prompt.md`
  notes: Director requiredContent 明确了离开宴会厅和公园长椅，但没有杯子动作要求。
- `absent` 杯子的当前位置没有进入结构化 story state 或 runtime state。
  artifacts: `turn-36/03-story-state.json`, `turn-36/05-runtime-after.json`
  notes: curStates 有角色/地点记忆，但没有把小桌杯子或卡琳娜杯子作为可校验状态。
- competingPressures:
- 宴会厅连续数轮把杯沿、杯壁、手指作为紧张对峙的物理细节反复使用。
- Director 要求卡琳娜短暂观察后带玩家离开，Narrator 倾向用一个小动作作为决定落定的信号。
- 最近可见事实虽然清楚，但以长 prose 形式输入，没有对象状态优先级或 consumed-action 标记。

## Causal Chain
- firstDivergenceArtifact: `turn-36/06-llm-calls.json[1] / turn-36/04-output.json.narrative`
- triggeringPressure: Narrator prompt 中最近数轮高频出现卡琳娜握杯、杯沿、杯壁等情绪动作，同时 Director 要求她观察后决定离开，促使模型继续使用杯子作为情绪落点。
- missingGuard: 系统没有把上一轮“杯子已放回桌面”写入当前场景物件状态，也没有在 Narrator handoff 中显式要求不要重复已消费的物件动作。
- directCause: Narrator 在 turn 36 生成正文时复用了“握杯手指松开/杯底落桌”的动作，没有遵守 turn 35 已完成的杯子状态。
- mechanismStatement: 当小物件状态只以低层级长 prose 存在、缺少 consumed-action/state guard 时，Narrator 会把近期高频的杯子动作模板再次用于本轮情绪落点，从而把已完成的放杯动作重复写成新动作。
- propagation: 错误直接进入 turn-36 visibleText 和 04-output.json；后续立即转场去公园，未被 state 或 events 单独固化为长期事实。
- nonCauses:
- Director 本轮没有要求再次放杯；它只安排确认认真、离开宴会厅、前往公园。
- 不是长期记忆缺失；冲突事实来自上一轮，仍在 recent context 中。
- 不是玩家输入歧义；玩家只选择认真回答。

## Root Cause
- label: `state-writeback`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 小物件的最新状态和已消费动作没有结构化写回或显式提升优先级；在杯子意象反复出现的 prompt 压力下，Narrator 缺少防线去区分“刚刚已经放下”与“本轮可再次放下”，于是把同一杯底落桌动作重复生成。
- fixSurface: `scene-object-state/writeback`, `narrator-prompt/current-scene-anchor`, `post-generation-continuity-validator`

## Evidence
- playerVisible: turn 35 末尾卡琳娜把杯子放回桌面；turn 36 又写她松开握杯手指、杯底落到桌面。
- internalTrace: turn-36/06b-narrator-prompt.md 保留了 turn 35 放杯文本，也显示 Director requiredContent 没有杯子动作；turn-36/04-output.json 的 narrative 首次出现重复动作；turn-36/03-story-state.json 未提供杯子结构化状态。

## Recommended Fix Area
为当前场景小物件建立轻量 objectState/consumedAction 写回，并在 Narrator prompt 中把 last visible object state 作为高优先级锚点；生成后校验相邻 turn 的重复放置/拿取动作。

## Confidence
`high`
