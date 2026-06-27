# issue-026-turn-80 root cause report

## Problem
- turn: 80
- issueValidity: valid
- problemSummary: turn 80 在玩家选择上一轮系统给出的“白鸽传闻”后，把它写成卡琳娜能识别的既有宴会传闻，扩大了 turn 79 未铺垫选项造成的上下文跳跃。

## Validity
- verdictReason: 该问题有效。虽然 turn 80 的 playerInput 来自上一轮可见选项，但该选项本身缺乏可见铺垫；正文继续说“你是说宴会上那个传闻”“白鸽在宴会上有很多名字”，把未证实选项固定为世界内事实。
- playerVisibleSupport: turn 79 首次出现“聊聊宴会上那个关于‘白鸽’的传闻”；turn 80 visibleText 随即让卡琳娜识别为“宴会上那个传闻”，并补出“某个人/某批货/康纳准备在庆典上放出来的消息”。
- caveats:
  - 如果玩家自己自由输入一个未知传闻，系统可以让角色质疑或澄清；但这里是系统选项先引入，后续又没有任何可见纠偏。

## Context Assessment
- actualStateBeforeIssue: turn 80 开始时，玩家唯一知道的“白鸽”来源是 turn 79 的系统选项；在此之前可见剧情没有解释它是什么，也没有让卡琳娜或其他角色提过这个词。
- relevantFacts:
  - claim: 当前 playerInput 是“聊聊宴会上那个关于‘白鸽’的传闻”。
    availability: present-clear
    artifacts: `turn-80/06a-director-prompt.md`, `turn-80/06b-narrator-prompt.md`
    notes: 该输入被以普通玩家输入形式交给 Director/Narrator，没有标明它来自上一轮 Choice 生成且缺少来源。
  - claim: turn 80 prompt 的 recentTurns 没有为“白鸽”提供可见上下文。
    availability: absent
    artifacts: `turn-80/06a-director-prompt.md`, `visible-timeline.jsonl`
    notes: recentTurns 主要是姜片茶、休息、室内聊天；“白鸽”只在当前玩家输入中出现。
  - claim: Director 将该输入解释为可回答的既有传闻。
    availability: present-clear
    artifacts: `turn-80/04-output.json`, `turn-80/06b-narrator-prompt.md`
    notes: Director summary/requiredContent 写入“卡琳娜回应白鸽传闻”“不揭示白鸽传闻的具体背景”。
  - claim: 系统缺少对 selected choice 的来源校验和降级策略。
    availability: absent
    artifacts: `turn-80/06a-director-prompt.md`, `turn-80/06-llm-calls.json`
    notes: 没有提示 Director：若当前输入来自模型选项且含未见专名，应改写为澄清或泛化话题。
- competingPressures:
  - 玩家选择必须被尊重
  - 当前故事线要求围绕宴会看法推进
  - 卡琳娜在高信任阶段可以模糊回答但不揭密
  - 上一轮 Choice 输出已把未见线索包装成可点动作

## Causal Chain
- firstDivergenceArtifact: `turn-79/04-output.json choices; turn-80/06a-director-prompt.md assistant output`
- triggeringPressure: turn 80 Director 收到的当前 playerInput 已经包含“白鸽传闻”，且没有携带“这是系统生成选项/未验证线索”的 provenance；为了响应玩家探索，它把该输入当作已成立的宴会话题。
- missingGuard: 缺少 Choice-to-Director 的 action binding 校验：选项文本中的新事实在进入下一轮时没有被验证、标注或降级，Director 也没有被要求识别“玩家可见但未铺垫”的系统选项。
- mechanismStatement: 未 grounded 的 Choice 选项被原样绑定为高优先级 playerInput，Director/Narrator 缺少来源校验，于是把“白鸽”从一个未铺垫按钮升级为卡琳娜承认的世界内传闻。
- directCause: Director 在 turn 80 写入“卡琳娜回应白鸽传闻”“不揭示白鸽传闻的具体背景”，Narrator 进一步扩写为“有人说是某个人/某批货/康纳准备放出的消息”。
- propagation: turn 80 visibleText 把“白鸽”固化为宴会相关传闻；turn 80 writes 更新 currentStoryline summary，后续 story state 继续记录该传闻。
- nonCauses:
  - 问题不是玩家自由探索越界；玩家只是点击了系统提供的选项。
  - 不是卡琳娜角色设定本身必然要知道白鸽；卡琳娜的识别来自本轮 Director/Narrator 的承接。

## Root Cause
- label: choice-action-binding
- family: agent-system
- secondaryFamilies: ["recent-context"]
- description: 触发压力是 turn 79 未 grounded 选项被 turn 80 当作普通 playerInput；缺失防线是 choice provenance 与新事实校验没有传到 Director；失败运动是系统把模型生成的未铺垫线索绑定成玩家意图并让角色承认其为既有传闻。
- fixSurface:
  - 选项对象增加 groundedFacts/sourceTurns，并在选择回放时传给 Director
  - Director prompt 增加 selectedChoiceProvenance：模型生成选项若含未见事实，必须澄清、泛化或拒绝固化
  - runtime 后处理在 playerInputSource=choice 时检查新专名是否已在 visible timeline 中出现

## Evidence
- playerVisible: turn 79 choices 首次引入“白鸽传闻”；turn 80 visibleText 写“你是说宴会上那个传闻”“白鸽在宴会上有很多名字”。
- internalTrace: turn-80/06a-director-prompt.md 的当前玩家输入就是该选项文本；turn-80/04-output.json 的 Director summary、requiredContent 和 Narrator narrative 都把它当成可回答话题。

## Recommended Fix Area
优先修复 Choice-to-Director handoff 与 selected choice provenance，避免模型生成选项在下一轮未经验证地成为 canon。

## Confidence
high
