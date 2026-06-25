# Root Cause Report: issue-18-turn-49

## Problem
- issueId: `issue-18-turn-49`
- turn: `49`
- issueValidity: `valid`
- problemSummary: 第 49 轮中，卡琳娜刚说完“但只有叫她卡尔的时候，她会眨一下眼睛”，下一句却写成“你说完这句话的时候”，把 NPC 的话短暂归因给玩家。

## Validity
- verdict: `valid`
- verdictReason: 玩家本轮只问了“她叫什么名字？”。后续关于卡尔名字来源和眨眼反应的解释由卡琳娜连续说出，rawHtml 中目标前一句也带有 data-speaker="卡琳娜"。因此“你说完这句话”不是合理的叙述省略，而是说话主体漂移。
- playerVisibleSupport: visible-timeline.jsonl 第 49 轮：玩家说“她叫什么名字？”后，卡琳娜回答“她叫卡尔”、讲述命名经过，并说“但只有叫她卡尔的时候，她会眨一下眼睛”；紧接着正文写“你说完这句话的时候”。
- caveats:
- 该错误持续时间短，后文又回到卡琳娜与卡尔互动，因此严重度低。
- 虽然前文有玩家发问，但“这句话”紧邻的是卡琳娜的台词，不能合理指向玩家最初的问题。

## Context Assessment
- actualStateBeforeIssue: 第 49 轮开始时，玩家低头看黑猫并轻声问卡琳娜它的名字。卡琳娜回答黑猫叫卡尔，继续讲述自己第一年遇到黑猫和随口取名的故事。到出错句前，连续说话者仍是卡琳娜，玩家没有插入新的台词。
- relevantFacts:
- `present-clear` 玩家本轮的核心行动/台词只有询问黑猫名字。
  - artifacts: `visible-timeline.jsonl`, `turn-49/06b-narrator-prompt.md`
  - notes: Director requiredContent 也明确“主角低头看向黑猫，轻声问卡琳娜它的名字”。
- `present-clear` 卡琳娜是名字解释和“只有叫她卡尔时会眨眼”这句台词的说话者。
  - artifacts: `turn-49/04-output.json`, `turn-49/06b-narrator-prompt.md`
  - notes: turn-49/04-output.json 的 rawHtml 中，目标前一句是 <p data-speaker="卡琳娜" data-to="帕兹">，而后一叙述却写“你说完这句话”。
- `present-clear` Narrator 输出协议要求角色对白使用 data-speaker/data-to，理论上可以提供 speaker stack。
  - artifacts: `turn-49/06b-narrator-prompt.md`
  - notes: prompt 明确写“角色对白必须使用 <p data-speaker=...>”，但实际输出中仍混入未打 speaker 的引号段落，削弱了局部说话者栈。
- `absent` 生成链路没有对“你说完这句话”这类归因短语做局部 speaker consistency 校验。
  - artifacts: `turn-49/04-output.json`, `turn-49/07-events.json`
  - notes: 错误进入 visibleText 和后续 choice prompt，说明没有在渲染前被自动纠正。
- competingPressures:
- 正文采用第二人称叙述，Narrator 常用“你说完/你听见自己的声音”等模板承接玩家台词。
- 本轮需要慢铺、感官细节优先，存在多段短对话和动作描写交替，局部 speaker stack 容易被模型打断。
- 输出中部分卡琳娜台词没有 data-speaker，仅靠上下文识别，降低了后续代词/归因的显式可验证性。
- Director 安排清楚要求卡琳娜回应，但没有提供句级 speaker transition 检查。

## Causal Chain
- firstDivergenceArtifact: `turn-49/04-output.json`
- triggeringPressure: Narrator 在第二人称叙述中生成多段卡琳娜解释与黑猫反应时，套用了常见的“你说完这句话”承接模板；同时实际 rawHtml 混用了带 data-speaker 的对话帧和未标 speaker 的引号段落，使局部说话者栈不稳定。
- missingGuard: 缺少句级 speaker-attribution guard：没有校验“这句话”指向的上一句带 data-speaker=卡琳娜，却被叙述为“你说完”；也没有强制所有角色对白都带 data-speaker 以便后处理追踪。
- mechanismStatement: 在第二人称正文里，若 Narrator 对多段对白只部分保留 speaker 标记且没有生成后 speaker-stack 校验，模型可能把 NPC 刚说完的台词套入玩家承接模板，造成短暂身份漂移。
- directCause: Narrator 局部生成时发生说话者/指代漂移，把卡琳娜的最后一句解释误接为玩家说完的话。
- propagation: 错误直接进入 turn-49/04-output.json 的 rawHtml、visibleText 和 trace packet；后续选项仍基于黑猫名字推进，没有造成长期剧情状态偏移，但玩家可见正文已经出现身份漂移。
- nonCauses:
- 不是玩家输入绑定问题：玩家输入被正确识别为询问名字。
- 不是 story memory 或 detail memory 缺失：问题发生在同一段连续对白的局部归因。
- 不是 Director 剧情安排错误：Director 明确要求卡琳娜回应并分享名字故事。
- 黑猫位置从上一 issue 继承的连续性问题不是本条身份漂移的主因。

## Root Cause
- label: `speaker-attribution-local-slip`
- family: `llm-self`
- secondaryFamilies: `agent-system`
- description: 所需上下文和角色分工在 Director 与 Narrator prompt 中是清楚的，但 Narrator 在第二人称、多段对白场景中局部套用了玩家承接模板，把紧邻的卡琳娜台词归给“你”；系统又缺少 speaker-stack validation 和强制全对白 data-speaker 的后处理守卫，未能拦截该本地生成错误。
- fixSurface:
- Narrator output validator: 维护最近 speaker stack，检测“你说完这句话/他说完/她说完”等归因短语是否与上一句 data-speaker 冲突。
- v3-html dialogue contract enforcement: 所有带引号的角色对白必须带 data-speaker/data-to，未标记则重试或自动修复。
- Narrator prompt: 增加“NPC 台词后不得用‘你说完这句话’承接，除非上一句 speaker 是主角/帕兹”的局部规则。
- Regression tests: 针对多段 NPC 解释 + 第二人称叙述的 speaker attribution 用例。

## Evidence
- playerVisible: 第 49 轮可见文本中，卡琳娜连续解释名字来源并说“但只有叫她卡尔的时候，她会眨一下眼睛”；下一句立刻写“你说完这句话的时候”。
- internalTrace: turn-49/06b-narrator-prompt.md 的 Director JSON 明确“卡琳娜回应，提及黑猫的名字”；turn-49/04-output.json rawHtml 中目标前一句带 data-speaker="卡琳娜"，错误句则由 Narrator 输出为“你说完这句话的时候”。

## Recommended Fix Area
优先增加 Narrator v3-html 的 speaker-stack validator 与对白标签强制校验；其次在 Narrator prompt 中加入第二人称承接短语的局部 speaker consistency 规则。

## Confidence
`high`
