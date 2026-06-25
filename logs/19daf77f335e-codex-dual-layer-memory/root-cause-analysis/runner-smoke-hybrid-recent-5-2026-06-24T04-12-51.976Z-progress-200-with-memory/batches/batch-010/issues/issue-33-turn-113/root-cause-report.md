# Issue 33 Turn 113 Root Cause Report

## Problem

本 issue 是 `valid`。

第 113 轮玩家可见正文最后把卡琳娜的手写成“手指扁平地搁在椅面上，掌心朝上”。同轮生成选项却给出“轻轻伸出手，覆上她的手背”。第 114 轮玩家选择该选项后，正文继续写玩家的手“平稳地落到了她搁在椅面上的手背上”，并写“手背上她皮肤的温度，在你掌心下保持着稳定”。

问题不是隐藏设定冲突，而是玩家可见物理姿势冲突：掌心朝上平放时，手背不是可由上方“覆上/落到”的暴露表面；文本也没有写任何翻手、托起或从下方接触的过渡。

## Validity

- `issueValidity`: `valid`
- 只用玩家可见证据即可确认：`logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`、`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/04-output.json`、`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/04-output.json` 都呈现同一矛盾。
- 第 113 轮早些时候有“路灯的光落在她手背上”，但这是抽手过程中的视觉描写；最后落位姿势已经更新为“掌心朝上”。因此不能用早先“手背”一词解释后续“覆上手背”。
- 可疑空间较小：如果正文写明卡琳娜翻手或玩家托住掌心，该问题可以消失；但目标窗口中没有这种桥接。

## Context Assessment

问题发生前，卡琳娜刚回应玩家“想试试抓住我的手吗”的邀请。她没有直接回答“是/否”，而是把手从口袋里抽出，放在自己膝盖旁边的长椅椅面上，离玩家一掌宽，最后明确为“掌心朝上”的开放状态。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 卡琳娜最终手部姿势是平放在椅面上且 `掌心朝上` | `present-clear` | `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/06c-choice-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/03-story-state.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/06b-narrator-prompt.md` | 该事实在第 113 轮正文最后一句，离选项生成最近。 |
| 早先出现“路灯的光落在她手背上” | `stale` | `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/06c-choice-prompt.md` | 该词只描述抽手过程，不能覆盖后续最终姿势。 |
| Choice worker 要以正文结尾判断玩家能合理做什么 | `present-clear` | `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/06c-choice-prompt.md` | 这是通用原则，但没有结构化接触面校验。 |
| 错误选项“覆上她的手背” | `present-clear` | `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/06-llm-calls.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/04-output.json` | 最早偏离点。 |
| 第 114 轮 Director/Narrator 同时看到“掌心朝上”和玩家输入“覆上手背” | `contradicted` | `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/06a-director-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/06b-narrator-prompt.md` | 下游没有桥接或修复冲突。 |
| runtime-after 提供独立手部姿势状态 | `absent` | `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/05-runtime-after.json` | runtime-after 只保留 worldState/entityStates/internal beat 等运行态。 |

竞争压力：

- 近几轮持续围绕“空出来的手”“抓住什么”“不会想松开”铺垫，强烈推动亲密触碰选项。
- 第 113 轮早先的“手背”词汇具有局部显著性。
- 选项需要短、具体、可点击，容易压缩掉姿势推理。
- 第 114 轮玩家输入来自系统生成选项，下游更倾向把它当作硬动作满足。
- Narrator 的慢铺和触觉细节要求放大了“手背温度”等矛盾细节。

## Causal Chain

