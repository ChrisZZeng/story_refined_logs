# Root Cause Report: issue-15 turn 54

## Problem
- issueIndex: `15`
- severity: `high`
- type: `repeated-scene`
- scope: `visibleText`
- problemSummary: turn 54 把玩家在 turn 40-50 已经进入并互动过的卡琳娜真正的家/私密房间，重新当作另一处未知新地点进入，重复了同一套空间陈设。

## Validity
- issueValidity: `valid`
- verdictReason: valid。玩家可见时间线足以证明重复：turn 39-40 已从公园侧小路、灰砖老铁门进入该私密空间，turn 40 已呈现约二十平米、暗绿色裂纹灯罩、深棕色皮质沙发、灰白毛毯、旧木桌、磨损书籍和搪瓷杯；turn 41-50 均在该房间内互动，turn 51 从铁门离开到公园。turn 52-54 又把“真正的家”作为另一个地方引出，并在 turn 54 重复同一房间模板。
- playerVisibleSupport: visible-timeline.jsonl 中 turn 39-40 首次抵达和进入；turn 41-50 室内连续互动；turn 51 离开房间转向公园；turn 52-54 再次邀请、带路、进入并复现同一空间。
- caveats:
- 如果作者意图是两个高度相似的房间，正文也需要明确说明这种相似性或回环机制；当前玩家可见文本没有提供这种解释。
- turn 52 已先发生可见层面的重新邀请，turn 54 是该错误链条的显性空间重复落点。

## Context Assessment
- actualStateBeforeIssue: 问题发生前，玩家可见连续性应是：主角已经在 turn 40 进入卡琳娜真正的家并在其中与卡琳娜、黑猫互动；turn 50 卡琳娜提议出去透气；turn 51 主角与卡琳娜从铁门离开到公园，黑猫留在铁门边。turn 52-53 已经把过期的“前往真正的家”桥段重新可见化，所以 turn 54 面对的是一个由前两轮错误铺出的再入门槛。
- relevantFacts:
- `present-clear` 玩家已经进入并观察过卡琳娜真正的家/私密空间。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-40/04-output.json`
  notes: turn 40 明确写出进入真正的家，并呈现与 turn 54 高度重合的灯罩、沙发、毛毯、旧木桌、书籍、搪瓷杯。
- `present-buried` 当前故事线摘要也已经记录“进入真正的家”和后续室内互动。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/03-story-state.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/06a-director-prompt.md`
  notes: turn 54 prompt 的“本段已完成的进展”包含进入真家、观察环境、翻看笔记、泡茶与深谈等，但它位于长 prompt 中部，且没有成为硬性当前场景约束。
- `present-clear` 卡琳娜已经带主角离开该房间到公园，而不是尚未抵达真正的家。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-51/04-output.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/06a-director-prompt.md`
  notes: turn 51 可见正文和 turn 54 prompt 最近几轮都写到从铁门跨出、到公园入口。
- `over-constraining` 固定承接仍把“邀请主角前去她真正的家”作为可用未来动作。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-52/06a-director-prompt.md`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/06a-director-prompt.md`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/03-story-state.json`
  notes: `interactionFollowup`/“玩家行动后的情节承接方式”在已完成进展之后仍保留该邀请，并在 prompt 后段靠近输出任务，形成比已完成摘要更可操作的压力。
