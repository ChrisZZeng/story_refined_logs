# Root Cause Report: issue-11-turn-37
## Problem
- issueIndex: 11
- turn: 37
- type: quality-regression
- severity: low
- problemSummary: turn-37 的选项从简短可执行动作漂移成长句式元叙事意图，如“她问我有什么值得去的理由——也许我想先知道……”。

## Validity
- issueValidity: valid
- verdictReason: 该问题成立但严重度低。玩家仍能理解大致方向，但选项显著长于相邻轮次，且以“她问我/也许我/轮到我”描述内心和叙事位置，而不是直接可点击动作。
- playerVisibleSupport: turn-36 选项是“表达自己对这场宴会的疑虑”“反问她对宴会有什么看法”“直接评价：‘一场正式的试探’”等清晰动作；turn-37 选项变为“她问我有什么值得去的理由——也许我想先知道她是怎么看待这场交易的实际价值的”等长句。
- caveats: 这些选项并非不可理解，也没有直接破坏剧情事实；问题是格式稳定性和互动清晰度下降。

## Context Assessment
- actualStateBeforeIssue: turn-37 正文结尾是卡琳娜反问玩家“你觉得那场晚宴有什么值得我去的理由？”，此时玩家合理动作应是回答、追问交易价值、坦白动机、表达实用看法等。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 选项应短、具体、可点击、像玩家主动行动。 | `present-clear` | turn-37/06c-choice-prompt.md system/user | choice prompt 开头和输出要求都强调短、具体、不要长段心理独白。 |
| 当前可见问题本身偏抽象，容易诱发观点/意图型选项。 | `present-clear` | turn-37/04-output.json<br>visible-timeline.jsonl turn-37 | 正文结尾是“你觉得那场晚宴有什么值得我去的理由？”，需要把抽象回答压缩成行动选项。 |
| 本轮没有可供复制的明确 candidate action 列表。 | `absent` | turn-37/06c-choice-prompt.md<br>turn-37/02-script-state.json | prompt 只描述判断流程和当前处境；script-state 中也未出现 choice/action candidate。 |
| 输出 schema 没有长度、动词开头、禁用“也许/轮到我/她问我”的硬校验。 | `absent` | turn-37/06c-choice-prompt.md 输出要求<br>turn-37/04-output.json choices | 提示是自然语言要求，不是可执行 validator。 |
| Choice 还生成了未在 prompt 中给出的 actionId。 | `present-clear` | turn-37/06-llm-calls.json call[2].object | 内部 object 含 `choice:ask_about_deal`、`choice:confess_other_motive`、`choice:share_own_view`，但可见 timeline 只保留 text。 |

- competingPressures:
  - 正文最后的问题是抽象价值判断，不是物理行动。
  - 当前 storyline 要“围绕卡琳娜询问玩家对宴会的看法展开讨论”，推动观点型选择。
  - choice prompt 虽要求短选项，但缺少硬长度和格式校验。
  - 没有候选动作列表可直接锚定，模型需要自行从对话中抽象选项。

## Causal Chain
- firstDivergenceArtifact: turn-37/06-llm-calls.json call[2].object（Choice generator output）
- triggeringPressure: Choice generator 面对抽象的“有什么值得去的理由”结尾和“宴会看法讨论”约束，把玩家下一步写成完整意图说明，而不是压缩为“追问交易价值/坦白另有目的/说出看法”等动作。
- missingGuard: 选项生成 contract 没有结构化字段或后处理来强制短动作格式、最大长度、动词开头、禁止元叙事短语；缺少候选动作锚点时也没有 fallback 模板。
- mechanismStatement: 抽象对话结尾缺少可执行 action binding，Choice generator 在无候选动作锚点和无长度 validator 的情况下把叙事意图原样展开成长选项，导致可见 choices 漂移成元叙事说明。
- directCause: Choice generator 直接输出四个长文本选项，其中前三个以“她问我/她向我坦白”开头并夹带“也许我/轮到我”等叙事意图。
- propagation: turn-37/04-output.json 写入这些 choices；visible-timeline.jsonl turn-37 对玩家展示同样文本；turn-38 选择第三项后，玩家输入也继承了元叙事句式。
- nonCauses:
  - 不是 Narrator 正文质量问题：turn-37 正文能自然承接玩家反问。
  - 不是隐藏剧情泄露：选项内容没有明显泄露未见事实。
  - 不是记忆缺失：相邻轮次上下文足以生成简短动作。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `llm-self`
- description: 触发压力是抽象观点型对话和 storyline 对“宴会看法讨论”的强调；缺失防线是 Choice contract 没有把抽象意图绑定成简短行动，也没有长度/格式 validator；失败运动是模型把“为什么值得去”的思考链条写进选项文本。
- fixSurface:
  - Choice generator schema：增加 `intent` 与 `displayText` 分离，displayText 设置最大长度和动词/发问模板。
  - Choice prompt：当结尾是抽象提问时使用固定 fallback：“回答…/追问…/坦白…/转移话题…”。
  - Choice post-validator：拒绝含“也许我”“轮到我”“她问我”等元叙事短语或超过阈值的选项，并重试。
  - actionId validator：禁止生成未由候选动作源提供的 `choice:*`。

## Evidence
- playerVisible: turn-37 choices 包括“她问我有什么值得去的理由——也许我想先知道她是怎么看待这场交易的实际价值的”“她向我坦白了感受——轮到我说出我眼中的那个晚宴是什么”。
- internalTrace: turn-37 choice prompt 明确要求“选项要短、具体、可点击”以及“不要替玩家做长段心理独白”，但 output object 仍生成长句，并包含未见候选来源的 actionId。

## Recommended Fix Area
修复 Choice 生成 schema、fallback 模板和 post-validation；把抽象讨论选项压缩为可执行玩家动作，并验证 actionId 来源。

## Confidence
medium
