# Root Cause Report

## Problem
- issueId: `issue-7-turn-30`
- turn: `30`
- problemSummary: 玩家只建议卡琳娜穿旧棉衣，系统却把该建议推进成玩家已同意同行，并直接完成离开暗街、进入凯旋门晚宴的场景迁移。

## Validity
- issueValidity: `valid`
- verdictReason: turn 29 的选项中“建议她穿这件旧棉衣”与“直接表明：如果跟她去晚宴能避开麻烦，那我去”是两个不同选择；玩家选前者只表达服装建议。turn 30 直接写“我们走”“你跟上去”并进入宴会厅，越过了同行/不同行的行动分支。
- playerVisibleSupport: turn 29 玩家被问衣服和晚宴安全，选项明确分离“建议穿旧棉衣”和“如果跟她去晚宴能避开麻烦，那我去”；turn 30 正文直接让卡琳娜出门并写玩家跟上，随后场景已到宴会厅。
- caveats: 卡琳娜可在 in-world 中邀请玩家一起走，但不能替玩家完成“跟上并入场”的核心决定；尤其因为系统刚提供过明确的同意选项。

## Context Assessment
- actualStateBeforeIssue: 卡琳娜正在决定是否穿旧棉衣参加凯旋门晚宴，并提示留在暗街可能不安全。玩家本轮只给出服装建议“它更适合她”，尚未选择同意同行。
- relevantFacts:
  - `present-clear` 玩家本轮核心意图是服装建议，不是同意同行。 artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-30/06a-director-prompt.md`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`. notes: 玩家输入明确为“建议她穿这件旧棉衣——它更适合她”。
  - `present-clear` 前一轮存在单独的“同意去晚宴”选项，玩家没有选择。 artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-29/04-output.json`. notes: turn 29 choices 中有“直接表明：如果跟她去晚宴能避开麻烦，那我去”。
  - `present-clear` 04-02 节点应在玩家接受邀请后进入 04-03，未接受时卡琳娜会独自前往。 artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-29/03-story-state.json`. notes: currentStoryline.constraints 写明“接受邀请 → 04-03 进入宴会厅；拒绝邀请 → 卡尔线”，interactionFollowup 写“当主角未接受邀请时，卡琳娜会独自前往”。
  - `over-constraining` turn 30 生成前 storyline 已经处在“04-03：进入宴会厅”。 artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-29/05-runtime-after.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-30/03-story-state.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-30/06a-director-prompt.md`. notes: turn-29 runtime-after 的 currentBeatId 已是 4-03；turn-30 prompt 当前故事线要求“正式进入宴会厅”。
  - `over-constraining` Director 把服装建议改写成“穿着旧棉衣参加晚宴”，并强制场景迁移。 artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-30/06-llm-calls.json`. notes: Director requiredContent 明确要求“离开铁门居所，穿过暗街通往宴会厅”“场景转换至宴会厅入口或内部”。
- competingPressures: storyline 04-03 已被提前激活；固定节点需要展示暗街到宴会厅的场景转换；卡琳娜提出晚宴安全性带来邀请压力；Director 输出中的 requiredContent 对 Narrator 是强制项

## Causal Chain
- firstDivergenceArtifact: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-29/05-runtime-after.json`
- triggeringPressure: runtime-after 在 turn 29 后把 currentBeatId 推到 `4-03-第一章`，turn 30 story state/prompt 因而以“正式进入宴会厅”为当前剧情；Director 又把本轮输入解释成“穿旧棉衣参加晚宴”。
- missingGuard: storyline transition 没有校验玩家是否明确接受同行；Director 也没有保留“服装建议只处理衣服，下一步仍需玩家确认是否同去”的 must-satisfy contract。
- mechanismStatement: 04-02→04-03 的节点生命周期把“晚宴邀请已提出/服装已讨论”误当成“玩家已接受邀请”，导致固定 beat 在没有玩家同意的情况下被激活，并通过 Director requiredContent 强制 Narrator 完成出门和入场。
- directCause: Director 在 turn 30 输出 requiredContent，要求离开铁门居所、穿过暗街并切到宴会厅。
- propagation: Narrator 按 requiredContent 写出“我们走”“你跟上去”与宴会厅入场；turn 30 runtime-after 随后完成 04-03 并进入 5-01，下一轮 choices 全部基于宴会厅。
- nonCauses: 不是玩家输入自然包含同行同意；不是 Narrator 单独擅自推进，Director 和 storyline 已强制推进；不是合理压缩行程，因为压缩前缺少玩家对同行分支的选择

## Root Cause
- label: `storyline-lifecycle`
- family: `agent-system`
- secondaryFamilies: `choice-action-binding`
- description: storyline 节点从 04-02“出门与晚宴邀请”提前进入 04-03“进入宴会厅”，没有把“玩家明确接受同行”作为转换前置条件；固定 beat 生命周期压过了玩家选择语义，把服装建议绑定成行动同意。
- fixSurface: `quest/node transition guard`, `choice-action binding schema`, `Director selected-intent validation`, `runtime-after storyline advancement`

## Evidence
- playerVisible: turn 29 单独提供“建议穿旧棉衣”和“那我去”的选择；turn 30 玩家选服装建议后，正文直接“我们走”“你跟上去”并进入宴会厅。
- internalTrace: /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-29/03-story-state.json 明确接受/拒绝分支；/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-29/05-runtime-after.json 已激活 4-03；/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-30/06-llm-calls.json requiredContent 强制进入宴会厅。

## Recommended Fix Area
修复 storyline lifecycle gate：04-02 到 04-03 必须由明确 accept actionId 或等价玩家自然语言触发；若玩家只评价衣服，应生成“卡琳娜穿上/再次邀请/给玩家选择”的回合，而不是迁移场景。

## Confidence
`high`
