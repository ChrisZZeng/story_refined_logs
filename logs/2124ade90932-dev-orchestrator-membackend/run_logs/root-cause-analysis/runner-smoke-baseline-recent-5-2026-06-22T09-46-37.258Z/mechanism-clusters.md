# Mechanism Clusters

## context-priority

family: agent-system

score: 8.00

fixSurface:
- recent-turn assembly contradiction flag
- Director clue correction handoff
- Narrator output consistency check against resolved clues
- 在 recent context 与 Director handoff 中标注 clue 冲突和 resolved 状态，避免上一轮错误以“最近事实”身份继续传播。
- character-card/context assembly conflict detection
- Director -> Narrator mustKeep/mustNotContradict handoff
- post-generation contradiction validator
- 优先修复 character-card/context assembly 与 Director -> Narrator handoff 的冲突仲裁和 must-not 约束。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 6 | 15 | medium | fact-conflict | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-002/issues/issue-006-turn-15/root-cause-report.md |
| 14 | 42 | high | fact-conflict | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-005/issues/issue-014-turn-42/root-cause-report.md |

## choice-action-binding

family: agent-system

score: 4.00

fixSurface:
- candidateActions schema: split actionId, actionLabel, playerFacingText, thematicHint
- choice prompt: require actionable button rewrite and reject non-action clauses
- choice generation validator: flag button text containing unexplained thematic fragments
- 优先修复 Choice 候选动作 handoff：候选动作的机器语义与玩家按钮文案分层，并在 Choice worker 输出前做动作化文案校验。
- selected choice coreAction/forbiddenAssumptions 提取
- Director prompt 的玩家行动边界 contract
- Narrator prompt 对询问/观察/等待型输入的 unresolved ending 规则
- Choice generator 对未决邀请状态的选项保留
- 修复 choice-action-binding：为询问、观察、犹豫、等待型选项生成 must-preserve action boundary，并要求本轮停在玩家确认点。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 1 | 7 | low | quality-regression | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-001/issues/issue-001-turn-07/root-cause-report.md |
| 10 | 28 | medium | user-input-ignored | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-003/issues/issue-010-turn-28/root-cause-report.md |

## fixed-beat-consumption

family: agent-system

score: 4.00

fixSurface:
- currentStoryline beat lifecycle: 为固定过渡 beat 增加 consumed/resolved/incompatible 状态。
- Director prompt assembly: 当 fixed beat 已在 recent visible text 中出现时，将约束降级为承接要求，而不是再次 requiredContent。
- state writeback: 保存关键连续动作的细粒度 scene state，例如 knockSequence/lastKnockPattern/pendingDoorResponse。
- Narrator handoff contract: 对序数声响要求必须说明计数基准，不能在基准不清时使用“第几声/第几次”。
- 优先修复 storyline fixed beat lifecycle 和 Director handoff 中的 recent visible sequence 校准；其次补充 runtime scene state 对连续声响的细粒度写回。
- storyline beat lifecycle / consumed-state tracking
- Director prompt/context assembly
- scene anchor or current-scene progress state
- requiredContent de-duplication and downgrade rules
- 优先在 storyline beat lifecycle 和 Director prompt/context assembly 中增加 scene-establishment 的 consumed-state 过滤与强 scene anchor：当上一轮已写过入场和环境建立时，将后续 beat 的相同要求改写为承接/变奏/只补未写信息，而不是进入 requiredContent。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 12 | 37 | low | fact-conflict | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-004/issues/issue-012-turn-37/root-cause-report.md |
| 21 | 49 | medium | repeated-scene | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-007/issues/issue-021-turn-49/root-cause-report.md |

## clue-target-binding

family: agent-system

score: 3.00

fixSurface:
- story state clue/object binding schema
- Director-to-Narrator scoped clue handoff
- Narrator preflight consistency check for resolved clues
- 为 clue target、source、resolvedAtTurn 建结构化状态，并在 Director/Narrator prompt 中以高优先级约束呈现。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 5 | 13 | medium | fact-conflict | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-002/issues/issue-005-turn-13/root-cause-report.md |

