# Issue 001 Turn 7 Root Cause Report

## Problem

Turn 7 的问题是玩家选项“直接去暗街，往日总是如影随形”读起来像拼接错误。前半句是明确行动，后半句没有在本轮正文中被承接为目标、状态或可执行意图。

## Validity

`issueValidity`: `valid`

玩家可见证据足够。Turn 7 正文只建立了纸条线索“暗街——找‘裁缝’”，下一步自然动作可以是去暗街或继续观察异常；“往日总是如影随形”没有被建立为按钮内容。该问题不影响事实链，但确实是低严重度的选项文案质量退化。

## Context Assessment

问题前的玩家实际处境是：猫离开摊位，露出纸条，纸条给出“暗街——找‘裁缝’”。玩家知道有一条可前往暗街的线索，也知道周围似乎无人看向自己。

相关事实：

- `present-clear`: 纸条线索是“暗街——找‘裁缝’”。证据在 `visible-timeline.jsonl`、`turn-07/04-output.json` 和 `turn-07/06c-choice-prompt.md`。
- `present-buried`: “从往日阴影中逃离 → 来到现实”是当前故事线的主题弧线，不是玩家按钮动作。证据在 `turn-07/03-story-state.json` 和 `turn-07/06c-choice-prompt.md`。
- `present-clear`: Choice worker 被要求生成短、具体、可点击的行动选项。证据在 `turn-07/06c-choice-prompt.md`。

竞争压力是：`candidateActions[0].text` 已经把动作出口写成“直接去暗街，往日总是如影随形”，Choice prompt 又把它放在“剧本/状态机候选推进动作”里展示，缺少对玩家可见按钮文案的净化要求。

## Causal Chain

最早偏离出现在 `turn-07/03-story-state.json` 的 `candidateActions[0].text`。该字段已经混合了动作“直接去暗街”和主题化片段“往日总是如影随形”。

`turn-07/06c-choice-prompt.md` 第 287-289 行把这个候选动作原样展示给 Choice worker。虽然 prompt 要求选项短、具体、可点击，但它没有要求对候选动作 `text` 做动作化重写，只强调可用候选要保留完整 `actionId`。随后 `turn-07/07-events.json` 中 `choiceGenerator` 原样输出了该选项，并由 `turn-07/04-output.json` 固化为玩家可见选项。

机制说明：候选动作字段把剧情出口和主题短语混写，Choice handoff 又把该字段当成玩家可见按钮候选，缺少按钮文案净化和 action label 分层，导致诗性片段被复制到最终选项。

非主因：

- Narrator 正文没有生成该异常选项。
- 玩家输入不是源头；玩家只是在 Turn 8 选择了系统生成的选项。

## Root Cause

`rootCause.label`: `choice-action-binding`

`family`: `agent-system`

根因是候选动作契约把 machine action 的可执行语义和 player-facing button copy 混在同一个 `text` 字段里。Choice prompt 缺少硬性规则来重写或拒绝非行动性从句，因此模型倾向于复制候选文本，造成玩家可见选项污染。

## Evidence

玩家可见证据：Turn 7 正文显示纸条“暗街——找‘裁缝’”，随后按钮出现“直接去暗街，往日总是如影随形”。

内部链路证据：`turn-07/03-story-state.json` 的 `candidateActions[0].text` 已含异常文案；`turn-07/06c-choice-prompt.md` 第 287-289 行将其展示为候选推进动作；`turn-07/07-events.json` 中 `choiceGenerator` 原样输出。

## Recommended Fix Area

优先修复 Choice 候选动作 handoff。将 `actionId`、机器语义标签、玩家按钮文案、主题提示分成不同字段，并在 Choice worker 输出前校验按钮是否是短、具体、可点击的玩家行动。

## Confidence

`high`
