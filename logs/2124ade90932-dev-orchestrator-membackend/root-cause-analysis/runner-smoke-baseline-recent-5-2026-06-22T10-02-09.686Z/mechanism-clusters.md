# Mechanism Clusters

## current-scene-anchor

family: agent-system

score: 5.75

fixSurface:
- Director current-scene entity validation
- Narrator first-mention constraints
- scene entity inventory / visible entity tracker
- 为 storyline 到 Director/Narrator 的 handoff 增加 visible entity anchor 检查和首次引入模板，未可见实体不得被写成“那只”或“一直在场”。
- current scene entity state
- Narrator prompt assembly
- adjacent-turn spatial continuity checker
- 为当前场景显著实体维护结构化位置锚点，并在 Narrator prompt 中前置；新增相邻轮次实体位置跳变检查，要求桥接动作或避免引用旧位置。
- Director output schema 增加 startFrame / lastVisibleState / transitionRequirements
- Narrator prompt 强制从上一轮最后可见姿态开始
- requiredContent 姿态/位置/接触变化的 bridge validator
- current-scene anchor、transitionRequirements、姿态/接触 bridge validator。
- Director prompt/context assembly: 增加上一轮终态 currentSceneAnchor。
- Director output validation: 检查 actionHint 是否从上一轮终态连续。
- Narrator prompt: 明确禁止无过渡改写上一轮结尾姿态。
- 在 Director/ Narrator 链路中加入结构化当前场景姿态锚点和姿态连续性校验。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 3 | 8 | low | unsupported-jump | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-001/issues/issue-003-turn-08/root-cause-report.md |
| 6 | 11 | low | space-time-break | medium | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-002/issues/issue-006-turn-11/root-cause-report.md |
| 9 | 19 | medium | unsupported-jump | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-003/issues/issue-009-turn-19/root-cause-report.md |
| 15 | 49 | low | space-time-break | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-005/issues/issue-015-turn-49/root-cause-report.md |

## fixed-beat-consumption

family: agent-system

score: 4.00

fixSurface:
- storyline lifecycle
- fixed beat consumed-state tracking
- Director duplicate-beat rewriting
- 在 storyline 节点和 Director 层增加 fixed beat 消费/去重逻辑，对相邻 turn 同一 NPC 已说过的线索只允许补充新信息。
- storyline / fixed beat lifecycle 的 consumed / remaining / incompatible 状态
- Director context assembly 中对已完成固定素材降权或移除
- Director requiredContent 与最近 visible text 的重复校验
- fixed beat lifecycle、Director context assembly、requiredContent duplicate check。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 2 | 3 | low | repeated-scene | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-001/issues/issue-002-turn-03/root-cause-report.md |
| 8 | 19 | medium | repeated-scene | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-003/issues/issue-008-turn-19/root-cause-report.md |

## memory-persistence

family: detail-memory

score: 4.00

fixSurface:
- detail fact persistence for key clue objects
- story state / statefold summarization
- Director-to-Narrator prompt assembly
- object-detail consistency check
- 将关键照片等线索物件的视觉细节持久化，并在后续涉及同一物件时注入 Narrator prompt 作为 must-preserve context；同时增加同一物件描述的 detail conflict 检查。
- Location state writeback: 保存关键存在物和显式不存在物。
- Choice affordance generator: 从 visibleText/locationState/action candidates 生成可检查对象白名单。
- Choice validation: 阻止具体 inspectable object 在未建立时进入选项。
- 地点细节持久化和 Choice 阶段可交互物件 grounding。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 5 | 10 | medium | fact-conflict | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-002/issues/issue-005-turn-10/root-cause-report.md |
| 16 | 50 | low | fact-conflict | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-005/issues/issue-016-turn-50/root-cause-report.md |

## selected-choice-continuation

family: agent-system

score: 2.25

fixSurface:
- selected choice handoff 增加 selectedFromTurn / respondsToLastPrompt / lastVisibleFrame
- Narrator prompt 最终指令强制从 player action / selected answer 开始
- Narrator 输出前段与最近 visibleText 的 duplicate guard
- selected-choice handoff、Narrator start-frame contract、recent-prefix duplicate check。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 10 | 21 | medium | repeated-scene | medium | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-003/issues/issue-010-turn-21/root-cause-report.md |

## choice-action-binding

family: agent-system

score: 2.00

fixSurface:
- choice finalization / action binding
- candidateActions text validation
- Choice worker output preservation for bound actions
- 修复 choice finalization，使 `actionId` 绑定不覆盖 Choice worker 的清晰 display text，并为候选动作文本增加可执行行动校验。
- Choice generation prompt/context assembly
- currentInteractionState or affordance extraction after Narrator
- choice post-generation consistency validator
- 为 Choice worker 增加当前可操作对象、已完成动作和必要前置动作的结构化输入，并对生成选项做状态一致性校验。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 1 | 3 | low | quality-regression | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-001/issues/issue-001-turn-03/root-cause-report.md |
| 11 | 29 | low | space-time-break | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-004/issues/issue-011-turn-29/root-cause-report.md |

## current-scene-anchor-gap

family: recent-context

score: 1.00

fixSurface:
- Narrator context assembly
- current scene spatial anchor extraction
- micro-spatial consistency lint
- 为 Narrator 增加当前场景微空间锚点，尤其是连续环境对象的位置、移动方向和关联家具；必要时增加后置 lint。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 12 | 38 | low | space-time-break | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-004/issues/issue-012-turn-38/root-cause-report.md |

## anti-repetition-contract-gap

family: agent-system

score: 1.00

fixSurface:
- Director prompt contract
- Narrator prompt contract
- recent motif extraction and cooldown
- quality regression lint for repeated action beats
- 增加 recent motif tracking，把近几轮动作和环境母题转为 avoid/cooldown constraints，并要求信息不能揭示时选择新的非信息推进方式。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 13 | 43 | low | quality-regression | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-004/issues/issue-013-turn-43/root-cause-report.md |

## current-appearance-persistence

family: detail-memory

score: 1.00

fixSurface:
- visible detail writeback
- character currentAppearance state
- prompt priority between current visible appearance and default character card
- appearance continuity lint
- 将同场景可见服装写入 currentAppearance/detail state，并在 prompt 中明确它优先于角色卡默认服装；增加外观连续性检查。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 14 | 47 | low | identity-drift | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-004/issues/issue-014-turn-47/root-cause-report.md |

## entity-location-anchor

family: recent-context

score: 0.75

fixSurface:
- statefold entity location writeback
- runtime-after current scene entity inventory
- Narrator prompt current-location table
- intra-sentence spatial consistency check
- 补上 scene entity location writeback，并在 Narrator prompt 中显式列出当前实体位置，避免从 recent prose 旧短语恢复过期位置。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 4 | 9 | low | space-time-break | medium | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-001/issues/issue-004-turn-09/root-cause-report.md |

## model-local

family: llm-self

score: 0.75

fixSurface:
- Narrator 输出后的中文文本质量检查与轻量修复
- visibleText 提交前的 malformed sentence detector
- Narrator style guard：短句优先，避免多重指代套叠
- Narrator 后处理 QA 与 malformed sentence 局部修复。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 7 | 19 | low | quality-regression | medium | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-003/issues/issue-007-turn-19/root-cause-report.md |
