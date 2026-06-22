# Issue 1 Turn 3 Root Cause Report

## Problem

issueIndex=1，turn=3，type=`quality-regression`，scope=`choices`。

玩家在 turn 3 看到的选项是“直接去暗街，往日总是如影随形”。前半句是可执行行动，后半句像从叙事主题或风格短语里误混进来的残片，不再是玩家可点击的清晰动作。

## Validity

`issueValidity`: `valid`

只看玩家可见内容，这个问题成立。turn 3 的正文结尾让玩家可以选择前往暗街或警觉异常；“直接去暗街”可以承接这个处境，但“往日总是如影随形”没有明确动作语义，也不是玩家可主动执行的行为。

需要注意的是，选项绑定的方向本身正确，问题不在“前往暗街”这个出口，而在玩家可见的 option text 被污染。

## Context Assessment

问题发生前，玩家已经在 turn 2 从小贩处得知暗街可能有敏特线索；turn 3 玩家尝试追卡琳娜失败后，小贩又把卡琳娜和暗街绑定起来。此时清晰可用的行动应该是“前往暗街找卡琳娜打听消息”。

相关事实：

- `present-clear`: turn 3 正文说明卡琳娜住在暗街，玩家可以前往暗街。来源：`turn-03/04-output.json`。
- `present-clear`: Choice worker 原始输出给出的选项是“前往暗街，找卡琳娜打听消息”。来源：`turn-03/06-llm-calls.json`。
- `over-constraining`: `candidateActions` 中 `choice:前往暗街` 的文本已经是“直接去暗街，往日总是如影随形”。来源：`turn-03/03-story-state.json`，同一文本也出现在 `turn-03/02-script-state.json`。
- `present-clear`: `turn-03/06c-choice-prompt.md` 明确要求选项“短、具体、可点击，像玩家会主动选择的行动”，但候选动作文本本身没有经过同样的可读性约束。

竞争压力主要来自 key choice 的绑定逻辑：当前内容确实已经形成前往暗街的选择场景，因此系统倾向保留并绑定 `choice:前往暗街`。

## Causal Chain

第一处偏离是 `turn-03/02-script-state.json` / `turn-03/03-story-state.json` 中的 `candidateActions[0].text`，它已经把可执行动作和抒情短语拼在一起。

随后 Choice worker 在 `turn-03/06-llm-calls.json` 中生成了更干净的文本：“前往暗街，找卡琳娜打听消息”，并绑定 `choice:前往暗街`。但是 `turn-03/07-events.json` 的 `choiceGenerator` 结果和 `turn-03/04-output.json` 最终输出都回到了候选动作原文“直接去暗街，往日总是如影随形”。

触发压力是 key choice 已可用，系统需要保留 `choice:前往暗街` 的剧情出口。缺失防线是绑定候选动作时没有保证玩家可见文本仍满足“可点击行动”的质量约束，也没有在 LLM 已改写出清晰文本后保留该改写。失败运动是：污染的候选动作 label 被当作最终 display text 覆盖了 Choice worker 的清晰 option text。

非主因：

- Narrator 没有造成该选项污染。
- Choice worker 这一轮的 raw output 不是污染源。
- 玩家选择前往暗街的剧情方向本身不是问题。

## Root Cause

`rootCause.label`: `choice-action-binding`

`family`: `agent-system`

这是一个 choice-action 绑定阶段的 display text 合同缺口：候选动作承担剧情出口绑定职责，但它的 `text` 字段没有被限制为玩家可执行动作；当 Choice worker 生成了更合格的文本后，后处理仍用候选动作文本作为最终选项展示。系统缺少“actionId 绑定保留、display text 可由 Choice worker 清洗”的分层合同，也缺少候选动作文本质量校验。

## Evidence

玩家可见证据：`visible-timeline.jsonl` turn 3 和 `turn-03/04-output.json` 都显示选项“直接去暗街，往日总是如影随形”。

内部链路证据：`turn-03/03-story-state.json` 的 `candidateActions` 已含污染文本；`turn-03/06c-choice-prompt.md` 把该候选动作提供给 Choice worker；`turn-03/06-llm-calls.json` 中 Choice worker 输出了清晰文本；`turn-03/07-events.json` 和 `turn-03/04-output.json` 最终又采用候选动作原文。

## Recommended Fix Area

优先修复 choice finalization / action binding 层：绑定 `actionId` 时不要强制用 candidate action 的 `text` 覆盖 LLM option text；同时给 `candidateActions.text` 增加“必须是玩家可执行行动”的校验或生成约束。

## Confidence

`high`
