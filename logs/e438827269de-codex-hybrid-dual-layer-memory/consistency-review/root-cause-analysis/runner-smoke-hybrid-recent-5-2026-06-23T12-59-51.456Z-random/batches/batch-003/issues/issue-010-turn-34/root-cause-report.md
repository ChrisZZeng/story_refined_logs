# Root Cause Report: issue-10-turn-34

## Problem
- issueIndex: 10
- turn: 34
- severity: `medium`
- type: `space-time-break`
- scope: `visibleText`
- summary: 第 34 轮玩家问“我们要去哪？”时，卡琳娜回答“公园。不远。走几分钟就到。”；此前玩家可见目标一直是跟卡琳娜出门去凯旋门晚宴，当前轮没有解释这是绕路、暂避或计划变更。

## Validity
- issueValidity: `valid`
- verdictReason: valid。玩家可见时间线中，turn 24 明确建立“今晚凯旋门那边有个晚宴，愿意来就跟我一起出门”，turn 29/31/33 都是在跟随卡琳娜出门/下楼。turn 34 突然把目的地说成公园且“不多解释”，缺少玩家可见过渡。
- playerVisibleSupport: turn 24 的邀请和安全理由、turn 29 的“走吧”、turn 31-33 的出门下楼，与 turn 34 的“公园。不远。走几分钟就到。”形成目标断裂。
- caveats:
- 如果后续解释为去晚宴前的短暂停留，公园可以被补救为中途站；但 turn 34 当下没有给出这种桥接，因此玩家可见问题成立。

## Context Assessment
- actualStateBeforeIssue: 问题发生前，玩家已经离开公寓楼道，跟着卡琳娜和黑猫往外走。玩家知道的出门目的来自 turn 24 的凯旋门晚宴邀请：晚宴上康纳不会动手，留在公寓更危险。
- relevantFacts:
- `present-clear` 玩家可见的出门目标是凯旋门晚宴。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/03-story-state.json`
  notes: turn 24 和 turn 31 的 recentTurns 都保留了邀请与出门行为；turn 34 currentStoryline.summary 也写有“准备离开公寓前往凯旋门晚宴”。
- `over-constraining` 当前 active beat 强推公园。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/06a-director-prompt.md`
  notes: currentStoryline 6-02 content 明写“卡琳娜带着主角来到了附近的公园”，constraints 要调用公园背景/CG，并围绕宴会看法展开讨论。
- `absent` 公园与晚宴之间没有桥接语义。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/06-llm-calls.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/04-output.json`
  notes: Director requiredContent 只要求“卡琳娜回答目的地时语气自然”和“到达公园”，没有要求解释公园是中转或临时改道。
- `present-clear` runtime quest beat 已经提前越过宴会/康纳节点。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-29/05-runtime-after.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/05-runtime-after.json`
  notes: runtime-after 显示 turn 29 已进入 6-02；turn 34 currentBeatId 仍为 6-02，turnInBeat=7，completedBeatIds 包含 5-03 和 6-01，尽管玩家可见剧情从未进入/离开宴会厅。
- `absent` 没有 pre-LLM event 解释路线变化。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/07-events.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/03-story-state.json`
  notes: target turn 的 preLlmEvents 在 recentTurns 中为空；07-events 只记录 worker output 和 commit，没有路线变更事件。
- competingPressures: recent visible target: 凯旋门晚宴, active beat 6-02: 附近公园情感铺垫, constraints: 保持晚宴邀约开放, 玩家直接问目的地, 缺少 route-goal state 或 bridge requirement

## Causal Chain
- firstDivergenceArtifact: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-29/05-runtime-after.json -> story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-34/03-story-state.json`
- triggeringPressure: quest runtime 在照片对话/出门准备尚未真正完成宴会相关节点时，已经把 currentBeatId 推进到 6-02；该 beat 的 content 和 constraints 强制公园、长椅、宴会看法讨论。
- missingGuard: storyline lifecycle 没有用玩家可见里程碑校验 beat 是否真的完成，也没有在 active beat 与 recent visible route-goal 冲突时要求桥接、延迟或改写 literal trigger。
- mechanismStatement: 线性 beat 自动推进把“归途反思/公园讨论”节点提前激活；由于缺少可见完成条件和路线目标优先级检查，Director 在玩家询问目的地时优先执行 active beat 的公园要求，而不是承接已建立的凯旋门晚宴目标或解释改道。
- directCause: turn-34 Director 输出明确安排“卡琳娜带着主角沿昏暗街道前行，回答关于目的地的问题，并走向附近的公园”，beats/requiredContent 又要求到达公园。
- propagation: Narrator 按 Director 输出写出“公园。不远。走几分钟就到。”；Choice 继续围绕来新西西里时长/公园路线生成选项；后续 turn 36-39 将公园场景固化。
- nonCauses:
- 不是玩家在 turn 34 主动要求去公园；玩家只是问目的地。
- 不是长程记忆缺失；晚宴目标在 recentTurns 和 currentStoryline.summary 中都存在。
- 不是单纯 Narrator 即兴改写；Director 和 currentStoryline 已经把公园作为本轮目标。

## Root Cause
- label: `storyline-lifecycle`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: storyline node activation/consumption 缺少玩家可见里程碑门控：多个宴会相关 beat 在照片支线中被标记完成，导致 6-02 公园节点提前成为 active beat；系统没有检查 active beat 与最近可见路线目标“去凯旋门晚宴”冲突，也没有要求过渡解释。
- fixSurface:
- `Quest/storyline lifecycle: 以 visible milestone 或 explicit actionId 作为 beat completion guard，避免每轮自动消费关键 beat`
- `Director context assembly: 对 currentStoryline.content 与 recent visible route-goal 做冲突检测并要求 bridge/delay`
- `State model: 持久化 routeGoal/currentDestination 与 destinationChangeReason`

## Evidence
- playerVisible: turn 24 建立晚宴邀约和安全理由；turn 31-33 是离开公寓、跟上卡琳娜；turn 34 问目的地却直接得到“公园。不远”。
- internalTrace: turn-24 到 turn-29 runtime-after 显示 beat 从 4-03、5-01、5-02、5-03、6-01 连续推进到 6-02；turn-34/03-story-state.json 的 currentStoryline 6-02 content 强推公园；turn-34/06-llm-calls.json call[0] beats/requiredContent 采用公园目标；07-events 和 04-output 固化该正文。

## Recommended Fix Area
优先修复 storyline lifecycle 的 beat completion/activation guard：关键地点节点必须等 visible milestone 或显式玩家选择满足后才能消费；当 active beat 的 literal target 与 recent routeGoal 冲突时，Director 必须桥接或延迟节点。

## Confidence
`high`
