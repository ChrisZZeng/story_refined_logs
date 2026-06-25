# Mechanism Clusters

## choice-action-binding

family: agent-system

score: 40.25

fixSurface:
- choiceGenerator: key candidateActions 也必须通过可见文本改写或 lint
- candidate action schema: 分离 machineLabel/actionId 与 playerFacingText
- choice output validator: 禁止逗号拼接的抽象短语或非动作尾巴
- 优先修复 choice pipeline：所有 key choice 的 player-facing text 都经过同一套短、具体、动作化的改写和 lint，不允许状态机 text 直接覆盖最终 choices。
- Choice schema: include actionPayload/offerContent expectations for transactional choices
- Director prompt: validate selected-choice feasibility against recent facts
- Narrator prompt: enforce selected action core intent or explicitly adapt with in-world refusal
- 优先修复选择语义绑定与交易类动作的可行性检查：没有新情报时不要生成“用情报交换”选项，或让 Director 明确把它改写为“坦白经历/证据换取信任”。
- Choice generator: validate options against immutable/player-visible core memories
- Director schema: add selectedChoiceInterpretation with preserveFacts list
- Narrator prompt: when selected text conflicts with core memory, frame as uncertainty/evasion rather than factual rewrite
- memory/state model: persist player-visible core memories separately from hidden truth
- 优先修复 Choice 与 selected-choice execution 的核心记忆约束：对主角身份、重大死亡记忆、亲历/未亲历这类事实建立不可被普通选项改写的 player-visible memory contract。
- choice generator scene-affordance schema
- object holder/location extraction from latest visible text
- post-choice validator for impossible object interactions
- 为 Choice worker 增加对象可用性抽取与验证：选项中的动词目标必须与 latest visible scene 中的 holder/location 一致；不一致时改写为“追问信封内容”等可行行动。
- selected-choice feasibility validator before Director
- Director prompt contract for impossible actions
- state/object affordance model for movable props
- 在 Director 前增加 selected choice 可执行性层：如果动作目标已离场，应生成承接文本（例如主角意识到信封被带走，转为询问卡琳娜）而不是重写物件位置。
- choice prompt open-question contract
- recent-turn consumed-reveal ledger
- choice generation duplicate-question filter
- 优先修复 Choice worker 的选项语义合约：在 prompt 或输入 schema 中提供 answeredQuestions/consumedReveals，并在生成后过滤与最近一两轮已回答问题等价的选项；当只想询问“额外后续”时，选项必须显式写成“除此之外还有没有别的”。
- choice-to-director semantic contract
- director recent-answer dedupe
- consumed-reveal lifecycle state
- 在 Director 前增加 recent-answer/repeated-question 检查：当玩家输入由系统选项触发且命中最近已回答内容时，Director 应改写为“她后来没有再说别的”或推进到未回答维度；同时让 Choice 输出携带 intent，例如 ask_additional_after_revealed_fact，而不是裸文本。
- Choice option schema 增加 antecedent/targetUtterance/targetSpeaker 字段
- selected choice -> Director handoff 中保留上一轮结尾引用片段
- Director 消歧规则：代词类选项优先检查最近未解释 utterance，并在歧义时保持提问而非替玩家指定旧主题
- 修复 selected-choice 语义绑定：对“这句话/那句话/刚才那件事”等 deictic 选项保存引用目标，并要求 Director 不得丢弃该目标。
- choice schema/action parser with target and askSubject fields
- Director must-satisfy player intent contract before applying storyline followup
- fixed beat adapter that answers/bridges selected question before advancing invitation beat
- regression tests for pronoun-target preservation in Chinese choices
- 优先修复 selected choice 到 Director 的 action binding：把代词目标和询问对象结构化，并要求固定剧情 beat 在满足核心玩家问题后才能推进。
- Choice prompt: equipment affordance constraints
- choice validator: impossible-action filter
- story state: persisted camera type and film-development status
- 在 Choice generator 前增加 equipment/action affordance 层，把胶片相机状态持久化为“canShoot=true, canReview=false until developed”，并在选项提交前过滤违反物理规则的 action text。
- Choice generator action feasibility validator
- equipment state model: cameraType and filmDevelopmentStatus
- prompt contract: do not offer actions that require unavailable object affordances
- 为 Choice generator 增加 “object affordance + temporal precondition” 过滤：胶片相机的 justTakenFrame 只能“继续过片/检查设置/记录位置”，不能“翻看照片”，除非已有显影/打印可见事件。
- Choice generator option novelty scoring
- selected action schema with consumed/continuation metadata
- Director duplicate-action handling prompt
- 为 Choice 增加已消费动作过滤和相似度去重；为 Director 增加 duplicate selected action 的 continuation/variation contract。
- Choice generator affordance validation
- object/device capability schema
- impossible-action option filter
- 在 Choice 阶段引入 object affordance 约束：选项必须通过设备规则校验，尤其过滤“底片相机即时查看照片”这类不可行动作。
- Choice generation grounded inventory filter
- selected choice to playerInput handoff validator
- Director/Narrator unsupported-object reconciliation prompt
- 为 Choice 增加 inventory-grounded action 生成与选中选项校验：未建立物件只能通过明确发现/取出/回忆来桥接，不能直接作为已存在容器。
- choice generation：生成取物选项前按 object-location state 校验容器/来源。
- state model：为关键随身物记录 owner/location/container，并将其放入 prompt 的高优先级 current inventory。
- handoff contract：Director/Narrator 在承接 selected choice 时区分“玩家意图”和“选项文本中可能错误的来源”，必要时桥接或修正。
- 优先修复 Choice 的取物动作绑定和关键物件 inventory 状态；同时让 Director/Narrator 对 selected choice 的物件来源进行一致性校验。
- choice generation：引入 reachable item/action validator，禁止从不可达容器取物。
- state model：记录 actor location、item location、carried/on-person/nearby 的可达性。
- prompt assembly：在 Choice prompt 高优先级处列出 current affordances，如“身上可取物/需回屋才可取物”。
- 优先修复 Choice 的 current-scene affordance 与 item reachability 校验，防止等待场景中把室内物件当作室外手边物件。
- Choice generator 的 current-scene affordance/object reachability check
- selected choice -> playerIntent normalization 中的 source-of-truth 标记
- Narrator prompt 中 playerInput 与 visibleText 冲突时的优先级规则
- 轻量 objectLocation state，用于常用道具的当前可达性
- 优先修复 Choice 选项生成与 selected-action handoff：选项必须通过当前场景可达性校验；当叙述阶段改写选项中的物件来源时，应把原选项标记为不可靠来源，后续只以 visibleText 为已发生事实。
- choice prompt 的 object affordance contract
- choice post-generation consistency validator
- story state/currentStoryline summary 中物件规则的结构化写入
- 为 Choice worker 增加物件 affordance 提取与校验：从最近正文/结构化 state 中识别 film camera，禁止生成即时预览、删除或改写与物件规则冲突的普通选项。
- choice current-scene anchor validation
- selected choice repair/bridge contract
- runtime location state writeback
- 在选项生成和 selected choice 消费之间增加 scene-location invariant：若当前位置为屋内，禁止/修复“回到屋里”类选项；若已暴露给玩家，则下一轮必须桥接为“往门边挪”而非重新进屋。
- choiceGenerator prompt/schema: 增加 negative affordance 和 world-rule checklist
- post-choice validator: 检查选项是否与本轮正文中的 cannot/无法/不能 约束冲突
- actionId binding: 禁止生成未在候选动作中出现的 anchor/actionId
- 修复 Choice 层的 action affordance 约束：从本轮正文提取不可做事项，并在选项生成后进行冲突校验；同时禁止未提供候选的 actionId/anchor 幻觉。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 2 | 3 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-001/issues/issue-002-turn-03/root-cause-report.md |
| 6 | 9 | low | user-input-ignored | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-002/issues/issue-006-turn-09/root-cause-report.md |
| 8 | 14 | medium | fact-conflict | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-002/issues/issue-008-turn-14/root-cause-report.md |
| 10 | 19 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-003/issues/issue-010-turn-19/root-cause-report.md |
| 11 | 20 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-003/issues/issue-011-turn-20/root-cause-report.md |
| 22 | 33 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-009/issues/issue-022-turn-33/root-cause-report.md |
| 23 | 34 | low | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-009/issues/issue-023-turn-34/root-cause-report.md |
| 32 | 70 | medium | user-input-ignored | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-011/issues/issue-032-turn-70/root-cause-report.md |
| 37 | 86 | medium | user-input-ignored | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-037-turn-86/root-cause-report.md |
| 51 | 123 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-016/issues/issue-051-turn-123/root-cause-report.md |
| 52 | 125 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-016/issues/issue-052-turn-125/root-cause-report.md |
| 58 | 132 | medium | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-018/issues/issue-058-turn-132/root-cause-report.md |
| 59 | 134 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-018/issues/issue-059-turn-134/root-cause-report.md |
| 64 | 147 | medium | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-019/issues/issue-064-turn-147/root-cause-report.md |
| 66 | 150 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-020/issues/issue-066-turn-150/root-cause-report.md |
| 67 | 157 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-020/issues/issue-067-turn-157/root-cause-report.md |
| 69 | 159 | low | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-021/issues/issue-069-turn-159/root-cause-report.md |
| 73 | 161 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-022/issues/issue-073-turn-161/root-cause-report.md |
| 74 | 162 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-022/issues/issue-074-turn-162/root-cause-report.md |
| 79 | 180 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-023/issues/issue-079-turn-180/root-cause-report.md |

