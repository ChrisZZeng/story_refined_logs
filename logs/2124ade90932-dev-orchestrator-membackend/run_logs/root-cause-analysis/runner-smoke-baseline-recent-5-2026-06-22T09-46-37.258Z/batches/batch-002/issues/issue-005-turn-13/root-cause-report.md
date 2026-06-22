# Problem

issueIndex=5，turn=13，type=`fact-conflict`，scope=`visibleText`。

玩家可见正文中，裁缝把交易条件说成“你把这东西带回来，我就告诉你纸条上那个人在哪”。这把“暗街——找‘裁缝’”的纸条误写成了指向某个待定位人物的线索，混淆了纸条目标和主角真正寻找的敏特。

# Validity

issueValidity: `valid`

玩家可见证据足以确认问题成立。turn 7 的纸条只写了“暗街——找‘裁缝’”；turn 12 裁缝本人明确说“你在古董街找到的那张纸条，是留给‘裁缝’的。我就是。”因此到 turn 13 之前，纸条线索已经指向并抵达裁缝本人。turn 13 再说“纸条上那个人在哪”，会让玩家理解为纸条上还有另一个需要定位的人，这与已见事实冲突。

这个判断不依赖隐藏设定。主角确实在更大目标上寻找敏特，但玩家可见文本没有建立“纸条上写着敏特或另一个人”的事实。

# Context Assessment

问题发生前的实际状态是：帕兹为了寻找照片中的敏特来到新西西里；古董街的猫露出纸条，纸条内容是让他去暗街找“裁缝”；帕兹沿线索找到剪刀图案的门，并在 turn 12 见到裁缝，裁缝确认“我就是”。

相关事实：

- `纸条内容是“暗街——找‘裁缝’”`：availability=`present-clear`。证据在 `visible-timeline.jsonl` turn 7，以及 turn 13 的 `06b-narrator-prompt.md` 最近经历中可见。
- `裁缝已确认自己就是纸条所指对象`：availability=`present-clear`。证据在 turn 12 visible text、turn 13 `06b-narrator-prompt.md` 最近经历中可见。
- `主角长期目标是寻找敏特`：availability=`present-clear` 但属于另一条目标线。证据在角色资料和历史情节概览中多次出现。
- `当前 Director 安排只要求裁缝提出交易条件`：availability=`present-clear`。turn 13 `06-llm-calls.json` 的 Director object 中 `requiredContent` 是“裁缝提出代价的具体内容，可以是用物品交换情报或帮忙做某件事”，没有要求或允许把纸条改写成另一名人物。

竞争压力主要来自两个上下文源：一是角色卡和历史摘要反复前景化“寻找照片中的敏特”；二是当前局部纸条线索只在最近正文和压缩摘要中出现，且摘要写成“与纸条线索呼应”，没有结构化说明 `paperNote.target = 裁缝` 且该线索已经 resolved。

# Causal Chain

firstDivergenceArtifact: `turn-13/06-llm-calls.json` 中 `kind=streamText` 的 Narrator 输出，同时反映在 `turn-13/04-output.json` 的 visible text。

Director 并不是第一处偏离。turn 13 的 Director object 只安排“主角回应裁缝，表示愿意付钱并询问代价，裁缝提出条件”，并加了“代价内容不提前揭示超出当前剧情已知范围的信息”的约束。

triggeringPressure: Narrator prompt 同时包含长期目标“寻找敏特”和局部交易压力“裁缝提出代价”。纸条事实虽在最近正文中清楚出现，但没有被提升为专门的 clue binding；当前故事线摘要只说剪刀图案“与纸条线索呼应”，容易把“找人的主线”和“纸条线索”合并成一个模糊的“找某个人”任务。

missingGuard: 系统没有给 Narrator 一个可执行的当前线索约束，例如 `纸条只指向裁缝，且裁缝已出现；不得称纸条上有另一个人`。也没有结构化 clue state 来区分 `photo.target=敏特` 和 `paperNote.target=裁缝`。

mechanismStatement: 当主线寻找对象和局部纸条对象同时进入 prompt，但局部纸条没有结构化 target/resolved 绑定时，Narrator 在生成交易条件时把“裁缝可提供关于寻找对象的情报”压缩成“纸条上那个人在哪”，把两个线索源错误合并成玩家可见事实。

directCause: Narrator 在清楚上下文之上做了 unsupported detail inference，把“纸条线索”和“找人主线”合成了不存在的“纸条上的人”。

propagation: turn 13 的 `writes` 只把中性 turn summary 写入 `currentStoryline`，没有把错误短语结构化写入 storyline；但错误 visible text 被带入之后的 recent turns，为 turn 15 的重复埋下了传播条件。

nonCauses:

- `Director` 不是根因；它没有写出“纸条上那个人”。
- `memory-persistence` 不是主因；正确的纸条和裁缝确认都仍在最近可见上下文中。
- 隐藏设定中敏特相关真相不是玩家可见错误的必要证据。

# Root Cause

rootCause.label: `clue-target-binding`

family: `agent-system`

secondaryFamilies: [`recent-context`]

这是一个线索归属绑定机制缺失。系统把主线目标、局部纸条、裁缝交易都作为自然语言上下文交给 Narrator，却没有给“纸条指向谁、是否已经解决、与照片寻找线是否相同”提供可执行的结构化约束。结果模型在当前交易场景里把两个可见线索源混合，生成了“纸条上那个人”这种玩家可见冲突。

fixSurface:

- story state 或 runtime artifact 中增加当前 clue/object binding，例如 `paperNote.text`、`paperNote.target`、`paperNote.resolvedAtTurn`。
- Director/Narrator handoff 中加入本轮相关 clue 的 scoped facts，并显式标注“照片目标”和“纸条目标”不是同一个槽位。
- Narrator 输出前的一致性检查应拦截“纸条上那个人”这类把已 resolved clue 重新当成 open person clue 的表述。

# Evidence

playerVisible: `visible-timeline.jsonl` turn 7 显示纸条只写“暗街——找‘裁缝’”；turn 12 显示裁缝说“纸条是留给‘裁缝’的。我就是”；turn 13 显示错误句“我就告诉你纸条上那个人在哪”。

internalTrace: `turn-13/06-llm-calls.json` 的 Director object 没有错误绑定；`kind=streamText` 的 Narrator 输出首次写出错误句；`turn-13/04-output.json` 和 `turn-13/07-events.json` 将其提交为 visible text。

# Recommended Fix Area

优先修复 `Director -> Narrator` 的 clue handoff 与 story state 中的 clue target schema。这里需要让当前线索的 target、source 和 resolved 状态成为高优先级事实，而不是让 Narrator 从长篇最近正文中自行重建。

# Confidence

confidence: `high`
