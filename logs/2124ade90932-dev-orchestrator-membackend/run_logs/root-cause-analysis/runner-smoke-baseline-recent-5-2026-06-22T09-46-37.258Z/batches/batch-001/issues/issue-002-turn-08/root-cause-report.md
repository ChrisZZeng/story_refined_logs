# Issue 002 Turn 8 Root Cause Report

## Problem

Turn 8 的问题是叙事从白天庆典、古董街连续步行，直接落到“夜色里，灯泡吱地响了一声”。玩家此前没有看到明确的长时间流逝或入夜过渡，因此这是低严重度的时间连续性断裂。

## Validity

`issueValidity`: `valid`

玩家可见证据支持该 issue。Turn 1 明确写到“阳光刺得你本能的眯起眼”。Turn 4-7 只是连续地从庆典区走到古董街、观察摊位、与猫互动并发现纸条，没有写出数小时流逝。Turn 8 末尾突然说“夜色里”，会让读者感觉时间被跳过。

保留 caveat：Turn 4-8 已多次使用“昏黄”“昏暗”“灯泡”“阴影”，读者也可以把“夜色”弱读成暗街局部氛围。因此该 issue 是有效但低严重度。

## Context Assessment

问题前玩家实际看到的状态是：复活日庆典正在进行，帕兹离开中央区，穿过古董街并发现“暗街——找‘裁缝’”纸条，然后沿线索去暗街入口。可见动作是连续短程移动。

相关事实：

- `present-clear`: 故事开场是白天庆典。证据在 `visible-timeline.jsonl`。
- `present-clear`: Turn 4-7 没有玩家可见长时间流逝。证据在 `visible-timeline.jsonl`、`turn-08/06a-director-prompt.md` 和 `turn-08/06b-narrator-prompt.md` 的 recentTurns。
- `present-clear`: 当前 beat 要表现从庆典喧闹到暗街安静、从明快到阴暗的空间反差。证据在 `turn-08/03-story-state.json`、`turn-08/06a-director-prompt.md` 和 `turn-08/06b-narrator-prompt.md`。
- `absent`: prompt 没有明确当前仍是同一时段，也没有说明“暗”应来自街区光线和建筑遮蔽而非实际入夜。

竞争压力包括：地点名“暗街”、固定 beat 的“光线变化”、情感弧线“轻松明快的庆典 → 阴暗的街道”，以及写作规范中“通过光线变化暗示时间”的风格规则。

## Causal Chain

最早玩家可见偏离出现在 `turn-08/04-output.json` 的 Narrator 输出。Director 本身没有要求写入夜，但它在 `requiredContent` 中前景化了“光线变化”和“从庆典喧闹到暗街安静的过渡”，并要求突出光线、声音和气味变化。

缺失的防线是当前时间锚。prompt 没有告诉 Narrator：这里应该是空间光线变暗，而不是时间已经进入夜晚。于是 Narrator 把“阴暗街道”的氛围反差升级成实际时间词“夜色里”。

机制说明：固定 beat 把空间氛围的变暗前景化，缺少当前时间锚来区分局部暗度和实际入夜，Narrator 将“阴暗街道”的空间反差升级成“夜色里”的时间事实。

非主因：

- 不是长期记忆问题；相关白天和连续行动都在 recent context 内。
- 不是玩家选择导致；玩家只选择“直接去暗街”。

## Root Cause

`rootCause.label`: `current-scene-time-anchor`

`family`: `agent-system`

根因是当前 scene/beat handoff 没有显式携带 time-of-day anchor。Director 和固定 beat 要求表现光线与氛围变化，但没有区分“街区变暗”与“时间入夜”。这让 Narrator 能把空间反差误写成时间事实。

## Evidence

玩家可见证据：Turn 1 是阳光白天；Turn 4-7 是连续行动；Turn 8 写“夜色里，灯泡吱地响了一声”。

内部链路证据：`turn-08/06a-director-prompt.md` 第 218-239 行和 `turn-08/06b-narrator-prompt.md` 第 217-238 行前景化“轻松明快的庆典 → 阴暗的街道”和“光线变化”。Director 输出的 `requiredContent` 要求从庆典喧闹到暗街安静，但没有当前时间约束。

## Recommended Fix Area

为 current scene 或 story state 增加 `currentTimeOfDay` / visible time anchor。Director 在要求“光线变化”时应声明这是空间转场还是时间流逝；Narrator 输出新的时间词时应检查是否已有玩家可见过渡。

## Confidence

`medium`
