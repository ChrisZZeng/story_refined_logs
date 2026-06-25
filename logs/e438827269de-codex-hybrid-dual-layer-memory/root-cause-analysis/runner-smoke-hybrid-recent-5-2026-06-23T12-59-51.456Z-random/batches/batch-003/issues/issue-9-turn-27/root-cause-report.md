# Root Cause Report: issue-9-turn-27
## Problem
- issueIndex: 9
- turn: 27
- type: repeated-scene
- severity: medium
- problemSummary: 玩家选择“确认她见过敏特”后，正文没有只推进到新的承认，而是先重复上一轮关于短发与“长头发容易被人抓住”的回答，并且对话帧的可见引号退化。

## Validity
- issueValidity: valid
- verdictReason: 该问题在玩家可见层面成立。turn-26 已经完整回答“不是”、短发和长发危险的原因；turn-27 的玩家输入只是确认她见过敏特，正文开头却近乎逐句重演这些内容。
- playerVisibleSupport: visible-timeline.jsonl 中 turn-26 已显示卡琳娜说“不是”“我知道她的时候——她已经是短发了。剪得很短。比照片上还要短。”“她说长头发容易被人抓住。在暗处不方便。”；turn-27 又以“不是。/我知道她的时候——她已经是短发了。比这张照片上还要短。/她说长头发容易被人抓住。在暗处不方便。”开场。
- caveats: turn-27 后半段“我见过她。就在新西西里。几个月前。”确实推进了新确认；问题集中在开头重复演出和对白标点退化。

## Context Assessment
- actualStateBeforeIssue: turn-26 结束时，卡琳娜已经回答过发型问题，并用短发原因强烈暗示她亲眼见过敏特；玩家可选择进一步确认、追问相识过程、追问目的或收回照片。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 短发与“长头发容易被人抓住”的解释已经在上一轮说完。 | `present-clear` | visible-timeline.jsonl turn-26<br>turn-27/06a-director-prompt.md 最近几轮玩家经历<br>turn-27/06b-narrator-prompt.md 上下文 | 完整原文在最近一轮玩家经历中出现，属于强可见上下文。 |
| 本轮玩家动作是确认她见过敏特，而不是重新询问发型。 | `present-clear` | visible-timeline.jsonl turn-27 playerInput<br>turn-27/06a-director-prompt.md 玩家输入 | 输入只有“确认她见过敏特”，没有要求重述前一轮解释。 |
| 导演需要把“确认她见过”绑定成增量推进，而非复用已消费证据。 | `present-ambiguous` | turn-26/06-llm-calls.json choiceGenerator object<br>turn-27/06-llm-calls.json director object | turn-26 选项/actionId 为 `choice:confirm_met`，但没有编码“只新增明确承认、不要复述短发答案”的约束。 |
| 不要重复已发生情节的通用规则存在。 | `present-clear` | turn-27/06a-director-prompt.md system<br>turn-27/06b-narrator-prompt.md user | 规则是通用原则，未转化为本轮已消费对白的硬性 guard。 |
| 对话帧必须包含可见引号。 | `present-clear` | turn-27/06b-narrator-prompt.md v3-html 输出协议 | 协议写明 `<p data-speaker=...>"台词"</p>`，但 Narrator 输出省略了引号。 |

- competingPressures:
  - 玩家选项“确认她见过敏特”语义偏抽象，容易让 Director 用上一轮的证据来“证明确认”。
  - 最近上下文中上一轮短发对白非常近、非常完整，且与“她见过敏特”的推论直接相关。
  - 当前故事线/历史摘要把上一轮写成“暗示她们见过面”，使本轮需要“确认”的增量目标存在但边界不清。
  - Narrator 被要求遵循 Director 的 beats，而 Director 已把“说明敏特短发的原因”列入本轮 beats。

## Causal Chain
- firstDivergenceArtifact: turn-27/06-llm-calls.json call[0].object（Director plotPoint）
- triggeringPressure: Director 面对 `choice:confirm_met`/“确认她见过敏特”时，把上一轮已经说过的短发解释当成本轮确认的组成部分，输出 beats: “卡琳娜承认见过敏特”“说明敏特短发的原因”。
- missingGuard: 选项/actionId 与 Director handoff 没有把核心动作绑定为“增量确认：只承认见过与时间地点，不复述已消费的发型回答”；通用“不要重复”规则没有转成针对上一轮对白的可执行排除项。
- mechanismStatement: 抽象确认类选项缺少增量语义绑定，Director 在近因上下文压力下复用了上一轮已消费的短发证据，Narrator 再按该 handoff 重演对白，并叠加本地 v3-html 引号格式 slip，最终形成玩家可见重复演出。
- directCause: Director 的本轮剧情安排错误包含“说明敏特短发的原因”；Narrator 忠实展开后把上一轮回答开头重新写了一遍。
- propagation: Narrator 在 turn-27/06-llm-calls.json call[1].text 中生成重复段落；turn-27/04-output.json 将其写入 `turnContent`；choices 又基于重复后的“我见过她”继续追问。
- nonCauses:
  - 不是长期记忆遗忘：上一轮内容在 recent turns 中清晰可见。
  - 不是角色设定缺失：卡琳娜是否见过敏特的边界在上下文中可推断。
  - 对话引号退化是同轮 Narrator 格式 slip，不是重复问题的主因。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `recent-context`, `llm-self`
- description: 触发压力是“确认她见过敏特”这种抽象选项与近因中完整的短发回答；缺失防线是选项/actionId 和 Director prompt 没有把“确认”约束为新增承认、并排除已消费对白；失败运动是 Director 将已消费证据重新列为本轮 beat，Narrator 复述并发生引号格式 slip。
- fixSurface:
  - choice/action schema：为确认类选项保存 `mustAdvanceFrom`、`alreadySatisfiedFacts`、`doNotRestate`。
  - Director prompt assembly：把上一轮已完成对白转成 hard negative constraints，而不是只放在 long recent context。
  - Narrator/v3-html validator：检查 data-speaker 帧是否保留可见引号或由渲染层统一处理对白标点。

## Evidence
- playerVisible: turn-26 已完成短发解释；turn-27 玩家只选择“确认她见过敏特”，但正文开头再次出现“不是”“我知道她的时候——她已经是短发了”“她说长头发容易被人抓住”。
- internalTrace: turn-27 Director object 的 summary 为“卡琳娜确认她见过敏特，并回忆起敏特短发的原因”，beats 包含“说明敏特短发的原因”；turn-27 Narrator prompt 明确要求对白帧带引号，但输出的 data-speaker 帧没有可见引号。

## Recommended Fix Area
优先修复 Choice→Director 的 action binding 与 consumed-content guard；同时给 Narrator 输出加 v3-html 对话标点校验。

## Confidence
high
