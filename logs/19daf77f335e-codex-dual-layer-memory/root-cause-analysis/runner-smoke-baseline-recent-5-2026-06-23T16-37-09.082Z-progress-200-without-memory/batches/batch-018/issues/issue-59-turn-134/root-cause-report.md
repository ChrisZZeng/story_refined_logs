# Root Cause Report: issue-59-turn-134

## Problem
- issueIndex: 59
- turn: 134
- problemSummary: turn 134 的选项“检查一下相机刚才拍的那一帧效果如何”把底片相机刚拍照片包装成可立即查看的对象。

## Validity
- issueValidity: valid
- verdictReason: 该问题成立但严重度低。玩家可见信息已反复建立这是一台胶卷/底片相机，选项作为可点击行动却暗示可以检查刚拍一帧的成片效果。turn 135 对该选择做了补救解释，但不能消除 turn 134 选项本身的错误 affordance。
- playerVisibleSupport: turn 128 写“胶卷还在里面”；turn 134 正文写“机械快门帘”“过片扳手”“胶卷还剩大半卷”；同轮选项却写“检查一下相机刚才拍的那一帧效果如何”。
- caveats:
  - “效果如何”也可被宽泛理解为回想构图或确认机械状态；不过作为玩家选项，它通常表示可检查结果，因此仍是低严重度有效问题。
  - turn 135 后续正文正确说明底片不能即时查看，属于后续缓解而非 turn 134 选项无错。

## Context Assessment
- actualStateBeforeIssue: 主角在石阶上检查一台胶卷机械相机，按下一次快门，过片扳手推进到下一帧，计数器显示胶卷还剩大半卷，然后把相机挂回胸前继续等待。
- relevantFacts:
  - claim: 相机是胶卷/底片机械相机，不能像数码设备一样即时查看照片成片。
    availability: present-clear
    artifacts: visible-timeline.jsonl, turn-134/06c-choice-prompt.md, turn-128/04-output.json, turn-134/04-output.json
    notes: Choice prompt 最近经历与本轮正文都包含胶卷、机械快门、过片扳手、计数器等事实。
  - claim: Choice generator 被要求判断玩家“能合理做什么”。
    availability: present-clear
    artifacts: turn-134/06c-choice-prompt.md
    notes: 规则存在，但没有物品 affordance 校验或底片相机特例。
  - claim: 刚拍一帧是当前最显眼的新事件，容易被转换成后续选项。
    availability: present-clear
    artifacts: turn-134/04-output.json, turn-134/06c-choice-prompt.md
    notes: 本轮正文末端刚写快门、过片和胶卷剩余，Choice 阶段自然围绕相机生成选项。
  - claim: 没有结构化设备能力/不可选动作约束。
    availability: absent
    artifacts: turn-134/03-story-state.json, turn-134/06c-choice-prompt.md
    notes: Prompt 没有把“不能即时查看底片成片”转成硬性 option filter。
- competingPressures:
  - Choice 需要生成贴近当前处境的普通行动
  - 刚拍快门是本轮最新、最可延展的动作
  - 摄影/检查相机是主角核心特质
  - 缺少设备规则到选项 affordance 的显式映射

## Causal Chain
- firstDivergenceArtifact: turn-134/04-output.json choices（choiceGenerator output in turn-134/06-llm-calls.json）
- triggeringPressure: 本轮正文刚突出按快门、过片、胶卷计数，Choice generator 按“围绕最新可见事件生成后续行动”的启发式，把“刚拍一帧”转成“检查效果”。
- missingGuard: 没有设备 affordance validator 或 prompt 规则禁止生成与胶卷相机物理规则冲突的即时预览选项；“能合理做什么”只是通用要求。
- mechanismStatement: Choice 阶段把显著的相机事件直接转译成后续可点击动作，但缺少物品能力校验，因而生成了与底片相机规则不匹配的“检查刚拍效果”选项。
- directCause: choiceGenerator 输出第三个选项“检查一下相机刚才拍的那一帧效果如何”。
- propagation: 该选项成为 turn 135 的 selectedFromPreviousTurn；Narrator 在 turn 135 用“不能从取景器看到已经拍好的那一帧”修正了它，但玩家在 turn 134 已看到不合规则的选项。
- nonCauses:
  - 不是 Narrator 在 turn 134 写错设备规则；正文设备描写正确
  - 不是 long-term memory 缺失；胶卷事实在 Choice prompt 当前正文中
  - 不是玩家自由输入造成，选项由系统生成

## Root Cause
- label: choice-action-binding
- family: agent-system
- secondaryFamilies: []
- description: Choice 生成只把最新事件绑定成可点击动作，没有校验该动作是否被已建立的物品规则允许；底片相机的“不能即时查看成片”没有作为 option-level hard constraint 参与过滤。
- fixSurface:
  - Choice generator affordance validation
  - object/device capability schema
  - impossible-action option filter

## Evidence
- playerVisible: 胶卷、机械快门、过片扳手和剩余胶卷均为玩家可见事实；同轮选项却暗示即时检查刚拍效果。
- internalTrace: turn-134 Director/Narrator 都正确围绕胶卷相机写作；错误首次出现在 Choice output；turn-135 Narrator 后续补救说明底片特性。

## Recommended Fix Area
在 Choice 阶段引入 object affordance 约束：选项必须通过设备规则校验，尤其过滤“底片相机即时查看照片”这类不可行动作。

## Confidence
high
