# Root Cause Report: issue-86

## Problem
- issueIndex: `86`
- turn: `200`
- issueValidity: `valid`
- problemSummary: turn 200 描写湿润石板上的脚步声时，把“湿润的石板”“干燥的声音”和“水汽还没来得及渗进鞋印”连成因果，感官和物理解释不自然。

## Validity
- verdictReason: 问题只凭玩家可见文本成立：同一句同时建立湿润路面和干燥脚步声，又用水汽渗入鞋印解释声音，读者很难把这理解为自然物理描写。
- playerVisibleSupport: turn 200 可见正文：“巷道的石板路面上有一层薄薄的晨露……她的鞋底踩过那些湿润的石板时，发出轻微的、干燥的声音——因为脚步足够轻，所以水汽还没来得及渗进鞋印的轮廓，她就已经走了过去。”
- caveats:
- “轻微、干燥的声音”单独看可被理解为轻声脚步；但后续“水汽渗进鞋印”的解释把隐喻拉成物理机制，使局部质量问题更明确。

## Context Assessment
- actualStateBeforeIssue: turn 199 后两人已经在通往巷口的路上行走；turn 200 玩家放慢一步，让卡琳娜走在前面并观察背影。正文应以安静步伐、晨光、外套和发梢等视觉细节为主，不需要解释鞋底与湿石板之间的物理机制。
- relevantFacts:
- 本轮需要描写卡琳娜行走背影和步伐细节。
  - availability: `present-clear`
  - artifacts: `turn-200/06-llm-calls.json, turn-200/04-output.json`
  - notes: Director requiredContent 明确要求背影、外套、金色马尾、晨光位置变化。
- 环境中有晨露、石板、露水气味等湿润清晨材料。
  - availability: `present-clear`
  - artifacts: `visible-timeline.jsonl, turn-200/06b-narrator-prompt.md`
  - notes: turn 195/197/198 多次出现露水、石板和清晨气味。
- 近期文本中的“干燥而轻细的声响”原本描述树叶/枯叶，不是湿石板脚步声。
  - availability: `present-buried`
  - artifacts: `turn-200/06b-narrator-prompt.md, turn-200/03-story-state.json`
  - notes: 该声响短语在 recentTurns 中反复出现，容易被迁移到新感官对象。
- “水汽还没来得及渗进鞋印轮廓”没有可见设定或常识支撑。
  - availability: `absent`
  - artifacts: `turn-200/04-output.json`
  - notes: Director 没有要求解释脚步声成因；正文自行添加了物理因果。
- competingPressures:
- Director pacing 要求“慢铺，以感官细节为主”，并把步幅、石板和晨光列为重点。
- 近期可见文本反复把“露水/石板”和“干燥而轻细的声响”放在清晨氛围里。
- Narrator 为了把观察写得细密，扩写到了脚跟、鞋底、鞋印和水汽等微观物理层面。

## Causal Chain
- firstDivergenceArtifact: `turn-200/06-llm-calls.json call 1 (narrator streamText)，同句写入 turn-200/04-output.json。`
- triggeringPressure: Director 要求慢铺感官细节和步伐/石板描写；Narrator prompt 的 recentTurns 又同时提供“露水、石板”和“干燥而轻细的声响”这些相邻素材。
- missingGuard: 缺少 unsupported sensory causality guard：当模型添加物理解释时，没有要求检查湿/干感官属性是否兼容，也没有限制无必要的微观因果解释。
- mechanismStatement: 在感官细节扩写压力下，Narrator 把 recent prose 中的“干燥声响”和本轮“湿润石板/鞋底”强行建立因果，缺少物理一致性护栏，于是生成了“水汽未渗进鞋印所以声音干燥”的 unsupported detail。
- directCause: Narrator 局部过度解释脚步声，发明了不成立的湿度-鞋印-声音因果链。
- propagation: 错误进入 turn-200/04-output.json 和 visible-timeline.jsonl；后续选项只承接观察距离，没有把该物理解释固化为剧情事实。
- nonCauses:
- 不是空间位置错误：两人此时已经在路上行走。
- 不是记忆缺失：问题不依赖远期事实。
- 不是 Director 要求的固定内容：Director 只要求感官慢铺，没有要求湿石板脚步声或水汽解释。

## Root Cause
- label: `unsupported-detail-inference`
- family: `llm-self`
- secondaryFamilies: `agent-system`
- description: Narrator 在慢铺感官细节时，把普通的晨露/石板/脚步观察扩展成未受支持的物理因果说明；prompt 没有要求只写可感知结果或校验湿/干属性兼容，导致局部 hallucinated sensory physics 进入正文。
- fixSurface:
- `Narrator prompt：限制无必要的微观物理解释，优先写可直接感知的结果`
- `post-generation quality lint：检测同句湿/干属性冲突和“因为”引出的感官因果`
- `style rewrite pass：将过度解释的感官句改写为直接、可验证的描写`

## Evidence
- playerVisible: turn 200 可见正文把湿润石板、干燥脚步声和水汽渗进鞋印连为一体，读者可直接看到感官因果不协调。
- internalTrace: turn-200/06-llm-calls.json 的 Director object 只要求背影、步伐、外套、发梢、晨光和石板位置变化；call 1 Narrator 首次添加“湿润石板/干燥声音/水汽未渗进鞋印”的解释。turn-200/06b-narrator-prompt.md recentTurns 中有“干燥而轻细的声响”和“露水、石板”等邻近素材。

## Recommended Fix Area
优先增加 Narrator 的 sensory causality 自检和输出后 lint，避免为氛围细节补写未经支撑的物理机制。

## Confidence
`medium`
