# issue-16-turn-24 Root Cause Report

## Problem
Turn 24 再次把卡琳娜写成双手撑膝、与玩家视线平齐；但 turn 23 已让她站在茶几对面、双手插进棉衣口袋。

## Validity
- issueValidity: `valid`
- verdictReason: 该 issue 有效。turn 23 的最后可见身体状态是卡琳娜从书架边走到茶几对面，双手插进棉衣口袋；turn 24 开头没有任何弯腰/抽手动作，却写“撑在膝盖上的双手没有收回去”，明显复活了更早的姿态。
- playerVisibleSupport: turn 23：“停在茶几对面，双手插进棉衣口袋里”；turn 24：“她撑在膝盖上的双手没有收回去，保持着那个与你视线平齐的姿势”。
- caveats: turn 24 同段随后又让她直起身并把手插进口袋，说明错误被局部自我修正；但开场姿态仍与上一轮最终状态冲突。

## Context Assessment
actualStateBeforeIssue: turn 24 生成前，玩家最后看到卡琳娜站在茶几对面，双手在棉衣口袋里，目光落在玩家脸上并问“你问这个做什么？”。

relevantFacts:
- claim: turn 23 结束时卡琳娜站在茶几对面，双手插进棉衣口袋。
  availability: `present-clear`
  artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/03-story-state.json`
  notes: 这是目标 turn 的立即前置状态，进入 turn 24 recentTurns。
- claim: 旧的撑膝姿态来自 turn 21，并已在 turn 21 结束；turn 22 又错误重复过一次。
  availability: `stale`
  artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/03-story-state.json`
  notes: turn 24 prompt 的 recentTurns 同时包含正确的 turn 23 口袋姿态和陈旧/已污染的撑膝姿态。
- claim: turn 24 Director 只要求卡琳娜以自己的方式继续试探，没有规定弯腰或手部姿态。
  availability: `present-clear`
  artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06-llm-calls.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06b-narrator-prompt.md`
  notes: characterBeats.actionHint 是“可能走近或保持距离”，没有要求恢复上一轮之前的撑膝动作。
- claim: 系统缺少以最近一轮 final pose 为最高优先级的结构化锚点。
  availability: `absent`
  artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/03-story-state.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/05-runtime-after.json`
  notes: curStates/runtime-after 不包含 hands in pockets 或 hands-on-knees 这种可校验状态。

competingPressures:
- turn 21/22 的撑膝姿态在 recentTurns 中出现两次，其中 turn 22 本身已被错误写入历史。
- 玩家输入“你觉得我为什么问这个？”延续心理试探，模型倾向复用近身审视姿态来表现张力。
- Director 的“走近或保持距离”动作提示是软性的，没有指定应从双手插袋状态开始。
- turn 24 当前故事线已跳到出门/晚宴邀请，但本轮 Director 没有实际执行该节点，反而留下更多上下文竞争。

## Causal Chain
- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06-llm-calls.json call[1] narrator text / logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/04-output.json
- triggeringPressure: turn 24 prompt 中 stale 的“撑膝/视线平齐”姿态因 turn 21 与 turn 22 重复出现而高显著；玩家反问与试探场景也适合近身压迫的姿态。
- missingGuard: 缺少 recent context priority guard：没有把 immediately previous final pose（双手插袋、站在茶几对面）提升为不可被旧 prose 覆盖的 current-scene anchor。
- mechanismStatement: 当 recentTurns 中同时存在立即前置 final pose 和更早的高显著姿态、但系统没有 final-state priority anchor 时，Narrator 会选择更符合戏剧张力的陈旧姿态，复活已经结束且被上一轮覆盖的动作。
- directCause: Narrator 使用 turn 21/22 的撑膝姿态作为 turn 24 开场，而不是继承 turn 23 的 hands-in-pockets state。
- propagation: turn 24 可见正文先复活撑膝姿态，再在同段写她直起身并把手插进口袋；该错误又进入后续 recentTurns，可能继续污染位置/手部状态。
- nonCauses:
  - 不是 Choice 选项导致：玩家选择只是反问动机，没有指定卡琳娜姿态。
  - 不是固定剧情必须：Director 和当前故事线均未要求撑膝。
  - 不是长期记忆缺失：正确状态就在上一轮可见文本中。

## Root Cause
- label: `current-scene-anchor`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 触发压力是 recentTurns 中重复出现、戏剧性更强的 stale 撑膝姿态；缺失防线是没有把上一轮 final pose（站在茶几对面、双手插袋）作为高优先级 current-scene anchor；失败运动是 Narrator 按旧姿态重建开场，再次让卡琳娜从撑膝状态直起。
- fixSurface:
  - context assembly: 最近一轮最后角色姿态/手部状态应作为单独 high-priority field 放在 Narrator 指令附近
  - statefold/event extraction: 为 transient posture 标记 started/ended/overridden，避免旧姿态在 recentTurns 中复活
  - Narrator continuity validator: 检测同一角色手部/姿态从 pockets 到 hands-on-knees 的无桥接跳变

## Evidence
- playerVisible: turn 23 结束前写卡琳娜停在茶几对面、双手插进口袋；turn 24 开头写她双手还撑在膝盖上、保持与玩家视线平齐。
- internalTrace: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06b-narrator-prompt.md 的 recentTurns 同时包含 turn 23 的正确 hands-in-pockets 结尾和 turn 21/22 的 stale 撑膝；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06-llm-calls.json call[0] Director object 没有姿态要求，call[1] Narrator text 首次复活旧姿态；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/05-runtime-after.json 无姿态状态。

## Recommended Fix Area
同 issue-13 一样，优先建立 current-scene final-state anchor 和 transient posture lifecycle；另外应在 recent context 中降低已被后续文本覆盖的姿态权重。

## Confidence
`high`