- `firstDivergenceArtifact`: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/06-llm-calls.json[2].object.options[0]`，同步落到 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/04-output.json` 的 `choices.options[0]`。
- `triggeringPressure`: 情感触碰铺垫与早先“手背”词汇显著性，让 Choice worker 把开放姿态压缩成“覆上手背”的温柔动作。
- `missingGuard`: Choice contract 没有把“掌心朝上”变成可校验的 physical affordance；selected choice 进入 Director/Narrator 后，也没有“与最近可见姿势冲突时必须桥接或修正”的 handoff 规则。
- `directCause`: Choice worker 生成物理上不匹配的选项；Director 在第 114 轮把它重述为 `summary`、`beats`、`requiredContent`；Narrator 继续细写，导致玩家看到矛盾。
- `propagation`: 错误选项展示给玩家 -> 玩家选择该选项 -> Director object 写入“主角伸手覆上卡琳娜的手背” -> Narrator 按 requiredContent 输出“落到手背”“手背温度” -> `turn-114/07-events.json` 和 `turn-114/04-output.json` 固化该轮结果。

非主因：

- 不是 `meta-memory` 或 `detail-memory`：关键姿势是上一轮结尾，且在 prompts 中清晰存在。
- 不是 `storyline-lifecycle` 或 `fixed-beat-consumption`：当前 storyline 只要求情感沉淀和卡尔暗示，没有指定“手背”动作。
- 不是 `state-writeback` 首发：`turn-114/05-runtime-after.json` 没有独立写入错误手部姿势。
- 不是 evaluator 误判：玩家可见文本本身同时呈现互斥姿势。

## Root Cause

- `rootCause.label`: `choice-action-binding`
- `rootCause.family`: `agent-system`
- `secondaryFamilies`: `recent-context`
- `confidence`: `high`

L3 root mechanism：选项生成到后续执行的 action binding 缺少物理可供性校验。Choice worker 在“掌心朝上”近期事实清晰存在时，把亲密触碰意图绑定成“覆上手背”；selected choice 进入下一轮后又被 Director/Narrator 当作硬动作，而系统没有要求在玩家输入与最近可见姿势冲突时桥接或修正为“覆上掌心/托住掌心/碰指尖”等可行动作。

这不是“Choice 出错”这个 L1 位置本身，而是一个可复发的机制缺口：短选项生成没有检查当前 pose/contactSurface，下游 handoff 也没有把系统生成选项视为可能需要修复的软约束。

## Evidence

玩家可见证据：

- `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/04-output.json`
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/04-output.json`

内部链路证据：

- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/06c-choice-prompt.md` 已把“掌心朝上”放在“本轮玩家已经看到的正文（最终判断依据，尤其结尾）”中。
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-113/06-llm-calls.json[2]` 输出错误选项：“轻轻伸出手，覆上她的手背”。
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/06a-director-prompt.md` 和 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/06b-narrator-prompt.md` 同时包含上一轮“掌心朝上”和本轮玩家输入“覆上她的手背”。
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/06-llm-calls.json[0].object`、`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/07-events.json` 将“手背”写入 Director 的 `beats`、`characterBeats`、`requiredContent`。
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-114/05-runtime-after.json` 未提供独立姿势写回，排除 runtime state 首发。

## Recommended Fix Area

优先修复 `choice-action-binding`：

1. 在 Choice generator prompt/schema 中加入 physical affordance check：生成身体接触动作前必须核对最近可见 pose/contactSurface。
2. 在 selected-choice -> Director handoff 中加入 conflict repair：如果玩家输入来自系统选项但与可见物理状态冲突，Director 必须桥接、改写为物理可行的等价动作，或显式写出姿势调整。
3. 在 Narrator prompt 中加入 requiredContent 冲突优先级：当 requiredContent 与 recent visible state 冲突，优先维护玩家已见物理状态，并用最小改写保留核心意图。
4. 可选：在短期 scene state 中记录 `pose` / `contactSurface`，供 Choice、Director、Narrator 共用。

## Confidence

`high`。关键事实在玩家可见文本、choice prompt、director prompt、narrator prompt 中都清晰存在；错误从 Choice 输出首次出现，并被下游直接传播，链路完整且没有发现更早的 storyline、memory 或 runtime 写回原因。
