# Issue 15 / Turn 47 Root Cause Report

## Problem
turn-47 的选项写成“说她也想去看看那片海”。在当前上下文里，“她”容易指向卡琳娜或黑猫，而后续 turn-48 实际展开为玩家说“我也想去看看那片海”。该选项在玩家点击前没有清楚表达玩家自己的行动。

## Validity
issueValidity: `valid`

这是 low severity 的 choice 文案一致性/质量问题。玩家可见的 turn-47 choice 本身含混；turn-48 的玩家可见展开进一步确认该选项原本应表达“我也想”。虽然可以勉强理解为“对她说，也想去看看那片海”的省略，但自然语义不够可靠。

## Context Assessment
turn-47 结束时，卡琳娜谈到诗中那片海，合理回应是玩家表达“我也想去看看”。

- `present-clear`: `turn-47/06c-choice-prompt.md` 要求“选项必须站在玩家视角”。
- `present-ambiguous`: 当前正文有卡琳娜与黑猫两个“她”的可能指代，选项中的“她也想”没有绑定到玩家。
- `present-clear`: `turn-48/06-llm-calls.json` call[0] requiredContent 明确主角应说“我也想去看看那片海。”
- `present-clear`: Choice schema 只有 `options[].text`，没有 speaker/utterance 字段区分“对她说”和“我也想”。

## Causal Chain
firstDivergenceArtifact: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/06-llm-calls.json` call[2] ChoiceGenerator object。

ChoiceGenerator 在生成短选项时沿用了中文互动选项常见的第三人称对象模板（例如“问她……”），但在需要表达玩家自身愿望的句子里没有切回第一人称。turn-48 Director/Narrator 正确恢复“我也想”，说明错误没有传播到正文，但已在选项层影响玩家理解。

triggeringPressure: 选项需要短、具体，且同组选项存在“问问她”“问她叫什么名字”的第三人称对象格式。

missingGuard: 缺少 choice text perspective contract；没有结构化字段或 linter 防止“玩家的第一人称态度”被写成第三人称“她也想”。

## Root Cause
label: `choice-action-binding`
family: `agent-system`
secondaryFamilies: `llm-self`

L3 机制：选项文本没有把行动对象、说话主体和实际 utterance 分离绑定。模型把“对她说：我也想……”压缩成“说她也想……”，造成 option semantics 与后续实际玩家行动不一致。

## Evidence
- Player-visible: `visible-timeline.jsonl` turn-47 choices 与 turn-48 visible text。
- Choice prompt/output: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/06c-choice-prompt.md`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/06-llm-calls.json`。
- Follow-up correction: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-48/06-llm-calls.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-48/04-output.json`。

## Recommended Fix Area
为 dialogue choice 增加 `speaker=player` 与 `utteranceText` 字段，或在 Choice 输出后做中文代词 linter：凡是表达玩家自身意愿的选项，必须使用“我/自己”，不要用未绑定的“她/他”。

## Confidence
`high`
