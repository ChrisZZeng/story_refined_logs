# Problem

issueIndex=6，turn=15，type=`fact-conflict`，scope=`visibleText`。

裁缝在解释铁盒任务后再次说“你把它带回来，我就告诉你纸条上那个人在哪”。这延续了 turn 13 的错误，把“找裁缝”的纸条继续当作包含某个待定位人物的线索。

# Validity

issueValidity: `valid`

玩家可见证据仍然足够。turn 7 的纸条只写“暗街——找‘裁缝’”；turn 12 裁缝确认自己就是纸条目标；turn 13 已经出现一次错误；turn 15 又在关键任务条件中重复“纸条上那个人”。这不是新的合理解释，而是对前一错误的强化。

该 issue 不需要隐藏信息来成立。即使裁缝确实掌握敏特或其他人的线索，也不能把纸条本身改写为“某个人在哪里”的线索。

# Context Assessment

turn 15 之前，玩家看到的是：裁缝提出要帕兹去取一样东西，作为交换；turn 14 裁缝拒绝替代方案，表示“帮我取东西”是唯一代价。正确的纸条归属事实仍存在于最近几轮可见文本中，但 turn 13 的错误句也已经进入 recent turns。

相关事实：

- `纸条只指向裁缝`：availability=`present-clear`。turn 12 的可见正文在 turn 15 Narrator prompt 的最近经历中仍然出现。
- `turn 13 已经产生“纸条上那个人”的错误表述`：availability=`present-clear`，但这是 stale/contradicted content。turn 15 `06b-narrator-prompt.md` 最近经历完整包含该错误句。
- `Director 没有要求重复纸条人物`：availability=`present-clear`。turn 15 Director object 只安排“裁缝透露私人物品、无法亲自前往、保持动机模糊”，没有要求“纸条上那个人”。
- `当前玩家输入是在追问取物细节`：availability=`present-clear`。这给 Narrator 一个继续解释交易条件的压力。

竞争压力是：最近正文中已有错误短语，且系统一致性规则要求“优先相信最近几轮玩家看到的正文”；同时更早但仍在 recent turns 内的正确裁缝确认没有被结构化提升为纠错依据。

# Causal Chain

firstDivergenceArtifact: 对本条 issue 的直接偏离在 `turn-15/06-llm-calls.json` 的 `kind=streamText` Narrator 输出；根链条的首个错误源头是 `turn-13/06-llm-calls.json` 的 Narrator 输出。

triggeringPressure: turn 15 Narrator prompt 的最近经历里，turn 13 的错误句作为玩家已经看到的正文原样出现。系统的连续性规则强调保持最近玩家可见正文一致，却没有区分“最近正文中的事实”与“最近正文中的已评测冲突”。

missingGuard: 缺少最近错误污染的纠正机制。Director summary 没有重复错误，但也没有明确纠正为“纸条只指向裁缝；交易回报应表述为关于你要找的人、照片人物或其他情报，而不是纸条上的人”。Narrator 也没有收到 clue target/resolved 的结构化约束。

mechanismStatement: 当前一轮错误被作为 recent visible text 输入，而系统没有对它与更早清晰事实做冲突检查时，Narrator 会把错误当作连续性事实复用，在更关键的任务条件中再次写出“纸条上那个人”。

directCause: turn 15 Narrator 继承了 turn 13 的错误可见表述，并在解释铁盒任务时复用。

propagation: turn 15 的 `writes` 把该错误再次提交为 turnContent；Choice 随后围绕铁盒任务给出后续选项，使玩家更容易把该错误理解为任务前提。

nonCauses:

- 这不是单纯的长期记忆遗忘；turn 12 的正确句仍在 turn 15 prompt。
- Choice 不是第一处偏离；错误已在 Narrator 正文中出现。
- 裁缝提供更多肉铺信息虽然另有过度推进风险，但不是本条 issue 的主要根因。

# Root Cause

rootCause.label: `context-priority`

family: `agent-system`

secondaryFamilies: [`recent-context`]

这是一个最近上下文优先级与纠错契约缺失的问题。系统把刚生成过的错误 visible text 与更早但清晰的事实一起交给下一轮，却没有机制标记“turn 13 的纸条人物说法与 turn 12 冲突”。在“保持最近正文一致”的通用规则下，错误句获得了事实权重，导致 turn 15 继续复用。

fixSurface:

- 在 recent-turn assembly 或 Director 阶段加入 contradiction flag，对同一 clue 的 target 冲突进行标注。
- 在 prompt 中把 resolved clue facts 放在独立高优先级字段，而不是只依赖最近正文。
- 对 Narrator 输出做轻量一致性检查，发现“纸条上那个人”与 `paperNote.target=裁缝` 冲突时要求重写。

# Evidence

playerVisible: `visible-timeline.jsonl` turn 7、turn 12、turn 13、turn 15 展示了“纸条只指向裁缝”到“纸条上那个人”再到重复强化的完整可见链。

internalTrace: `turn-15/06b-narrator-prompt.md` 最近经历包含 turn 12 的正确确认，也包含 turn 13 的错误句；`turn-15/06-llm-calls.json` 的 Director object 没有错误短语，Narrator streamText 再次输出“纸条上那个人在哪”；`turn-15/04-output.json` 提交该文本。

# Recommended Fix Area

优先修复 recent context 的冲突优先级和 clue resolved 状态传递。对于已解决线索，后续 prompt 应显式标注正确归属，并在上一轮 visible text 出现冲突时触发纠偏，而不是让 Narrator把错误当连续性事实继续写。

# Confidence

confidence: `high`
