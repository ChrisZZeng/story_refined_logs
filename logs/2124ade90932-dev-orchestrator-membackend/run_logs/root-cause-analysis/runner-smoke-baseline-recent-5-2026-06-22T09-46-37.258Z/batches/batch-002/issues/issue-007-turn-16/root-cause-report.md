# Problem

issueIndex=7，turn=16，type=`space-time-break`，scope=`visibleText`。

前文已经把暗街行动锚定在夜色中，turn 16 裁缝却说“最好趁白天去。现在离正午还有一阵”，并给出“趁白天行动”的选项。玩家没有看到倒叙、睡眠或长时间跳转，当前任务时间从夜里断裂回正午前。

# Validity

issueValidity: `valid`

玩家可见证据支持该问题。turn 8 的暗街入口对峙以“夜色里，灯泡吱地响了一声”明确锚定；之后 turn 9 到 turn 15 都是连续行动：通过盘查、深入暗街、找门、进入裁缝铺、谈交易，没有可见时间跳回白天的桥段。turn 16 的“白天”“离正午还有一阵”和后续选项“现在就去肉铺，趁白天行动”与此前时间状态冲突。

这里不需要隐藏时间线或脚本信息来判定。即便暗街室内昏暗，玩家看到的“夜色”仍然是当前外部时间锚。

# Context Assessment

问题发生前的实际状态是：帕兹在夜色中的暗街完成连续探索，进入裁缝铺并与裁缝谈取铁盒的条件。turn 16 玩家只是继续追问肉铺周围情况，没有触发时间跳转。

相关事实：

- `暗街行动发生在夜色中`：availability=`absent` for turn 16 Director prompt 的高优先级结构化字段。该事实在玩家可见 turn 8 清楚出现，但因为当前 recent window 主要覆盖 turn 11-15，且 `currentStoryline.summary` 未保存 time-of-day，Director 无高优先级时间锚。
- `turn 9-15 是连续行动，无长时间跳转`：availability=`present-clear`。turn 16 Narrator prompt 最近经历展示了连续对话和探索。
- `Director 在 turn 16 主动注入白天行动窗口`：availability=`over-constraining`。turn 16 Director object 的 `requiredContent` 包含“白天少有人去”“傍晚后偶尔有黑帮”“最好在庆典人流散去前行动”。
- `Narrator 和 Choice 服从该白天窗口`：availability=`present-clear`。turn 16 Narrator 输出写出“现在离正午还有一阵”，Choice 输出“现在就去肉铺，趁白天行动”。

竞争压力主要来自：历史摘要和世界资料保留“复活日清晨与中央区”“庆典人流”等日间/庆典语汇；写作规范鼓励用光线暗示时间；但当前场景缺少持久的 `timeOfDay=night` 状态来压过这些泛化压力。

# Causal Chain

firstDivergenceArtifact: `turn-16/06-llm-calls.json` 的 Director object，也同步出现在 `turn-16/04-output.json` 的 `plotPoint.requiredContent`。

triggeringPressure: 玩家询问“肉铺周围有没有人看守、该注意什么”，Director 需要给出潜入时间窗口。由于当前状态没有持久化夜间锚，Director 从“白天少有人去、傍晚有人抽烟、庆典人流尚未散到这边”等常规潜入逻辑和庆典语汇中构造了白天方案。

missingGuard: story state 和 Director prompt 没有结构化的 current scene temporal anchor。turn 8 的“夜色”没有写入 currentStoryline summary、location state 或 runtime-after 的可执行字段；prompt 也没有约束“不得把当前连续行动倒回正午前”。

mechanismStatement: 当当前场景的 time-of-day 只存在于较早 visible prose，而没有被持久化为 scene state 时，Director 在安全路线规划压力下会根据通用庆典/巡逻逻辑重新推断时间窗口，生成与玩家已见夜色冲突的白天任务条件。

directCause: Director 把“白天/正午前/庆典人流未散”写入 requiredContent；Narrator 按该安排生成正文；Choice 继续锁定“趁白天行动”。

propagation: 错误先在 Director object 成为本轮 contract，再通过 Narrator visible text 和 Choice options 同时对玩家可见，形成正文和后续行动层面的时间断裂。

nonCauses:

- 不是 Narrator 单独幻觉；Narrator 遵循了 Director 的 requiredContent。
- 不是玩家输入造成；玩家只要求询问看守和注意事项。
- 不是隐藏脚本要求的必然结果；可见连续性没有给出回到正午前的桥。

# Root Cause

rootCause.label: `missing-current-scene-time-anchor`

family: `detail-memory`

secondaryFamilies: [`agent-system`, `recent-context`]

这是一个当前场景时间锚的持久化缺失。`夜色` 是具体的玩家可见场景细节，但它没有作为稳定事实进入 story state 或 Director handoff；当它滑出 recent window 后，Director 只能从泛化的庆典时间、白天/傍晚风险和潜入任务逻辑重新推断，最终把当前连续夜间行动改写成正午前。

fixSurface:

- story state 或 runtime state 增加 `currentTimeOfDay`、`lastVisibleTimeAnchor`、`timeAdvanceReason` 等字段。
- state writeback 在出现“夜色”“正午”“暮色”等时间锚时更新当前 scene temporal facts。
- Director prompt 在规划任务窗口时必须引用当前时间锚；若需要改变时间，必须生成玩家可见过渡。
- Choice generation 需要检查选项时间是否与 currentTimeOfDay 冲突。

# Evidence

playerVisible: `visible-timeline.jsonl` turn 8 写明“夜色里，灯泡吱地响了一声”；turn 9-15 连续行动没有时间跳转；turn 16 写出“白天”“离正午还有一阵”，并提供“趁白天行动”选项。

internalTrace: `turn-16/06-llm-calls.json` 的 Director object 在 `requiredContent` 中写入白天/傍晚/庆典人流窗口；`turn-16/06b-narrator-prompt.md` 把该 object 交给 Narrator；`turn-16/04-output.json` 和 `turn-16/06-llm-calls.json` 的 Choice object 将其提交到正文和选项。

# Recommended Fix Area

优先修复 scene temporal facts 的写回和 Director handoff。时间锚不应只靠最近几轮 prose 记忆；只要当前行动连续，Director 在生成行动窗口前应看到并维护 `currentTimeOfDay`。

# Confidence

confidence: `high`
