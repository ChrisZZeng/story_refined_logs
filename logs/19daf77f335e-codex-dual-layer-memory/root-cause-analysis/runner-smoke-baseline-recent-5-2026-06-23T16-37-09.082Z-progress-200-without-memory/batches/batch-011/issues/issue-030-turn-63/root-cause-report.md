# issue-30-turn-63 Root Cause Report

## Problem
- issueIndex: `30`
- turn: `63`
- issueValidity: `valid`
- summary: 第63轮中，卡琳娜先明确承接玩家刚说的提醒，却在同一句回应里把这句话说成“她说得没错”，短暂把玩家的话归给第三人称女性。

## Validity
问题成立。玩家输入和正文开头均显示“有些话不说出来的话，那个人可能永远不知道”是帕兹/玩家本轮对卡琳娜说出的提醒；卡琳娜随后复述“你刚才那句话”后却说“她说得没错”，与同轮可见指代冲突。

玩家可见证据：turn-63 的玩家输入是“告诉她——有些话不说出来的话，那个人可能永远不知道”；正文写“你的话落在雨后湿润的空气里”，并写“但你刚才那句话——……——她说得没错”。

Caveats:
- 错误只发生在一个短语中，前文已有“你说得对”，因此是低严重度的局部 identity-drift，而不是整轮主体错置。

## Context Assessment
问题发生前状态：卡琳娜已在 turn-62 坦白自己知道那句话是写给卡尔的；turn-63 玩家以自己的战场经验鼓励她不要把话留到以后，卡琳娜应当回应玩家的提醒，并决定今晚告诉卡尔。

Relevant facts:
- `present-clear` 被复述的“有些话不说出来……”是玩家/帕兹本轮刚说的话。 artifacts: `visible-timeline.jsonl:turn-63`, `turn-63/06a-director-prompt.md`, `turn-63/06b-narrator-prompt.md`；玩家输入和 Narrator prompt 的最近上下文都直接包含该句；Director 也将 playerIntent 写为“表达”。
- `present-clear` 本轮对话的回应对象是玩家，正文中玩家应以“你/帕兹”承接。 artifacts: `turn-63/06b-narrator-prompt.md`, `turn-63/06-llm-calls.json`；底层写作规范写明“你=帕兹=玩家=主角”，Director involvedCharacters 为帕兹和卡琳娜。
- `present-clear` 卡尔/那个人是这句话的收信对象，局部文本中存在大量女性第三人称“她”。 artifacts: `visible-timeline.jsonl:turn-62`, `turn-63/04-output.json`；卡琳娜在同段里说“我觉得她不会太累”“今晚回去，我告诉她”，这些“她”应指卡尔，不应回指玩家。
- `present-buried` 角色资料中另有“卡琳娜只会轻描淡写地承认她说得对”的女性代词模板。 artifacts: `turn-63/06b-narrator-prompt.md`；该信息属于卡琳娜/敏特资料的长背景，不是本轮事实，但可能增加“她说得对/没错”的语言惯性。

Competing pressures:
- 同段里卡尔作为女性收信对象被反复用“她”指代
- 情感告白主题长期围绕“那句话”“那个人”展开
- Narrator 需要把玩家简短选择扩写成完整劝说段落
- 缺少输出后对引用来源和称谓的局部校验

## Causal Chain
- firstDivergenceArtifact: `turn-63/06-llm-calls.json call[1] (Narrator streamText)，同内容落入 turn-63/04-output.json narrative。`
- triggeringPressure: Narrator 在一段充满女性第三人称的告白对象语境中续写卡琳娜回应；同段前后“她不会太累”“我告诉她”均指卡尔，长背景还埋有“她说得对”的表达范式。
- missingGuard: 没有可执行的局部约束要求：当正文复述本轮玩家话语时，承认正确的一方必须回指玩家/“你”，不能被附近的女性对象代词吸走；也没有后处理检查“你刚才那句话”后的称谓一致性。
- mechanismStatement: 在多女性 referent 和长期“那句话”主题的局部语言压力下，Narrator 虽然拥有清晰玩家输入，却缺少引用来源/称谓一致性 guard，于是把本轮玩家提醒临时滑写成第三人称女性意见。
- directCause: Narrator 局部生成了“——她说得没错”，而不是“你说得没错/你说的没错”。
- propagation: 错误只进入 turn-63 的玩家可见正文；Director plotPoint、后续选项和 runtime 状态没有把“她说得没错”进一步固化为剧情事实。

Non-causes:
- 不是 Director 剧情判断错误：Director 只要求帕兹建议、卡琳娜决定，没有要求第三人称归因。
- 不是 memory-persistence：需要的信息就在本轮玩家输入和 Narrator prompt 中。
- 不是 Choice 问题：错误发生在正文生成阶段之前选项尚未参与。

## Root Cause
- label: `model-local`
- family: `llm-self`
- secondaryFamilies: 无
- description: 在本轮玩家输入和 Director contract 都清楚的情况下，Narrator 受附近多个“她”以及长背景表达模板牵引，发生局部指代滑移；系统缺少针对“复述玩家话语时称谓必须回指玩家”的可执行校验，所以一个短语变成玩家可见 identity-drift。
- fixSurface: `Narrator prompt 的引用/归因一致性规则`, `turnContent 后处理或 evaluator-style lint：检测“你刚才那句话/你刚才说”后接“她/他/TA说得对”的冲突`, `可选：为本轮 player utterance 建立 speaker/addressee 标注供 Narrator 使用`

## Evidence
- playerVisible: turn-63 玩家输入和正文均把提醒归给玩家；同轮正文的“她说得没错”与“你的话”“你刚才那句话”冲突。
- internalTrace: turn-63 Director output 为“帕兹鼓励卡琳娜……卡琳娜被触动”，无第三人称归因；turn-63 Narrator LLM call 首次生成“她说得没错”。

## Recommended Fix Area
优先在 Narrator 输出前后增加 quote attribution / pronoun consistency guard，尤其检查当前玩家输入被复述时的指代。

## Confidence
`high`
