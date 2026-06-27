# Mechanism Clusters

## fixed-beat-consumption

family: agent-system

score: 17.00

fixSurface:
- storyline/fixed beat lifecycle：为 `interactionFollowup` 增加 consumed/resolved/incompatible 状态并从后续 prompt 中剔除已消费桥段
- prompt assembly：将 `本段已完成的进展` 中的场景完成事实提升为 hard continuity guard，并放在固定承接之前
- state/writeback：持久化 `currentLocationId`、`hasEnteredTrueHome`、`lastSceneIdentity` 等当前场景锚点
- choice gating：禁止从 stale followup 生成已完成关键出口选项
- 优先修复 currentStoryline/fixed beat lifecycle 与 prompt assembly 的已消费承接过滤，同时补充当前场景 identity 写回。
- Director beat lifecycle：标记 micro-beat consumed/resolved
- runtime writeback：记录卡尔 awake/openEyes/currentPose
- Narrator guard：禁止重复上一轮刚完成的状态变化，除非有反向状态
- storyline summary writer：保留已完成关键微状态而非只写氛围概括
- 在 Director 与 runtime-after 之间增加 beat consumption 和实体状态写回：醒来、入座、递茶、开门等一次性/状态变化动作需要写成 currentState，并在下一轮 Director 候选动作生成前过滤已消费动作。
- storyline lifecycle 增加 beat 状态：unstarted/active/consumed/incompatible，已发生公园长椅 beat 不再进入当前核心流程
- Director prompt 增加 hard current-scene anchor：从 recent visible tail 抽取当前位置，场景变更必须显式 bridge
- Narrator 增加 scene-transition validator：若正文新增户外环境但导演/正文未写离开动作，则要求补桥或拒绝切场
- 优先修复 storyline/fixed beat lifecycle 与 current scene anchoring，在 Director 前阻止已消费场景 beat 重新成为本轮骨架。
- storyline node lifecycle / consumed beat registry
- Director context assembly priority
- currentStoryline.summary compaction and completed-progress separation
- Choice prompt de-duplication against consumed beats
- 为 storyline/fixed beat 增加 consumed/resolved 状态，并在 Director 前置检查“本 beat 的核心问题是否已在玩家可见文本中得到回答”；若已完成，只允许深化、对照或转场，不允许重新提问。
- storyline beat lifecycle / interactionFollowup consumption tracking
- Director prompt assembly 的 consumed-beat / return-state priority guard
- runtime state writeback for currentLocationId、visitedLocation、revealedLocation、returningToLocation anchors
- Director validation: 当 requiredContent 涉及已完成路线/门槛/首次揭示时，必须改写为 return/known-route 或要求桥接
- 优先修复 currentStoryline.interactionFollowup 的生命周期消费与 runtime 位置/地点访问写回：当地点 reveal + travel + threshold 已完成后，后续再出现同名目的地必须被标记为 returningToKnownLocation，并在 Director prompt 中以硬约束压过未消费的固定承接。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 15 | 54 | high | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-005/issues/issue-015-turn-54/root-cause-report.md |
| 24 | 72 | low | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-007/issues/issue-024-turn-72/root-cause-report.md |
| 27 | 89 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-008/issues/issue-027-turn-89/root-cause-report.md |
| 29 | 92 | medium | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-009/issues/issue-029-turn-92/root-cause-report.md |
| 34 | 120 | high | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-011/issues/issue-034-turn-120/root-cause-report.md |

## choice-action-binding

family: agent-system

score: 14.75