## storyline-lifecycle

family: agent-system

score: 27.00

fixSurface:
- storyline beat activation/consumption guard
- choice prompt context assembly visible-entity filter
- choice output validator for unseen named entities
- 优先修复 storyline 生命周期与 Choice prompt 的解锁边界：只有玩家可见触发已发生的 beat、角色名和关系才能进入选项可用素材；对输出选项做 unseen entity 检测。
- quest/storyline beat completion gating
- statefold visible-transition verification
- prompt assembler currentSceneAnchor and location conflict priority
- Director currentStorylineConstraints persistence across turns
- choice/runtime propagation guard for unbridged scene transitions
- 优先修复 storyline/statefold 的 transition beat lifecycle：只有当上一轮可见正文实际完成离开公寓、路程或进入宴会厅的桥段时，才允许消费 `4-03-第一章` 并激活 `5-01-第一章`；同时在 prompt assembly 中增加 currentSceneAnchor，对 currentLocation 与 recent visible text 冲突时强制要求桥接或回退。
- quest/storyline statefold beat completion and transition gating
- current-scene anchor in story state and prompt assembly
- Director contract for location-changing beat compatibility
- runtime validation for currentStoryline vs recent visible location
- 优先修复 storyline/statefold 的地点切换 beat 消费规则：为 04-02/04-03 这类 transition beat 增加 visible-transition predicate（邀请/接受/移动/到达），并在 prompt assembly 中添加 current-scene anchor 与冲突校验；当 currentStoryline 与最近可见地点冲突时，Director 必须 bridge/rewrite/delay，而不是直接使用后续节点。
- quest/storyline transition guard：节点完成前检查 required visible anchors 是否已在正文或事件中落地
- current-scene anchor model：将 player-visible location、route、known destinations 作为高优先级结构化状态传给 Director/Narrator
- prompt assembler priority：当 currentStoryline 与 recent visible text 冲突时显式标记 contradiction，并要求优先 recent visible text 或桥接
- hidden-to-visible reveal gate：未在可见时间线出现的地点名/人物关系不得作为选项或目的地输出
- 优先修复 storyline runtime 的节点生命周期与可见场景锚点校验；同时调整 Director prompt 的冲突优先级和隐藏地点 reveal gate。
- quest/storyline lifecycle state machine
- anchor activation and beat completion evidence gate
- statefold/currentStorylineConstraints carryover
- Director prompt assembly conflict-priority rules
- Narrator handoff contract for ambiguous 'mention X' instructions
- 优先修复 quest/storyline lifecycle：对固定 beat 完成和 anchor 激活增加玩家可见证据校验；玩家绕过固定节点时标记 deferred/skipped/incompatible，并把“主角尚未见过康纳”这类负向进度作为当前硬约束进入 Director/Narrator prompt。
- Storyline node lifecycle: add skipped/incompatible state when a player declines a branch.
- Director handoff contract: distinguish allowed topic mention from already-seen event details.
- Narrator prompt guard: forbid creating concrete prior events unless present in visible timeline or explicit Director beat with support.
- 修复 storyline lifecycle 与 handoff 可见性边界：declined branch 必须显式 skipped，后续只能讨论“听说/被提醒/可能会见”而不能生成“已经坐在对面”的 prior event。
- storyline objective schema: 支持 active rendezvous(time, location, counterparty, deadlineStatus)
- pre-LLM event scheduler: 时间达到/接近 deadline 时注入 door-meeting 或 missed-rendezvous 事件
- Choice gating: deadline 临近时优先提供去门口/确认迟到，禁用无期限室内等待
- statefold/currentStoryline: 不要把 exact time/location 压缩成泛化‘等待天亮出发’
- 优先修复 storyline lifecycle 和时间门限事件：把玩家可见的约定时间、地点、对象存成 active objective，并在 Choice/Narrator 前强制处理。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 9 | 16 | medium | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-003/issues/issue-009-turn-16/root-cause-report.md |
| 17 | 26 | high | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-005/issues/issue-017-turn-26/root-cause-report.md |
| 18 | 27 | medium | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-006/issues/issue-018-turn-27/root-cause-report.md |
| 19 | 28 | high | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-007/issues/issue-019-turn-28/root-cause-report.md |
| 21 | 31 | high | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-008/issues/issue-021-turn-31/root-cause-report.md |
| 43 | 106 | medium | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-014/issues/issue-043-turn-106/root-cause-report.md |
| 48 | 118 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-015/issues/issue-048-turn-118/root-cause-report.md |

