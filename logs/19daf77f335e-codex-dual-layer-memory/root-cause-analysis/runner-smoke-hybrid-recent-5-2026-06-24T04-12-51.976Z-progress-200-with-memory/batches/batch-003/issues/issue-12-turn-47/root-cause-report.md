# Root Cause Report - issue-12 turn 47

## Problem
turn 47 的一个选项写成“她侧过头，沉默地注视着那行褪色的小字，没有开口。”，既把早前笔记本线索拉回当前场景焦点，又把玩家选项写成第三人称 NPC 行动。

## Validity
- issueValidity: `valid`
- verdictReason: 该问题由玩家可见 choices 直接成立。当前正文刚围绕卡琳娜回答“刚来的时候最难的是什么”，焦点是空房间、搪瓷杯、地板光线和黑猫；选项应是玩家下一步可主动采取的行动。该选项的主语是“她”，描述卡琳娜沉默动作，玩家无法选择让卡琳娜这么做。
- playerVisibleSupport: turn 47 visibleText 结束于卡琳娜总结“空有空的用处”；choices 中却出现“她侧过头，沉默地注视着那行褪色的小字，没有开口”。“那行褪色的小字”来自 turn 42-44 的笔记本调查。
- caveats:
- 玩家仍在同一房间，回到笔记本并非绝对不可能；真正的硬伤是选项语义不是玩家行动，并且没有把回到笔记本写成玩家可执行动作。

## Context Assessment
- actualStateBeforeIssue: 卡琳娜刚回答自己初来此地最难的是“空”，并进一步说空房间能让她听见自己往哪里走；玩家手中仍有搪瓷杯，黑猫坐在卡琳娜脚边。当前可选行动应围绕追问方向感、回应她的孤独、询问黑猫或饮茶等玩家动作。
- relevantFacts:
- `present-clear` 当前正文结尾的焦点是卡琳娜关于“空”的回答、搪瓷杯、地板光线和黑猫。
  artifacts: `turn-47/04-output.json`, `turn-47/06c-choice-prompt.md`
  notes: choice prompt 的“本轮玩家已经看到的正文”把当前结尾完整放在输出前。
- `stale` 笔记本小字是 turn 42-44 的早前调查焦点，当前轮没有继续操作笔记本。
  artifacts: `visible-timeline.jsonl`, `turn-47/06c-choice-prompt.md`
  notes: choice prompt 的最近几轮仍包含多处“那行褪色的小字”，但该线索已被后续泡茶和居住时间对话覆盖。
- `present-clear` 选项必须是玩家下一步可以主动选择的行动，并站在玩家视角。
  artifacts: `turn-47/06c-choice-prompt.md`
  notes: prompt 开头和输出前再次确认都写明“只生成玩家下一步可以主动选择的行动”“选项必须站在玩家视角”。
- `present-clear` 本轮没有 candidateActions 可供绑定，Choice 需要生成普通行动。
  artifacts: `turn-47/03-story-state.json`
  notes: candidateActions 为 null，增加了模型从长 recent context 中自行抽取可选方向的压力。
- competingPressures:
- 最近上下文保留了多处“那行褪色的小字”和笔记本情绪线索。
- 当前轮没有状态机候选动作，Choice 必须自行从上下文生成普通行动。
- 情感铺垫氛围鼓励安静、沉默、注视等散文化动作，容易滑成正文续写而非玩家操作。

## Causal Chain
- firstDivergenceArtifact: `turn-47/06-llm-calls.json[2].object.options[1] / turn-47/04-output.json.choices`
- triggeringPressure: Choice prompt 同时包含当前正文和较长 recentTurns，其中 turn 42-44 的“那行褪色的小字”多次出现；没有候选动作时，模型从旧线索和安静氛围中抽取了一个散文化动作。
- missingGuard: choice schema 只有 text，没有 actor/actionType/groundingTurn 字段；后处理也没有拒绝第三人称 NPC 主语、非玩家可控动作或 stale-focus 引用。
- directCause: Choice generator 生成了以“她”为主语的正文续写式选项，而不是以玩家为主体的下一步行动。
- mechanismStatement: 当 Choice 只能输出自由文本选项且缺少玩家动作绑定校验时，长 recent context 中的旧线索和正文式语言会被误转成可点击选项，导致选项既脱离当前结尾焦点，又把 NPC 行为当成玩家选择。
- propagation: 该错误进入 turn-47 visible choices；如果玩家点击，会把交互语义锁到一个玩家无法直接执行的卡琳娜动作上。
- nonCauses:
- Narrator 的 turn 47 正文没有把笔记本重新带回焦点。
- 不是 story state 缺少当前正文；choice prompt 明确包含了当前结尾。
- 不是 actionId 绑定错误；该选项没有 actionId，问题在自由文本选项语义。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: Choice 生成链路缺少可执行主体绑定和当前焦点校验；在无 candidateActions 且 recent context 保留旧笔记本线索的压力下，模型把旧线索和 NPC 沉默动作写成可点击选项，而系统没有 schema/validator 阻止第三人称 NPC 行动进入 choices。
- fixSurface: `choice-generator-schema`, `choice-post-validator/player-action-subject-check`, `choice-prompt/current-focus-prioritization`, `stale-context-filter-for-choices`

## Evidence
- playerVisible: turn 47 choices 中第二项为“她侧过头，沉默地注视着那行褪色的小字，没有开口。”；这不是玩家主动行动，且小字来自 turn 42-44。
- internalTrace: turn-47/06c-choice-prompt.md 明确要求玩家视角行动，但也保留了 turn 42-44 的小字文本；turn-47/03-story-state.json candidateActions 为 null；turn-47/06-llm-calls.json[2].object.options[1] 首次生成该错误选项。

## Recommended Fix Area
给 Choice 输出增加 actor/actionType/groundingTurn 或类似结构化校验；拒绝以 NPC 第三人称开头、不可由玩家主动执行、或引用非当前焦点且无玩家动作包装的选项。

## Confidence
`high`
