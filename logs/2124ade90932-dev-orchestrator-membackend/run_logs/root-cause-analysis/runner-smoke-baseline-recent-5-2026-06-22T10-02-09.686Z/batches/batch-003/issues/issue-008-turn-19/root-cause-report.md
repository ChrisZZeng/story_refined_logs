# Problem

issueIndex=8，turn=19，type=`repeated-scene`，scope=`visibleText`。

turn 18 已经让德索洛说出“……阁下。”，卡琳娜回应“很好。”、“你女儿的事，我可以查。”和“不过你应该知道我的规矩。”turn 19 在玩家选择“继续保持沉默，让卡琳娜处理”后，又把这组称呼、同意调查和规矩提醒当作新正文重演了一遍，随后才继续推进到第二次低头、明天再来和德索洛退场。

# Validity

`issueValidity`: `valid`

只看玩家可见时间线，问题已经成立。turn 18 末尾的交易前置动作已经完成，turn 19 开头却从“……阁下。”“很好。”“你女儿的事，我可以查。”“不过你应该知道我的规矩。”重新演起。玩家输入只是保持沉默，让卡琳娜继续处理，并没有要求回放上一轮内容。

# Context Assessment

问题发生前，玩家实际看到的状态是：德索洛站在门口，双手垂在身侧，已经低声称呼“阁下”；卡琳娜已经接受称呼，同意可以查女儿之事，并提醒他知道自己的规矩。下一轮应该从这个已完成状态之后继续，最多承接德索洛如何回应规矩，而不应重新演出称呼和承诺。

Relevant facts:

- claim: turn 18 已完成称呼、同意调查和规矩提醒。availability: `present-clear`。artifacts: `visible-timeline.jsonl`, `turn-19/03-story-state.json`, `turn-19/06a-director-prompt.md`。notes: 最近几轮玩家经历中完整列出 turn 18 文本，且离本轮玩家输入很近。
- claim: currentStoryline.summary 已记录“迫使他称自己为‘阁下’并接受交易条件”。availability: `present-clear`。artifacts: `turn-19/03-story-state.json`, `turn-19/06a-director-prompt.md`。notes: 这是已完成进展，本应抑制重复。
- claim: 德索洛角色资料仍含固定“交易过程”：单膝跪地、拉手、“卡琳娜阁下”、交易达成。availability: `over-constraining`。artifacts: `turn-19/02-script-state.json`, `turn-19/06a-director-prompt.md`。notes: 该固定素材没有按当前可见进度被消费或改写为剩余待演内容。
- claim: prompt 顶部有“不要重复、重演”规则。availability: `present-clear`。artifacts: `turn-19/06a-director-prompt.md`, `turn-19/06b-narrator-prompt.md`。notes: 规则存在，但弱于后续 fixed beat / requiredContent 的执行压力。

Competing pressures:

- 最近正文明确告诉 Director 不该重复。
- 德索洛角色资料和节点素材持续把“尊严换公道”的完整固定过程提供给模型。
- currentStoryline 的 constraints 仍写着“卡琳娜‘尊严换公道’的交易法则待后续展现”“不提前揭示具体内容”，让交易像仍未完成。
- 系统要求 `requiredContent` 必须写进正文，导致一旦 Director 选错固定 beat，Narrator 很难纠正。

# Causal Chain

First divergence artifact: `turn-19/06-llm-calls.json[0].object`，即 Director output。

Director 在 turn 19 输出中写入：

- beats: “卡琳娜审视德索洛，等待他主动询问规矩。”
- beats: “德索洛犹豫后再次单膝跪地，拉起卡琳娜的手，低唤‘阁下’加姓氏。”
- requiredContent: “卡琳娜没有立即回应德索洛的‘阁下’”，“德索洛主动单膝跪地，拉起卡琳娜的手。”

Triggering pressure: prompt 中德索洛角色资料的“交易过程”以完整固定演出形式出现，且 currentStoryline 仍处在 beat `2-02-第一章`，没有将称呼和同意调查标成 consumed，只把它们压缩进一个模糊 summary。

Missing guard: 缺少 fixed beat consumed-state / remaining-beat 机制。系统没有把“已完成称呼、已承诺可查、已提醒规矩”从可执行固定素材中剔除，也没有硬性要求 Director 以最近可见 turn 18 的末帧为唯一起点。

Mechanism statement: 已消费的固定交易 beat 仍以可执行素材进入 Director prompt，recentTurns 虽然清楚但只是普通上下文；Director 把固定素材重新提升为本轮 `requiredContent`，Narrator 按必须写入规则重演上一轮交易步骤，造成玩家可见进度倒退。

Direct cause: Director 把上一轮已完成内容重新安排为 turn 19 的剧情骨架。

Propagation: Narrator 根据 Director `requiredContent` 生成重复正文；`04-output.json` 写入该 narrative；Choice 基于重复后的结尾生成“跟进卡琳娜”等选项；runtime-after 将德索洛移出 on-stage，但不能修复 turn 19 的玩家可见重复。

Non-causes:

- 不是玩家输入导致；玩家选择保持沉默，是继续处理，不是要求重放。
- 不是 Choice 绑定错误；Choice 在重复之后才生成。
- 不是长期 memory 缺失；需要的信息就在最近一轮和 currentStoryline.summary 中。

# Root Cause

`rootCause.label`: `fixed-beat-consumption`

`family`: `agent-system`

`secondaryFamilies`: `recent-context`

根因是固定剧情 beat 的消费状态没有被结构化管理。德索洛交易过程作为角色资料和节点素材持续出现在 prompt 中，却没有被拆成“已完成”和“剩余待演”的可执行状态；Director 在 recent visible text 与固定素材冲突时，把已消费的称呼/同意/规矩提醒重新排进本轮 requiredContent。系统虽然有“不要重复”的文字规则，但没有让它在 fixed beat 选择上成为硬约束。

`fixSurface`:

- storyline / fixed beat lifecycle：给固定演出增加 consumed / remaining / incompatible 状态。
- Director context assembly：把已完成固定 beat 从可执行素材中降权或移除。
- Director prompt contract：要求 `requiredContent` 只能来自“剩余待演”，并校验不得包含最近一轮已出现的对白。

# Evidence

Player-visible evidence:

- turn 18: “……阁下。”、“很好。”、“你女儿的事，我可以查。”、“不过你应该知道我的规矩。”
- turn 19: 再次出现“……阁下。”、“很好。”、“你女儿的事，我可以查。”、“不过你应该知道我的规矩。”

Internal trace:

- `turn-19/03-story-state.json`: currentStoryline.summary 已写“迫使他称自己为‘阁下’并接受交易条件”，但 constraints 仍保留“尊严换公道”待展现。
- `turn-19/02-script-state.json`: 德索洛角色资料的“交易过程”仍写完整固定演出。
- `turn-19/06-llm-calls.json[0].object`: Director 把“再次单膝跪地、拉起手、低唤阁下”放入 beats / requiredContent。
- `turn-19/06-llm-calls.json[1].text`: Narrator 按 Director 安排输出重复场景。

# Recommended Fix Area

优先修复 fixed beat lifecycle 和 Director 的 fixed material selection：每个固定交易步骤需要可消费状态，且 consumed steps 不应再进入 `requiredContent`。同时增加 prompt-time duplicate check，比较 Director `requiredContent` 与最近一轮 visible text。

# Confidence

`high`

可见重复、Director 首次偏离、固定素材压力和缺失消费状态在日志中都直接可见。