- `absent` 运行态没有稳定记录“当前已经在/刚离开卡琳娜真正的家”的 location anchor。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-40/05-runtime-after.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-51/05-runtime-after.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/02-script-state.json`
  notes: `currentLocationId` 仍为 `夜晚的街道`，`entityStates` 只有 `公园` 和 `卡琳娜`，anchors 只到 `卡琳娜已发出邀请`，没有 `已进入真正的家` 或当前室内身份。
- competingPressures:
- 已完成进展要求不要重复已经发生的情节。
- 过期的 fixed followup 仍要求态度值达到后邀请去真正的家。
- 地点记忆中存在多个相近条目：`当前所在的室内房间`、`卡琳娜的家（真正的家）`、`卡琳娜的铁门居所`、`卡琳娜的公寓`。
- 阶段六约束持续要求氛围转换、关系推进、引向后续卡尔对话。
- recentTurnLimit=5 使 turn 40 的首次入室细节不在最近正文窗口内，只能依赖长摘要和地点记忆。

## Causal Chain
- firstDivergenceArtifact: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-52/07-events.json narrator worker-done；上游触发来自 /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-52/06b-narrator-prompt.md 中 stale `interactionFollowup` 与已完成进展的冲突。`
- triggeringPressure: turn 52/54 prompt 同时包含“已完成：已经进入真正的家并深谈”和“玩家行动后的承接：卡琳娜邀请主角前去她真正的家”。后者是更像待执行动作的固定桥段，且与 `阶段六情感铺垫/引向后续卡尔对话` 的持续约束共同拉动模型再次发起邀请。
- missingGuard: 缺少 fixed beat consumed guard：`邀请/前往/进入真正的家` 在 turn 38-40 已消费后没有从 `interactionFollowup` 移除，也没有硬性当前场景锚点要求“如回到该房间必须承认已来过，不得当作新地点”。
- mechanismStatement: 已消费的 `invite true home` fixed beat 在 currentStoryline 中继续作为可执行承接出现，而 completed progress 只以长摘要形式存在且不具备阻断力，Narrator 先在 turn 52 重新发出邀请，Choice/Director 随后把该邀请转成路线和入室，turn 54 再套用同一房间模板，造成玩家可见的重复进度重置。
- directCause: turn 52 Narrator 在 Director 未要求新邀请、且 `currentTurnConstraints` 写着不进行新信息揭露的情况下，新增了“真正的家不是暗街那间铁门后的房间，是另外一个地方”。turn 53 Choice/Director 接受该分支，turn 54 Director 将 `scene` 设为 `卡琳娜的家（真正的家）` 并要求复现室内陈设。
- propagation: turn 52 输出的邀请生成选项 `接受邀请，跟她走`；turn 53 选中后生成再次穿过公园侧方小路、灰砖墙老铁门；turn 54 Director requiredContent 明确要求深棕色沙发、旧木桌、搪瓷杯、暗绿色裂纹灯罩等陈设，Narrator 逐项满足，最终固化为可见重复。
- nonCauses:
- 不是单纯 long-term memory 缺失：turn 54 story state 和 prompt 中有已进入真家的完成摘要。
- 不是 evaluator 误判：重复房间的关键视觉物件和路径在玩家可见文本中高度一致。
- 不是单纯 Narrator 局部失误：Narrator 受到 stale fixed followup、未消费 storyline 和地点模板共同施压。

## Root Cause
- label: `fixed-beat-consumption`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: `邀请/前往/进入真正的家` 这个固定承接在 turn 38-40 已完成后没有被标记为 consumed，也没有从 currentStoryline 的可执行 followup 中移除；prompt 只把完成事实放在长摘要中，却继续把同一承接作为未来动作呈现。缺失的消费防线让后续 worker 把已完成空间转换重新执行，并用同一地点模板重建场景。
- fixSurface: `storyline/fixed beat lifecycle：为 `interactionFollowup` 增加 consumed/resolved/incompatible 状态并从后续 prompt 中剔除已消费桥段`, `prompt assembly：将 `本段已完成的进展` 中的场景完成事实提升为 hard continuity guard，并放在固定承接之前`, `state/writeback：持久化 `currentLocationId`、`hasEnteredTrueHome`、`lastSceneIdentity` 等当前场景锚点`, `choice gating：禁止从 stale followup 生成已完成关键出口选项`

## Evidence
- playerVisible: turn 39-40 首次从公园侧小路和灰砖铁门进入该房间；turn 41-50 在该房间内连续互动；turn 51 离开到公园；turn 52-54 再次把真正的家当新地点并重复同一空间。
- internalTrace: turn 54 `03-story-state.json`/`06a-director-prompt.md` 已有完成摘要，但同一 prompt 的 `玩家行动后的情节承接方式` 仍保留邀请真家的固定桥段；turn 52 `07-events.json` Narrator 首次重新发出邀请；turn 54 `04-output.json` plotPoint requiredContent 要求复现同一室内陈设。

## Recommended Fix Area
优先修复 currentStoryline/fixed beat lifecycle 与 prompt assembly 的已消费承接过滤，同时补充当前场景 identity 写回。

## Confidence
`high`
