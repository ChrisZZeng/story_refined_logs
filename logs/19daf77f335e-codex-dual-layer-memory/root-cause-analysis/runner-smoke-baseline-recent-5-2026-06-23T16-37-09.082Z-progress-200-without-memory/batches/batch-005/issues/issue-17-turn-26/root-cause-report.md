# Root Cause Report - issue-17 turn-26

## Problem
- `issueId`: `issue-17`
- `turn`: 26
- `type`: `space-time-break`
- `severity`: `high`
- 玩家可见问题：第 26 轮在没有任何出门、路程或抵达桥段的情况下，突然从卡琳娜公寓写到宴会厅高窗、水晶吊灯、白色桌布和正在继续的酒会。

## Validity
- `issueValidity`: `valid`
- 仅用玩家可见证据即可确认问题成立：第 25 轮仍在公寓私密对话中，空间锚点包括沙发、茶几、书架、黑猫、窗外雨声和暖气管；第 26 轮玩家输入只是“确认一下时间，考虑该不该告辞”，却直接出现“宴会厅高窗”“水晶吊灯”“白色桌布”“酒会还在继续”。
- 第 26 轮虽然还写到茶几、沙发和书架，但这是公寓物件与宴会厅环境混杂，不是合理转场。
- 隐藏剧本中存在宴会厅节点，不能反向证明玩家已经看见过进入宴会厅；玩家可见文本没有该过渡。

## Context Assessment
- 问题发生前的实际玩家可见状态：主角与卡琳娜仍在卡琳娜公寓围绕德索洛、信封和卡琳娜在本地权力网中的角色对话。第 25 轮末尾仍是“窗外雨声”“暖气管”“黑猫”等公寓锚点。
- `present-clear`: 第 26 轮玩家输入/selected choice 是“确认一下时间，考虑该不该告辞”，只要求处理当前场景里的时间和离开意图；见 `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`、`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-26/01-summary.json`。
- `present-clear`: 最近几轮正文在第 26 轮 Narrator prompt 中完整保留了公寓锚点；见 `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-26/06b-narrator-prompt.md`。
- `over-constraining`: 内部状态已把当前位置/故事线推到宴会厅：turn-25 `facts.currentLocationId` 已是 `宴会厅`，turn-26 `currentStoryline` 是 `5-01-第一章`，`locationStates` 只有 `宴会厅`；见 `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-25/02-script-state.json`、`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-26/02-script-state.json`、`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-26/03-story-state.json`。
- `present-clear` 但未持久化：第 25 轮 Director 曾写出 `currentStorylineConstraints`: “为前往宴会厅做铺垫，但不在此轮实际推进地点变化”，但下一轮仍被推进到 `5-01-第一章`；见 `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-25/04-output.json`、`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-25/01-summary.json`。
- 竞争压力：当前故事线/地点强推宴会厅，最近可见上下文强指向公寓，玩家输入只要求告辞，prompt 的冲突优先级没有把“最近可见当前场景”转成硬约束。

## Causal Chain
- L1 `divergence`: 第 25 轮回合后的 storyline/runtime 状态。`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-25/05-runtime-after.json` 和 `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-25/01-summary.json` 显示，虽然第 25 轮正文没有实际进入宴会厅，`beatAfterStateFold` 仍从 `4-03-第一章` 推进到 `5-01-第一章`。
- `triggeringPressure`: 第 26 轮 prompt 把当前地点列为 `宴会厅`，当前故事线列为 `推进节点 05-01：宴会厅环境与人群`，并在当前故事线素材中要求宴会厅权力场、灯光、人群、康纳相关铺垫。
- `missingGuard`: 缺少“transition beat 必须已经在玩家可见文本中完成”才能被消费的校验；缺少跨回合 `currentSceneAnchor`；第 25 轮“不要实际推进地点变化”的约束没有阻止下一轮激活宴会厅节点。
- `directCause`: 第 26 轮 Director/Narrator 在被包装成宴会厅当前场景的上下文里处理“确认时间/告辞”，Director requiredContent 又要求“窗外光线、宴会灯光”等时间暗示，Narrator 因而输出 `data-bg="宴会厅"`、宴会厅高窗、水晶吊灯、白色桌布和酒会声。
- `propagation`: Choice generator 随后提供“留下来，等她继续说康纳的事”等选项；turn-26 runtime-after 继续推进到 `5-02-第一章` 并把 `康纳` 加入 charactersOnStage；第 27、28 轮继续沿宴会厅叙事发展。
- `nonCauses`: 不是玩家选择导致；不是长期 memory 缺失，因为最近公寓文本在 prompt 中清楚可见；不是 evaluator 误判；也不是纯 `model-local`，因为 prompt/state 的宴会厅压力很强且已经由 lifecycle 提前推进。

## Root Cause
- `rootCause.label`: `storyline-lifecycle`
- `family`: `agent-system`
- `secondaryFamilies`: `recent-context`
- L3 机制：transition beat 的 lifecycle 与玩家可见实现脱钩。系统在 `进入宴会厅` 节点尚未被可见正文桥接完成时，就将该节点消费并激活后续宴会厅节点；prompt assembler 随后把新 `currentStoryline` 和 `currentLocationId` 前景化，压过最近可见的公寓锚点，导致 Narrator 把普通的“确认时间/告辞”写成宴会厅内行为。
- 这不是 `Director`、`Narrator`、`Choice`、`statefold` 本身作为根因；它们分别是链路中的位置。可复发的机制是 `storyline-lifecycle` 缺少基于玩家可见转场完成度的消费/推进防线。

## Evidence
- 玩家可见证据：`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl` 第 25 轮仍在公寓，第 26 轮开头直接进入宴会厅元素。
- 内部 trace：`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-25/04-output.json` 保留“不实际推进地点变化”的约束；`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-25/01-summary.json` / `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-25/05-runtime-after.json` 把下一轮推进到 `5-01-第一章`；`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-26/06b-narrator-prompt.md` 把 `宴会厅` 作为当前地点/故事线；`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-26/04-output.json` 将错误地点玩家可见化。
- 传播证据：`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-26/05-runtime-after.json` 推进到 `5-02-第一章` 并扩展 charactersOnStage；第 27、28 轮继续以宴会厅为场景。

## Recommended Fix Area
- 在 quest/storyline lifecycle 中增加 visible-transition completion gating：`4-03-第一章` 这类 transition beat 只有在可见正文实际出现出门、路程、抵达或进入宴会厅桥段后，才能被标记 consumed/complete 并激活 `5-01-第一章`。
- 在 prompt assembly 中增加 `currentSceneAnchor` 与冲突优先级：当 `currentLocationId/currentStoryline` 与最近可见正文冲突时，必须要求 Director 先桥接或回退，而不是直接把新地点作为当前事实。
- 将 Director 的跨回合约束（如“不在此轮实际推进地点变化”）写入 runtime/storyline pending guard，供下一轮 statefold 和 prompt 使用。
- 对 Choice/runtime propagation 增加 guard：未桥接的场景跳转不能继续生成后续关键人物/宴会选项并固化到后续 beat。

## Confidence
- `confidence`: `high`
- 置信度依据：玩家可见断裂清楚；内部 artifacts 显示 `4-03` 未可见完成却被消费，`5-01` 被前景化，且错误继续传播到后续 runtime 和可见轮次。
