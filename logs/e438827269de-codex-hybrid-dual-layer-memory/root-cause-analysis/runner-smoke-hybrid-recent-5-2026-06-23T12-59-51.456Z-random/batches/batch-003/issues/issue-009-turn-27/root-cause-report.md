# Root Cause Report: issue-9-turn-27

## Problem
- issueIndex: 9
- turn: 27
- severity: `medium`
- type: `repeated-scene`
- scope: `visibleText`
- summary: 第 27 轮在玩家选择“确认她见过敏特”后，正文先重复第 26 轮已经完整给出的短发回答，再追加“我见过她 / 就在新西西里”，并且卡琳娜对白失去引号，形成玩家可见的重复演出和格式退化。

## Validity
- issueValidity: `valid`
- verdictReason: valid。玩家可见时间线中，第 26 轮已经回答“不是”“我知道她的时候——她已经是短发了”“她说长头发容易被人抓住”；第 27 轮又近乎逐句复述这些句子。玩家本轮动作只是确认推论，不需要重演上一轮答案。
- playerVisibleSupport: visible-timeline.jsonl 中 turn 26 的短发解释与 turn 27 开头三段高度重合；turn 27 的对白可见为无引号文本，例如“不是。”、“我知道她的时候——她已经是短发了”。
- caveats:
- “确认她见过敏特”不是完整台词，存在少量解释空间；但即使理解为追问确认，也只需要直接确认，不需要重复上一轮已经完成的回答。

## Context Assessment
- actualStateBeforeIssue: 问题发生前，卡琳娜正拿着敏特照片。第 26 轮她已经说明自己知道敏特时敏特是短发，并给出长发容易被抓住的原因；这已经让玩家能推断“她见过敏特”。第 27 轮玩家选择确认这个推断。
- relevantFacts:
- `present-clear` 短发解释在上一轮已经呈现，属于已消费的玩家可见内容。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/03-story-state.json`
  notes: Director prompt 的最近几轮玩家经历逐字包含 turn 26 的“不是”“短发”“长头发容易被人抓住”。
- `present-ambiguous` 本轮玩家动作是确认见过敏特，而不是要求重述发型答案。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-26/06c-choice-prompt.md`
  notes: choice text 只有“确认她见过敏特”，没有明确 speechAct 或要说出口的台词，给 Director 留下了“让 NPC 再确认”的解释空间。
- `present-buried` Director/Narrator 有通用的不要重复要求。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/06b-narrator-prompt.md`
  notes: system prompt 明确“不要重复、重演”，但它是通用原则，未绑定到本轮已经消费的短发证据。
- `contradicted` 当前故事线已经提前推进到宴会/康纳节点，与照片对话现场冲突。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/05-runtime-after.json`
  notes: turn 27 prompt 的 currentStoryline 是 5-02 康纳出场，但 recentTurns 仍在公寓照片对话；这是背景压力，不是本条重复的唯一直接原因。
- `present-clear` 对白帧协议要求 data-speaker 台词带引号。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/06b-narrator-prompt.md`
  notes: Narrator prompt 末尾要求 `<p data-speaker=...>"台词"</p>`，但输出中卡琳娜台词没有引号。
- competingPressures: 低特异性的 choice text, 上一轮短发解释是确认推论的最近证据, Director 慢铺/凝重语气, 通用 anti-repeat 原则缺少本轮已消费事实标记, v3-html 引号要求只靠 prompt 约束

## Causal Chain
- firstDivergenceArtifact: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/06-llm-calls.json call[0] / story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-27/04-output.json`
- triggeringPressure: turn 26 的 Choice 输出“确认她见过敏特”是一个推论式意图，而不是明确玩家动作或台词；Director 看到上一轮短发证据后，把“确认”安排为“卡琳娜确认她见过敏特，并回忆起敏特短发的原因”。
- missingGuard: 缺少 choice-action-binding 级别的 speechAct/consumedEvidence 约束：没有告诉 Director 该选项只应推进到“直接承认见过”，并禁止复述上一轮已经消费的短发原因；Narrator 也缺少输出后格式校验来强制对白引号。
- mechanismStatement: 当推论式短选项没有绑定为明确可执行动作时，Director 会用最近的推论证据来填充“确认”动作；由于已消费证据没有成为硬约束，Narrator 按这个 handoff 重演了上一轮答案，并在生成中丢失了对白引号。
- directCause: Director handoff 把本轮 beats 写成“卡琳娜承认见过敏特 / 说明敏特短发的原因”，直接要求 Narrator 再说明短发原因。
- propagation: Narrator 在 turn-27/06-llm-calls.json call[1] 中把 Director beats 落成正文；07-events.json 的 narrator worker-done 和 04-output.json 均保留重复文本，最终写入 visible-timeline。
- nonCauses:
- 不是玩家要求逐字复述；玩家只选择确认推论。
- 不是长程记忆缺失；上一轮文本在 recentTurns 和 prompt 中 present-clear。
- 不是 currentStoryline 中康纳节点的直接内容复用；本轮实际重复的是上一轮照片对话内容。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 低特异性的推论式选项没有绑定明确 speechAct、目标回复和已消费证据；Director 在最近上下文压力下用上一轮短发解释来完成“确认”，而系统没有 hard guard 阻止重复或要求只输出新的承认信息。
- fixSurface:
- `Choice option schema/prompt: 为推论型选项增加 actionKind/speechAct/targetFact，避免只输出“确认 X”`
- `Director prompt/intent resolver: 将 selected choice 转成 must-satisfy contract，并附带 consumedEvidence 禁止复述`
- `Narrator/output validator: 检查 data-speaker 台词引号和跨 turn 重复片段`

## Evidence
- playerVisible: turn 26 已出现“不是 / 我知道她的时候已经是短发 / 她说长头发容易被人抓住”；turn 27 又以同一信息开场，并且卡琳娜对白没有引号。
- internalTrace: turn-26/06c-choice-prompt.md 产生“确认她见过敏特”；turn-27/06a-director-prompt.md recentTurns 清楚包含上一轮回答；turn-27/06-llm-calls.json call[0] 的 beats 包含“说明敏特短发的原因”；call[1] 输出重复正文；turn-27/07-events.json worker-done 与 04-output.json 固化该文本。

## Recommended Fix Area
优先修复 Choice→Director 的 selected choice handoff：让选项携带明确 speechAct、targetFact 和已消费证据，并在 Director 组装时加入本轮 anti-repeat 检查；同时加 v3-html 对白引号校验。

## Confidence
`medium`
