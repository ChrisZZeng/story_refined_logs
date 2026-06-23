# Mechanism Clusters

## storyline-lifecycle

family: agent-system

score: 9.00

fixSurface:
- quest/beat lifecycle transition guard
- Director handoff schema for unresolved sensory events
- Narrator prompt current-scene anchor section
- 为 storyline transition 增加可见前置条件：只有 DeSalo 的第三次敲门/身份揭示桥段被玩家看见后才能完成 `2-02`；同时在 Director 输出中加入 `unresolvedImmediateEvents`，把 `soundProfile: knuckle/short/forceful` 传给 Narrator 并禁止改写。
- quest/beat prerequisite checks
- invitation lifecycle state (`not_introduced`/`offered`/`accepted`/`declined`)
- Narrator bridge rules for first-time route introduction
- Choice key-action availability gating
- 为 storyline node 添加可见前置条件与 invitation lifecycle：只有当晚宴被可见提出后才能显示 `仍然有效` 或绑定 accept/refuse；如果 4-02 首次触发，Narrator 应先桥接 `我有一个新提议`，并保持 location 不从公寓超前到 `暗街-夜晚`。
- Quest/storyline lifecycle: 以 visible milestone 或 explicit actionId 作为 beat completion guard，避免每轮自动消费关键 beat
- Director context assembly: 对 currentStoryline.content 与 recent visible route-goal 做冲突检测并要求 bridge/delay
- State model: 持久化 routeGoal/currentDestination 与 destinationChangeReason
- 优先修复 storyline lifecycle 的 beat completion/activation guard：关键地点节点必须等 visible milestone 或显式玩家选择满足后才能消费；当 active beat 的 literal target 与 recent routeGoal 冲突时，Director 必须桥接或延迟节点。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 6 | 20 | medium | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-002/issues/issue-006-turn-20/root-cause-report.md |
| 8 | 24 | medium | unsupported-jump | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-002/issues/issue-008-turn-24/root-cause-report.md |
| 10 | 34 | medium | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003/issues/issue-010-turn-34/root-cause-report.md |

## choice-action-binding

family: agent-system

score: 6.25

fixSurface:
- script/state candidateActions schema：拆分 `intentLabel`、`playerFacingText`、`actionId`
- choiceGenerator prompt：绑定 actionId 时允许重写玩家可见 text，并要求 action-only label
- choice postprocessor/lint：拦截无谓抒情从句、非行动短语、与场景无 referent 的片段
- 优先修复 candidateActions 到 choiceGenerator 的绑定契约：候选动作应提供稳定 actionId 和语义 intent，但玩家可见文本必须经过 choice 文案生成/校验，而不是直接继承脚本文案。
- Choice option schema/prompt: 为推论型选项增加 actionKind/speechAct/targetFact，避免只输出“确认 X”
- Director prompt/intent resolver: 将 selected choice 转成 must-satisfy contract，并附带 consumedEvidence 禁止复述
- Narrator/output validator: 检查 data-speaker 台词引号和跨 turn 重复片段
- 优先修复 Choice→Director 的 selected choice handoff：让选项携带明确 speechAct、targetFact 和已消费证据，并在 Director 组装时加入本轮 anti-repeat 检查；同时加 v3-html 对白引号校验。
- Choice schema: 增加 actionKind/speechAct/maxLength，并要求 text 为命令式或第一人称行动
- Choice prompt: 加硬性 negative examples，禁止“也许”“轮到我”“她问我……”式选项
- Choice post-validator/rewrite: 超长或无动作动词的选项自动改写为短动作
- 优先修复 Choice generator 的 schema 和 post-validation，把选项从自由文本变成带 actionKind/speechAct 的短动作；对超长、元叙事、无动作动词选项执行自动重写或重采样。
- choice generator affordance check
- choice schema action preconditions
- Director selected-action spatial bridge
- Narrator current entity location guard
- 让 ChoiceGenerator 在生成涉及实体接触/拿取/靠近的选项时检查 current entity location；如果动作不可直接发生，选项必须写成“起身走到书堆前，再……”或标记 action precondition，由 Director 在下一轮显式桥接。
- choice schema speaker/utterance fields
- Choice prompt pronoun rules for player utterances
- choice text linter for ambiguous third-person self-reference
- 将 dialogue choice 拆成结构化字段，例如 actionTarget、speaker=player、utteranceText；或至少增加 linter：当选项以“说她/他说也想/觉得”等表达玩家自身态度时，改写为“说自己也想”或“说：我也想……”。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 1 | 3 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-001/issues/issue-001-turn-03/root-cause-report.md |
| 9 | 27 | medium | repeated-scene | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003/issues/issue-009-turn-27/root-cause-report.md |
| 11 | 37 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003/issues/issue-011-turn-37/root-cause-report.md |
| 14 | 46 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-004/issues/issue-014-turn-46/root-cause-report.md |
| 15 | 47 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-004/issues/issue-015-turn-47/root-cause-report.md |

## current-scene-anchor

family: recent-context

score: 4.00

fixSurface:
- Narrator prompt/context assembly：加入 `lastVisibleSentence` / `startAfter` 硬字段
- storyline lifecycle：标记交互后续中已消费的前置 beat，避免旧分支前置动作继续施压
- post-generation duplicate-span check：检测与上一轮尾段高度重合的开头并重写
- 优先在 Narrator handoff 中添加结构化承接锚点和重复检测，同时让 storyline/fixed beat 消费状态从“已完成进展”变成可执行的过滤规则。
- statefold/current scene entity pose extraction
- Director prompt context priority rules
- Narrator prompt first-frame continuity check
- post-generation continuity validator for repeated immediate actions
- 在 Director 前增加“上一轮玩家可见最后一帧”的实体/位置/姿态锚点，并在 prompt 中声明它高于 storyline summary、情绪摘要和候选动作；Narrator 输出前检查第一段是否回滚该锚点。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 2 | 6 | low | repeated-scene | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-001/issues/issue-002-turn-06/root-cause-report.md |
| 13 | 43 | medium | event-negated | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-004/issues/issue-013-turn-43/root-cause-report.md |

