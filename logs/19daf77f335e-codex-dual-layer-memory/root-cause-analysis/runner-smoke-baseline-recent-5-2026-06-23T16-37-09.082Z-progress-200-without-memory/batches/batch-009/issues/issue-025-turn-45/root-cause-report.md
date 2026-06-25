# Root Cause Report - issue-25 / turn 45

## Problem
turn 45 让卡琳娜说卡尔“从来不用‘原来的你’或者‘本来的你’这种说法”且“只会说‘你今天在想什么’”，与 turn 44 刚刚建立的卡尔惯常表达“你本来就没有变过。你只是需要记住它。”以及“她总是这样说”发生轻微但直接的连续性摇摆。

## Validity
- issueValidity: `valid`
- verdictReason: 有效。turn 44 不只是一次转述，而是说卡尔“总是这样说”；turn 45 下一轮又用“从来不用/只会说”改写她的惯常措辞。虽然“本来的样子”和“本来的你”存在细微措辞差异，但“只会说‘你今天在想什么’”排除了 turn 44 的刚揭示惯用句。
- playerVisibleSupport: turn 44 可见正文：“卡尔不会用‘本来的样子’这种说法。她会说——‘你本来就没有变过。你只是需要记住它。’……她总是这样说。”turn 45 可见正文：“她从来不用‘原来的你’或者‘本来的你’这种说法。她只会说‘你今天在想什么’”。
- caveats: 如果只比较“本来的样子”与“本来的你”，可以勉强解释为卡琳娜在区分不同说法；但“只会说”与 turn 44 的“总是这样说”不可同时成立。

## Context Assessment
turn 45 前，玩家刚问卡琳娜卡尔会如何回答“本来的样子”问题。卡琳娜以一种亲近、信任的语气给出卡尔的固定式回答，并强调她总是这样说。turn 45 玩家顺着该信息说“在卡尔眼里大概一直没变”，系统应延续这条惯常表达，最多补充解释，而不是替换成另一个排他性惯用句。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 卡尔的刚揭示惯常表达是“你本来就没有变过。你只是需要记住它。” | `present-clear` | `visible-timeline.jsonl`<br>`turn-45/06a-director-prompt.md`<br>`turn-45/06b-narrator-prompt.md`<br>`turn-45/03-story-state.json` | turn 45 prompts 的最近几轮经历包含 turn 44 原文，且在 prompt 尾部很近的位置出现。 |
| turn 44 同时说明卡尔不说的是“本来的样子”这种抽象说法。 | `present-clear` | `turn-44/04-output.json`<br>`turn-45/06b-narrator-prompt.md` | 这可允许卡尔不用某个概念化表述，但不允许否认刚给出的“你本来就没有变过”惯用句。 |
| Director 对 turn 45 只要求承认卡尔确实这样看待她，没有要求改写具体台词。 | `present-ambiguous` | `turn-45/06-llm-calls.json` | Director output 概括为“卡琳娜可能会承认卡尔的确这样看待她”，没有把 turn 44 quote 设为 must-preserve requiredContent。 |
| Narrator 应避免“从来/只会”这类排他性断言与最近一轮冲突。 | `absent` | `turn-45/06b-narrator-prompt.md` | 写作一致性有通用要求，但没有针对刚出现的 quoted habitual wording 做硬校验。 |

Competing pressures:
- 玩家选择的措辞“在她眼里大概一直没变”鼓励 Narrator 概括卡尔的看法。
- turn 44 有“卡尔不会用‘本来的样子’这种说法”，可能被模型过度泛化成卡尔不用任何“本来/原来”措辞。
- Director handoff偏概念化，没有把上一轮原句作为固定台词传给 Narrator。

## Causal Chain
- firstDivergenceArtifact: `turn-45/06-llm-calls.json call 1 (Narrator output) / turn-45/04-output.json narrative`
- triggeringPressure: Narrator 需要把“卡尔眼里没有变过”的概念继续写成自然对白；prompt 中同时有“卡尔不会用‘本来的样子’这种说法”和上一轮固定句，模型抓住前者并创造了一个新的排他性习惯说法。
- missingGuard: 没有把上一轮 quoted habitual wording 标为 exact quote / must-preserve fact，也没有对“从来/只会”排他断言做最近上下文校验。
- mechanismStatement: 在精确惯用句只作为最近长文本存在、Director 又只交付概念性目标时，Narrator 将“不会用本来的样子”过度概括成“从来不用原来的你/本来的你，只会说今天在想什么”，从而替换了上一轮刚声明的固定表达。
- directCause: Narrator 本轮生成的卡琳娜对白引入了新的“只会说‘你今天在想什么’”排他性说法。
- propagation: 错误出现在 turn 45 可见文本中，并可能影响后续玩家选择“继续问卡尔的事”的理解；turn 46 开始沿卡尔来历继续推进，没有立即纠正该措辞冲突。
- nonCauses: 不是长期记忆丢失；冲突事实就在上一轮并仍在 turn 45 prompt 中。；不是 Choice action binding；玩家选择合理延续了 turn 44 内容。；不是 Director 明确要求替换台词；替换发生在 Narrator 写作阶段。

## Root Cause
- label: `model-local`
- family: `llm-self`
- secondaryFamilies: `agent-system`
- description: Narrator 在清晰可见的上一轮上下文下发生局部过度概括，把“卡尔不用‘本来的样子’这种说法”扩展为排他性新惯用句，并忽略了同一上下文中“她总是这样说”的原句；系统缺少 exact-quote preservation guard 使该本地生成滑移未被拦截。
- fixSurface: `narrator exact-quote preservation instruction`, `recent quoted-fact validator`, `exclusive-claim consistency check`

## Evidence
- playerVisible: turn 44 刚把“你本来就没有变过。你只是需要记住它。”标成卡尔总是说的话；turn 45 立即改为“从来不用……只会说‘你今天在想什么’”。
- internalTrace: turn-45/06b-narrator-prompt.md 包含 turn 44 原文；turn-45/06-llm-calls.json call 0 Director output 只要求承认卡尔这样看待她，没有要求更改原句；call 1 Narrator 自行生成排他性新表述。

## Recommended Fix Area
给 Narrator 增加“上一轮直接引语/惯常说法必须逐字保持或显式作为补充而非替代”的约束，并在输出后扫描“从来/只会/总是”等排他词是否与 recentTurns 中的 quoted facts 冲突。

## Confidence
`medium`
