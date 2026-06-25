# issue-025-turn-79 root cause report

## Problem
- turn: 79
- issueValidity: valid
- problemSummary: turn 79 的可点击选项把“宴会上那个关于‘白鸽’的传闻”写成玩家已知话题，但此前玩家可见内容没有铺垫“白鸽”或相关传闻。

## Validity
- verdictReason: 该问题有效。玩家刚看完的正文只建立了室内暖光、空杯、是否休息和继续聊天的开放场面；选项突然给出带专名的宴会传闻，超出了玩家可见知识边界。
- playerVisibleSupport: visible-timeline.jsonl 中“白鸽/鸽”只出现在 turn 79 选项和 turn 80 后续文本；turn 78 仍是室内喝完姜片茶的安静状态，turn 79 正文仅让卡琳娜表示“我还不困”“如果你想再聊聊，我也在这儿”。
- caveats:
  - 玩家知道此前有宴会，但不知道有名为“白鸽”的传闻；问题不在于能否聊宴会，而在于选项把未铺垫专名写成既有线索。

## Context Assessment
- actualStateBeforeIssue: turn 78-79 玩家处在卡琳娜的室内居所，喝完茶后询问是否该休息；卡琳娜回应不困，允许继续聊天或玩家自己拿毯子休息。
- relevantFacts:
  - claim: 玩家可见上下文没有建立“白鸽”或“白鸽传闻”。
    availability: absent
    artifacts: `visible-timeline.jsonl`, `turn-79/trace.md`
    notes: 全可见时间线检索显示“白鸽/鸽”首次出现在 turn 79 选项。
  - claim: 当前可操作处境是室内继续聊天、休息或拿毯子。
    availability: present-clear
    artifacts: `turn-79/04-output.json`, `turn-79/06c-choice-prompt.md`
    notes: 本轮正文结尾明确卡琳娜在室内等玩家回答，没有提出具体宴会线索。
  - claim: Choice prompt 要求以本轮正文结尾为准，不要泄露玩家尚未看到的信息。
    availability: present-clear
    artifacts: `turn-79/06c-choice-prompt.md`
    notes: 该约束存在，但没有要求每个新专名绑定玩家可见来源，也没有输出 provenance 字段。
  - claim: 当前故事线仍要求围绕宴会看法展开讨论并保持悬疑感。
    availability: over-constraining
    artifacts: `turn-79/06c-choice-prompt.md`, `turn-79/03-story-state.json`
    notes: 这给选项生成器一个“宴会话题/悬疑问题”的方向，但没有具体可见线索可供专名化。
- competingPressures:
  - 正文结尾的开放聊天选项
  - storyline 对宴会看法讨论的持续压力
  - 悬疑文风要求“知道更多但问题更多”
  - Choice worker 需要生成 2-4 个具体可点击动作

## Causal Chain
- firstDivergenceArtifact: `turn-79/04-output.json choices`
- triggeringPressure: Choice worker 在没有明确候选动作时，需要把“如果你想再聊聊”转化成具体话题；prompt 中又保留了“围绕宴会看法”与悬疑层次要求。
- missingGuard: 缺少“新专名/新传闻必须在本轮正文、recentTurns 或已显式可见记忆中出现”的硬校验；没有让 Choice 输出 option 的 visibleSource，无法阻止模型把泛化的宴会悬疑压缩成未铺垫专名。
- mechanismStatement: 在开放聊天场景中，Choice prompt 给了宴会与悬疑方向，却没有专名来源校验，模型把泛泛的“宴会话题”具体化成未出现的“白鸽传闻”，从而把无来源线索放进玩家可点击选项。
- directCause: Choice 输出了“聊聊宴会上那个关于‘白鸽’的传闻”这一未被玩家看见过的选项。
- propagation: 该选项进入 turn 79 玩家可见 choices，并成为 turn 80 可被选择的 playerInput。
- nonCauses:
  - turn 79 Director/Narrator 正文没有生成“白鸽”，正文自身保持室内场景一致。
  - 这不是长期记忆遗忘；相反，是在可见上下文缺少该事实时引入了新事实。

## Root Cause
- label: unsupported-detail-inference
- family: agent-system
- secondaryFamilies: ["llm-self"]
- description: 触发压力是 Choice worker 要把开放聊天变成具体宴会话题，且 prompt 中有宴会讨论和悬疑要求；缺失防线是没有对新专名、新传闻做玩家可见来源校验；失败运动是模型将普通宴会话题推断成“白鸽”这个具体传闻并直接暴露给玩家。
- fixSurface:
  - Choice prompt 增加 visible-grounding gate：新专名/传闻/物件必须引用本轮正文或 recentTurns 中的原文来源
  - Choice schema 增加 sourceTurn/sourceText 或 groundedFactId，缺失来源时降级为泛称如“聊聊宴会上的事”
  - 选项后处理增加未见专名检测，拦截不在玩家可见词表中的 clue-like noun

## Evidence
- playerVisible: turn 79 visible choices 含“聊聊宴会上那个关于‘白鸽’的传闻”；turn 78-79 正文只涉及姜片茶、休息、继续聊天、毯子和室内暖光。
- internalTrace: turn-79/06c-choice-prompt.md 明确要求以正文结尾为准且不泄露未见信息，但同时保留宴会讨论约束；turn-79/04-output.json 中只有 choices 首次出现“白鸽”。

## Recommended Fix Area
优先修复 Choice worker 的选项 grounding contract 与后处理校验，而不是修改 Narrator 文风。

## Confidence
high