## context-priority

family: agent-system

score: 15.50

fixSurface:
- prompt context assembler: detect hidden/public fact conflicts and foreground public-state override
- Director schema: add explicit resolvedFacts/conflictResolution field
- Narrator prompt: add hard constraint that recent visible denial cannot be contradicted without in-world acknowledgement
- 优先修复 context assembly 与 Director/Narrator handoff 的冲突优先级，把最近玩家可见事实提升为硬约束，并在角色卡冲突时要求桥接或不采用隐藏事实。
- current-scene entity pose/time-anchor schema
- Narrator prompt 中对“仍然/还/和离开时一样”等连续性比较的核对规则
- post-generation consistency lint：比较词涉及上一离场/入场时间点时回查最近 visibleText
- 为当前场景中的角色姿态增加 lastSeenPose/atPlayerExit/currentPose 区分，并在 Narrator 生成时间比较短语时执行显式回查。
- Narrator prompt posture-state transition rules
- short-horizon body affordance checker after generation
- state representation for player/NPC posture in current scene
- style phrase reuse guard when an action changes posture/location
- 优先增加短程姿态状态锚点：当本轮动作改变坐/站/走等 body state 时，Narrator 和后置检查必须让新姿态覆盖旧描述模板。
- Director prompt/context assembly: add current-scene object-state anchor for interactive objects.
- Narrator handoff schema: include objectState deltas such as book.open=false and require reopen action before page/symbol descriptions.
- State writeback: persist close/open and item position when visible text changes them.
- 为最近可见动作生成 current-scene physical state，并在 Director/Narrator 前执行“最新物体状态优先于旧描写”的校验。
- Recent-turn context assembly: extract last visible pose/location deltas into current-scene anchors.
- Narrator prompt: add adjacent-turn posture continuity check before opening with character body position.
- Optional state writeback: lightweight character pose fields for active scene.
- 为相邻 turn 结尾生成 current-pose anchors，并要求 Narrator 开场身体动作不得回退到上一姿势，除非先写过渡动作。
- context assembly: current-scene object-location anchor
- Narrator prompt: latest-visible-state priority rule
- post-generation continuity check for object relocation without action
- 为 Narrator/Choice 的 prompt assembly 增加“当前物品位置”结构化摘要，并在生成后检查同一物品是否从 latest-visible location 无动作跳转。
- current-object-state extraction from recent turns
- Director handoff should include salient object properties when requiring item checks
- Narrator prompt priority rule for last-described physical state over generic sensory defaults
- 在 Director/Narrator handoff 中加入当前物体状态锚点，尤其当 requiredContent 要检查某件物品时，自动提取最近一次描述的温度、位置、封装和完整性作为 must-preserve facts。
- Narrator prompt context assembly
- current scene physical-state schema
- post-generation consistency check for local physical states
- 给当前场景加入结构化 surfaceState/currentPhysicalFacts，并在 Narrator 前后检查同一物体或表面状态是否被互斥改写。
- context assembly 的 current scene state priority
- Director summary 中的 monotonic time/light-state constraints
- Narrator prompt 的 recent-context vs established-state conflict guard
- 把光照/窗帘/时间推进等单调场景状态写入当前场景锚点，并在 prompt 排序中置于最近意象之前。
- prompt/context assembly: 为可计时环境细节生成 currentSceneAnchors
- Director schema: 对重复等待场景输出 latestPosition/continuityConstraints
- Narrator prompt: 对 recent visible state 的最新环境锚点增加硬约束
- 在 context assembly/Director handoff 中为连续等待场景抽取并前置 current-scene anchor，尤其是光线、物件位置、人物姿态等会跨轮递进的局部状态。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 5 | 8 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-002/issues/issue-005-turn-08/root-cause-report.md |
| 31 | 68 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-011/issues/issue-031-turn-68/root-cause-report.md |
| 36 | 84 | low | space-time-break | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-036-turn-84/root-cause-report.md |
| 42 | 97 | medium | event-negated | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-014/issues/issue-042-turn-97/root-cause-report.md |
| 44 | 108 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-014/issues/issue-044-turn-108/root-cause-report.md |
| 50 | 120 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-016/issues/issue-050-turn-120/root-cause-report.md |
| 55 | 129 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-017/issues/issue-055-turn-129/root-cause-report.md |
| 57 | 131 | low | fact-conflict | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-018/issues/issue-057-turn-131/root-cause-report.md |
| 62 | 139 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-019/issues/issue-062-turn-139/root-cause-report.md |
| 77 | 167 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-023/issues/issue-077-turn-167/root-cause-report.md |

