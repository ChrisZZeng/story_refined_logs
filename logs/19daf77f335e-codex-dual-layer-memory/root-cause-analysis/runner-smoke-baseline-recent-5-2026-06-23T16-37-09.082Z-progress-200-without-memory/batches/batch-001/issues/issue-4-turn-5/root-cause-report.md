# issue-4-turn-5 Root Cause Report

## Problem
turn-5 卡琳娜介入时，正文先说声音来自“巷子深处”，又说黑帮目光越过玩家落在“身后”，再写她站在“巷口的阴影里”，空间锚点互相打架。

## Validity
- issueValidity: `valid`
- verdictReason: 该问题成立。turn-4 已建立玩家朝前方窄巷/巷口遭遇三人，turn-5 同一次介入却在深处、玩家身后、巷口三种位置之间切换，玩家难以复原卡琳娜从哪一侧出现、黑帮和玩家各自面向何处。
- playerVisibleSupport: turn-4 visibleText：“前方是一条窄巷”“巷口站着三个人”；turn-5 visibleText：“一个声音从巷子深处传来”“目光越过你，落在你身后的某个地方”“巷口的阴影里站着一个少女”。
- caveats:
- 如果把玩家在包围中转身/后退作为未写出的动作，部分方位可被补解释；但正文没有给出该转向，因此玩家可见空间仍断裂。

## Context Assessment
actualStateBeforeIssue: turn-4 末尾玩家在暗街巷口被三名黑帮逼近、左右/右后方形成包围；前一段可见空间核心是“前方窄巷”和“巷口站着三个人”。

relevantFacts:
- `present-clear` 前一轮可见空间：玩家从中央区走向前方窄巷，三名黑帮在巷口拦路。 artifacts: visible-timeline.jsonl, turn-04/04-output.json, turn-05/06a-director-prompt.md. turn-05 prompt 的最近几轮玩家经历中保留了该正文。
- `present-ambiguous` 当前故事线 1-03 只要求卡琳娜声音传来、主角顺声看去、卡琳娜登场，没有指定入口/深处/玩家身后的几何关系。 artifacts: turn-05/03-story-state.json, turn-05/06a-director-prompt.md. 固定 beat 缺少可执行空间锚点。
- `present-ambiguous` Director output 引入“卡琳娜的声音从身后传来”。 artifacts: turn-05/06-llm-calls.json, turn-05/06b-narrator-prompt.md. 该方向没有和前一轮“前方/巷口/包围圈”对齐。
- `absent` runtime/location state 没有保存 player、黑帮、巷口、巷子深处的相对位置。 artifacts: turn-04/05-runtime-after.json, turn-05/05-runtime-after.json. runtime 只有 charactersOnStage 与 anchors，无法约束空间连续性。

competingPressures: 固定登场 CG 和 background 都标注“暗街-巷口”；戏剧化介入常用“声音从深处/身后传来”；前一轮可见文本的巷口站位只在长 recentTurns prose 中；当前 beat 要快速完成卡琳娜压制黑帮并带玩家进入更深处

## Causal Chain
- firstDivergenceArtifact: `turn-05/06-llm-calls.json Director output 首先无锚点地写“声音从身后传来”；turn-05/04-output.json Narrator 进一步混合为“巷子深处/身后/巷口”`
- triggeringPressure: 当前固定 beat 只规定卡琳娜登场和暗街-巷口资源，前一轮空间关系埋在长 recent visible text 中；Director/Narrator 为了制造压迫感和配合 CG/background，自行选择多个相对方位。
- missingGuard: 缺少 current-scene spatial anchor：没有结构化记录玩家朝向、黑帮位置、巷口入口、巷子深处以及卡琳娜进入路径，也没有要求新增角色只使用一个一致的相对位置。
- mechanismStatement: 卡琳娜介入的固定演出没有携带当前巷口几何图，且 previous spatial facts 只以长 prose 形式存在；在“暗街-巷口”资源和戏剧化出场语言的竞争下，Director/Narrator 分别选择身后、深处和巷口作为锚点，导致玩家可见空间断裂。
- directCause: Narrator 在同一介入段落连续写“巷子深处”“你身后”“巷口的阴影”，没有解释玩家或卡琳娜移动。
- propagation: 同轮后文又让卡琳娜“朝巷子更深处走去”，进一步让她的初始位置难以定位；runtime 只记录节点推进，没有修复空间状态。
- nonCauses:
- 不是长期记忆或 meta-memory，所需空间事实在上一轮和本轮 prompt 中。
- 不是玩家选择导致，玩家只选择交出物品，没有改变站位。
- 不是单一 background 资源错误；问题在相对方位没有被合约化。

## Root Cause
- label: `current-scene-anchor`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 系统没有把最近可见场景的空间关系转成可执行 anchor；固定卡琳娜介入 beat 只给出出场要求和“暗街-巷口”资源，缺失方位一致性 guard，生成链在戏剧化语言和资源地点压力下混用深处、身后和巷口。
- fixSurface:
- scene state model: 保存 playerPosition/facing/blockers/entryPath
- Director prompt: 对介入角色要求 chooseOne entryVector 并持续使用
- Narrator validator: 同段落 relative-location drift 检查

## Evidence
- playerVisible: turn-4 建立“前方窄巷/巷口站着三个人”；turn-5 同一介入段落使用“巷子深处”“身后”“巷口”三个锚点。
- internalTrace: turn-05/03-story-state.json 固定节点未指定卡琳娜相对方位；turn-05/06b-narrator-prompt.md 的 Director JSON 写“声音从身后传来”，requiredContent 只强调 CG/background 和台词；runtime-after 没有空间状态字段。
- tracePacket: `issues/issue-4-turn-5/trace.md`

## Recommended Fix Area
优先修复 current-scene spatial anchoring：把最近一轮关键空间关系结构化进 Director/Narrator，并对同段新增角色的 entryVector 做一致性校验。

## Confidence
`medium`
