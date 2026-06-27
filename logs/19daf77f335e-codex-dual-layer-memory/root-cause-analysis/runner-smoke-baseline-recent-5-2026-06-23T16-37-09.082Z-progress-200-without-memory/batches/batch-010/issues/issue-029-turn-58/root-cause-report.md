# issue-29-turn-58

## Problem
第 58 轮卡琳娜连续发言中出现“而且——”“时机这件事，不是光靠等就能等来的。”。同一段对白中没有叙述插入或换说话人，多出的闭合/开启引号把一句话硬切开，造成阅读卡顿。

## Validity
issueValidity: valid

玩家可见文本直接包含异常：“而且——”“时机这件事……”。前后都属于卡琳娜对“什么时候说/合适时机”的回应，不存在需要拆成两段引号的叙事理由。该问题不改变剧情事实或选项语义，因此是 low 级 quality-regression。

## Context Assessment
问题前的实际状态：第 57 轮卡琳娜还不确定那句话写给谁。第 58 轮玩家追问她是否在等合适时机。卡琳娜应继续模糊回应，不透露具体条件。

相关事实：
- `present-clear`: Director 要求卡琳娜回答时机问题但保留具体条件；见 `turn-58/04-output.json plotPoint`。
- `present-clear`: Narrator 在同一 `data-speaker="卡琳娜"` frame 中生成相邻 `”“`；见 `turn-58/06-llm-calls.json` call 1。
- `present-clear`: `normalizedContent.visibleText` 原样保留异常，说明 v3-html normalizer 没有检查 frame 内标点质量。
- `not-needed`: Choice 输出正常，没有继续传播该标点异常。

Competing pressures: Narrator 用中文引号包裹对白，并用破折号表现停顿；v3-html 协议检查标签结构，但没有中文引号配对/相邻引号 lint。

## Causal Chain
firstDivergenceArtifact: `turn-58/06-llm-calls.json` call 1 / `turn-58/04-output.json` narrative。

Director 剧情安排没有异常标点要求。Narrator 在写“而且——”后的继续说明时，错误地关闭又重新开启中文引号，形成同 frame 内的 `”“` 断裂。输出管线接受了合法 `<p>` 结构，却没有校验玩家可见标点，因此错误进入 visibleText。

Propagation: 异常保留在 `turn-58/04-output.json rawHtml`、`normalizedContent.visibleText` 和 `visible-timeline.jsonl`；后续 Choice 和 runtime state 未扩大该问题。

Non-causes: 不是 Director、Choice、memory 或剧情连续性问题。

## Root Cause
rootCause.label: model-local

family: llm-self

secondaryFamilies: agent-system

根因机制：在清楚的 v3-html 协议下，Narrator 局部生成仍因“破折号停顿 + 中文引号包裹对白”产生 malformed dialogue；缺少 frame 内 quote-balance / typography lint，使这个本地格式 slip 被直接提交给玩家。

## Evidence
- Player-visible: `visible-timeline.jsonl` turn 58。
- Internal trace: `turn-58/04-output.json plotPoint` 无异常要求；`turn-58/06-llm-calls.json` call 1 首次生成 `“而且——”“时机这件事……”`；`turn-58/04-output.json normalizedContent.visibleText` 原样保留。

## Recommended Fix Area
增加 Narrator 输出后的 typography lint/repair：检查中文引号配对、同一 dialogue frame 内相邻闭合/开启引号，必要时自动合并或重采样。

## Confidence
high
