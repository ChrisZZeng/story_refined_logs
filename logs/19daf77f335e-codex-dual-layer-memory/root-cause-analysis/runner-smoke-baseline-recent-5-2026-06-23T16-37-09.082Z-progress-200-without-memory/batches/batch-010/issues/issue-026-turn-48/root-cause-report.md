# issue-26-turn-48

## Problem
第 48 轮把卡琳娜与卡尔第一次见面后的清晨同时写成“第一次见面之后的第二天”和“就任申诉人的第一天”。第 46-47 轮刚建立过顺序：第一天晚上初见卡尔，卡尔陪她坐了一整晚，天亮后说“你坐得够稳了”并跳走。

## Validity
issueValidity: valid

玩家可见证据足够成立。第 46 轮说“我刚成为申诉人的第一天。那天晚上……”，第 47 轮说“坐了整整一个晚上”“天亮的时候她醒了……‘你坐得够稳了。’——然后就跳出去了”。第 48 轮将这个天亮后的追问称为“第一次见面之后的第二天”，但同段又说“那天是我就任申诉人的第一天”。如果把“就任第一天”解释成任期第一阶段，冲突可略微缓和；但按玩家刚看到的自然日顺序，仍是 low 级时间连续性问题。

## Context Assessment
问题前的实际状态：玩家正在公园长椅上听卡琳娜回忆卡尔。卡琳娜已经说过她第一次见卡尔是在刚成为申诉人的第一天夜里；卡尔在她膝上睡了一整晚，天亮后说“你坐得够稳了”并跳走。玩家随后问“卡尔为什么选中了你”。

相关事实：
- `present-clear`: 第一次见卡尔发生在“刚成为申诉人的第一天”的夜里；见 `visible-timeline.jsonl turn-46`、`turn-48/03-story-state.json recentTurns`。
- `present-clear`: “你坐得够稳了”发生在坐完整晚后的天亮；见 `visible-timeline.jsonl turn-47`、`turn-48/06a-director-prompt.md`。
- `present-clear`: 玩家本轮问的是选中原因，不是日期；见 `turn-48/01-summary.json`。
- `absent`: Director 没有把“第一天夜里→整夜→次日清晨”整理成 Narrator 必须遵守的 temporal anchor；见 `turn-48/04-output.json plotPoint`。
- `present-buried`: 写作规范要求用光线变化替代“第一天”“第二天”等标签，但它埋在长 prompt 中，未成为本轮硬约束。

Competing pressures: 玩家追问原因、storyline 推动“卡尔在关键时刻引导卡琳娜”、慢铺回忆的叙事风格、recentTurns 长篇散文式承载时间事实。

## Causal Chain
firstDivergenceArtifact: `turn-48/06-llm-calls.json` call 1 / `turn-48/04-output.json` narrative。

Director 的剧情骨架没有直接出错；它只要求卡琳娜回答为何被卡尔选中。错误第一次出现在 Narrator 正文中：模型把“第一次见面之后的第二天”和“就任申诉人的第一天”压进同一段旧日追问。可见事实在 prompt 里，但没有被结构化为靠近最终写作指令的时间锚点，Narrator 在补因果时把相邻日历事件合并成同一个“那天”。

Propagation: 冲突进入 `turn-48/04-output.json normalizedContent.visibleText` 和 `visible-timeline.jsonl`。后续 choices 未继续扩大日期问题，`05-runtime-after.json` 未显示新的结构化日期写回。

Non-causes: 不是长期记忆缺失；事实在最近两轮。不是 Choice 问题。也不是隐藏设定造成的评测误判。

## Root Cause
rootCause.label: temporal-anchor-contract

family: agent-system

secondaryFamilies: recent-context

根因机制：近期时间线只以长篇可见散文进入 prompt，Director handoff 又强调情感/因果回答而不输出可执行 temporal anchor；缺少“第一天夜里→整夜→次日清晨”的硬约束后，Narrator 将次日清晨与就任第一天合并，生成玩家可见的 first/second-day 冲突。

## Evidence
- Player-visible: `visible-timeline.jsonl` turn 46、47、48。
- Internal trace: `turn-48/06a-director-prompt.md` 与 `turn-48/06b-narrator-prompt.md` 包含 recentTurns；`turn-48/04-output.json plotPoint` 无时间锚点；`turn-48/06-llm-calls.json` call 1 首次生成冲突句。

## Recommended Fix Area
优先在 Director→Narrator handoff 增加 `currentSceneTimeline` / `temporalAnchors`，把最近事件顺序放到最终写作指令附近；再增加输出后 first/second-day 标签冲突 lint。

## Confidence
high