## current-scene-anchor

family: agent-system

score: 12.75

fixSurface:
- scene state model: 保存 playerPosition/facing/blockers/entryPath
- Director prompt: 对介入角色要求 chooseOne entryVector 并持续使用
- Narrator validator: 同段落 relative-location drift 检查
- 优先修复 current-scene spatial anchoring：把最近一轮关键空间关系结构化进 Director/Narrator，并对同段新增角色的 entryVector 做一致性校验。
- context assembly: 为 Narrator 提供 currentScene.entityPose/currentLocation 的短锚点，来源于上一轮最后可见帧
- statefold/event extraction: 抽取角色最终姿态、位置和临时动作 consumed 状态
- Narrator prompt/check: 若复用最近动作，必须检查该动作是否已在上一轮结束
- 在 prompt/context assembly 与 statefold 之间增加可执行的 current-scene anchor：上一轮最后角色位置、姿态、手部状态，以及 transient action consumed 标记；Narrator 生成前优先继承该锚点。
- context assembly: 最近一轮最后角色姿态/手部状态应作为单独 high-priority field 放在 Narrator 指令附近
- statefold/event extraction: 为 transient posture 标记 started/ended/overridden，避免旧姿态在 recentTurns 中复活
- Narrator continuity validator: 检测同一角色手部/姿态从 pockets 到 hands-on-knees 的无桥接跳变
- 同 issue-13 一样，优先建立 current-scene final-state anchor 和 transient posture lifecycle；另外应在 recent context 中降低已被后续文本覆盖的姿态权重。
- current scene/state writeback from turnContent data-bg and visible scene cues
- prompt assembly priority for currentScene over storyline resource hints
- storyline scene/CG constraint lifecycle: consumed/incompatible beats must be marked and suppressed
- Narrator preflight check for scene-resource contradictions
- 优先修复 currentScene 写回与 prompt 组装优先级：把最新可见场景作为硬锚点传给 Director/Narrator，并在 storyline 节点的场景资源被近期文本覆盖后自动降权。
- context assembly: 为当前地点、主角姿态、手持/穿戴/摆放物品生成 last-visible-state anchor
- Narrator prompt: 在导演 JSON 后追加不可违背的 Current Scene Anchor，并要求旧位置必须由显式动作改写
- Choice prompt/output validator: 检查选项是否假设物品位于旧位置
- 优先修复 currentSceneAnchor / object-location statefold 与 Narrator/Choice 的硬约束注入，避免 recent prose 中旧位置覆盖最新可见状态。
- context assembly: 生成 playerPosture/currentLocation/currentNearbyObjects 的 concise anchor
- Narrator prompt: 要求正文首段从 current anchor 起笔，不能重新设定姿态
- Choice action binding: 对候选 actionId 的自然语言文本进行当前位置兼容性检查
- 优先修复 currentSceneAnchor 与 Choice option compatibility validator，确保当前地点/姿态在正文和选项阶段一致。
- Director output schema: currentLocation/currentPosture/doorState
- choice-action binding should include source state for selected option
- Narrator prompt hard rule: begin from previous visible ending state before realizing selected action
- runtime structured location state validation
- 为每轮 Narrator 合约增加 current-scene anchor，并在 Choice/Director handoff 中绑定选项发生的源位置；对移动/门/载具等状态建立简单一致性校验。
- current scene/object anchor schema：objectLocation、containerState、lastVisibleTurn
- Director -> Narrator handoff 中对必须桥接的物件移动生成 explicit bridge
- Narrator output local consistency validator，检测同一物件“already X / put to X”冲突
- state writeback 将常用道具开合状态写入可检索事实
- 为高频可携带物件增加 current-scene anchor 和 container state，并在 Director 交给 Narrator 的 beats 中要求先桥接移动/开合；增加同轮输出自检，禁止同一物件在同一段被描述为已经在目标位置又被放到目标位置。
- context assembly: 为当前场景抽取可持续环境锚点，例如 lightPosition、shadowDirection、wetness、objectLocation，并标注单调/不可回退规则。
- Director-to-Narrator handoff: 对返回同一地点的 turn 注入“do not regress visible environmental anchors”的当前场景约束。
- post-generation consistency check: 对同一名词短语和序数坐标做短窗可见文本回退检测。
- 优先修复 current scene continuity anchor 的抽取和注入；对光线、影子、水痕等可见环境细节建立短窗单调性 guard。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 4 | 5 | low | space-time-break | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-001/issues/issue-004-turn-05/root-cause-report.md |
| 13 | 22 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-004/issues/issue-013-turn-22/root-cause-report.md |
| 16 | 24 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-004/issues/issue-016-turn-24/root-cause-report.md |
| 34 | 76 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-034-turn-76/root-cause-report.md |
| 46 | 115 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-015/issues/issue-046-turn-115/root-cause-report.md |
| 47 | 117 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-015/issues/issue-047-turn-117/root-cause-report.md |
| 56 | 130 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-017/issues/issue-056-turn-130/root-cause-report.md |
| 70 | 160 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-021/issues/issue-070-turn-160/root-cause-report.md |
| 81 | 186 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-024/issues/issue-081-turn-186/root-cause-report.md |

