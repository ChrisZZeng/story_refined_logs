# Root Cause Report - issue-10 turn 45

## Problem
turn 45 的“那扇你刚刚推开的门”可能被读作玩家刚推开物理铁门，但上下文也强烈支持它是“打开谈话/回忆入口”的隐喻。

## Validity
- issueValidity: `questionable`
- verdictReason: 可见证据不足以把它判定为确定事实冲突。若按物理门理解，确实与 turn 39 卡琳娜推门、turn 40 玩家跨门槛相冲突；但 turn 43-45 连续使用“半开的门”“打开了一扇门”等谈话隐喻，且 turn 45 玩家刚问“想聊聊这里的事吗”，因此“刚刚推开的门”有合理的比喻读法。
- playerVisibleSupport: 物理读法的支持来自 turn 39-40 的铁门动作；隐喻读法的支持来自 turn 43 的“半开的门”、turn 44 的“那行字打开了一扇门”以及 turn 45 以追问打开卡琳娜回忆话题。
- caveats:
- 这句话仍有歧义风险：黑猫“看着门”的物理动词容易把隐喻拉回实体门。
- 如果产品标准要求避免所有未标明的实体/隐喻双关，可将其视作低严重度文案风险，而非确定连续性错误。

## Context Assessment
- actualStateBeforeIssue: 玩家和卡琳娜已在室内进行了多轮关于笔记本、红百叶窗和母亲住处的对话；物理铁门早在 turn 39-40 完成进入动作；当前轮玩家接茶并邀请卡琳娜聊“这里的事”。
- relevantFacts:
- `present-clear` 物理铁门由卡琳娜打开，玩家只是跨过门槛进入。
  artifacts: `visible-timeline.jsonl`, `turn-45/trace.md`
  notes: 这是评测把句子读作实体门时的冲突依据。
- `present-clear` 最近两轮把回忆和谈话推进反复写成“门”隐喻。
  artifacts: `turn-45/06b-narrator-prompt.md`, `visible-timeline.jsonl`
  notes: turn 43 写“把那扇半开的门又推开了一点”，turn 44 写“那行字打开了一扇门”。
- `present-clear` turn 45 玩家刚刚打开的是话题入口：询问是否想聊这里的事。
  artifacts: `turn-45/04-output.json`, `turn-45/06b-narrator-prompt.md`
  notes: “刚刚”可以指当前对话动作，不一定指进入房间。
- `present-clear` Narrator prompt 没有强制重提物理门动作。
  artifacts: `turn-45/06b-narrator-prompt.md`, `turn-45/04-output.json`
  notes: Director 安排是泡茶、接茶、提问、卡尔观察，不要求门动作。
- competingPressures:
- 房间本身以铁门为重要空间边界，实体门仍是场景母题。
- 近几轮同时使用门作为心理/回忆隐喻，且没有显式标注比喻。
- 黑猫被写成有象征性观察功能，能让“看着门”同时像实体动作和寓意动作。

## Causal Chain
- firstDivergenceArtifact: `evaluator interpretation of turn-45 visibleText`
- triggeringPressure: 评测把“那扇你刚刚推开的门”优先解析成物理铁门；但生成上下文中“门”也被连续用作谈话/记忆隐喻。
- missingGuard: 原文没有用“像是/仿佛/话题的门”明确标记隐喻，导致实体门读法和隐喻读法并存。
- directCause: 不是确定的剧情链路错误，而是一个歧义句触发的评测风险。
- mechanismStatement: 未标注的高频隐喻与同场景实体物件同名时，评测和读者可能把心理动作误解析为物理动作，但当前证据不能排除合理隐喻读法。
- propagation: 该句只出现在 turn-45 visibleText 中；后续问题不依赖玩家是否真的推过物理门。
- nonCauses:
- 不是明确的 action binding 错误；当前玩家输入确实打开了谈话话题。
- 不是物理门状态缺失造成的确定错误；turn 45 prompt 中更显著的是最近的“门”隐喻。

## Root Cause
未生成：该 issueValidity 不是 valid。

## Evidence
- playerVisible: turn 39-40 支持物理冲突读法；turn 43-45 支持隐喻读法，因此 validity 只能判为 questionable。
- internalTrace: turn-45/06b-narrator-prompt.md 包含 turn 43-44 的门隐喻，并且 Director output 只要求泡茶、提问和卡尔观察，没有要求复述物理开门。

## Recommended Fix Area
若要降低此类误判和读者歧义，应在 Narrator prompt 或后处理文案规则中要求：当同一场景存在实体门时，心理/话题“门”隐喻需要加明确比喻标记，避免“看着那扇门”这类实体化表述。

## Confidence
`medium`
