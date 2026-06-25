# Issue 34 Turn 120 Root Cause Report

## Problem

turn 120 把卡琳娜带主角去“真正的家”的路线、铁门、钥匙、短通道和门槛重新写成一次新发现。玩家此前已经在同一晚完成过这段路线并进入过该空间，之后又从室内离开到公园；因此本轮应写成“回到已知的真正的家”，而不是再次发现/首次进入。

## Validity

issueValidity: `valid`

- 玩家可见证据足够：`logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl` 的 turn 38-40 已经呈现“真正的家”的首次邀请、带路、开铁门、跨门槛和暖光房间。
- turn 89-90 又显示二人从室内跨出、穿过巷道、回到公园长椅；当前场景不是首次去家，而是从公园准备回去。
- turn 118-119 中玩家问“回去”是否指“之前说过的‘真正的家’”，卡琳娜答复“真正的家”并起身。
- turn 120 却写“朝一条你之前没有注意到的岔路走去”，重新走旧砖墙窄巷、开铁门、站在门内等玩家跨入；这与玩家已见过的历史直接冲突。
- caveat: turn 119 的“带你去看”单独看仍可解释为再带你去看，但 turn 120 的完整门槛仪式和首次发现措辞使重复场景成立。

## Context Assessment

问题发生前的实际状态：主角已经访问过卡琳娜真正的家，在室内观察过房间并与卡琳娜长时间共处；随后二人离开室内走到公园。turn 118-119 的“回去”应是返回该已知地点。

relevantFacts:

- `玩家此前已经到过并进入过“真正的家”`: `present-clear`。玩家可见 turn 38-40 清楚成立；内部也出现在 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/03-story-state.json` 的 `currentStoryline.summary` 和 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/06a-director-prompt.md:636` 后的“本段已完成的进展”。
- `玩家后来从真正的家离开，当前人在公园长椅`: `present-clear`。玩家可见 turn 89-90 成立；内部 summary 也记录“离开室内前往公园”。
- `turn 120 应绑定为返回已知地点`: `present-ambiguous`。最近几轮有“回去”和“之前说过的‘真正的家’”，但没有把“已经去过/正在返回”升格为硬约束。
- `active storyline 仍保留邀请前去真正的家`: `over-constraining`。`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/03-story-state.json` 的 `currentStoryline.interactionFollowup` 与 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/06a-director-prompt.md:733` 仍保留已消费承接。
- `通用不重复提示`: `present-clear` 但不可执行。`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/06a-director-prompt.md:16` 要求不要重复已完成进展，但没有提供 `trueHomeVisited` / `returningToTrueHome` 这类硬性状态。
- `当前位置和地点访问锚点`: `absent`。`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/02-script-state.json` 与 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/05-runtime-after.json` 只有粗粒度 anchor，例如“卡琳娜已发出邀请”，没有 true-home reveal/travel consumed/returning 状态。

competingPressures:

- `interactionFollowup` 继续要求“卡琳娜邀请主角前去她真正的家”。
- `recentTurns` 只覆盖 turn 115-119，没有包含首次抵达与离开家的可见片段。
- 已访问信息在长 summary 和地点记忆中存在，但显著性低于近端“带你去看”和“站起来，跟她走”。
- Director 产出的 requiredContent 偏向转场、巷道、铁门和开门；Narrator 被要求不要改变导演方向。

## Causal Chain

firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/06-llm-calls.json` call[0].object / `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/04-output.json` `plotPoint`

- triggeringPressure: active `currentStoryline.interactionFollowup` 仍写“卡琳娜邀请主角前去她真正的家”，而近端玩家选择是“站起来，跟她走”。
- missingGuard: 没有已消费的 home-reveal/travel beat 生命周期；没有“真正的家已访问，本轮只能写 returning/known route”的硬约束；runtime 没有 `currentLocationId`、`visitedLocation`、`returningToLocation` 等可执行状态。
- directCause: Director 将本轮总结为“主角跟随卡琳娜离开公园，前往她真正的家”，并把“路径从公园转入更隐蔽的巷道”“卡琳娜在铁门前停下，掏出钥匙打开门”写进 `requiredContent`。
- propagation: Narrator 按 Director JSON 慢铺路线，加入“你之前没有注意到的岔路”等首次发现措辞；Choice 输出“跨过门槛，走进门内的暖光中”等选项；`07-events.json` committed 后，turn 121 又继续重复室内初次进入和陈设介绍。
- nonCauses: 不是 evaluator 使用隐藏信息造成的误判；不是单纯 Narrator 自行偏离；不是 Choice 的首因；也不是纯 `detail-memory` 缺失，因为旧访问事实存在但未被 lifecycle/priority guard 转化为约束。

mechanismStatement: 已消费的“邀请前去真正的家”固定承接仍作为 active followup 进入 Director prompt，而已访问事实只埋在长 summary 和地点记忆里；在没有 consumed/returning guard 的情况下，Director 把“站起来，跟她走”重新绑定到首次前往与开门 beat，Narrator 再将其扩写成玩家可见的重复发现。

## Root Cause

rootCause.label: `fixed-beat-consumption`

family: `agent-system`

secondaryFamilies: [`recent-context`]

该固定 beat 在 turn 38-40 已经被消费：邀请、带路、开门、进入都已发生；后来又出现室内共处和离开到公园。到 turn 120，它已经不应再作为字面“前去真正的家”承接触发，而应被改写为返回已知地点、熟悉路线或桥接到下一段室内互动。系统缺少 beat consumption / returning-state 的生命周期防线，导致 active followup 与近端动作压过了已完成进展。

## Evidence

- 玩家可见：`logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl` turn 38-40、turn 89-90、turn 118-120。
- story state：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/03-story-state.json` 的 `currentStoryline.summary` 已有首次访问、室内共处、离开公园等摘要，但 `currentStoryline.interactionFollowup` 仍保留邀请前去真正的家。
- Director prompt：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/06a-director-prompt.md:16` 有通用不要重复提示；`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/06a-director-prompt.md:733` 仍保留已消费 followup。
- LLM calls/output：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/06-llm-calls.json` call[0].object 和 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/04-output.json` `plotPoint.requiredContent` 把路线与开门列为本轮必须内容。
- Narrator/Choice/events：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/06b-narrator-prompt.md:976` 后显示 Narrator 被要求遵循 Director JSON；`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/06-llm-calls.json` call[2].object 和 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/07-events.json` 将门槛选择提交。
- runtime-after：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-120/05-runtime-after.json` 仍没有 true-home consumed/returning anchor。

## Recommended Fix Area

优先修复 `currentStoryline.interactionFollowup` 的生命周期消费与 runtime 位置/地点访问写回：当地点 reveal + travel + threshold 已完成后，后续同名目的地必须进入 `returningToKnownLocation` 或等价状态，并在 Director prompt 中以硬约束压过未消费固定承接。Director validation 也应检查 `requiredContent` 是否复用了已完成路线、门槛或首次揭示；若复用，必须改写为返回、熟悉路线、桥接或延后。

## Confidence

confidence: `high`
