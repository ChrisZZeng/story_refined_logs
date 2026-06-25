# issue-5-turn-8 root cause report

## Problem
卡琳娜在第 6 轮刚对玩家说敏特没有来找她、她也没有主动打听；第 8 轮又说自己告诉过敏特一部分骷髅会情报，改变了两人是否有过实质接触这一线索。

## Validity
- issueValidity: `valid`
- verdictReason: 该问题成立。第 6 轮的玩家可见文本把卡琳娜与敏特的关系限定为见过、听说过、但没有来找和主动打听；第 8 轮改为卡琳娜曾直接向敏特提供情报。两者不是措辞差异，而是接触事实变化。
- playerVisibleSupport: turn-06 visibleText: 卡琳娜说敏特在新西西里活动过、她在几个地方见过敏特，并补充“但她没来找过我，我也没主动打听过她的事”。turn-08 visibleText: 卡琳娜说敏特在找骷髅会相关记录和名单，随后说“我告诉过她我知道的部分。之后她就消失了”。
- caveats:
  - 第 6 轮曾用视线错开暗示卡琳娜有所保留，因此她可能隐瞒细节；但第 8 轮不是承认隐瞒，而是直接改写为曾经向敏特提供情报，仍构成可见事实冲突。

## Context Assessment
- actualStateBeforeIssue: 第 8 轮前，玩家已经在卡琳娜公寓内完成初步交易：卡琳娜承认见过敏特、知道敏特在新西西里活动，但玩家可见事实仍是敏特没有找过卡琳娜，卡琳娜也没有主动打听。玩家选择说明敏特是同伴，用个人来意换取更多线索。
- relevantFacts:
  - claim: 玩家可见的最新接触事实是：敏特没有来找卡琳娜，卡琳娜也没有主动打听敏特。
    availability: `present-clear`
    artifacts: `turn-08/06a-director-prompt.md`, `turn-08/06b-narrator-prompt.md`, `visible-timeline.jsonl`
    notes: 该事实以第 6 轮完整正文进入 recentTurns，位置在最近几轮文本中，足以被本轮继续约束。
  - claim: 角色卡隐藏设定写着敏特来找过卡琳娜寻求骷髅会情报，卡琳娜告诉了她知道的部分。
    availability: `contradicted`
    artifacts: `turn-08/06a-director-prompt.md`, `turn-08/06b-narrator-prompt.md`
    notes: 该隐藏资料与最近玩家可见文本冲突，且在角色卡中靠前出现，对 Narrator 有强局部压力。
  - claim: 本轮允许卡琳娜透露敏特在寻找与骷髅会相关的线索，但不得说明具体细节或自己与敏特的关系。
    availability: `present-ambiguous`
    artifacts: `turn-08/06-llm-calls.json`, `turn-08/06b-narrator-prompt.md`
    notes: Director 的约束没有显式禁止把隐藏的接触关系写成可见事实，只说不要说明具体关系。
- competingPressures: 隐藏角色卡中的卡琳娜-敏特接触设定；本轮要给玩家一部分骷髅会线索的剧情压力；最近可见文本里的否认接触；保持悬疑而有所保留的角色表演

## Causal Chain
- firstDivergenceArtifact: turn-08/06-llm-calls.json call[1] / turn-08/04-output.json 的 Narrator 正文输出
- triggeringPressure: Narrator prompt 同时包含第 6 轮可见否认和角色卡“敏特来找过卡琳娜、卡琳娜告诉了她知道的部分”的隐藏资料；Director 只要求“透露一部分敏特在寻找的情报”，没有把第 6 轮否认接触作为硬约束交给正文。
- missingGuard: 缺少冲突优先级守卫：当隐藏角色卡与最近玩家可见事实冲突时，Narrator 必须优先保持可见文本，并把隐藏事实延后、桥接或改写为不矛盾的说法。
- mechanismStatement: 隐藏角色卡中更具体的“来找过/告诉过”关系事实在提示中与最近可见否认并存，而 Director handoff 没有显式锁住“不得改写接触事实”，Narrator 为满足透露骷髅会线索的压力直接采用隐藏事实，导致玩家看到卡琳娜前后改口。
- directCause: Narrator 将隐藏设定“卡琳娜告诉敏特情报”落成台词，而没有与第 6 轮“没来找过我、我也没主动打听”做可见一致性调和。
- propagation: 错误进入 turn-08/04-output.json 和 visible-timeline.jsonl；后续 turn-09/turn-10 的 recentTurns 继续把该冲突事实带入上下文。
- nonCauses:
  - 不是长期记忆缺失：冲突双方都在 turn-08 prompt 内出现。
  - 不是单纯评测误判：玩家可见文本已经足以确认冲突。
  - 不是必须提前揭示的剧情秘密；可以只说她听说过骷髅会方向而不承认曾向敏特提供情报。

## Root Cause
- label: `context-priority`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 当隐藏角色卡与最近玩家可见文本冲突时，提示只给了泛化的“保持一致、优先最近正文”原则，却没有把具体冲突转成可执行约束；在“本轮要透露骷髅会线索”的压力下，Narrator 采用了更具体但较低优先级的隐藏资料。
- fixSurface:
  - prompt context assembler: detect hidden/public fact conflicts and foreground public-state override
  - Director schema: add explicit resolvedFacts/conflictResolution field
  - Narrator prompt: add hard constraint that recent visible denial cannot be contradicted without in-world acknowledgement

## Evidence
- playerVisible: turn-06 visibleText 与 turn-08 visibleText 直接冲突：前者否认来找和主动打听，后者承认曾向敏特提供情报。
- internalTrace: turn-08/06b-narrator-prompt.md 同时包含角色卡“敏特来找过卡琳娜”“卡琳娜只告诉了她自己知道的部分”和 recentTurns 中第 6 轮的否认；turn-08/06-llm-calls.json call[1] 首次输出“我告诉过她我知道的部分”。

## Recommended Fix Area
优先修复 context assembly 与 Director/Narrator handoff 的冲突优先级，把最近玩家可见事实提升为硬约束，并在角色卡冲突时要求桥接或不采用隐藏事实。

## Confidence
`high`