fixSurface:
- candidateAction authoring / generation text sanitizer
- choiceGenerator actionId binding merge policy
- choice option readability validator
- 优先修复 choice-action binding：绑定 actionId 时不要无条件回填候选动作 text，并在候选动作入库/出库时做可执行性与残片检测。
- choice-generator-schema
- choice-post-validator/player-action-subject-check
- choice-prompt/current-focus-prioritization
- stale-context-filter-for-choices
- 给 Choice 输出增加 actor/actionType/groundingTurn 或类似结构化校验；拒绝以 NPC 第三人称开头、不可由玩家主动执行、或引用非当前焦点且无玩家动作包装的选项。
- choiceGenerator subject-control validator
- choice option precondition checker
- current-scene posture anchor for Choice prompt
- 优先修复 Choice 选项生成与后处理：为 option 增加 subject/action controllability 检查，禁止“她/他/他们 + 直接动作完成”这类替 NPC 决策的玩家选项，并用最近正文抽取的姿态 precondition 做冲突过滤。
- choiceGenerator posture precondition validator
- player current-scene anchor extraction
- adjacent-turn choice-to-narration continuity check
- 优先修复 Choice worker 的动作 precondition：从最近正文抽取 `playerPosture` / `isSeated` 这类 current-scene anchor，并在 option 发布前拦截“坐下/站起/走近/拿起”等与当前姿态或物件状态冲突的动作。
- Choice/Director handoff：添加 playerActionMode 和 mustNotSpeak
- Narrator prompt：非语言选择禁止写“你说/你问/你说完”
- post-generation checker：检测未授权玩家台词或‘你说完’归因
- 全局写作规则消除“每轮必须包含主角台词”的歧义
- 把玩家选择的 speech/action mode 作为结构化合同传给 Narrator，并在生成后校验是否新增未授权玩家发言；尤其拦截“你说完/你问完/你刚才说”等表达。
- 选项对象增加 groundedFacts/sourceTurns，并在选择回放时传给 Director
- Director prompt 增加 selectedChoiceProvenance：模型生成选项若含未见事实，必须澄清、泛化或拒绝固化
- runtime 后处理在 playerInputSource=choice 时检查新专名是否已在 visible timeline 中出现
- 优先修复 Choice-to-Director handoff 与 selected choice provenance，避免模型生成选项在下一轮未经验证地成为 canon。
- Choice prompt answered-intent guard
- choice semantic de-duplication against playerInput and current visible answer
- per-turn topic slot status
- post-choice repetition validator
- Choice 生成前抽取本轮 playerInput 的 core intent 与正文回答，若选项与已回答 intent 语义等价则过滤或改写为真正的深化方向。
- Choice action semantic validation
- Director duplicate-intent collapse
- selected-choice provenance metadata
- recent answer topic-slot tracking
- 为系统生成选项附加 provenance 和 semanticIntent；Director 收到由系统选项产生的输入时，与上一轮 answeredIntent 比对，若重复则改为简短承认、推进到新维度或提供非重复选择。
- choice generator prompt/schema：加入 physical affordance check，要求动作接触面必须匹配最近可见 body pose；对“掌心朝上/朝下/握拳/手放桌面”等姿势生成可行接触选项。
- selected-choice -> Director handoff：加入冲突检测与 repair rule；若玩家输入来自系统选项但与可见姿势冲突，Director 必须桥接、改写为物理可行等价动作，或显式写出角色/玩家调整姿势。
- Narrator prompt：在 requiredContent 与 recent visible state 冲突时，优先维护玩家已见物理状态，并用最小改写保留核心意图。
- 可选 state model：把当前接触相关 pose/contactSurface 作为短期 scene affordance 存入当前场景状态，供 Choice 和 Director 共同读取。
- 优先修复 `choice-action-binding`：在 Choice 生成和 selected-choice handoff 中加入 scene affordance/pose 校验与冲突修复；其次在 Narrator 层加入 requiredContent 与 recent visible state 冲突时的局部改写规则。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 1 | 5 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-001/issues/issue-001-turn-05/root-cause-report.md |
| 12 | 47 | medium | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-003/issues/issue-012-turn-47/root-cause-report.md |
| 17 | 56 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-006/issues/issue-017-turn-56/root-cause-report.md |
| 20 | 69 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-006/issues/issue-020-turn-69/root-cause-report.md |
| 23 | 71 | low | user-input-ignored | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-007/issues/issue-023-turn-71/root-cause-report.md |
| 26 | 80 | medium | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-008/issues/issue-026-turn-80/root-cause-report.md |
| 31 | 109 | low | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-009/issues/issue-031-turn-109/root-cause-report.md |
| 32 | 110 | low | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-009/issues/issue-032-turn-110/root-cause-report.md |
| 33 | 113 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-010/issues/issue-033-turn-113/root-cause-report.md |

