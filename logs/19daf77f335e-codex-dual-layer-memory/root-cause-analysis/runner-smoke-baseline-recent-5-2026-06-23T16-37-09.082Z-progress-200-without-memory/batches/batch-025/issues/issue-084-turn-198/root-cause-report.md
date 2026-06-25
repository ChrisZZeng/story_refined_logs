# Root Cause Report: issue-84

## Problem
- issueIndex: `84`
- turn: `198`
- issueValidity: `valid`
- problemSummary: turn 198 正文把卡琳娜说话时的停顿写成“她的声音在指尖上停顿了一拍”，声音、指尖与停顿的搭配缺少可见叙事支撑，形成局部语义错配。

## Validity
- verdictReason: 该问题只凭玩家可见文本即可成立：卡琳娜刚说“在想……”，下一句却说声音在指尖上停顿；同段随后才写她把右手从外套口袋里抽出来，正文没有建立声音落在指尖或通过指尖发声的机制。
- playerVisibleSupport: turn 198 可见正文：“在想……”之后紧接“她的声音在指尖上停顿了一拍，目光仍然看着前方的路”，随后写“她说着，把插在外套口袋里的右手抽出来”。
- caveats:
- 如果作为极度诗化隐喻，单句可以被勉强理解为停顿伴随手部动作；但正文没有呈现该手部动作，且“声音在指尖上”本身会打断阅读。

## Context Assessment
- actualStateBeforeIssue: 玩家在 turn 198 走近正在等他的卡琳娜，轻声问她等候时在想什么；卡琳娜开始回答“在想……”，场景应承接一次口头停顿和神态/动作描写。
- relevantFacts:
- 卡琳娜是在回答玩家的提问，问题焦点是她“在想什么”。
  - availability: `present-clear`
  - artifacts: `turn-198/04-output.json, visible-timeline.jsonl`
  - notes: 玩家输入和可见正文都明确进入对话回应，不需要新的物理机制。
- “声音停顿”可以成立，但“声音在指尖上停顿”缺少动作承托。
  - availability: `present-clear`
  - artifacts: `turn-198/04-output.json`
  - notes: 同段先写声音，后写右手从口袋里抽出；指尖没有在该句之前承担可见动作。
- 近期文本反复使用“指尖”“停顿”“声音”作为心理外化材料。
  - availability: `present-buried`
  - artifacts: `turn-198/06b-narrator-prompt.md, turn-198/03-story-state.json`
  - notes: recentTurns 中有“卡琳娜的指尖在膝盖上停住”“她的指尖在膝盖上轻轻敲了一下”“声音里带着一种微妙的停顿”等相邻素材。
- Narrator 收到的导演安排要求“对话驱动，感官细节优先”，但没有要求指尖动作。
  - availability: `present-clear`
  - artifacts: `turn-198/06-llm-calls.json, turn-198/06b-narrator-prompt.md`
  - notes: Director 只给出“目光微垂，双手插在外套口袋里”的动作提示，未要求把停顿落在手指上。
- competingPressures:
- Narrator prompt 的写作规则强调用环境、动作、神态建立节奏，并示例“指尖敲桌”等心理外化动作。
- recentTurns 内多次出现“指尖”“停顿”“声音”的诗性句式，给局部词组拼接提供了高相似度材料。
- Director pacing 要求“感官细节优先”，降低了对朴素动作描写的约束强度。

## Causal Chain
- firstDivergenceArtifact: `turn-198/06-llm-calls.json call 1 (narrator streamText)，同一内容写入 turn-198/04-output.json 的 turnContent。`
- triggeringPressure: Narrator 在一个高诗化、感官细节优先的提示中，同时看到近期“指尖停住/敲”“声音停顿”的表达材料，并要描写卡琳娜回答前的一拍停顿。
- missingGuard: 缺少局部语义兼容检查：身体部位动作、声音属性和停顿主体必须在同一句中物理/隐喻关系清楚；也没有要求在手在口袋里时避免凭空使用指尖动作。
- mechanismStatement: 在诗性动作外化压力下，Narrator 将 recent context 中相邻的“声音停顿”和“指尖停住”局部混合，而输出侧没有语义搭配护栏，于是生成了“声音在指尖上停顿”这种无承托隐喻。
- directCause: Narrator 的局部词组拼接/隐喻生成失误，把可接受的“声音停顿了一拍”错误地挂到“指尖上”。
- propagation: 错误直接进入 turn-198/04-output.json 的 visibleText 和 visible-timeline.jsonl；turnSummary 没有固化该短语，后续主要是一次性文本质量问题。
- nonCauses:
- 不是玩家输入误导：玩家只询问她在想什么。
- 不是 long-term memory 缺失：所需信息都在本轮可见上下文内。
- 不是 Choice 阶段造成：问题在 Narrator 正文生成时已经出现。

## Root Cause
- label: `model-local`
- family: `llm-self`
- secondaryFamilies: `agent-system`
- description: Narrator 在清晰的对话场景下发生局部诗性搭配混合：recent prompt 中“指尖停住/敲”和“声音停顿”被压缩成同一句，系统侧又没有对身体部位、感官主体和动作关系做输出前校验，导致 malformed metaphor 直接进入玩家可见正文。
- fixSurface:
- `Narrator prompt 的局部语义自检规则`
- `post-generation quality lint：检测“声音/气味/光线”等感官主体与身体部位介词短语的异常搭配`
- `Narrator rewrite pass：对诗性隐喻要求可见动作承托`

## Evidence
- playerVisible: turn 198 可见正文在卡琳娜说“在想……”后写“她的声音在指尖上停顿了一拍”，但同段只建立她目光看路、右手稍后从口袋抽出。
- internalTrace: turn-198/06-llm-calls.json 的 Director object 没有该短语，只给出高层对话安排；call 1 Narrator text 首次生成该句。turn-198/06b-narrator-prompt.md 的 recentTurns 和写作规则提供了“指尖/停顿/声音”的邻近素材与感官细节压力。

## Recommended Fix Area
优先在 Narrator 输出质量层增加短语级语义兼容检查；其次弱化“指尖”等示例在无动作承托时的可复用性。

## Confidence
`high`
