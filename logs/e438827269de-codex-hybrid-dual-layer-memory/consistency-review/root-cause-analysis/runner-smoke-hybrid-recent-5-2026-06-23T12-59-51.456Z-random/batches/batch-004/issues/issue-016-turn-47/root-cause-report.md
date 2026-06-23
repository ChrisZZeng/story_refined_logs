# Issue 16 / Turn 47 Root Cause Report

## Problem
turn-47 正文替玩家说：“那本地图册——你说你读得最多。”此前玩家可见内容没有“地图册读得最多”这一事实；turn-45 只说明地图册是卡琳娜第一年捡到、缺页但够用，并说这些书每本都读过不止一遍。

## Validity
issueValidity: `valid`

玩家可见证据足够。`够我用` 只能说明地图册被使用过，不能推出“读得最多”，更不能推出“你说你读得最多”。因此这是正文给玩家对白添加无依据前提。

## Context Assessment
问题发生前，玩家选择“问卡琳娜她最常读的是哪本书”。可见事实包括：旧地图册、暗红诗集、机械手册；地图册第一年捡到且缺页；诗集第三十七页被撕掉且有写海的诗；每本书都读过不止一遍。

- `present-clear`: `turn-47/06a-director-prompt.md` 和 `turn-47/06b-narrator-prompt.md` 的 recent turns 包含 turn-45 原文，没有“地图册读得最多”。
- `present-clear`: `turn-47/03-story-state.json` 与 prompt 记忆摘要强调“诗集中关于另一片海的诗句对她有特殊意义”。
- `not-needed`: Director 输出只要求卡琳娜回答最常读哪本书，没有要求玩家断言地图册。
- `over-constraining`: Narrator 首段把“地图册读得最多”写成玩家引用卡琳娜的话。

## Causal Chain
firstDivergenceArtifact: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/06-llm-calls.json` call[1] Narrator text。

Director 的 plan 是合理的：“主角提问，卡琳娜回答并分享”。错误没有出现在 Choice 或 Director，而是在 Narrator 将玩家提问自然化时，加入了错误前提：“那本地图册——你说你读得最多。”

triggeringPressure: “最常读哪本书”需要比较式回答；地图册的“够我用”和所有书“读过不止一遍”给模型提供了可误合成的材料。

missingGuard: 缺少 player-dialogue presupposition grounding；系统没有要求 Narrator 对“你说过/读得最多”这种前提断言逐项核对来源。

## Root Cause
label: `unsupported-detail-inference`
family: `llm-self`
secondaryFamilies: `agent-system`

L3 机制：Narrator 在清楚可见上下文下做了 unsupported comparative inference，把“用过地图册”与“每本书读过多次”合成为“地图册读得最多”，并写成玩家对白中的既有事实。agent-system 的次要问题是缺少对白前提 source check 和结构化 known-facts guard。

## Evidence
- Player-visible: `visible-timeline.jsonl` turn-45/turn-47。
- Story state: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/03-story-state.json`。
- Prompts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/06a-director-prompt.md`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/06b-narrator-prompt.md`。
- LLM calls/output/events: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/06-llm-calls.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/04-output.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-47/07-events.json`。

## Recommended Fix Area
在 Narrator 阶段添加玩家对白前提检查：出现“你说过”“最常”“已经”等断言式或比较式表达时，必须能在 recent visible text 或 structured facts 中找到来源；找不到时改为开放问题，例如“你更常翻哪一本？”

## Confidence
`medium`