## unsupported-detail-inference

family: llm-self

score: 5.00

fixSurface:
- choiceGenerator prompt grounding rules
- choice option noun/entity grounding validator
- visible-timeline based unsupported-object filter
- 为 Choice worker 加入 visible-grounded option 约束：选项中的具体物件、人物、承诺、凭据必须能在玩家可见窗口或已揭示 state 中命中，否则改写为泛化问法或删除。
- object identity registry: keyId、knownDescription、knownProperties、lastSeenTurn
- Narrator prompt guard: object properties not in visible/state evidence cannot be newly contrasted as facts
- post-generation consistency check: same-object reference + changed physical attribute triggers rewrite
- state/prompt assembly: distinguish prior key memory from current door affordance，避免只用泛称“旧钥匙”
- 优先建立物件身份与属性一致性层：对钥匙、门、照片等可复用道具在 state/prompt 中携带稳定 ID 和已知属性，并在 Narrator 输出后检查同一对象属性变更。
- Choice prompt 增加 visible-grounding gate：新专名/传闻/物件必须引用本轮正文或 recentTurns 中的原文来源
- Choice schema 增加 sourceTurn/sourceText 或 groundedFactId，缺失来源时降级为泛称如“聊聊宴会上的事”
- 选项后处理增加未见专名检测，拦截不在玩家可见词表中的 clue-like noun
- 优先修复 Choice worker 的选项 grounding contract 与后处理校验，而不是修改 Narrator 文风。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 4 | 24 | low | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-001/issues/issue-004-turn-24/root-cause-report.md |
| 14 | 53 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-004/issues/issue-014-turn-53/root-cause-report.md |
| 25 | 79 | medium | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-008/issues/issue-025-turn-79/root-cause-report.md |

## context-priority

family: agent-system

score: 3.75

fixSurface:
- director-to-narrator handoff schema: 增加 currentPlayerPosture、currentHeldObjects、currentLocationAnchor
- prompt assembly priority rules: recent visible posture > storyline/location memory；历史/未来地点摘要必须标注 non-current
- Narrator prompt guard: posture-changing verbs require recent visible support
- statefold/location memory: 避免把已发生/未来概览当作当前现场事实注入
- 优先修复 prompt assembly 与 Director→Narrator handoff：把玩家当前姿态和手持物作为显式状态传递，并在 Narrator 侧加入无依据姿态变更检查。
- prompt assembly priority rules：recent visible entity position > location default/template > character flavor
- entity/location state writeback：为黑猫/卡尔等可移动实体记录 `lastVisibleLocation` 和 `lastVisibleTurn`
- Director validator：当 requiredContent 会改变实体位置时，强制加入 bridge 或拒绝该 requiredContent
- Narrator contract：禁止用 `不知什么时候` 代替实体跨场景移动承接
- 优先修复 prompt 上下文优先级和可移动实体位置写回；对 Director requiredContent 增加位置连续性校验。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 13 | 50 | low | unsupported-jump | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-004/issues/issue-013-turn-50/root-cause-report.md |
| 16 | 54 | medium | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-005/issues/issue-016-turn-54/root-cause-report.md |

## current-scene-anchor

family: agent-system

score: 3.25