## memory-persistence

family: detail-memory

score: 12.50

fixSurface:
- Item/inventory state model: persist owner/location for named portable objects.
- Director handoff schema: when mentioning a portable object, include currentOwner and whether transfer is required/visible.
- Prompt boundary: mark character-card example lines as non-events and forbid treating them as already happened.
- 建立 named item ownership persistence，并在 Director/Narrator handoff 中强制区分“提醒当前持有者带上”“本轮交给玩家”“玩家已持有”。
- inventory/detail fact writeback for consumables
- retrieval of exact item count/brand/package when an item is inspected
- Narrator prompt guard against inventing counts when state lacks exact value
- 把可消耗物品的品牌、数量、包装状态写入并检索 inventory/detail memory；在物品检查 prompt 中禁止从泛称补造精确数量。
- equipment/object-rule memory
- Choice prompt grounded affordance list
- choice text validator for impossible item operations
- 将相机/胶卷的使用规则写入装备状态，并让 Choice 只从 grounded affordances 生成选项。
- scene-state/writeback：为当前地点记录可影响连续性的局部物理状态，如地面 wet/dry、是否有 puddle。
- prompt assembly：在 Director/Narrator prompt 中加入 current-scene anchor，优先列出最近已确认的环境约束。
- Narrator guard：写雨后感官细节前检查同地点是否已明确“不是积水”。
- 优先补 scene-state/writeback 与 prompt assembly 的当前场景物理状态锚点，避免局部环境细节滑出 recentTurns 后被感官描写重写。
- inventory/detail memory schema：item=count/package/container/lastConfirmedTurn
- state writeback 从装备检查正文抽取数量和包装
- Narrator prompt 中“若数量/包装未给出，避免新精确数值”的约束
- consistency guard 对同一物件数量/包装变更要求可见桥接
- 把装备数量、包装、容器作为 detail memory/inventory state 持久化，并在 requiredContent 要求检查装备时优先注入这些字段；对缺失字段采用保守描述，不生成新的精确数值。
- object behavior memory：actionCondition -> observedResponse，例如 shake/light -> clearSound
- statefold/storyline summary 保留关键物件行为结果，而不只保留玩家意图
- Narrator prompt 对同一物件不同测试条件的 priority/condition guard
- 关键物件行为变更必须要求 visible explanation 的 consistency guard
- 为关键道具建立条件化行为记忆，尤其区分动作条件与观察结果；压缩摘要不能只保存“尝试检查”，必须保存“检查得到的结果”。若后续要改变行为，要求正文给出可见原因。
- entity/object memory schema for salient object affordances
- storyline summary compaction rules
- Narrator prompt rule: secrecy constraints must not negate already visible object behavior
- 为关键物件建立条件化状态记忆：记录触发动作、可见反应、例外条件；摘要压缩不得把‘贴耳无额外声’覆盖‘摇动会响’，Narrator 在保密约束下也必须保持已见物理反应。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 45 | 110 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-014/issues/issue-045-turn-110/root-cause-report.md |
| 54 | 128 | low | fact-conflict | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-017/issues/issue-054-turn-128/root-cause-report.md |
| 63 | 146 | low | fact-conflict | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-019/issues/issue-063-turn-146/root-cause-report.md |
| 65 | 149 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-020/issues/issue-065-turn-149/root-cause-report.md |
| 71 | 160 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-021/issues/issue-071-turn-160/root-cause-report.md |
| 72 | 160 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-021/issues/issue-072-turn-160/root-cause-report.md |
| 75 | 163 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-022/issues/issue-075-turn-163/root-cause-report.md |

## state-writeback

family: agent-system

score: 10.75

