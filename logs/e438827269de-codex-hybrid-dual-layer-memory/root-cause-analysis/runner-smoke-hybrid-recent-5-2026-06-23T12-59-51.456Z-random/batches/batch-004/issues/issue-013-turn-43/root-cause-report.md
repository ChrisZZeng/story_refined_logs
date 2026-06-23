# Issue 13 / Turn 43 Root Cause Report

## Problem
turn-43 开头把黑猫写回到“鼻尖还悬在你的手指上方、没有退开”的状态，但 turn-42 末尾玩家已经看到黑猫“收回了头、后退半步、重新蹲坐”。同一 turn-43 后文又重复“收回头/后退半步”，形成即时动作回滚与重复演出。

## Validity
issueValidity: `valid`

只看玩家可见内容即可确认：turn-42 已经完成退回动作；turn-43 第一段否定该结果，随后又重演。这里不是隐藏状态与可见状态不一致，而是连续两轮可见正文之间的直接冲突。

## Context Assessment
问题发生前，玩家实际看到的状态是：主角仍保持蹲姿，黑猫已从玩家手指附近退回半步，在桌沿重新蹲坐，尾巴搭回原位。

- `present-clear`: turn-42 最后一帧在 `visible-timeline.jsonl`、`turn-43/06a-director-prompt.md` 和 `turn-43/06b-narrator-prompt.md` 的 recent turns 中均可见。
- `present-buried`: `turn-43/03-story-state.json` 的 storyline summary 只保留“主角蹲下向黑猫伸手打招呼，卡琳娜和卡尔观察其反应”，没有保留“黑猫已退回”的终点姿态。
- `absent`: `turn-42/05-runtime-after.json` 没有黑猫当前 pose/location 字段，只保留粗粒度 runtime 状态。
- `over-constraining`: `turn-43/06-llm-calls.json` 的 Director 输出把卡尔 actionHint 写成“鼻尖仍悬在主角手指附近”。

## Causal Chain
firstDivergenceArtifact: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-43/06-llm-calls.json` call[0] Director object。

Director 在 `summary` 中写“主角蹲姿保持与黑猫的肢体接触”，在 `characterBeats` 中写“鼻尖仍悬在主角手指附近”。这一步已经把上轮中段状态当成当前起点。Narrator 随后按 Director handoff 生成 turn-43 第一段“鼻尖还悬在你的手指上方——她没有退开”，并在后文再次执行“收回头/后退半步”。

triggeringPressure: 玩家输入“继续保持蹲姿”与温馨接触的情绪摘要，推动 Director 延续“贴近/接触”的画面。

missingGuard: 缺少 current-scene terminal anchor；上轮最后一帧没有被抽取成高优先级实体状态，也没有规则要求 Director 删除与最后一帧冲突的 actionHint。

nonCauses: 不是长期记忆缺失；不是 Choice 输出直接导致；runtime-after 没有写错位置，但缺少可约束生成的微状态。

## Root Cause
label: `current-scene-anchor`
family: `agent-system`
secondaryFamilies: `recent-context`

L3 机制：系统没有把最近玩家可见正文的最后一帧作为 Director/Narrator 的硬锚点。由于 story state 与 storyline summary 只保留了“互动温馨/黑猫认可”的概括，Director 更容易沿用上轮中段的“鼻尖靠近”画面；缺少锚点优先级后，Narrator 将这个错误 handoff 写成可见回滚并重复同一动作。

## Evidence
- Player-visible: `visible-timeline.jsonl` turn-42/turn-43。
- Story state: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-43/03-story-state.json`。
- Prompts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-43/06a-director-prompt.md`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-43/06b-narrator-prompt.md`。
- LLM calls/output/events: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-43/06-llm-calls.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-43/04-output.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-43/07-events.json`。
- Runtime: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-42/05-runtime-after.json`。

## Recommended Fix Area
在 Director 前构建“上一轮玩家可见最后一帧”的 entity pose/location anchor，并让它高于 storyline summary、情绪摘要和候选动作；Narrator 输出第一段前检查是否回滚该 anchor。可在 `statefold/current scene entity pose extraction`、Director prompt context priority、Narrator first-frame continuity check 以及 post-generation immediate-action validator 上修复。

## Confidence
`high`
