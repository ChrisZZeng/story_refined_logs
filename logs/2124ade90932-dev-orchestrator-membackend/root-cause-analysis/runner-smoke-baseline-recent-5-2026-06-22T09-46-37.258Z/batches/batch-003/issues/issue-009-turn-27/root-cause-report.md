# Issue 009 Turn 27 Root Cause Report

## Problem

turn 27 的可见正文已经处在黄昏后到夜间的暗街场景，却让卡琳娜说“午安，记者”。这造成轻微但可见的时间语感冲突。

## Validity

`issueValidity`: `valid`

玩家可见时间线足以确认问题：turn 19 已到“淡橘色”的黄昏，turn 20 写天空沉入紫灰，turn 24 写天色几乎完全沉入夜蓝，turn 27 又写“深蓝色裂隙”和昏黄灯光。在这种时间语境下，“午安”没有被标记为玩笑、反讽或角色习惯，因此是有效 issue。

## Context Assessment

问题发生前，玩家经历了从傍晚等待、混入庆典人流、进入暗街到夜蓝巷道的一系列推进。当前 scene 时间应是黄昏后到夜间。内部 artifact 中，这个时间事实存在于 recent turns，但固定演出把卡琳娜问候写成强制台词。

Relevant facts:

- `present-clear`: 玩家可见时间已经从黄昏推进到夜蓝。证据见 `visible-timeline.jsonl` turn 19、20、24、27。
- `over-constraining`: 当前 storyline 固定演出硬写“卡琳娜 对 主角：‘午安，记者。’”。证据见 `turn-27/03-story-state.json`、`turn-27/06a-director-prompt.md:312-314`。
- `over-constraining`: Director 将这句原样转入 `requiredContent`。证据见 `turn-27/06b-narrator-prompt.md:516-524`。
- `absent`: 没有要求固定台词根据已推进的可见时间重写，也没有将时间锚点提升到比 literal fixed line 更高的优先级。

Competing pressures:

- 固定演出要求“启动模板流程必须一次输出全部”且“关键台词必须强制触发一次”。
- 最近可见时间事实清楚，但在 prompt 中是长段历史内容，不如 `requiredContent` 贴近最终写作指令。

## Causal Chain

`firstDivergenceArtifact`: `turn-27/03-story-state.json` 的 `currentStoryline.content` 固定演出；本轮由 Director 在 `turn-27/04-output.json` 的 `requiredContent` 中固化。

固定 beat 仍处于 active，需要触发卡琳娜介入和公寓邀请；但其中的 literal greeting “午安”已经与最近可见时间不兼容。Director 没有改写该台词，而是作为 requiredContent 原样交给 Narrator。Narrator 遵循 requiredContent，输出了时间语感冲突。

Triggering pressure: 固定演出中的硬台词和“必须强制触发一次”的约束。

Missing guard: 固定 beat 缺少“与当前 visible time-of-day 不兼容时必须 rewrite literal wording”的生命周期/上下文适配规则。

Mechanism statement: 当 active fixed beat 的 literal dialogue 与最近可见时间冲突时，系统仍把 literal dialogue 作为最高优先级 requiredContent 传递，且没有时间锚点适配防线，导致 Narrator 正确执行固定台词却生成玩家可见时间语感错误。

Propagation: 错误台词进入 `turn-27/04-output.json` visibleText；后续没有修正。

Non-causes:

- 不是长程记忆缺失；时间推进在 recent turns 内。
- 不是 Choice worker 主因。
- 不是隐藏设定问题；玩家可见时间线足够判定。

## Root Cause

`label`: `fixed-beat-literal-replay`

`family`: `agent-system`

`secondaryFamilies`: [`recent-context`]

固定演出节点仍有效，但其中的 literal greeting 已与最新 visible time-of-day 不兼容。系统缺少 fixed beat 触发时的上下文适配层，导致 Director/Narrator 将硬台词“午安”原样重放，而没有改为“晚上好”等适合当前场景的问候。

## Evidence

Player-visible evidence:

- `visible-timeline.jsonl` turn 19: 光线转为淡橘色，黄昏来临。
- `visible-timeline.jsonl` turn 20: 天空从淡橘色沉入紫灰。
- `visible-timeline.jsonl` turn 24: 天色几乎完全沉入夜蓝。
- `visible-timeline.jsonl` turn 27: 卡琳娜说“午安，记者”。

Internal trace:

- `turn-27/06a-director-prompt.md:312-314` 固定演出包含硬台词“午安，记者”。
- `turn-27/06b-narrator-prompt.md:516-524` Director 将该台词放入 `requiredContent`。
- `turn-27/04-output.json` 按 requiredContent 输出该台词。

## Recommended Fix Area

为 fixed beat requiredContent 增加上下文适配机制：对时间、地点、称谓、已发生动作这类 visible anchors 做 literal line rewrite 检查。若硬台词与当前 visible context 冲突，应保留剧情功能但改写表层 wording，并记录改写原因。

## Confidence

`high`