fixSurface:
- state writeback validator for movable objects
- recent-turn contradiction resolver
- runtime object holder/location persistence
- 为 runtime-after/story state 增加物件 holder/location 写回，并在新一轮构建 prompt 时对 recentTurns 中的物理冲突进行仲裁；发现上一轮错误时优先桥接修正，而不是继续承接。
- quest/runtime anchor writeback：区分 beat visited、beat skipped、visible completed
- storyline summary 生成：不要把未可见固定 beat 写成已发生进展
- Choice affordance validator：具体观察类选项必须绑定 visible evidence
- Director requiredContent：禁止要求玩家描绘未在 visible timeline 中出现的具体事实
- 优先修复 fixed beat / anchor writeback 与 visible timeline 的一致性，并在 Choice/Director 对观察类行动进行 visible-evidence gating。
- statefold/current-scene object-state writeback
- Narrator prompt 的 currentSceneAnchors 区块
- post-generation consistency check for terminal object states
- 为场景物件终止态增加 durable writeback，并在 Narrator prompt 中把这些状态作为高优先级当前场景锚点。
- runtime object-location state writeback
- Narrator current-scene inventory block
- post-generation continuity validator for object moves
- 将关键随身物件位置写入 runtime/story state，并在 Narrator prompt 末尾给出 currentSceneInventory；生成后校验若物件从膝头/胸前变入包内，必须有显式放置桥接。
- runtime state/writeback: 记录高显著物件位置和持有关系
- Director/Narrator handoff: 为姿态变化附加 object-continuity checklist
- Narrator prompt: 若改变物件位置必须显式写出移动动作
- 补强局部物件状态写回和 Narrator 的动作桥约束：物件位置从最近正文改变时，必须显式写出拿起、放下、挪开或保持原位。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 12 | 21 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-003/issues/issue-012-turn-21/root-cause-report.md |
| 33 | 72 | medium | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-011/issues/issue-033-turn-72/root-cause-report.md |
| 61 | 139 | medium | event-negated | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-019/issues/issue-061-turn-139/root-cause-report.md |
| 76 | 166 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-022/issues/issue-076-turn-166/root-cause-report.md |
| 78 | 171 | low | space-time-break | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-023/issues/issue-078-turn-171/root-cause-report.md |

## model-local

family: llm-self

score: 5.75

fixSurface:
- narrator exact-quote preservation instruction
- recent quoted-fact validator
- exclusive-claim consistency check
- 给 Narrator 增加“上一轮直接引语/惯常说法必须逐字保持或显式作为补充而非替代”的约束，并在输出后扫描“从来/只会/总是”等排他词是否与 recentTurns 中的 quoted facts 冲突。
- Narrator prompt: 明确禁止同一对白中出现无叙述分隔的相邻 `”“`。
- post-generation typography linter: 检查中文引号配对、相邻闭合/开启引号、dialogue frame 内 quote balance。
- auto-repair normalizer: 对 `“A”“B”` 这类同 speaker 同 frame 文本合并为 `“A B”` 或要求重采样。
- 优先增加 Narrator 输出后的 typography lint/repair，覆盖中文引号配对与同 frame 相邻 quote breaks。
- Narrator prompt 的引用/归因一致性规则
- turnContent 后处理或 evaluator-style lint：检测“你刚才那句话/你刚才说”后接“她/他/TA说得对”的冲突
- 可选：为本轮 player utterance 建立 speaker/addressee 标注供 Narrator 使用
- 优先在 Narrator 输出前后增加 quote attribution / pronoun consistency guard，尤其检查当前玩家输入被复述时的指代。
- Choice post-generation semantic contradiction checker against current visibleText
- Choice prompt negative-fact checklist for “没有回答/不知道/不能”
- option validator that rejects assumptions contradicted by the final paragraph
- 优先给 Choice worker 增加 same-turn visibleText contradiction filter，尤其检查选项是否预设了正文刚否认的事件。
- post-generation style lint: 检测第二人称模式下的 他/她 + 主角随身物 短语
- Narrator prompt: 将 perspective contract 放到输出前检查清单
- normalizer/evaluator: 对低成本代词替换给出自动修复或重试
- 为 Narrator 输出增加 perspective/pronoun lint，尤其在第二人称叙事中拦截“他/她的/他内袋/他的手”等与主角随身物或动作绑定的第三人称片段。
- Narrator prompt 的局部语义自检规则
- post-generation quality lint：检测“声音/气味/光线”等感官主体与身体部位介词短语的异常搭配
- Narrator rewrite pass：对诗性隐喻要求可见动作承托
- 优先在 Narrator 输出质量层增加短语级语义兼容检查；其次弱化“指尖”等示例在无动作承托时的可复用性。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 25 | 45 | low | fact-conflict | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-009/issues/issue-025-turn-45/root-cause-report.md |
| 29 | 58 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-010/issues/issue-029-turn-58/root-cause-report.md |
| 30 | 63 | low | identity-drift | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-011/issues/issue-030-turn-63/root-cause-report.md |
| 35 | 78 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-035-turn-78/root-cause-report.md |
| 80 | 183 | low | language-drift | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-023/issues/issue-080-turn-183/root-cause-report.md |
| 84 | 198 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-025/issues/issue-084-turn-198/root-cause-report.md |

## alias-pronoun-contract

family: agent-system

score: 3.00

fixSurface:
- entity/alias schema: 为 visibleAlias 增加 visiblePronoun 或 genderPresentation
- prompt assembly: 将隐藏真实身份与玩家可见 persona 分区并说明不可影响表层称谓
- post-generation validator: 同一 named entity/alias 单回合 pronoun drift 检查
- 优先修复角色 alias/persona 的 prompt contract：公开称呼、隐藏身份、可见 pronoun 分离，并在 Narrator 输出后做同场景实体代词一致性校验。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | medium | identity-drift | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-001/issues/issue-001-turn-01/root-cause-report.md |

