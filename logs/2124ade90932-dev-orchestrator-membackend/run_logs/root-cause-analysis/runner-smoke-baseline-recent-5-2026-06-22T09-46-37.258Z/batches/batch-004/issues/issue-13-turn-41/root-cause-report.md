# Root Cause Report: issue-13-turn-41

## Problem

issueIndex=13, turn=41, severity=medium, type=unsupported-jump, scope=mixed。

turn 41 在玩家只看到门外男子初步露面并说“我需要你……帮我”“我女儿……”之后，正文和选项提前使用“德索洛”姓名，并把他与卡琳娜的疏远、家人关系和旧怨作为玩家可选择的已知判断。

## Validity

issueValidity: valid。

只看玩家可见文本，该问题成立。turn 39-40 只显示门外有一个拿信封的人影，脸仍在阴影中。turn 41 才显示他是年逾五十、穿白西装、为女儿求助的男人。没有任何可见信息建立他的姓名、他与卡琳娜是旧识、他曾疏远卡琳娜，或“家人”关系。

一个 caveat 是：“德索洛”这个名字在 turn 41 正文末尾已经被旁白突然写出，所以到 choices 出现时玩家视觉上已经见过该名字；但这本身也是未铺垫的可见泄露，仍不能支持选项里的旧怨和关系判断。主角可以凭经验看出急迫和求助，却不能凭空知道“当初疏远卡琳娜”或“疏远家人”。

## Context Assessment

问题发生前，玩家知道门外有一名拿信封的陌生人，卡琳娜似乎认识或预判他，但来者身份、姓名、与卡琳娜的历史关系都未被揭示。玩家选择等待对方先开口，所以合理下一步是听他说出请求、询问身份、观察卡琳娜反应，或者保持沉默。

相关事实：

- 来者是年逾五十、白西装、为女儿求助的男子：availability=present-clear。证据在 visible-timeline.jsonl turn 41、turn-41/04-output.json narrative 和 turn-41/06b-narrator-prompt.md Director output。
- 来者姓名是“德索洛”：availability=absent before target output; present-ambiguous inside target output。turn 41 之前没有可见姓名；turn 41 正文通过旁白“钉在德索洛身上”和 rawHtml speaker tag 暴露姓名，而非角色自我介绍或玩家识别。
- 德索洛曾疏远卡琳娜、不把她当家人，双方有旧怨：availability=absent player-visible; present-clear hidden storyline。证据在 turn-41/03-story-state.json currentStoryline.content 和 currentStoryline.interactionFollowup。
- Choice prompt 有“不要提前泄露玩家尚未看到的信息”的约束：availability=present-clear。证据在 turn-41/06c-choice-prompt.md system、判断流程和输出前再次确认。
- Choice prompt 顶部直接提供含隐藏关系的“主角可以”候选：availability=over-constraining。证据在 turn-41/06c-choice-prompt.md 当前情节边界参考。

## Causal Chain

firstDivergenceArtifact: turn-41/06c-choice-prompt.md。对姓名泄露而言，最早玩家可见偏离还出现在 turn-41/06b-narrator-prompt.md 之后的 Narrator output；对关系和旧怨选项而言，第一处错误包装是 06c-choice-prompt.md 将 hidden interactionFollowup 作为候选动作交给 choiceGenerator。

triggeringPressure: turn-41/03-story-state.json currentStoryline.interactionFollowup 以“主角可以”列出四个作者视角分支，其中包含“斥责德索洛的无仁无义”“走投无路才会想起卡琳娜”“疏远卡琳娜这个‘家人’”。06c-choice-prompt.md 又把这段放在靠前的“当前情节边界参考”，比后面的可见性警告更具体、更可复制。

missingGuard: 缺少 candidate action 的 visible-knowledge gate。系统没有把 author-facing storyline followup 标为 hidden/internal，也没有在 choiceGenerator 前强制逐项验证选项文本中的姓名、关系、动机和旧怨是否已由玩家可见文本支持。Narrator 侧也缺少 stable characterId 到 visible alias 的渲染 guard，导致“德索洛”姓名进入正文。

mechanismStatement: author-facing storyline followup 被直接拼入 player-facing choice prompt，且没有字段级可见性标注或自动改写层；choiceGenerator 在具体候选动作压力下复制了隐藏关系判断，Narrator 同时把内部角色 ID 当作可见姓名使用，最终把未揭示的姓名、关系和旧怨暴露给玩家。

propagation: choiceGenerator 输出了四个选项，其中 1、2、4 都依赖未揭示关系；turn-41/04-output.json choices 和 turn-41/07-events.json worker-done choiceGenerator 完整记录该输出。visible-timeline.jsonl turn 41 收录这些 choices。turn 42 玩家选择第 4 个选项后，后续叙事被锁定到“德索洛作为父亲”“疏远家人”等隐藏关系线上。

nonCauses:

- 不是 meta-memory 缺失；系统知道正确背景，问题是隐藏背景被过早暴露。
- 不是单纯 llm-self；prompt 中有非常具体的隐藏候选动作，模型复制这些动作是被系统压力诱导的。
- 不是玩家输入导致；玩家只是等待对方先开口。
- Director 对本轮正文有“不要进行卡琳娜的数落或回应”的约束，正文主体没有展开旧怨；错误主要发生在可见姓名渲染和 choices 生成阶段。

## Root Cause

rootCause.label: visible-knowledge-gating。

family: agent-system。secondaryFamilies: []。

系统把 story state 中的 author-facing hidden followup 和稳定角色 ID 直接暴露给 player-facing Narrator/Choice 表面，却没有强制按玩家可见知识过滤或改写。具体触发压力是 currentStoryline.interactionFollowup 中含隐藏关系的“主角可以”候选；缺失防线是候选动作和实体姓名的 visibility gate；失败运动是 choiceGenerator 将这些候选改写成可点击选项，Narrator 也把内部姓名写入正文。

## Evidence

玩家可见证据：turn 39-40 visibleText 只显示门外人影、信封、遮在阴影里的脸；turn 41 visibleText 显示白西装男子说“我需要你……帮我”和“我女儿……他们把她——”，没有说明姓名和旧关系。turn 41 choices 却给出“斥责德索洛当初疏远卡琳娜”“走投无路才想起家人”“疏远‘家人’的矛盾”。

内部链路证据：turn-41/03-story-state.json currentStoryline.content 和 interactionFollowup 明确包含德索洛与卡琳娜旧识、疏远和家人关系；turn-41/06c-choice-prompt.md 顶部把这段作为“当前情节边界参考”提供，同时也包含“不要提前泄露”的通用规则；turn-41/07-events.json worker-done choiceGenerator 和 turn-41/04-output.json choices 记录最终选项；turn-41/05-runtime-after.json 进入 2-03 beat，说明该节点继续推进并可被 turn 42 的选项锁定。

## Recommended Fix Area

优先修复 Choice candidate visibility gating 和 story state followup schema；同时补 Narrator 的未揭示角色 ID 渲染保护。具体包括把 currentStoryline.interactionFollowup 拆成 internal candidate 与 playerVisibleCandidate、给候选增加 revealPrerequisites，以及在 choiceGenerator 前做 visibleText support check。

## Confidence

confidence: high。