## missing-current-scene-time-anchor

family: detail-memory

score: 3.00

fixSurface:
- story/runtime state temporal anchor fields
- state writeback for visible time cues
- Director prompt currentTimeOfDay contract
- Choice temporal consistency check
- 为当前场景时间锚建立写回和 handoff，使 Director 在规划任务窗口前必须看到 currentTimeOfDay，并要求时间改变必须有玩家可见过渡。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 7 | 16 | medium | space-time-break | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-002/issues/issue-007-turn-16/root-cause-report.md |

## visible-knowledge-gating

family: agent-system

score: 3.00

fixSurface:
- Choice prompt assembly: 将 currentStoryline.interactionFollowup 拆分为 internal candidate 与 playerVisibleCandidate，并在进入 prompt 前做 visibility validation。
- Choice generator contract: 对每个 option 的人物姓名、关系、动机、旧怨字段做 visibleText support check；无支持时改写为“询问身份/追问来意/观察卡琳娜反应”等普通行动。
- Storyline schema: 为 followup candidate 增加 revealPrerequisites 或 minVisibleFacts，避免作者视角分支被直接当作玩家选项。
- Narrator rendering guard: 内部 characterId 在未介绍前只能渲染为可见别名，例如“门外的男人/白西装男人”，不能直接输出稳定姓名。
- 优先修复 Choice candidate visibility gating 和 story state followup schema；同时补 Narrator 的未揭示角色 ID 渲染保护。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 13 | 41 | medium | unsupported-jump | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-004/issues/issue-013-turn-41/root-cause-report.md |

## missing-current-scene-anchor

family: agent-system

score: 3.00

fixSurface:
- scene state/writeback for currentScene and playerPosition
- Narrator prompt high-priority scene anchor injection
- Choice option validation against scene anchor
- 优先修复 scene state/writeback，并在 Narrator 与 Choice 阶段注入和校验 currentScene/playerPosition/doorState。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 16 | 42 | medium | space-time-break | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-005/issues/issue-016-turn-42/root-cause-report.md |

## choice-visible-grounding-gap

family: agent-system

score: 3.00

fixSurface:
- Choice prompt/context assembly
- choice visible-grounding validator
- Director-to-Choice handoff schema distinguishing plannedContent from observedVisibleContent
- 为 Choice 阶段加入 visibleText grounding：选项里的专有名词、代词回指和“刚才说的”必须能在玩家可见窗口中匹配；Director 的计划字段不能直接作为 observed fact 使用。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 18 | 45 | medium | unsupported-jump | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-006/issues/issue-018-turn-45/root-cause-report.md |

## storyline-visible-introduction-gating

family: agent-system

score: 3.00

fixSurface:
- storyline fixed-beat visible-introduction gate
- Director requiredContent filtering
- Choice action candidate visibility checks
- 为固定 beat 和候选 action 增加 `introducedToPlayer` / `visibleNameEstablished` gating；未引介 NPC 的专名不能进入 requiredContent、正文或 action text，必须先安排可见桥接。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 20 | 48 | medium | unsupported-jump | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-006/issues/issue-020-turn-48/root-cause-report.md |

## speaker-pronoun-contract

family: agent-system

score: 2.25

fixSurface:
- Narrator prompt actor-pronoun rules
- structured dialogue schema validation
- post-generation validator for non-player data-speaker second-person body/voice phrases
- 优先修复 Narrator prompt/output schema 的 actor-pronoun contract，并增加非玩家 speaker 第二人称身体/声音描写校验。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 15 | 42 | medium | identity-drift | medium | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-005/issues/issue-015-turn-42/root-cause-report.md |

## fixed-beat-detail-incompatibility

family: agent-system

score: 1.00

fixSurface:
- fixed beat authoring/lint: validate object detail terms against established item facts
- Director prompt: define priority and rewrite policy when fixed dialogue conflicts with visible facts
- requiredContent builder: attach conflict warnings or softened paraphrase permissions
- 为 fixed beat / interactionFollowup 增加道具事实 lint，并在 Director requiredContent 阶段允许对冲突固定台词做最小事实修正或显式标注为谎话。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 3 | 9 | low | fact-conflict | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-001/issues/issue-003-turn-09/root-cause-report.md |

