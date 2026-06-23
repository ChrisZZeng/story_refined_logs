# issue-12-turn-38 Root Cause Report

## Problem

issueIndex=12，turn=38，type=`space-time-break`，scope=`visibleText`。第 37 轮刚把晨光光斑定位为从墙根滑到旧茶几桌腿边缘，第 38 轮却写成“窗台上那道即将爬过桌腿的光斑”，把窗台、地板/墙根和茶几桌腿的空间关系混在一起。

## Validity

issueValidity: `valid`

该问题可以只用玩家可见文本确认。第 37 轮写“那枚菱形光斑已经从墙根滑到了旧茶几的桌腿边缘”，并另写“窗台上空荡荡的”。第 38 轮开头则说“窗台上那道即将爬过桌腿的光斑”。同一道光斑同时被放在窗台上又要爬过桌腿，局部空间关系不成立。

严重度低，因为读者仍能理解作者想表达“光斑缓慢移动”的意象；但作为连续空间描写，它确实发生了可见漂移。

## Context Assessment

第 38 轮发生前，玩家和卡琳娜仍在清晨客厅，坐在沙发/茶几附近喝茶并谈昨晚巷子里的动静。光线作为节奏标记连续出现：第 35 轮在地板形成菱形光斑，第 37 轮移动到旧茶几桌腿边缘。

relevantFacts:

- claim: 光斑上一轮位于墙根到旧茶几桌腿边缘，不在窗台上。
  availability: `present-clear`
  artifacts: `visible-timeline.jsonl`, `turn-38/06b-narrator-prompt.md`
  notes: 第 37 轮正文被完整放入 turn-38 Narrator prompt 的最近几轮经历。
- claim: 第 38 轮 Director 没有要求改变光斑空间位置。
  availability: `not-needed`
  artifacts: `turn-38/04-output.json`, `turn-38/07-events.json`
  notes: Director 只安排卡琳娜模糊回应，没有涉及光斑位置。
- claim: Narrator prompt 中有通用一致性规则，但没有结构化 scene geometry。
  availability: `present-ambiguous`
  artifacts: `turn-38/06b-narrator-prompt.md`
  notes: prompt 要求优先相信最近正文，但光斑位置只埋在多轮长文本里，没有被抽成当前场景锚点。

competingPressures:

- 清晨光线、窗台、灰尘、鸽子和桌腿都在近几轮反复出现，词簇高度相邻。
- 当前对话需要慢铺和环境隐喻，Narrator 倾向继续使用光斑意象。
- 缺少“当前场景微空间状态”的短锚点，使模型需要从长 prose 中即时重建几何关系。

## Causal Chain

firstDivergenceArtifact: `turn-38/07-events.json` 中 `worker-done` / `narrator` 输出，以及 `turn-38/04-output.json` `narrative`。

triggeringPressure: 最近上下文反复并列“窗台”“灰尘旋”“光斑”“桌腿”等视觉意象，Narrator 为了延续慢铺隐喻，把这些局部元素合成为一句“窗台上那道即将爬过桌腿的光斑”。

missingGuard: 系统没有从最近可见正文中维护当前场景微空间锚点，例如 `lightSpot.location = floor/wall-root near coffee-table leg`。通用一致性规则无法强制模型在写环境隐喻时保持几何关系。

mechanismStatement: 当当前场景的微空间事实只以自然语言埋在最近几轮中，而本轮又要求继续用环境意象慢铺时，Narrator 会把相邻视觉词簇合成新的空间句；缺少 current-scene spatial anchor 使“窗台”和“桌腿边缘”被错误合并为同一光斑位置。

directCause: Narrator 本地生成时把光斑位置从地板/墙根附近漂移到窗台。

propagation: 错误只在第 38 轮正文中出现，未被 Choice 放大。后续仍继续使用窗台/灰尘意象，说明该微空间状态没有被系统性修正。

nonCauses:

- 不是 Director 直接要求的错误；Director 输出没有空间安排。
- 不是玩家输入导致；玩家只追问卡琳娜是否知道昨晚巷子里的人是谁。
- 不是长期记忆问题；需要的事实就在上一轮可见上下文里。

## Root Cause

rootCause.label: `current-scene-anchor-gap`

family: `recent-context`

secondaryFamilies: [`agent-system`]

L3 root mechanism 是当前场景微空间锚点缺失。系统把最近正文整体交给 Narrator，并用通用一致性规则提示“保持一致”，但没有为会连续移动的局部环境对象维护短状态。光斑这类节奏性环境细节不是剧情主状态，容易被模型当作可自由重组的意象，最终把窗台、灰尘、桌腿的关系合错。

这不是单纯的 `Narrator` 组件名问题，也不是 `recent-context` 这个粗分类本身；具体机制是“最近上下文中的空间对象没有被抽取成可执行的 current-scene anchor，导致慢铺环境描写时相邻意象被错误融合”。

## Evidence

playerVisible:

- `visible-timeline.jsonl` turn 37: “那枚菱形光斑已经从墙根滑到了旧茶几的桌腿边缘”。
- `visible-timeline.jsonl` turn 38: “窗台上那道即将爬过桌腿的光斑”。

internalTrace:

- `turn-38/06b-narrator-prompt.md`: 最近几轮经历清楚包含第 37 轮正确位置。
- `turn-38/04-output.json`: Director `plotPoint` 只安排追问和模糊回应，没有引入光斑位置变化。
- `turn-38/07-events.json`: first bad text 出现在 `narrator` 输出。

## Recommended Fix Area

优先修复 Narrator context assembly 的当前场景锚点。对近几轮反复出现且具有位置关系的局部对象，可以抽取短表，例如光斑、茶几、窗台、角色位置，并在 prompt 中以更高优先级提供。另一个低成本补丁是在环境描写后做 micro-spatial consistency lint，捕捉“窗台上的光斑爬过桌腿”这类几何不可能句。

## Confidence

confidence: `high`