## fixed-beat-consumption

family: agent-system

score: 3.00

fixSurface:
- storyline lifecycle/statefold: consume fixed beats and remove or rewrite consumed constraints
- runtime anchors: persist precise current-scene state such as doorKnocked/bookletInHand
- Narrator prompt: require continuation from last visible sentence, not from earlier salient dialogue
- 优先修复固定 beat 消费与场景锚点写回：turn 结束时把敲门 beat 标记 consumed，并把下一轮 prompt 的首要约束改为从门已响后的动作继续。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 7 | 10 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-002/issues/issue-007-turn-10/root-cause-report.md |

## hidden-referent-pronoun-contract

family: agent-system

score: 3.00

fixSurface:
- Director schema: 为 hidden referent 增加 `referentPronounPolicy` / `allowedSurfaceRefs`，明确“只用那个人/对方，不用他/她”或继承候选实体 pronoun。
- Narrator prompt: 对不点名对象增加“不要用会暴露或冲突的 gendered pronoun”硬约束。
- Choice generator: 在选项生成前对已知实体的 pronoun/gender facts 做一致性检查，禁止“他=卡尔”这类绑定。
- entity state: 将卡尔的 displayPronoun / species / gender 放入高优先级可见 entity facts。
- 优先修复 hidden referent 的 handoff contract：Director 输出可见称谓策略，Narrator 和 Choice 都必须继承并校验实体 pronoun。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 28 | 57 | medium | identity-drift | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-010/issues/issue-028-turn-57/root-cause-report.md |

## object-transfer-continuity

family: agent-system

score: 3.00

fixSurface:
- Director->Narrator plotPoint schema 增加 currentObjectStates/holder/visibility 与 mustShowTransfer 字段
- Narrator post-check 增加同一输出内 object holder 与 visibility consistency 校验
- choice/player-input binding 中把‘提醒某人带上物品’区分为确认、交接、或让当前 holder 继续携带
- 优先修复 Director-to-Narrator handoff 的 object state contract，并为 Narrator 增加物品 holder/visibility 自检。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 38 | 87 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-013/issues/issue-038-turn-87/root-cause-report.md |

## object-affordance-contract

family: agent-system

score: 3.00

fixSurface:
- equipment/object state schema for loaded film camera
- Director-to-Narrator requiredContent guard for object affordances
- Narrator prompt rule: do not invent destructive inspection steps for loaded analog film cameras
- statefold/writeback of frame count and loaded-film status
- 为关键装备建立可检索的 object state/affordance，并让 Director 在装备检查类动作中显式传递允许/禁止的检查方式和当前帧/装卷状态。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 53 | 128 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-017/issues/issue-053-turn-128/root-cause-report.md |

## state-summary-negative-fact-loss

family: detail-memory

score: 3.00

fixSurface:
- statefold/storyline summary policy: 保留对后续可产生冲突的 negative facts，例如“没有说更多”“没有得到回答”“只问了 X”。
- memory persistence: 为关键已公开对话建立 exact/limited conversation facts，供后续回忆同一事件时检索。
- Narrator prompt guard: 当要求角色回忆已出现过的离屏对话时，显式列出可用事实和禁止新增的响应范围。
- 优先修复 summary/memory 对已公开离屏对话的限制性事实保留；在回忆同一事件时做 source-of-truth 检索和否定事实注入。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 82 | 188 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-024/issues/issue-082-turn-188/root-cause-report.md |

## handoff-contract

family: agent-system

score: 3.00

fixSurface:
- Director output schema：加入 currentSceneAnchor / locomotionState / mustRespectRecentVisible 字段
- Narrator prompt：当 recentTurns 有冲突时显式优先最新可见结尾和本轮玩家输入
- state writeback：保存角色当前位置、姿态和运动状态，供下一轮检索
- continuity lint：检测“上一轮站着等”后无桥接出现“保持步行节奏/继续走着”的冲突
- 优先修复 Director 到 Narrator 的 current-scene anchor handoff，并增加 recent visible conflict priority；结构化保存角色姿态/运动状态可作为长期防线。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 85 | 198 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-025/issues/issue-085-turn-198/root-cause-report.md |

## scene-fact-persistence-gap

family: detail-memory

score: 2.25

fixSurface:
- story state scene-fact writeback
- history summarizer fact retention
- director contradiction check against canonical scene facts
- narrator unsupported-cause guard
- 为关键场景建立 canonical scene facts，并在 statefold/history summarizer 中保留“host/owner/venue/visible cause”等字段；Director 生成涉及既有场景归属或因果的 requiredContent 前，应检查 canonical facts，Narrator 应禁止把“知道/会注意到”升级成“派人/邀请”等新事件。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 24 | 41 | medium | fact-conflict | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-009/issues/issue-024-turn-41/root-cause-report.md |

## object-affordance-continuity

family: agent-system

score: 1.75