## continuation-boundary

family: agent-system

score: 1.00

fixSurface:
- Narrator handoff: include continuation cursor / last completed beat
- Director output: specify startAfter or alreadyDone facts for immediate scene continuations
- repetition validator: compare first generated sentence against previous visible tail
- 在 Narrator handoff 中加入 continuation cursor 或 `alreadyDone` 列表，并对生成首句和上一轮尾句做近重复校验；Director 对即时连续场景应显式说明从哪个已完成动作之后开始。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 4 | 9 | low | repeated-scene | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-001/issues/issue-004-turn-09/root-cause-report.md |

## fixed-beat-literal-replay

family: agent-system

score: 1.00

fixSurface:
- fixed beat requiredContent 的 literal line rewrite 检查
- Director prompt 中 visible time-of-day anchor 的优先级规则
- Narrator 对固定台词与当前时间冲突的改写许可
- 为 fixed beat requiredContent 增加 visible context 适配层，尤其是时间、地点、称谓、动作状态的 literal line rewrite。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 9 | 27 | low | space-time-break | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-003/issues/issue-009-turn-27/root-cause-report.md |

## model-local

family: llm-self

score: 1.00

fixSurface:
- Narrator 输出后的局部语义一致性 lint
- 同一事件窗口内“不是 X”与后续 X 命名冲突检测
- Narrator prompt 对异常声音修辞的限定
- 增加 Narrator 输出后的局部语义一致性 lint，并在 prompt 中要求异常声音必须说明异常点而不能先否定事件类型再按该类型推进。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 11 | 36 | low | fact-conflict | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-003/issues/issue-011-turn-36/root-cause-report.md |

## format-protocol-validation-gap

family: agent-system

score: 1.00

fixSurface:
- Narrator output validator
- v3-html parser/normalizer
- turnContent post-generation repair or retry policy
- 为 Narrator 的 v3-html 输出增加确定性结构校验：检查 data-speaker 帧内引号平衡、段落边界和根级文本；失败时重试或自动修复。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 17 | 45 | low | quality-regression | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-006/issues/issue-017-turn-45/root-cause-report.md |

## storyline-lifecycle

family: agent-system

score: 1.00

fixSurface:
- storyline node activation / entry gating
- Choice candidate filtering
- visible anchor validation for future-node followups
- 为 storyline followup 加可见 entry gate：只有对应名词、地点、时间或邀请在 final visibleText 中建立后，相关候选选项才可显示；时间词必须来自 visible/current state 锚点。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 19 | 46 | low | unsupported-jump | high | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-006/issues/issue-019-turn-46/root-cause-report.md |

## current-scene-time-anchor

family: agent-system

score: 0.75

fixSurface:
- story state/current scene model: include currentTimeOfDay or visible time anchor
- Director prompt: when requesting light change, state whether it is spatial lighting or time passage
- Narrator prompt/validator: flag new time-of-day claims without visible transition
- 为当前 scene/beat 增加显式 time-of-day anchor，并要求 Director 在光线变化是空间转场还是时间流逝时做区分；Narrator 输出新增“夜色、清晨、黄昏”等时间词时应校验是否有玩家可见过渡。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 2 | 8 | low | space-time-break | medium | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-001/issues/issue-002-turn-08/root-cause-report.md |

## current-scene-anchor

family: agent-system

score: 0.75

fixSurface:
- Director-to-Narrator handoff 的 sceneBlocking/actor-position 字段
- 围堵、追逐、进入场景的方向一致性检查
- Narrator prompt 中对最近空间锚点的高优先级呈现
- 为 Director-to-Narrator handoff 增加当前场景 sceneBlocking，并对同一事件内方向短语做一致性校验。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 8 | 27 | low | space-time-break | medium | /Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-003/issues/issue-008-turn-27/root-cause-report.md |
