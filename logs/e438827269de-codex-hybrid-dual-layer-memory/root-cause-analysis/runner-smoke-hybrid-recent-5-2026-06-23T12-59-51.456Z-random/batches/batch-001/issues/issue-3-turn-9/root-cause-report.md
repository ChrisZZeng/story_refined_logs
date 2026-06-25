# Root Cause Report - issue-3-turn-9
## Problem
- issueIndex: 3
- turn: 9
- issueValidity: valid
- problemSummary: turn 9 中卡琳娜把中央区摊贩称为“那个老头”，但 turns 1-3 玩家看到的同一摊贩一直以“她”呈现。
- tracePacket: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-001/issues/issue-3-turn-9/trace.md`

## Validity
- verdictReason: 玩家可见证据足以成立：前文多次用女性代词描述该摊贩，turn 9 又把“中央区卖旧货的摊贩”接成“他说”和“那个老头”，没有伪装、误认或另一个摊贩的可见解释。
- playerVisibleSupport: turns 1-3 可见文本多次写“她把胳膊肘撑在摊子上”“她低下头去整理摊子上的零碎物件”等；turn 9 写帕兹说“中央区卖旧货的摊贩。他说你住在这里。”，随后卡琳娜说“那个老头啊。”
- caveats: 如果后续明确揭示中央区另有一名卖旧货老人，才可能解释；本批次可见范围内没有这种桥接。

## Context Assessment
- actualStateBeforeIssue: 卡琳娜刚在暗街巷口制止冲突并邀请主角去公寓。主角跟随她穿过暗街，途中解释自己是听中央区摊贩说报卡琳娜名字有用。此时被提及的应是 turns 1-3 同一名已见过的摊贩。
- relevantFacts:
  - `present-clear` 中央区摊贩此前被玩家明确看到为女性编码。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-01/04-output.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-02/04-output.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-03/04-output.json` notes: 玩家可见正文连续使用“她”指代摊贩。
  - `absent` turn 9 生成所需 prompt 中没有稳定保留摊贩性别、代词或外观属性。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-09/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-09/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-09/06b-narrator-prompt.md` notes: 事件记忆和历史概览只保留“摊贩/摊主/小贩”提供线索的功能性事实，没有 `pronouns`、`genderCue` 或 `lastMentionedAs`。
  - `not-needed` turn 9 Director 未要求提及摊贩，也未给出摊贩身份细节。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-09/06-llm-calls.json` notes: Director beats 是跟随卡琳娜、穿过巷道、抵达公寓；vendor 相关对白是 Narrator 自行添加的过渡交谈。
  - `contradicted` Narrator 在缺少性别锚点时为摊贩补入“他说/老头”。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-09/06-llm-calls.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-09/04-output.json` notes: 输出同时出现 `他说你住在这里` 和 `那个老头啊`，与前文女性编码冲突。
- competingPressures: turn 9 最近上下文主要是暗街冲突，turns 1-3 的摊贩细节已离开近期窗口；memory summary 只保留功能性事实：摊贩提供卡琳娜线索，没有保留性别/外貌；“卖旧货的摊贩”容易触发老年男性摊主的默认推断；过渡对白需要让卡琳娜回应线索来源，模型补写了未被约束的人物细节

## Causal Chain
- firstDivergenceArtifact: story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-09/03-story-state.json / story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-09/06b-narrator-prompt.md omit vendor gender; visible divergence appears in story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-09/06-llm-calls.json call[1].text
- triggeringPressure: 摊贩的功能性记忆被保留为“中央区摊贩提供卡琳娜线索”，但性别/代词和可见称谓没有被持久化；Narrator 需要写自然路上对白，于是基于“卖旧货摊贩”进行默认补全。
- missingGuard: 缺少 transient NPC 的实体属性持久化与重提校验：再次提到已见过 NPC 时，没有要求从 visible history/entity memory 取称谓、代词、外貌，或在不确定时使用中性称谓。
- mechanismStatement: 临时 NPC 的性别/代词没有从玩家可见文本写入可检索实体属性；当最近上下文只剩功能性摘要时，Narrator 用常见摊主刻板印象补写“老头”，把同一摊贩重铸为男性老人。
- directCause: Narrator 在 turn 9 过渡对白中 unsupported 地新增 `他说` 和 `那个老头`。
- propagation: 错误被提交进 turn 9 正文；本批次目标处主要是当轮 visibleText，后续若继续引用该 vendor 才可能进一步固化。
- nonCauses: 不是玩家输入造成的二义性；玩家只选择跟上卡琳娜。；不是 Director 明确要求将摊贩设为男性；Director object 没有该内容。；不是隐藏设定推翻可见事实；玩家没有看到摊贩伪装或另一个摊主。

## Root Cause
- label: `memory-persistence`
- family: `detail-memory`
- secondaryFamilies: `llm-self`
- description: 具体机制是临时 NPC 的可见身份属性没有持久化。系统保留了“摊贩提供线索”的剧情功能，却丢失了女性代词/呈现；缺失的实体属性防线让 Narrator 在重提该 NPC 时进行 unsupported gender/age inference，最终输出“老头”。
- fixSurface: statefold/memory extractor：为临时 NPC 保存 `genderCue`、`pronouns`、`appearanceCue`、`lastMentionedAs`；context assembly：当输出提及已见过 NPC 时检索并前置这些属性；Narrator prompt/output validator：不确定时使用中性称谓“那个摊贩”，禁止新增年龄/性别

## Evidence
- playerVisible: turns 1-3 的摊贩多次以“她”出现；turn 9 同一来源被写成“他说”“那个老头”。
- internalTrace: turn 9 的 story state、Director/Narrator prompt 和事件记忆只保存“摊贩/摊主”提供线索，没有保存代词或性别；Director 未安排 vendor 身份变化；Narrator output 首次引入男性老人称谓。

## Recommended Fix Area
优先改进 detail-memory/statefold 对临时 NPC 属性的抽取和回填，并增加“重提已见 NPC 不新增性别/年龄”的 Narrator 约束。

## Confidence
`high`
