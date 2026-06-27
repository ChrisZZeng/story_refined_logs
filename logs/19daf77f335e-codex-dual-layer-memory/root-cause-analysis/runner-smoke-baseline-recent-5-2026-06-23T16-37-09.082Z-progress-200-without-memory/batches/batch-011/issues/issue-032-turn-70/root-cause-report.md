# issue-32-turn-70 Root Cause Report

## Problem
- issueIndex: `32`
- turn: `70`
- issueValidity: `valid`
- summary: 第70轮选择“问卡琳娜那句话是什么意思”后，正文让卡琳娜解释较早的告白/说出口主题，而没有承接上一轮卡尔刚说的“你知道该怎么做，是另一码事”这一即时提醒。

## Validity
基本成立。turn-69 的可见结尾是卡尔给出新的提醒“不过这是一码事。你知道该怎么做，是另一码事”，随后出现“问卡琳娜那句话是什么意思”。在这个位置，玩家合理期待追问刚出现的提醒；turn-70 却把问题绑定到更早的“有些话不说/我今天说了”的告白主题。

玩家可见证据：turn-69 末尾卡尔说“你知道该怎么做，是另一码事”，卡琳娜对此有反应；下一步选项是“问卡琳娜那句话是什么意思”。turn-70 的回答为“有些话不说……对方可能永远都不会知道”“我今天说了”“就是那句话的意思”。

Caveats:
- “那句话”在该支线中是长期反复使用的主题词，且选项明确写“问卡琳娜”，所以也存在追问卡琳娜早先告白含义的可读空间；因此 confidence 不是 high。

## Context Assessment
问题发生前状态：卡尔刚评价卡琳娜的表达，说“我等了几年的话，让你一天就等到了”，并补充“你知道该怎么做，是另一码事”；卡琳娜在一旁听到后有微小反应。玩家随后选择询问“那句话”的意思。

Relevant facts:
- `present-clear` turn-69 的最近新信息是卡尔的提醒“你知道该怎么做，是另一码事”。 artifacts: `visible-timeline.jsonl:turn-69`, `turn-70/06a-director-prompt.md`；该句位于上一轮正文接近结尾，显著高于更早的告白主题。
- `present-ambiguous` 玩家选择/输入只写“那句话”，没有显式绑定到卡尔提醒或卡琳娜告白。 artifacts: `turn-69/04-output.json`, `turn-70/06a-director-prompt.md`；这是问题发生的歧义入口。
- `present-ambiguous` turn-69 Choice 输出为 generic actionId choice:ask_what_she_means，没有携带 antecedent。 artifacts: `turn-69/06-llm-calls.json call[2]`；actionId 只能表示“问她什么意思”，无法告诉下一轮 Director 应追问哪句话。
- `over-constraining` 长期 storyline 和 recentTurns 反复把“那句话”用于卡琳娜对卡尔的未说出口之话。 artifacts: `turn-70/03-story-state.json`, `turn-70/06a-director-prompt.md`；该主题比即时卡尔提醒更早，但在故事状态摘要中很显眼。
- `contradicted` Director 在 turn-70 将输入解释为“卡琳娜刚才对卡尔说的那句话”。 artifacts: `turn-70/06-llm-calls.json call[0]`, `turn-70/04-output.json`；这是链路中首次把歧义锁定到旧主题的 artifact。

Competing pressures:
- 即时上下文：卡尔刚给出一句新的、含义未解释的提醒
- 长期主题：卡琳娜未说出口的“那句话”贯穿多轮
- 选项文本面向卡琳娜而不是卡尔
- Choice actionId 未提供语义槽位，Director 需自行消歧

## Causal Chain
- firstDivergenceArtifact: `turn-70/06-llm-calls.json call[0] (Director plotPoint)，其 summary 将输入绑定为“卡琳娜刚才对卡尔说的那句话”。`
- triggeringPressure: turn-69 Choice 生成了“问卡琳娜那句话是什么意思”并绑定 generic actionId choice:ask_what_she_means；同时 story state 中“那句话=卡琳娜对卡尔的未说之话”长期高频出现。
- missingGuard: 选项/selected action handoff 没有保存当前指代对象（例如 Carl 的“你知道该怎么做”）；Director prompt 也没有规则要求代词短语优先绑定到上一轮结尾的最新未解释话语。
- mechanismStatement: Choice 把一个依赖即时语境的代词动作交给下一轮时没有携带 antecedent，Director 在长期 storyline 的“那句话”压力下自行消歧为旧告白主题，Narrator 随后完整执行该错误绑定，造成玩家可见承接偏移。
- directCause: Director 把玩家问题解释成追问卡琳娜对卡尔说出的那句“你对我很重要/有些话不说”的含义，而不是追问卡尔最新提醒的含义。
- propagation: Narrator 按 Director 安排让卡琳娜解释“有些话不说……对方可能永远都不会知道”，Choice 又继续提供情感回应/转向安排，未回到卡尔提醒。

Non-causes:
- 不是 Narrator 擅自改剧情：Narrator 遵循了 Director 已经错误绑定的 summary。
- 不是长期记忆缺失：问题来自旧主题过强，而不是旧主题不可用。
- 不是玩家输入完全无效：玩家确实选择了系统给出的追问选项，核心 intent 是追问“那句话”的含义。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: Choice 生成了依赖上一轮结尾语境的代词选项，却只交付 generic text/actionId，没有把“那句话”应指向的具体 utterance 作为 must-satisfy contract 传给 Director；在长期“那句话”主题的竞争压力下，Director 锁定了较早告白主题，导致本轮没有回应卡尔最新提醒。
- fixSurface: `Choice option schema 增加 antecedent/targetUtterance/targetSpeaker 字段`, `selected choice -> Director handoff 中保留上一轮结尾引用片段`, `Director 消歧规则：代词类选项优先检查最近未解释 utterance，并在歧义时保持提问而非替玩家指定旧主题`

## Evidence
- playerVisible: turn-69 结尾是卡尔“你知道该怎么做，是另一码事”；turn-70 没解释这句，而解释早先“有些话不说”。
- internalTrace: turn-69 Choice output 为“问卡琳娜那句话是什么意思”/choice:ask_what_she_means；turn-70 Director summary 首次写“卡琳娜刚才对卡尔说的那句话”，Narrator据此生成旧主题回答。

## Recommended Fix Area
修复 selected-choice 语义绑定：对“这句话/那句话/刚才那件事”等 deictic 选项保存引用目标，并要求 Director 不得丢弃该目标。

## Confidence
`medium`
