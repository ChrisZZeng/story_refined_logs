# issue-27-turn-54

## Problem
第 54 轮玩家正在讲述敏特，正文在 `data-speaker="帕兹"` 的“她叫敏特”之后写“她说出这个名字时”，把说话主体短暂错归给第三人称女性。

## Validity
issueValidity: valid

玩家可见证据足够成立。第 54 轮前后都在写玩家开口：“等你开口”“你靠在长椅的靠背上”，台词是“她叫敏特。我认识她的时候——还在战区。”同段后半又写“你的手指在膝盖上蜷了一下”。因此“她说出这个名字时”应为“你说出这个名字时”一类表达。错误只持续一句，后文未长期固化，所以严重度低。

## Context Assessment
问题前的实际状态：第 53 轮卡琳娜问“确认一件什么事——方便说吗？”第 54 轮玩家选择愿意告诉她，当前应由帕兹开始讲述敏特。

相关事实：
- `present-clear`: 本轮应由帕兹讲述寻找敏特的原因；见 `turn-54/04-output.json plotPoint`。
- `present-clear`: Narrator 已正确输出 `data-speaker="帕兹"` 的“她叫敏特”；见 `turn-54/06-llm-calls.json` call 1。
- `present-clear`: 旁白描述主角时应使用“你/帕兹”；同段后文也写“你的手指”。
- `present-clear`: 局部文本中有多个女性代词和女性角色，形成代词吸附压力。
- `absent`: 没有检查前一帧 speaker tag 与下一句叙述主语是否一致；错误被正常 normalized 和 committed。

Competing pressures: 台词“她叫敏特/我认识她”紧邻女性代词；场上卡琳娜也是“她”；Narrator 风格需要写承接语气，容易局部滑移。

## Causal Chain
firstDivergenceArtifact: `turn-54/06-llm-calls.json` call 1 / `turn-54/04-output.json` narrative。

Director 没有出错：它明确要求“帕兹开始讲述”。Narrator 结构化 speaker tag 也正确，但紧接着的叙述句局部代词漂移，写成“她说出这个名字时”。缺失的是句级 speaker-pronoun alignment guard：当前一帧是主角台词时，描述其语气和动作必须回指“你/帕兹”。

Propagation: 错句进入 `turn-54/04-output.json normalizedContent.visibleText` 与 `visible-timeline.jsonl`；后续 Choice 未扩散该主体错误，runtime-after 未持久化。

Non-causes: 不是 Director、Choice 或 memory-persistence 问题；需要的说话人信息就在同一段结构化标签中。

## Root Cause
rootCause.label: speaker-pronoun-alignment

family: llm-self

根因机制：speaker tag 清楚，但局部生成面对“她叫敏特/我认识她”和卡琳娜这类女性代词压力时发生代词滑移；系统没有句级校验把前一帧 `data-speaker="帕兹"` 约束传递到下一句叙述主语，导致玩家可见的主体错归。

## Evidence
- Player-visible: `visible-timeline.jsonl` turn 54。
- Internal trace: `turn-54/04-output.json plotPoint` 写“帕兹回应”；`turn-54/06-llm-calls.json` call 1 同时包含正确的 `data-speaker="帕兹"` 和错误的“她说出这个名字时”。

## Recommended Fix Area
为 Narrator 输出增加 speaker-pronoun alignment lint，尤其检查主角台词后的“他说/她说出/她开口”等承接句；在最终输出提醒中明确“描述主角说话方式时必须用‘你/帕兹’”。

## Confidence
high