fixSurface:
- scene prop state 增加 orientation、accessibleSurface、readableSurface 字段
- Narrator 在复用最近 prop 描述前执行 physical-affordance self-check
- Director requiredContent 对可读物件要求说明是否需要玩家翻开、扶正、拿起或只远观
- 优先增加 prop affordance/orientation 状态和 Narrator 物理可读性自检，避免把装饰性朝向和互动可读面混合。
- Choice->Director action binding 增加 prop interaction precondition/repair beat
- Director requiredContent 生成前检查目标 prop 的 orientation 与玩家动作是否兼容
- Narrator 输出后执行 prop affordance consistency lint，特别是 read/turn/open/close 等动作
- 优先在 Choice->Director->Narrator 链路加入 prop interaction precondition 和 repair beat，确保查看/翻页前先解决物理朝向。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 40 | 93 | low | fact-conflict | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-013/issues/issue-040-turn-93/root-cause-report.md |
| 41 | 94 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-013/issues/issue-041-turn-94/root-cause-report.md |

## location-transition-bridge

family: agent-system

score: 1.00

fixSurface:
- Director schema: 将 characterBeats.actionHint 拆成 currentLocation/from/to/transitionRequired，而非自然语言二选一
- Narrator prompt/check: 角色 location 与上一轮 final location 不一致时必须写 bridge 或改回原地
- statefold: 维护角色当前 location 与最近交互锚点（茶几、书架、门口等）
- 强化 Director->Narrator handoff 的位置转换契约：所有 actionHint 中的新位置必须带 from/to 与 transitionRequired，并在 Narrator 输出后做可见移动桥接校验。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 14 | 23 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-004/issues/issue-014-turn-23/root-cause-report.md |

## choice-affordance-state-gating

family: agent-system

score: 1.00

fixSurface:
- Choice generation: 从上一轮正文抽取 availableObjects/unavailableObjects，并按 owner/location gate 选项
- selected action validation: 玩家选择涉及物件时，在 Director 前校验物件是否在当前 scene 可触达
- statefold/writeback: 记录 envelope.owner=德索洛、location=outside/apartment-left，并在后续 prompt 中高优先级展示
- Choice schema: 禁止模型发明未在 candidateActions 中存在的 actionId，普通选项也需通过 affordance check
- 优先修复 Choice affordance gating 与 selected action revalidation：对被转移/离场/消耗的道具写入结构化 object state，并在 Choice 和 Director 前阻断不可触达物件选项。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 15 | 24 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-004/issues/issue-015-turn-24/root-cause-report.md |

## temporal-anchor-contract

family: agent-system

score: 1.00

fixSurface:
- Director plotPoint schema: 增加 currentSceneTimeline / temporalAnchors 字段，列出最近事件顺序。
- Narrator prompt assembly: 将最近两轮的时间关系摘要放在最终写作指令附近。
- post-generation consistency check: 针对同段 first day / second day / 那天 等时间标签做局部冲突检测。
- 优先修复 Director→Narrator 的 temporal anchor handoff，并增加输出后时间标签冲突 lint。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 26 | 48 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-010/issues/issue-026-turn-48/root-cause-report.md |

## speaker-pronoun-alignment

family: llm-self

score: 1.00

fixSurface:
- Narrator post-generation linter: 检查 `data-speaker=帕兹` 后紧邻叙述中的“他说/她说出/她开口”等主体是否冲突。
- Narrator prompt: 将“描述主角说话方式时必须用‘你/帕兹’，不要用第三人称代词”放入最终输出提醒。
- visibleText normalizer QA: 对 speaker-tag 与相邻叙述句做轻量规则校验。
- 优先加 Narrator speaker-pronoun alignment lint，覆盖主角台词后紧邻叙述句的代词主体。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 27 | 54 | low | identity-drift | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-010/issues/issue-027-turn-54/root-cause-report.md |

## object-state-handoff

family: agent-system

score: 0.75

fixSurface:
- selected action parser: 抽取 handedOverItems / affectedObjects
- Director/Narrator prompt: 增加 mustAccountForObjects
- post-generation continuity check: 同一 turn 物件交出后必须归还/带走/损坏/遗失之一
- 优先为 selected action 到 Director/Narrator 的 handoff 增加 object-state ledger，并在固定 beat 消耗前后做同 turn 物件归宿校验。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 3 | 5 | low | fact-conflict | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-001/issues/issue-003-turn-05/root-cause-report.md |

## current-scene-posture-anchor

family: recent-context

score: 0.75

fixSurface:
- recent context assembler 增加 activeEntityPosture/currentMotion 摘要
- Director plotPoint.characterBeats 支持 posture/motion must-preserve 字段
- Narrator post-check 增加同一输出中 sit/stand/walk 状态转移一致性检查
- 优先补 active scene posture/motion anchor，并在 Narrator 输出后检查姿态动词是否有前置状态。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 39 | 90 | low | space-time-break | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-013/issues/issue-039-turn-90/root-cause-report.md |

## current-object-anchor

family: agent-system

score: 0.75

fixSurface:
- carried item position state/writeback
- Narrator prompt current-object facts block
- same-turn entity position consistency checker
- 把随身物品位置写入 current-object facts，并要求 Narrator 若改变位置必须显式描写移动原因；增加同轮实体位置冲突检测。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 60 | 136 | low | fact-conflict | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-018/issues/issue-060-turn-136/root-cause-report.md |

## unsupported-detail-inference

family: llm-self

score: 0.75

fixSurface:
- Narrator prompt：限制无必要的微观物理解释，优先写可直接感知的结果
- post-generation quality lint：检测同句湿/干属性冲突和“因为”引出的感官因果
- style rewrite pass：将过度解释的感官句改写为直接、可验证的描写
- 优先增加 Narrator 的 sensory causality 自检和输出后 lint，避免为氛围细节补写未经支撑的物理机制。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 86 | 200 | low | quality-regression | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-025/issues/issue-086-turn-200/root-cause-report.md |

