# Root Cause Report - issue-23 / turn 34

## Problem
turn 34 玩家选择“问她卡琳娜后来还说了什么”后，正文没有提供新的后续信息，而是再次完整演出 turn 32 已揭示的卡琳娜回来后沉默、坐壁炉前、没有复盘、问“你值不值得信任”、以前从没问过，构成可见重复场景。

## Validity
- issueValidity: `valid`
- verdictReason: 有效。turn 34 的正文与 turn 32 的关键事实序列高度重合，且没有把玩家追问推进到“除此之外没有更多”“她之后的反应”“卡尔的回答”等新信息；重复发生在玩家可见文本层。
- playerVisibleSupport: turn 32 已经说“她回来以后，没说话。在壁炉前面坐了很久”“以前她回来会跟我说每一句对白……今晚她没有”“她问我——你值不值得信任”“她以前从没问过我这个问题”。turn 34 又写“她回来以后，在壁炉前面坐了很长时间”“以前她回来，会跟我说每一句对白……今晚她一句都没有提”“她问我——你值不值得信任”“她以前从没问过我这个问题”。
- caveats: 玩家选择来自上一轮的重复风险选项，因此 turn 34 的直接输入确实要求询问“后来还说了什么”；系统仍应将其解释为额外追问或简短确认，而不是完整复演。

## Context Assessment
turn 34 前，玩家刚在 turn 33 追问敏特关联，卡尔只给出“你来新西西里，是因为她”。更早的 turn 32 已经揭示卡琳娜回屋后的核心后续，因此 turn 34 若响应“后来还说了什么”，应承认没有更多、追问卡尔如何回答、或提供新细节，而不应重述整段。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| turn 32 的揭示已消费。 | `present-clear` | `visible-timeline.jsonl`<br>`turn-34/06a-director-prompt.md`<br>`turn-34/06b-narrator-prompt.md` | Director 和 Narrator prompts 的最近几轮玩家经历都完整包含 turn 32 正文。 |
| turn 34 的玩家输入来自 turn 33 的重复风险选项。 | `present-clear` | `turn-33/04-output.json`<br>`turn-34/01-summary.json` | 输入文本是“问她卡琳娜后来还说了什么”，其语义未标明“除了刚才那件事之外”。 |
| Director 应避免把已消费内容重新设为 requiredContent。 | `absent` | `turn-34/06a-director-prompt.md`<br>`turn-34/06-llm-calls.json` | Director output 直接将“卡琳娜回来后在壁炉前坐了很久、没有复盘、最终问是否值得信任”列为 requiredContent。 |
| Narrator 需要基于 Director 骨架输出正文。 | `over-constraining` | `turn-34/06b-narrator-prompt.md`<br>`turn-34/06-llm-calls.json` | Narrator 被要求不得改变导演已确定的剧情方向，因此 Director 的重复 requiredContent 成为强约束。 |

Competing pressures:
- 玩家输入本身来自重复选项，给 Director 一个看似合理的追问目标。
- Director requiredContent 使用强制内容字段，比最近文本中的“已讲过”事实更靠近最终生成指令。
- 当前故事线仍处于卡尔/卡琳娜反思节点，鼓励慢铺和重复情绪铺陈。

## Causal Chain
- firstDivergenceArtifact: `turn-33/06-llm-calls.json call 2 (Choice output), propagated through turn-34/06-llm-calls.json call 0 (Director)`
- triggeringPressure: turn 33 的重复风险选项成为 turn 34 玩家输入；Director 在缺少“已消费揭示”约束的情况下，把该输入解释为重讲卡琳娜回来后发生的事。
- missingGuard: 缺少从 Choice 到 Director 的语义标记，无法区分“询问额外后续”与“重问刚刚已揭示内容”；也缺少 Director 层的 recent-answer dedupe。
- mechanismStatement: 重复选项被选中后，Director 没有检查该问题核心答案已在最近可见文本中完成，而是把已消费 reveal 写成本轮 requiredContent，Narrator 按强约束复演，导致玩家可见重复。
- directCause: turn-34 Director output 的 requiredContent 明确要求再次写卡琳娜坐壁炉前、未复盘、最终问帕兹是否值得信任。
- propagation: Narrator 依据 Director 的 requiredContent 输出重复正文；Choice 随后又给出“问她怎么回答/问表情”等后续选项，使重复分支继续占用局部推进。
- nonCauses: 不是隐藏设定造成的矛盾；仅凭玩家可见 turn 32 与 turn 34 即可确认重复。；不是缺少 turn 32 文本；turn 34 prompts 中能看到该文本，问题是没有把它转化为已消费约束。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: Choice 到 Director 的 handoff 只传递了自然语言选项文本，没有传递该选项是否引用已回答问题、是否应解释为“额外信息”或“换角度追问”的 must-satisfy contract；Director 因此把最近已消费 reveal 重新包装为 requiredContent，Narrator 被迫复演。
- fixSurface: `choice-to-director semantic contract`, `director recent-answer dedupe`, `consumed-reveal lifecycle state`

## Evidence
- playerVisible: turn 32 和 turn 34 对卡琳娜回屋后的同一组事实进行了近乎完整重复；turn 34 没有回答新的“后来还说了什么”。
- internalTrace: turn-34/06-llm-calls.json call 0 的 Director output 将重复内容列入 beats 和 requiredContent；turn-34/06b-narrator-prompt.md 要求 Narrator 不改变 Director 剧情方向；turn-34/06-llm-calls.json call 1 按该骨架输出重复正文。

## Recommended Fix Area
在 Director 前增加 recent-answer/repeated-question 检查：当玩家输入由系统选项触发且命中最近已回答内容时，Director 应改写为“她后来没有再说别的”或推进到未回答维度；同时让 Choice 输出携带 intent，例如 ask_additional_after_revealed_fact，而不是裸文本。

## Confidence
`high`
