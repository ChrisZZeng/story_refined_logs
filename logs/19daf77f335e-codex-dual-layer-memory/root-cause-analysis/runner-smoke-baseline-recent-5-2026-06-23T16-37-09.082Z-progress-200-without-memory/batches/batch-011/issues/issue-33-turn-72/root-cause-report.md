# issue-33-turn-72 Root Cause Report

## Problem
- issueIndex: `33`
- turn: `72`
- issueValidity: `valid`
- summary: 第72轮凭空写出玩家在宴会上观察到康纳递酒、戴银戒并翻转戒指，随后让卡琳娜和卡尔把该观察当成真实权力信号推进；但玩家可见时间线没有发生过这段互动。

## Validity
问题成立。玩家可见的 turn-27 只是卡琳娜介绍康纳并建议玩家见她，turn-28 玩家选择告辞并离开宴会厅；没有康纳递酒、戒指、翻转手势或玩家近距离观察。turn-72 将该不存在的观察写成玩家说出口的事实并让 NPC 验证，属于 unsupported-jump。

玩家可见证据：turn-27: 卡琳娜说康纳是晚宴主人并建议玩家见她；turn-28: 玩家选择“仍然决定告辞，改日再说”，正文写玩家走向大门、走进雨里并回到暗街。turn-72: 玩家台词声称“康纳递酒给你的时候……银戒……翻转了一下”。

Caveats:
- 无

## Context Assessment
问题发生前状态：玩家早已离开宴会，当前在卡尔小屋壁炉边。可见经历只支持玩家知道康纳名字、身份以及卡琳娜建议以后会见到康纳；不支持玩家曾看到康纳和卡琳娜在宴会上进行递酒/戒指互动。

Relevant facts:
- `present-clear` 玩家没有可见地见到康纳递酒或翻转戒指。 artifacts: `visible-timeline.jsonl:turn-27`, `visible-timeline.jsonl:turn-28`；玩家在康纳真正出场/交互前选择告辞并离开。
- `present-ambiguous` turn-71 Choice 提供“提起宴会上看到的某个细节”但没有绑定具体可见细节。 artifacts: `turn-71/04-output.json`, `turn-71/06-llm-calls.json call[2]`；该选项暗示存在可提及的宴会细节，却没有要求从 visible timeline 选择已出现事实。
- `contradicted` runtime anchors 将未可见发生的康纳交互/试探/交锋标记为 true。 artifacts: `turn-28/05-runtime-after.json`, `turn-72/05-runtime-after.json`；turn-28 后 anchors 已有“康纳的试探”“康纳和卡琳娜的交锋”true，与玩家离开宴会的可见事实不一致。
- `over-constraining` turn-72 Director 要求玩家必须描绘一个具体宴会细节。 artifacts: `turn-72/06-llm-calls.json call[0]`, `turn-72/04-output.json`；requiredContent 写“主角必须描绘一个具体的宴会细节”，示例包含康纳眼神/手势/对话片段，迫使 Narrator 填充具体事实。
- `present-clear` Choice prompt 本身要求不要展示未被正文铺垫的候选动作。 artifacts: `turn-71/06c-choice-prompt.md`；该 guard 存在但未阻止未绑定的“宴会上看到的某个细节”选项。

Competing pressures:
- 阶段五剧本/历史摘要长期保留“康纳与卡琳娜的权力试探”
- runtime anchors 把未可见交锋标为已发生
- 当前情节仍要求围绕宴会看法/权力关系展开
- Choice 提供了未指定细节的试探行动
- Director requiredContent 要求具体化该细节

## Causal Chain
- firstDivergenceArtifact: `内部最早可见于 turn-28/05-runtime-after.json：玩家离开宴会后仍写入“康纳的试探”“康纳和卡琳娜的交锋”等 anchors；目标回合的首个玩家可见前分歧是 turn-71/06-llm-calls.json call[2] 的未绑定“宴会细节”选项。`
- triggeringPressure: 剧情节点 05-03 的固定权力试探被 runtime/storyline 视为已访问/已发生，后续 prompt 的历史概览也保留康纳交锋走向；turn-71 Choice 因此允许“提起宴会上看到的某个细节”，turn-72 Director 又把它升级为“必须描绘具体宴会细节”。
- missingGuard: 系统没有区分 fixed beat 被跳过/访问/实际玩家可见完成，也没有把 runtime anchors 与 visible timeline 对齐；Choice/Director 缺少“具体细节必须来自玩家已见文本”的约束和检索槽。
- mechanismStatement: 被玩家可见选择跳过的康纳交锋 beat 仍被写入已发生 anchors，后续 Choice 和 Director 把这些隐藏/脚本事实当成玩家可用 affordance，并在没有可见细节的情况下要求 Narrator 具体化，最终生成了戒指信号这一 unsupported factual clue。
- directCause: turn-72 Director 的 requiredContent 要求主角说出具体宴会细节；Narrator 选择了“康纳递酒、银戒朝内翻转”并让卡琳娜/卡尔确认其意义。
- propagation: 错误不仅在 turn-72 正文出现，还进入 turn-72 的后续选项“问卡琳娜，她对刚才那枚戒指的事还有什么想说的”，并在 turn-73/74 继续扩展为骷髅会身份线索。

Non-causes:
- 不是玩家真的观察到了但评测遗漏：visible timeline 中 turn-28 明确离开宴会。
- 不是单纯 Narrator 幻觉：Director 已经要求具体宴会细节，Choice 已经提供未绑定 affordance。
- 不是 meta-memory 缺失：根因是隐藏 state/beat lifecycle 与玩家可见路径不一致。

## Root Cause
- label: `state-writeback`
- family: `agent-system`
- secondaryFamilies: 无
- description: 玩家可见路径跳过了康纳交锋，但 runtime-after/storyline writeback 仍将康纳试探和交锋标记为已发生；这个错误状态让后续 Choice/Director 认为玩家拥有宴会权力细节可供提起，并在缺少 visible support 时强制 Narrator 填充具体细节，形成玩家可见 unsupported-jump。
- fixSurface: `quest/runtime anchor writeback：区分 beat visited、beat skipped、visible completed`, `storyline summary 生成：不要把未可见固定 beat 写成已发生进展`, `Choice affordance validator：具体观察类选项必须绑定 visible evidence`, `Director requiredContent：禁止要求玩家描绘未在 visible timeline 中出现的具体事实`

## Evidence
- playerVisible: turn-27/28 显示玩家没有见到康纳递酒或戒指；turn-72 直接把该观察作为玩家台词并让 NPC 认证。
- internalTrace: turn-28 runtime-after anchors 已把“康纳的试探”“康纳和卡琳娜的交锋”置 true；turn-71 Choice 给出未绑定宴会细节选项；turn-72 Director requiredContent 强制具体化，Narrator 生成戒指细节。

## Recommended Fix Area
优先修复 fixed beat / anchor writeback 与 visible timeline 的一致性，并在 Choice/Director 对观察类行动进行 visible-evidence gating。

## Confidence
`high`
