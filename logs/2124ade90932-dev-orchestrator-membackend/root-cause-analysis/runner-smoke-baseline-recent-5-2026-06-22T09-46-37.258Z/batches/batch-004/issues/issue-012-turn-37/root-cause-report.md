# Root Cause Report: issue-12-turn-37

## Problem

issueIndex=12, turn=37, severity=low, type=fact-conflict, scope=visibleText。

turn 37 把新的三连敲写成“第三声敲门”和“那三声叩击”，没有清楚承接 turn 36 已经出现的三声敲门和随后两声敲门。玩家可能误读当前是第三声、第三轮敲门，还是另一组三连敲。

## Validity

issueValidity: valid。

只看玩家可见文本，该问题成立。turn 36 已经写出一组三声“咚咚咚”，随后又写“敲门声又响了一次。这次更短——两声”。turn 37 再次写“咚咚咚”，并立刻称为“第三声敲门”，随后又说“那三声叩击”。这些表述混用了单个叩击、三连叩击和敲门轮次。

保留一点 caveat：“第三声敲门”可以勉强读成第三轮敲门，而不是第三个叩击；但因为同段同时出现“咚咚咚”和“那三声叩击”，误读风险是真实存在的。

## Context Assessment

问题发生前，玩家已经看到主角捏住暗红线薄册子但还没翻开；门外先响过三声，又响过一次更短的两声。玩家选择“翻开册子迅速看一眼内容再回应敲门”，所以系统可以继续加强门外压力，但必须清楚承接已有敲门序列。

相关事实：

- 已有三声敲门和随后两声敲门：availability=present-clear。证据在 visible-timeline.jsonl turn 36、turn-37/03-story-state.json recentTurns[index=35]、turn-37/06a-director-prompt.md 和 turn-37/06b-narrator-prompt.md。
- 玩家核心动作是快速看册子再回应敲门：availability=present-clear。证据在 visible-timeline.jsonl turn 37 playerInput、turn-37/06a-director-prompt.md 和 turn-37/06b-narrator-prompt.md。
- currentStoryline 仍保留“本节点结束时必须输出敲门声”：availability=over-constraining。证据在 turn-37/03-story-state.json currentStoryline.constraints 和 Director/Narrator prompts。
- Director 需要区分“第几轮敲门”和“第几声叩击”：availability=absent。turn-37/06-llm-calls.json director call 直接写成“敲门声第三次响起”，没有计数基准。

## Causal Chain

firstDivergenceArtifact: turn-37/06-llm-calls.json director call，镜像见 turn-37/07-events.json worker-done director 和 turn-37/06b-narrator-prompt.md 的 Director 安排摘要。

triggeringPressure: currentStoryline.constraints 中“本节点结束时必须输出敲门声”在上一轮敲门已经出现后仍保持激活；玩家输入又要求先看册子再回应敲门，于是 Director 把未消费的固定 beat 推成“敲门声第三次响起”。

missingGuard: 缺少 fixed beat consumed/incompatible guard，也缺少连续声响的计数承接规则。系统没有要求 Director 在重用敲门 beat 前检查上一轮是否已经输出过，或者把新敲门改写成“门外再次催促”。

mechanismStatement: 已触发的敲门过渡 beat 没有被标记为 consumed，且 Director 没有被强制按 recent visible sequence 校准计数，导致固定 beat 被再次落成带序数的 requiredContent；Narrator 按 requiredContent 写出“第三声敲门”，最终让玩家可见文本混淆敲击声与敲门轮次。

propagation: Director requiredContent 进入 turn-37/06b-narrator-prompt.md；Narrator 输出进入 turn-37/04-output.json narrative 和 writes.turnContent.visibleText；writes.currentStoryline.update.turnSummary 又固化为“敲门声第三次响起”。turn-37/05-runtime-after.json 只保留“敲门声打断了交谈”锚点，没有保存细粒度 knockSequence。

nonCauses:

- choiceGenerator 不是主因；turn 37 的选项没有延续计数错误。
- 不是 long-term memory failure；所需事实就在上一轮 recent context。
- 不是单纯 Narrator 局部失误；Narrator 收到的 Director requiredContent 已经带有“第三次”指令。

## Root Cause

rootCause.label: fixed-beat-consumption。

family: agent-system。secondaryFamilies: recent-context。

敲门作为 storyline 固定过渡 beat 在上一轮已经玩家可见地触发，但 lifecycle/writeback 没有把该 beat 标记为 consumed，也没有把“门外仍在等待回应”改写成新的兼容状态。Director prompt 因而继续把“必须输出敲门声”作为强压力，同时没有计数承接 guard，最终把 recent context 中已有的三声和两声之上又生成一个“第三声敲门”。

## Evidence

玩家可见证据：visible-timeline.jsonl turn 36 显示三声“咚咚咚”和随后两声；turn 37 显示再次“咚咚咚”，并称为“第三声敲门”“那三声叩击”。

内部链路证据：turn-37/03-story-state.json currentStoryline.constraints 仍要求“本节点结束时必须输出敲门声”；turn-37/06-llm-calls.json 与 turn-37/07-events.json 的 Director output 把 requiredContent 写成“敲门声第三次响起”；turn-37/06b-narrator-prompt.md 将该安排交给 Narrator；turn-37/04-output.json 和 07-events narrator output 固化为玩家可见正文；turn-37/05-runtime-after.json 没有保存敲门计数状态。

## Recommended Fix Area

优先修复 storyline fixed beat lifecycle 和 Director handoff 中的 recent visible sequence 校准；其次补充 runtime scene state 对连续声响的细粒度写回。具体包括 consumed/resolved/incompatible 状态、Director prompt 中的 beat 降级规则，以及 Narrator 对“第几声/第几次”的计数基准要求。

## Confidence

confidence: high。
