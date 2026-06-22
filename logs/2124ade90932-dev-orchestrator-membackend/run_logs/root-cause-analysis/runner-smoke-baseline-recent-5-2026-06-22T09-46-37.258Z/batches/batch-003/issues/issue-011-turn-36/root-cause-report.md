# Issue 011 Turn 36 Root Cause Report

## Problem

turn 36 当前可见正文先写“不是敲门”，紧接着又描述“指节叩在旧木料上的声音”，并在后文写“敲门声又响了一次”。同一声音事件的性质在局部文本中自相矛盾。

## Validity

`issueValidity`: `valid`

这个问题只依赖当前轮玩家可见正文。若作者想表达“不是普通敲门”，正文没有写出限定语；相反，它先否定“敲门”，再描述典型敲门动作并直接命名为“敲门声”。因此 issue 成立，severity 为 low。

## Context Assessment

问题发生前，玩家在卡琳娜公寓内查看书架，选择抽出暗红色线的薄册子。当前 storyline 要求节点结束时必须输出敲门声作为过渡。Director 正确把本轮安排成“抽出薄册子”后“敲门声响起”。

Relevant facts:

- `present-clear`: storyline 约束要求“急促的敲门声”作为节点过渡。证据见 `turn-36/03-story-state.json`、`turn-36/06a-director-prompt.md:333-358`。
- `present-clear`: Director 输出要求“敲门声响起”与“必须出现一阵急促的敲门声打断当前动作”。证据见 `turn-36/06b-narrator-prompt.md:531-562`。
- `present-clear`: Narrator prompt 要求不要改变 Director 剧情方向。证据见 `turn-36/06b-narrator-prompt.md:570-579`。
- `contradicted`: Narrator 输出同时写“不是敲门”和“敲门声又响”。证据见 `turn-36/04-output.json`。

Competing pressures:

- 需要用敲门声制造节点过渡。
- Narrator 追求悬疑和声音质感，生成了“不是敲门”的修辞翻转。

## Causal Chain

`firstDivergenceArtifact`: `turn-36/06-llm-calls.json` 的 Narrator `streamText`，并落入 `turn-36/04-output.json`。

Director 和 story state 都清楚要求敲门声；没有内部 artifact 要求把它写成非敲门声。Narrator 在执行时先写“门响了。不是敲门”，随后又把声音描述为指节叩门并在后文称为“敲门声”，形成局部自矛盾。

Triggering pressure: 悬疑转场需要一个急促、可打断动作的声音事件。

Missing guard: 缺少对同一局部事件的 semantic self-consistency 检查，尤其是“不是 X”之后又按 X 命名/处理的模式。

Mechanism statement: 在清楚要求“敲门声”的情况下，Narrator 为增强悬疑使用了“不是敲门”的局部修辞，但没有维护同一声音事件的语义一致性，导致后文按敲门处理时直接暴露矛盾。

Propagation: 矛盾进入 visibleText；Choice 也围绕“回应敲门”继续展开，确认后文按敲门处理。

Non-causes:

- 不是 Director/root storyline 指令冲突；它们都要求敲门声。
- 不是 memory 或 recent-context 问题；冲突发生在同一段生成内部。
- 不是 evaluator 误判；同段文本直接可见。

## Root Cause

`label`: `model-local`

`family`: `llm-self`

`secondaryFamilies`: []

所有关键上下文和 contract 都清楚要求“敲门声”。错误来自 Narrator 局部生成：为了营造声音异常感，它先否定“敲门”，又立即按敲门描述和命名。没有证据表明 pipeline、state 或 prompt handoff 推动了这个矛盾。

## Evidence

Player-visible evidence:

- `visible-timeline.jsonl` turn 36: “不是敲门。三声……指节叩在旧木料上的声音”。
- `visible-timeline.jsonl` turn 36: “敲门声又响了一次”。

Internal trace:

- `turn-36/03-story-state.json` 约束要求节点结束时输出急促敲门声。
- `turn-36/06b-narrator-prompt.md:531-562` Director 要求“敲门声响起”和“必须出现一阵急促的敲门声”。
- `turn-36/04-output.json` 是首个自相矛盾 artifact。

## Recommended Fix Area

增加 Narrator 输出后的局部语义一致性 lint：检测同一事件窗口内“不是 X/并非 X”与后续 X 命名、动作或 choice label 的冲突。也可以在 Narrator prompt 中要求，若想写异常声音，应写“不是普通的敲门”或明确异常点，不能先否定事件类型再按该类型推进。

## Confidence

`high`
