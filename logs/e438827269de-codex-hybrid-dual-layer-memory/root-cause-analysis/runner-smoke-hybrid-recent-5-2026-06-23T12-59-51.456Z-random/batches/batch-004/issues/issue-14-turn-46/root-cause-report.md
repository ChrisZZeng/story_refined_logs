# Issue 14 / Turn 46 Root Cause Report

## Problem
turn-45 已经把黑猫从椅子腿旁移动到书堆前，并停在诗集附近；turn-46 开头没有任何移动桥接，直接写“那只黑猫蹲坐在椅子腿旁”。

## Validity
issueValidity: `valid`

玩家可见证据足够：turn-45 明确移动路径是“从椅子腿旁站起来，踱了两步，走到书堆前……蹲坐下来”；turn-46 第一段却从“椅子腿旁”开始。房间小不等于可以省略移动，尤其 turn-46 还写“你的手还悬在半空中”，像是直接回接旧位置。

## Context Assessment
问题发生前，主角坐在旧椅子上，黑猫位于书堆/诗集附近，卡琳娜靠墙坐在地铺边缘。

- `present-clear`: `turn-46/06a-director-prompt.md` 与 `turn-46/06b-narrator-prompt.md` 的 recent turns 包含 turn-45 的“走到书堆前”。
- `present-clear`: `turn-46/03-story-state.json` 的地点摘要写到“黑猫踱步至书堆前短暂停留后静坐”。
- `over-constraining`: `turn-45/06-llm-calls.json` call[2] 生成“伸手轻轻摸摸黑猫的头”，没有“起身/靠近书堆”的桥接。
- `present-ambiguous`: `turn-46/06-llm-calls.json` call[0] 只把本轮 requiredContent 写成“必须描写主人伸手抚摸黑猫头部”，未指定如何处理空间距离。

## Causal Chain
firstDivergenceArtifact: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-45/06-llm-calls.json` call[2] ChoiceGenerator object。

ChoiceGenerator 在黑猫已经位于书堆前的可见结尾后，提供了一个无空间桥接的即时触摸选项。玩家选择后，Director 将该动作变成必须完成的本轮动作；Narrator 为了让“伸手摸头”直接成立，把黑猫放回较早的“椅子腿旁”。

triggeringPressure: 玩家选择“摸黑猫头”后，系统强烈倾向立即兑现动作。

missingGuard: 缺少 `choice-action-binding` 的空间可达性检查；选项没有 action precondition，也没有要求 Director/Narrator 桥接玩家或黑猫的位置。

nonCauses: 不是 recent context 缺失，也不是长期 detail-memory；位置事实在 story state 和 recent prompt 中都清楚存在。

## Root Cause
label: `choice-action-binding`
family: `agent-system`
secondaryFamilies: `recent-context`

L3 机制：Choice 组件没有把玩家可点击行动绑定到当前实体位置和动作前置条件。一个需要“起身走近书堆”或“等黑猫回来”的动作被包装成“伸手摸头”，随后 Director/Narrator 为满足动作而重用更早的椅子旁位置，覆盖了最近可见位置。

## Evidence
- Player-visible: `visible-timeline.jsonl` turn-45/turn-46。
- Story state: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-46/03-story-state.json`。
- Prompts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-46/06a-director-prompt.md`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-46/06b-narrator-prompt.md`。
- LLM calls/output/events: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-45/06-llm-calls.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-46/06-llm-calls.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-46/04-output.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-46/07-events.json`。
- Runtime: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-45/05-runtime-after.json` 没有微观 location slot，不能阻止该跳转。

## Recommended Fix Area
为 ChoiceGenerator 增加 affordance check：涉及触摸、拿取、靠近等动作时，必须验证目标实体当前位置；若不可直接执行，选项文本或 action contract 必须包含桥接动作。Director/Narrator 也应在执行 selected action 前确认 current entity location。

## Confidence
`high`
