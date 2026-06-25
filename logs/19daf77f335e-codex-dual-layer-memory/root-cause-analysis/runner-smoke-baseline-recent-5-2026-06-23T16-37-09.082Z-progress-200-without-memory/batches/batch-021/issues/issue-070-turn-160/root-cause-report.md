# issue-70-turn-160 Root Cause Report

## Problem
第160轮把相机包写成已经在旧木桌上、拉链半开，随后又写“把包放在桌上，拉开拉链”；这与此前已合拢且在椅子扶手附近的包状态冲突，并在同一段正文内部自相矛盾。

## Validity
- issueValidity: `valid`
- 判定理由：该 issue 有效。玩家可见文本明确多次把相机包整理并合拢：turn-148 拉上拉链后放在椅子扶手上，turn-152 把铃铛放回侧袋后“拉链合拢”，turn-153 手指还落在椅子扶手和包面固定出的拉链头位置。turn-160 无桥接地改成桌上半开，并在同一轮先说包已在桌上又说把包放到桌上。
- 玩家可见证据：turn-148、turn-152、turn-153 建立关闭/椅子扶手附近；turn-160 visibleText 同时出现“桌面上搁着你的相机包，拉链……半开着”和“你走过去，把包放在桌上，拉开拉链”。
- 注意事项：
- turn-159 已经把相机包错误带到门口，这使 turn-160 的输入上下文本身被污染；但 turn-160 的“桌上已搁着/又放到桌上”是独立的同轮可见矛盾。

## Context Assessment
实际问题前状态：按玩家可见连续性，进入 turn-160 前相机包应保持已合拢；较早清楚位置是屋内椅子扶手附近，turn-159 又错误地让它出现在门口“原位”。无论采用哪条可见线索，turn-160 都需要明确拿起、带回屋、放到桌上、再拉开，而不能同时写成已经在桌上且尚未放到桌上。

相关事实与可用性：
- `absent` 相机包此前已被整理好并拉上拉链。 证据：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-148/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-152/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-160/06b-narrator-prompt.md`。turn-148/152 事实不在 turn-160 的 recentTurns 中；currentStoryline 只保留“整理相机包”等摘要，没有 open/closed 状态。
- `present-ambiguous` 相机包具体位置需要桥接：椅子扶手/门口可见，不是自动在桌上。 证据：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-160/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-159/04-output.json`。prompt 中最近的明确文本只有 turn-159 的“低头看了一眼相机包。一切都在原位”，它没有说明如何回屋、拿起和放置。
- `present-clear` 本轮玩家输入只是“回屋检查装备”，没有声明已经拿起包或打开包。 证据：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/summary.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-160/06a-director-prompt.md`。Director 只给出“回到屋内/检查相机/检查胶卷/检查防水袋/确认银色铃铛”等 beats。
- `not-needed` Narrator 需要在本轮正文内保持局部自洽，不能先定位在桌上再写放上桌。 证据：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-160/04-output.json`。该约束不依赖长期记忆，只需要输出阶段局部一致性检查。

竞争压力：
- Director requiredContent 要一次完成多个装备检查，天然倾向把包放到桌上作为工作台
- recent window 只有 turn-155 到 turn-159，丢失 turn-148/152 的关闭状态
- turn-159 已污染当前包位置，但表述“原位”又含混
- 慢铺感官细节风格鼓励补充桌角、拉链、背带等具体物件细节

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-160/06b-narrator-prompt.md assistant narrative output`
- triggeringPressure: Director brief 要求“回到屋内”并连续检查相机、胶卷、防水袋、银色铃铛，但没有指定相机包从当前可见位置到桌面的桥接动作；Narrator 为了让装备检查顺手，把旧木桌作为默认操作台。
- missingGuard: 缺少 current-scene-anchor：没有结构化 objectLocation/openClosed state 告诉 Narrator 包在哪里、是否已合拢，以及回屋检查前是否必须先拿起/移动；同时缺少输出内自检来捕捉“已在桌上/把包放到桌上”的局部矛盾。
- mechanismStatement: 在装备检查 requiredContent 的压力下，Narrator 缺少可执行的相机包位置和开合状态锚点，于是临时拼接“桌上半开”和“把包放到桌上”两个互斥 staging，导致玩家可见物件位置和状态承接混乱。
- directCause: turn-160 Narrator 自行补全“桌面上搁着相机包、半开”以及“把包放在桌上、拉开拉链”，没有桥接此前状态。
- propagation: turn-160 末尾把包写成“手边放着准备好的包”；后续回合继续基于三卷胶卷、桌边/包侧袋等新设定展开。
- nonCauses:
- 不是固定剧情要求半开或放桌；Director 只要求检查装备。
- 不是玩家选择直接造成；玩家选择“回屋检查”没有指定包已在桌上或半开。

## Root Cause
- label: `current-scene-anchor`
- family: `agent-system`
- secondaryFamilies: `detail-memory`, `llm-self`
- description: 触发压力是 Director 的装备检查流程需要一个操作台和多个物件动作；缺失防线是当前场景没有结构化记录相机包的 location/openClosed，也没有要求 Narrator 在移动物件前显式桥接并自检同段矛盾；失败运动是 Narrator 用默认桌面 staging 填空，叠加了互斥的“已在桌上”和“放到桌上”。
- fixSurface:
- `current scene/object anchor schema：objectLocation、containerState、lastVisibleTurn`
- `Director -> Narrator handoff 中对必须桥接的物件移动生成 explicit bridge`
- `Narrator output local consistency validator，检测同一物件“already X / put to X”冲突`
- `state writeback 将常用道具开合状态写入可检索事实`

## Evidence
- playerVisible: turn-148 拉上拉链并放在椅子扶手；turn-152 拉链合拢；turn-153 指尖落在拉链头；turn-160 同时写桌上半开和把包放上桌。
- internalTrace: turn-160/06a-director-prompt.md 和 plotPoint 只列“检查相机/胶卷/防水袋/铃铛”，没有包位置桥接；turn-160/03-story-state.json 的 curStates 没有相机包实体状态；turn-160/06b-narrator-prompt.md 的 recentTurns 不含 turn-148/152 的闭合事实。
- tracePacket: `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-021/issues/issue-70-turn-160/trace-packet.json`

## Recommended Fix Area
为高频可携带物件增加 current-scene anchor 和 container state，并在 Director 交给 Narrator 的 beats 中要求先桥接移动/开合；增加同轮输出自检，禁止同一物件在同一段被描述为已经在目标位置又被放到目标位置。

## Confidence
`high`