fixSurface:
- Director referent schema
- Narrator pronoun validation
- dialogue grounding prompt
- post-generation entity/pronoun checker
- 为对话生成增加 referent plan：每句代词台词必须列出指代对象；当对象是玩家时优先使用“你/记者先生”，不得把玩家性别从全局角色卡中丢失。
- recentTurns -> Director 的实体位置抽取与置顶
- current scene entity state/writeback：记录黑猫 location/pose/tailContact
- Director validator：若改变实体位置需生成移动承接
- prompt priority：最近 visibleText 覆盖旧地点摘要
- 增加当前场景实体锚点抽取与校验：每轮从 visibleText 写回可见实体的 location/pose/contactPoint，下轮 Director 必须继承；若输出改变位置，要求显式移动桥接。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 6 | 28 | medium | identity-drift | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-002/issues/issue-006-turn-28/root-cause-report.md |
| 22 | 71 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-007/issues/issue-022-turn-71/root-cause-report.md |

## state-writeback

family: agent-system

score: 3.00

fixSurface:
- scene-object-state/writeback
- narrator-prompt/current-scene-anchor
- post-generation-continuity-validator
- 为当前场景小物件建立轻量 objectState/consumedAction 写回，并在 Narrator prompt 中把 last visible object state 作为高优先级锚点；生成后校验相邻 turn 的重复放置/拿取动作。
- turnSummary consumed-beat writeback
- Director prompt current-progress anchor
- repeated-scene validator for adjacent turns
- 优先修复 state writeback 与 Director handoff：把“已解释/已追问/已消费”的细粒度 beat 写入 current progress，并在 Director 生成 requiredContent 前检查相邻 turn 是否已经完成同一情绪或信息节点。
- turn writeback 增加 lastVisibleLocation/characterPositions，从 visible tail 或 Narrator output 抽取并持久化
- Director 输入加入上一轮 endingState 作为高优先级字段，且高于 storyline content
- 场景转换后处理检测：若本轮 opening location 与上一轮 ending location 冲突，要求桥接或修正
- 优先修复 state writeback 与 Director 的上一轮 endingState 优先级，确保下一轮从玩家最后看到的位置继续。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 9 | 36 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-003/issues/issue-009-turn-36/root-cause-report.md |
| 19 | 65 | low | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-006/issues/issue-019-turn-65/root-cause-report.md |
| 28 | 90 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-008/issues/issue-028-turn-90/root-cause-report.md |

## handoff-contract

family: agent-system

score: 3.00

fixSurface:
- Director output schema
- Narrator prompt consistency guard
- story-state/event-memory summarization
- pre-output contradiction check
- 在 Director→Narrator 交接中增加“echoedKnownConcept”或“previouslyStatedByCharacter”类约束：当玩家复述角色已讲过的核心规则时，Narrator 必须把反应写成“认可/追问理解深度”，不得写成“第一次听到/不认识该概念”。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 5 | 25 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-002/issues/issue-005-turn-25/root-cause-report.md |

## storyline-lifecycle

family: agent-system

score: 3.00

fixSurface:
- quest/node transition guard
- choice-action binding schema
- Director selected-intent validation
- runtime-after storyline advancement
- 修复 storyline lifecycle gate：04-02 到 04-03 必须由明确 accept actionId 或等价玩家自然语言触发；若玩家只评价衣服，应生成“卡琳娜穿上/再次邀请/给玩家选择”的回合，而不是迁移场景。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 7 | 30 | medium | user-input-ignored | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-002/issues/issue-007-turn-30/root-cause-report.md |

## entity-alias-collision

family: agent-system

score: 3.00

fixSurface:
- entity alias registry
- storyline authoring validator
- prompt assembly disambiguation
- pre-generation visible-name conflict check
- 建立 visible alias registry：任何新角色使用已出现称呼前必须检查冲突；若允许重名，Director 必须生成桥接句（例如“她不是中央区那个摊贩，只是同样自称卖消息的人”）或改用唯一称号。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 8 | 31 | medium | identity-drift | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-002/issues/issue-008-turn-31/root-cause-report.md |

