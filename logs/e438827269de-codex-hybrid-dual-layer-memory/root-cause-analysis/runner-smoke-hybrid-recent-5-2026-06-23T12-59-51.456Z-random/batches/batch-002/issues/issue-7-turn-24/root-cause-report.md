# Root Cause Report: issue-7-turn-24

## Problem
Turn 24 说 `门没有锁`，但此前门锁刚被两次明确写成锁上，且没有可见开锁动作。

## Validity
- issueValidity: `valid`
- verdictReason: 玩家可见文本已建立门锁状态：Turn 18 检查并确认锁舌卡紧；Turn 20 DeSalo 离开后卡琳娜关门，锁舌再次卡进门框。Turn 21-23 没有开锁或离门动作，Turn 24 却宣称门没有锁。
- playerVisibleSupport: Turn 18：`铁质锁舌卡入门框...确实是卡紧的`；Turn 20：`卡琳娜关上门。锁舌卡进门框的声音清脆而笃定`；Turn 24：`如果你不想来——也没关系。门没有锁。`。
- caveats:
- 可以把 `门没有锁` 理解成卡琳娜愿意放行的社交表达，但它仍然直接描述物件状态，与刚建立的锁舌状态冲突。

## Context Assessment
- actualStateBeforeIssue: Turn 24 前玩家仍在卡琳娜公寓内，就是否交出敏特照片与卡琳娜沉默对峙。门在 DeSalo 离开后被卡琳娜关上并锁舌卡紧；玩家没有看到任何人重新开锁。
- relevantFacts:
- `present-clear` 公寓门当前应为锁上状态。 证据：`story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/06b-narrator-prompt.md`。Turn 20 lock sentence 在 Turn 24 recentTurns 尾部和 Narrator prompt 中可见。
- `absent` 门锁状态没有被结构化持久化。 证据：`story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/02-script-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/03-story-state.json`。`entityStates` 只有 `公园` 和 `卡琳娜`，没有 `door.locked` 或公寓门状态；`currentScene` 也为 null。
- `over-constraining` Turn 24 前系统已进入 `4-02` 出门与晚宴邀请节点，提供接受/拒绝邀请分支。 证据：`story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/02-script-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/06a-director-prompt.md`。`currentStoryline` 要求邀请主角共赴晚宴，`interactionFollowup` 写 `当主角未接受邀请时，卡琳娜会独自前往`，对离开/拒绝可行性形成强压力。
- `present-clear` Director 本轮摘要没有要求改变门锁状态。 证据：`story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/06-llm-calls.json`。Director 只总结主角不拿照片、卡琳娜等待决定；错误由 Narrator 在扩写时引入。
- competingPressures: 晚宴邀请节点需要给玩家接受/拒绝的自由, 拒绝分支需要解释玩家可以不跟卡琳娜走, 门锁事实只在长 recent prose 中，没有结构化 scene affordance, 当前Location 在 script state 已偏向 `暗街-夜晚`，削弱了公寓门的物理状态显著性

## Causal Chain
- firstDivergenceArtifact: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-24/06-llm-calls.json call[1].text`
- triggeringPressure: `4-02` 当前故事线要求发出晚宴邀请并给出拒绝路径，Narrator 需要让玩家觉得可以不去；于是用 `门没有锁` 来表达离开自由。
- missingGuard: 门锁这一局部物件状态没有写入结构化 state，也没有在 handoff 中作为 `must-preserve scene affordance` 出现；通用一致性规则不足以压过晚宴/拒绝分支压力。
- mechanismStatement: 可离开分支被 foreground，而门锁状态只以 buried recent prose 存在且未 state-writeback；Narrator 为了给拒绝邀请提供通行解释，生成了 `门没有锁` 这一未经开锁动作支持的物件状态。
- directCause: Narrator 输出最后一句 `如果你不想来——也没关系。门没有锁。`，与 recent visible lock state 冲突。
- propagation: 错误句进入 `turn-24/04-output.json` 和 visible timeline；Choice worker 随后提供 `拒绝邀请，留在公寓里`，使错误的离开/留置分支成为玩家可操作语境。
- nonCauses:
- 不是玩家选择导致：玩家只是没有拿出照片
- 不是长期 detail-memory：锁门事实仍在 recentTurns 中
- 不是 Director 明确要求：Director 没有提门锁

## Root Cause
- label: `state-writeback`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 公寓门锁这种可持续影响行动 affordance 的局部物件状态没有被写回结构化 state；当晚宴邀请/拒绝分支要求呈现玩家可不跟随时，Narrator 缺少 `door.locked=true` guard，只在长 recent prose 中埋着锁门事实，因而生成了相反的 `门没有锁`。
- fixSurface: `scene object state extraction/writeback`, `current-scene affordance block in Director/Narrator prompts`, `exit/choice validation against locked-door state`

## Evidence
- playerVisible: Turn 18 和 Turn 20 均明确锁上；Turn 24 无开锁动作却说门没有锁。
- internalTrace: Turn 24 prompt recentTurns 包含 `锁舌卡进门框的声音清脆而笃定`；`turn-24/02-script-state.json` / `03-story-state.json` 没有门锁结构化状态；Narrator call[1] 首次引入相反状态。

## Recommended Fix Area
把门/窗/出口等场景 affordance 从正文事件抽取到 scene state，例如 `apartmentDoor.locked=true`，并在 Narrator 与 Choice 生成前做 contradiction check；若需要离开，先生成可见开锁动作或改写为 `我会给你开门`。

## Confidence
`high`