## memory-persistence

family: detail-memory

score: 3.00

fixSurface:
- statefold/memory extractor：为临时 NPC 保存 `genderCue`、`pronouns`、`appearanceCue`、`lastMentionedAs`
- context assembly：当输出提及已见过 NPC 时检索并前置这些属性
- Narrator prompt/output validator：不确定时使用中性称谓“那个摊贩”，禁止新增年龄/性别
- 优先改进 detail-memory/statefold 对临时 NPC 属性的抽取和回填，并增加“重提已见 NPC 不新增性别/年龄”的 Narrator 约束。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 3 | 9 | medium | identity-drift | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-001/issues/issue-003-turn-09/root-cause-report.md |

## choice-format-validation-gap

family: agent-system

score: 1.00

fixSurface:
- Choice output schema / post-generation validator
- choice text sanitizer
- 06c-choice-prompt.md option style contract
- 在 Choice worker 后增加 `option.text` 文案 lint：检测未配对 `“”`、`"`、括号等；同时在 prompt 中要求选项使用无引号行动句，必要时自动把 `低声问卡琳娜：...？”` 规范为 `低声问卡琳娜是否有武器`。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 5 | 16 | low | quality-regression | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-002/issues/issue-005-turn-16/root-cause-report.md |

## state-writeback

family: agent-system

score: 1.00

fixSurface:
- scene object state extraction/writeback
- current-scene affordance block in Director/Narrator prompts
- exit/choice validation against locked-door state
- 把门/窗/出口等场景 affordance 从正文事件抽取到 scene state，例如 `apartmentDoor.locked=true`，并在 Narrator 与 Choice 生成前做 contradiction check；若需要离开，先生成可见开锁动作或改写为 `我会给你开门`。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 7 | 24 | low | fact-conflict | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-002/issues/issue-007-turn-24/root-cause-report.md |

## context-priority

family: agent-system

score: 1.00

fixSurface:
- story state / statefold 的 current-scene entity pose/location writeback
- Narrator prompt assembly 的 latest-visible-state anchor 区块
- post-generation continuity validator for entity location and posture
- 优先补 current-scene entity anchor：从上一轮 visibleText/normalizedContent 抽取实体最终位置和姿态，写入 story state/runtime-after，并在 Narrator prompt 最后显式列出；同时增加生成后校验，发现同一实体回到旧位置时要求有移动承接或重写。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 17 | 48 | low | space-time-break | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-005/issues/issue-017-turn-48/root-cause-report.md |

## speaker-attribution-contract

family: agent-system

score: 1.00

fixSurface:
- Narrator handoff schema for dialogue turns / utterance speaker ownership
- v3-html parser/validator requiring quoted speech to carry data-speaker
- post-generation speaker-continuity checker before commit
- 优先把 dialogue ownership 从 prompt 文字要求升级为结构化合约：Director/Narrator handoff 生成 role-tagged utterance plan；Narrator 输出后强制校验所有引号台词必须有 data-speaker，并检查相邻叙述中的“你说完/她说完”是否与上一 utterance speaker 一致。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 18 | 49 | low | identity-drift | high | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-005/issues/issue-018-turn-49/root-cause-report.md |

## model-local

family: llm-self

score: 0.75

fixSurface:
- Narrator prompt：关键情报分析句优先复用已建立的清晰表达，避免随意改造 idiom
- post-generation quality lint：检测不通顺搭配、疑似错拼隐喻和低置信文本片段
- regeneration policy：对低严重度但明显 malformed 的句子做局部重写
- 优先加入 Narrator 输出质量检查和关键对白局部重写机制；这类问题不需要改剧情状态，主要需要捕捉 malformed idiom。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 4 | 12 | low | quality-regression | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-001/issues/issue-004-turn-12/root-cause-report.md |

## orthography-normalization-gap

family: agent-system

score: 0.75

fixSurface:
- Narrator prompt: 明确要求 zh-Hans/简体中文输出
- Output normalizer: 对 visibleText 做繁简检测或 OpenCC zh-Hans normalization
- Quality validator: 对混入繁体字的正文触发重采样或自动修正
- 优先在 Narrator 输出后增加 zh-Hans normalization/validator；对玩家可见正文进行混排字符扫描，低成本自动修正“隻”等繁体字。

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 12 | 39 | low | language-drift | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003/issues/issue-012-turn-39/root-cause-report.md |

## unsupported-detail-inference

family: llm-self

score: 0.75

fixSurface:
- Narrator prompt presupposition grounding rule
- structured known-facts list for local objects
- post-generation unsupported comparative claim checker
- 在 Narrator 阶段加入“玩家对白前提”检查：凡出现“你说过/最常/已经/当然”等断言式或比较式说法，必须能在 recent visible text 或 structured facts 中找到来源；否则改写成开放问题，例如“你更常翻哪一本？”

| issue | turn | severity | type | confidence | report |
| --- | --- | --- | --- | --- | --- |
| 16 | 47 | low | unsupported-jump | medium | /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-004/issues/issue-016-turn-47/root-cause-report.md |