## hidden-identity-alias-contract

family: agent-system

score: 3.00

fixSurface:
- director-output-schema/internal-vs-visible-character-alias
- secret-boundary-redaction-layer
- narrator-prompt/hidden-identity-guard
- storyline-beat-lifecycle-for-reveals
- 为隐藏身份角色增加 playerVisibleAlias/currentRevealState 字段；Director 输出只允许使用当前 revealState 许可的可见称呼，并在 requiredContent 中禁止“对自己名字承认”等 reveal 句式，除非 storyline 节点显式标记 reveal。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 11 | 46 | medium | identity-drift | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-003/issues/issue-011-turn-46/root-cause-report.md |

## entity-alias-visibility-contract

family: agent-system

score: 2.25

fixSurface:
- Director prompt 的 player-visible knowledge boundary
- entity alias/state schema：区分 canonicalIdentity、playerVisibleName、revealedAliases
- Choice prompt：生成选项前校验称谓是否已玩家可见
- Narrator instructions：身份首次显式绑定必须桥接或延迟
- 为角色/实体增加 player-visible alias reveal 状态，并在 Director 和 Choice 生成时强制检查：未被玩家显式确认的 canonical identity 不得直接作为玩家选项或旁白称谓；需要输出桥接句、继续使用泛称，或等待剧情正式揭示。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 21 | 70 | medium | identity-drift | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-007/issues/issue-021-turn-70/root-cause-report.md |

## sensory-beat-consumption

family: agent-system

score: 2.25

fixSurface:
- Narrator prompt delta contract
- runtime sensory/event writeback for consumed one-shot beats
- recent-turn repetition checker
- Choice prompt current-object validation
- 给 Narrator 增加“本轮必须产生相对上一轮的最小增量，不得重放上一轮一次性动作”的硬约束；将环境动态事件写入 consumed sensory beats，并在选择生成前过滤由重复事件产生的选项。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 30 | 99 | medium | repeated-scene | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-009/issues/issue-030-turn-99/root-cause-report.md |

## model-local

family: llm-self

score: 2.00

fixSurface:
- Narrator post-generation copyedit pass
- pronoun antecedent / collocation lint
- quality-regression evaluator feedback loop
- 为 Narrator 输出增加轻量 copyedit/自检步骤，重点检测自反代词、无先行词代词和“动作-受事”搭配异常。
- Unicode lookalike punctuation lint
- visibleText normalization before publish
- 为 Narrator 输出增加轻量 Unicode/copyedit 后处理：检测中文正文中的“一一”“ー”等常见 lookalike 误替换，并在进入 `04-output.json` 和 visible timeline 前规范化或退回重写。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 3 | 21 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-001/issues/issue-003-turn-21/root-cause-report.md |
| 18 | 64 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-006/issues/issue-018-turn-64/root-cause-report.md |

## model-local-sentence-closure-slip

family: llm-self

score: 1.00

fixSurface:
- Narrator post-generation semantic linter
- visibleText sentence-closure repair pass
- v3-html paragraph-level quality gate
- 在 Narrator 输出提交到 `turnContent` 前增加 paragraph-level semantic quality gate：抽取 `visibleText`，检测段尾未闭合短语和无标点换段后话题突变，命中后触发局部 repair 或重写对应 `<p>`。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 35 | 168 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-012/issues/issue-035-turn-168/root-cause-report.md |

## current-scene-time-anchor-gap

family: agent-system

score: 0.75

fixSurface:
- story state currentScene.timeOfDay / elapsedTime model
- Narrator prompt current-scene anchor block
- time-transition consistency validator
- 为当前场景建立结构化时间锚，并在 Narrator/Choice 输出后检测“夜、深夜、清晨”等时间词是否有玩家可见过渡支撑。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 2 | 9 | low | space-time-break | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-001/issues/issue-002-turn-09/root-cause-report.md |

