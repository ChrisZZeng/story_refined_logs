# Issue 008 Turn 27 Root Cause Report

## Problem

turn 27 的同一场围堵里，正文先写脚步声“从主巷两端的黑暗中同时向中间收拢”，随后又写“三个穿深色夹克的人影从你刚刚穿过的那条岔道口方向走来”，并让另外两人封住往古董街方向的退路。玩家可见空间调度被写成两种来向。

## Validity

`issueValidity`: `valid`

玩家可见文本内部已经构成冲突，不需要隐藏信息支持。若把“三人从岔道口方向走来”理解成其中一端，也仍难解释同一句里“另外两人一左一右”与“主巷两端同时收拢”的关系；因此这是低烈度但真实的空间一致性问题。

## Context Assessment

问题发生前，玩家在 turn 26 位于岔道口内侧的小空地附近，选择“放弃跟踪，原路退回暗街主巷”。最近可见文本已经建立了主巷、较窄岔道、古董街方向、肉铺方向和岔道口小空地的相对关系，但这些关系主要埋在长段最近经历里。

Relevant facts:

- `present-clear`: 玩家本轮意图是“原路退回暗街主巷”。证据见 `visible-timeline.jsonl` turn 27、`turn-27/06a-director-prompt.md:452-453`。
- `present-buried`: 主巷、侧面岔道、肉铺方向、古董街方向的局部地图。证据见 `turn-27/06b-narrator-prompt.md:392-445`。
- `present-ambiguous`: Director 只安排“在巷口遭遇三名黑帮成员堵截”，没有说明三名黑帮的来向、站位和退路。证据见 `turn-27/06b-narrator-prompt.md:488-500`。
- `absent`: Narrator 可执行的 `sceneBlocking` 或 actor-position anchor，没有把“主巷两端”“岔道口方向”“古董街方向”统一成单一空间方案。

Competing pressures:

- 当前 storyline 固定演出要求三名黑帮与卡琳娜介入一次性完成。
- Director beat 强调“堵截”和压迫感，但没有把空间调度具体化。
- 最近空间事实存在，但被长篇历史正文承载，离最终写作指令较远。

## Causal Chain

`firstDivergenceArtifact`: `turn-27/06-llm-calls.json` 的 Narrator `streamText`，并落入 `turn-27/04-output.json`。

Director 输出本身没有写出互相矛盾的来向，只给出“玩家退回暗街主巷，在巷口遭遇三名黑帮成员堵截”。Narrator 在补全空间压迫感时，先生成“两端同时收拢”，又生成“三个穿深色夹克的人影从岔道口方向走来”，把两个可用但互斥的空间方案合并进同一场调度。

Triggering pressure: 固定演出和 Director beat 要求立刻发生三人堵截，以形成卡琳娜介入的舞台。

Missing guard: handoff 没有把最近的局部地图整理成明确的当前场景锚点，也没有要求同一事件内的来向、退路和人物站位只选一种方案。

Mechanism statement: 在“必须发生堵截”的剧情压力下，系统把最近空间关系留在长段上下文里，而没有生成可执行的 `sceneBlocking`，导致 Narrator 用多个方向性短语即时拼接围堵场面，形成玩家可见的来向冲突。

Propagation: 冲突进入 `04-output.json` 的 visibleText；后续 choices 未进一步修正空间状态。

Non-causes:

- 不是 `memory-persistence` 主因；所需空间信息在最近上下文中存在。
- 不是 Choice worker 主因；选项发生在冲突正文之后。
- 不是 evaluator 误判；冲突可直接从 turn 27 可见正文确认。

## Root Cause

`label`: `current-scene-anchor`

`family`: `agent-system`

`secondaryFamilies`: [`recent-context`]

当前场景空间事实虽然在 recent turns 中存在，但 handoff 没有把它们提升为可执行的当前场景锚点。Director 的“巷口遭遇三名黑帮成员堵截”只规定剧情功能，没有规定来向和站位；Narrator 因此在同一段里混用了“两端收拢”和“岔道口方向走来”两种调度。

## Evidence

Player-visible evidence:

- `visible-timeline.jsonl` turn 27: “从主巷两端的黑暗中同时向中间收拢”。
- `visible-timeline.jsonl` turn 27: “三个穿深色夹克的人影从你刚刚穿过的那条岔道口方向走来”。

Internal trace:

- `turn-27/06b-narrator-prompt.md:392-445` 保留了最近局部地图，但只是长正文。
- `turn-27/06b-narrator-prompt.md:488-500` 的 Director handoff 只给“巷口遭遇三名黑帮成员堵截”。
- `turn-27/04-output.json` 首次出现互斥空间调度。

## Recommended Fix Area

在 Director-to-Narrator handoff 中增加当前场景的 `sceneBlocking` 或等价字段，至少包含玩家位置、主要出口、NPC 来向、封锁方向和当前场景允许的移动方向。对固定演出触发的围堵/追逐/进入场景，Narrator 前增加同一事件内方向短语一致性检查。

## Confidence

`medium`
