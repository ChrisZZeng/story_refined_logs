# Root Cause Report: issue-77-turn-167

## Problem
- issueIndex: 77
- turn: 167
- problemSummary: 连续等待场景中，晨光已经在 turn 166 越过灰烬槽边缘并爬上炉口上缘，但 turn 167 又回写为从窗沿往壁炉方向爬、吞没铁架下缘并停在灰烬槽边缘，造成光线轨迹回退。

## Validity
- issueValidity: valid
- verdictReason: 玩家可见正文连续把同一束晨光当作计时线索；turn 167 的位置描述回到 turn 163-165 的阶段，而不是从 turn 166 的炉口上缘继续推进，因此是有效但轻微的空间时间连续性错误。
- playerVisibleSupport: turn 164 写晨光已从壁炉铁架边缘越过并在灰烬槽铺开；turn 165 写从铁架边沿滑落并在灰烬槽铺成亮斑；turn 166 写从灰烬槽边缘越过并沿铁架爬上炉口上缘；turn 167 又写从窗沿往壁炉爬、吞没铁架下缘并停在灰烬槽边缘。
- caveats: 这是低严重度错误，因为晨光移动本身是氛围细节，不改变主线行动。；turn 168 又恢复到灰烬槽更深处，说明漂移没有长期锁死，但 turn 167 本轮仍对玩家可见。

## Context Assessment
- actualStateBeforeIssue: 问题发生前，玩家仍在卡尔小屋等待卡琳娜消息，刚调整好相机包并站在门廊/墙角附近。晨光作为等待时间流逝的连续视觉标尺，最新可见位置已经越过灰烬槽边缘并沿壁炉铁架爬向炉口上缘。
- relevantFacts:
  - 晨光最新位置已经越过灰烬槽边缘，正沿壁炉铁架爬上炉口上缘。 availability=present-clear artifacts=logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-167/03-story-state.json；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-167/06a-director-prompt.md；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-167/06b-narrator-prompt.md notes=该事实出现在 turn 166 玩家可见正文，并被收进 turn 167 的 recentTurns/最近几轮玩家经历，但只是长段 prose 中的一句环境描写。
  - 本轮玩家输入是继续坐一会儿观察光线变化，不要求把光线回放到早先位置。 availability=present-clear artifacts=logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-167/06a-director-prompt.md；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-167/06b-narrator-prompt.md notes=Director 将意图概括为等待与观察，并要求慢铺感官细节，但没有指定从最新光线位置继续。
  - 故事状态没有结构化保存光线当前位置或单调推进约束。 availability=absent artifacts=logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-167/03-story-state.json；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-167/05-runtime-after.json notes=currentStoryline summary 只说等待、观察晨光渐亮；runtime-after 只有 quest/entity 粗状态，没有小屋内光线锚点。
- competingPressures: 玩家输入要求观察光线变化；Director 的 pacing 为感官细节优先；recentTurns 中多轮反复出现窗沿、壁炉、铁架、灰烬槽等相似轨迹；当前故事线长期停留在等待卡琳娜的过渡状态

## Causal Chain
- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-167/06-llm-calls.json#narrator-streamText
- triggeringPressure: Narrator 被要求慢铺等待与光线细节；prompt 中虽然有 turn 166 的最新位置，但同一 recentTurns 窗口还包含 turn 162-165 多个更早的光线阶段，且 Director handoff 只说观察晨光在屋内移动。
- missingGuard: 缺少当前场景环境锚点和单调时间线约束；一致性规则只是通用地要求优先最近正文，没有把“光线已越过灰烬槽并上爬”转成必须续接的硬约束。
- mechanismStatement: 在重复等待场景中，多个相似光线阶段被长 prose 并列提供，而当前最新位置没有被结构化锚定或在 Director handoff 中前置，Narrator 在感官慢铺压力下复用了较早的光线轨迹，导致玩家可见的晨光位置回退。
- directCause: Narrator 生成了“又从窗沿往壁炉的方向爬”“吞没壁炉的铁架下缘”“在灰烬槽的边缘上停留”等早先阶段描述。
- propagation: 错误进入 turn-167/04-output.json 的 narrative 和 turnContent write；Choice 未修正该环境事实。turn 168 的正文重新写到灰烬槽更深处，减轻但不消除 turn 167 的可见回退。
- nonCauses: 不是固定剧情节点要求晨光回到窗沿；当前 storyline 只要求等待。；不是玩家输入导致的回退；玩家只要求继续观察光线。；不是隐藏设定问题；玩家可见正文已经足以证明问题。

## Root Cause
- label: context-priority
- family: agent-system
- secondaryFamilies: recent-context
- description: 重复环境细节只有在 recentTurns 的长正文中保留，Director/Narrator handoff 没有把最新光线位置提升为 current-scene anchor，也没有给出“只能向前推进”的时间连续性 guard；感官细节压力使模型从同一窗口内较早阶段取样，形成可见回退。
- fixSurface: prompt/context assembly: 为可计时环境细节生成 currentSceneAnchors；Director schema: 对重复等待场景输出 latestPosition/continuityConstraints；Narrator prompt: 对 recent visible state 的最新环境锚点增加硬约束

## Evidence
- playerVisible: visible-timeline.jsonl turn 164-167 的晨光轨迹形成顺序冲突；turn 167 正文重复灰烬槽边缘阶段。
- internalTrace: turn-167/03-story-state.json 和 06a/06b prompt 含 turn 166 最新位置，但只在最近几轮正文 prose 中；turn-167/04-output.json 与 07-events.json 显示 first bad text 由 narrator 产生；05-runtime-after.json 未保存光线位置锚点。

## Recommended Fix Area
在 context assembly/Director handoff 中为连续等待场景抽取并前置 current-scene anchor，尤其是光线、物件位置、人物姿态等会跨轮递进的局部状态。

## Confidence
high
