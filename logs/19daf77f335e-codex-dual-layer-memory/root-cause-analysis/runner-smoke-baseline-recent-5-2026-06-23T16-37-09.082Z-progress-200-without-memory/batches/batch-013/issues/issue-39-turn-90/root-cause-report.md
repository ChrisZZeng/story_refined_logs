# Root Cause Report: issue-39-turn-90

## Problem
- issueIndex: `39`
- turn: `90`
- problemSummary: turn 90 中卡尔已经在旁侧行走且步伐没有变化，后文却在没有坐下或停住描写的情况下再次‘站起来’，造成低强度动作连续性断裂。

## Validity
- issueValidity: `valid`
- verdictReason: 该 issue 有效。turn 89 末尾已经写卡尔在卡琳娜重新迈步时一同站起来；turn 90 前半又写卡尔在旁侧的步伐没有变化，说明她正跟随行走。后半句‘卡尔在她转身的同时站起来’没有前置蹲坐或停坐动作，和当前动作状态冲突。
- playerVisibleSupport: turn 89 先写卡尔蹲坐，随后写她一同站起来；turn 90 又写卡尔步伐没有变化，之后才再次写站起来。
- caveats: 卡琳娜曾在路灯下停住并转身，如果文本补一句卡尔也停下蹲坐，则‘站起来’可成立；但玩家可见正文没有这个桥接。；这是动作姿态的小连续性问题，不改变主线事实。

## Context Assessment
- actualStateBeforeIssue: turn 89 结束时，卡琳娜重新迈步，卡尔已随她站起并一起前进；turn 90 的玩家追问发生在路灯间行进过程中，卡琳娜边走边解释，卡尔在旁侧跟随。
- relevantFacts:
- `present-clear` 卡尔在 turn 89 末尾已经从蹲坐状态站起并继续前进。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl:turn-89, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/06b-narrator-prompt.md, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/03-story-state.json。最近可见正文包含完整 sit->stand 过渡，最新状态是站立/行进。
- `present-clear` turn 90 本轮内部先把卡尔描述为仍在旁侧行走。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/04-output.json, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/06-llm-calls.json。Narrator 本轮前半写‘卡尔在旁侧的步伐没有变化’，因此后文‘站起来’不是由本轮前文铺垫出的动作。
- `present-clear` Director handoff 要卡尔保持沉默跟随、耳朵微动。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/04-output.json, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/06b-narrator-prompt.md。plotPoint.requiredContent 是‘卡尔保持沉默跟随’，characterBeats 是‘保持跟随，耳朵微动表示注意’。
- `absent` 本轮在再次站起前没有让卡尔坐下或蹲下。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/04-output.json, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/07-events.json。正文和 pre-LLM events 都没有可解释再次站起的中间姿态变化。
- `present-buried` 最近上下文中存在一个可被误复用的‘卡尔蹲坐->站起来’动作模板。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/06b-narrator-prompt.md。turn 89 的蹲坐和站起都在最近正文中，且靠近本轮输入之前，容易被下一轮转身/继续走的节奏触发复写。
- competingPressures: 上一轮有卡尔蹲坐再站起的可复用动作模式。；本轮卡琳娜在路灯下停住、转身、继续前行，触发 companion action beat。；Director 对卡尔只给‘保持跟随’的软描述，没有显式 currentPosture=walking/standing。；叙事偏好用尾巴弧线和站起动作标记段落翻页，容易重复动作标点。

## Causal Chain
- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/06-llm-calls.json[1] / logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-90/04-output.json Narrator output
- triggeringPressure: 最近正文中的‘蹲坐下来->一同站了起来’动作序列和本轮卡琳娜‘停下、转身、继续走’的节奏相似，给 Narrator 一个重复 companion 起身动作的模板压力。
- missingGuard: prompt 和 state 没有显式 current-scene posture anchor，也没有检查同一输出前文已经写了‘步伐没有变化’。Director 的‘保持跟随’没有被执行为不可再次站起的硬约束。
- mechanismStatement: 当最近 turn 的姿态变化模板比最新 posture 状态更显眼时，缺少 current-scene posture anchor 使 Narrator 在新的转身/继续节点复用‘卡尔站起来’，即使本轮和上一轮最新状态都指向她正在跟随行走。
- directCause: Narrator 在 turn 90 后半误把卡尔重置为可‘站起来’的姿态。
- propagation: 错误主要停留在 turn 90 可见正文内；后续选择未继续强调卡尔坐/站状态，因此未形成长期状态写回。
- nonCauses: 不是故事线或隐藏设定要求卡尔坐下。；不是 Choice 输出造成；问题发生在正文生成阶段。；不是 long-term memory，涉及的是上一轮和本轮内部的动作连续性。

## Root Cause
- label: `current-scene-posture-anchor`
- family: `recent-context`
- secondaryFamilies: `llm-self`
- description: 具体机制是当前场景姿态没有被结构化锚定：触发压力来自上一轮卡尔蹲坐/站起模板与本轮卡琳娜停下再继续的相似节奏，缺失防线是没有 currentPosture/currentMotion 约束和同一输出动作自检，失败运动是 Narrator 把卡尔从正在跟随的状态局部重置为需要站起的状态。
- fixSurface: recent context assembler 增加 activeEntityPosture/currentMotion 摘要；Director plotPoint.characterBeats 支持 posture/motion must-preserve 字段；Narrator post-check 增加同一输出中 sit/stand/walk 状态转移一致性检查

## Evidence
- playerVisible: turn 89 末尾卡尔已站起并跟随；turn 90 先写她步伐没有变化，后写她在卡琳娜转身时站起来。
- internalTrace: turn-90/06b-narrator-prompt.md 中 turn 89 的蹲坐/站起靠近本轮输入；turn-90/04-output.json 的 plotPoint 要‘保持沉默跟随’，但 Narrator streamText 在同一输出内生成了再次站起。

## Recommended Fix Area
优先补 active scene posture/motion anchor，并在 Narrator 输出后检查姿态动词是否有前置状态。

## Confidence
`medium`
