# Root Cause Report

## Problem
评测认为主角坐到壁炉边矮凳时，没有交代此前在矮凳上的卡尔去了哪里。

## Validity
- issueValidity: `questionable`
- verdictReason: 该 issue 有可疑风险，但证据不足以判定为真实不一致。turn 101-110 的确多次把卡尔放在壁炉旁矮凳上；然而 turn 111-118 经过了长时间的装备检查、闭目等待、天色变化和天亮，文本不再聚焦卡尔，且猫在长时间间隔中离开或换位置是合理读法。
- playerVisibleSupport: 支持评测的一面：turn 110 仍写“壁炉旁矮凳上蜷着的卡尔”，turn 119 写主角“在壁炉边的矮凳上坐下”。削弱评测的一面：turn 111-118 没有说明卡尔仍在矮凳上，且时间从深夜推进到天亮。
- caveats: 如果故事要求所有主要角色的离场都必须显式可见，这会是有效问题；但以普通叙事阅读，长时间未出镜的猫可以合理移动。；不能用内部“卡尔本轮不出场”约束来倒推玩家可见错误。

## Context Assessment
玩家最后明确看到卡尔在矮凳上是在 turn 110；之后 111-118 的可见文本主要跟随主角装备检查和等待天亮，没有明确说明卡尔仍在场、仍占据矮凳或已经离开。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 卡尔曾在壁炉旁矮凳上。 | `present-clear` | `visible-timeline.jsonl`<br>`turn-101/04-output.json`<br>`turn-110/04-output.json` | 这是评测提出风险的主要可见依据。 |
| 从 turn 111 到 turn 118 经历了较长等待和时间推进，卡尔没有再次被确认仍在矮凳。 | `present-ambiguous` | `visible-timeline.jsonl`<br>`turn-111/04-output.json`<br>`turn-118/04-output.json` | 沉默既可读作遗漏，也可读作不在镜头内/已离开；玩家可见证据无法唯一确定。 |
| turn 119 内部 Director 要求卡琳娜和卡尔本轮不出场。 | `not-needed` | `turn-119/04-output.json`<br>`turn-119/06-llm-calls.json` | 该隐藏约束只能解释系统为何没写卡尔，不能用于证明玩家可见不一致成立。 |

- competingPressures: 早先稳定的卡尔-矮凳构图；长时间经过和镜头焦点转向主角装备/窗边；猫可以合理离开或换位置；turn 119 玩家输入明确要求坐到壁炉边等待

## Causal Chain
- `firstDivergenceArtifact`: evaluator / issue-49；若按有效问题追踪，可能的风险点是 turn-119/06-llm-calls.json call[1] 未显式处理卡尔位置
- `triggeringPressure`: 评测把较早的卡尔位置当作仍然强约束；turn 119 叙述则按玩家输入直接移动到壁炉边坐下。
- `missingGuard`: 从玩家可见证据看，缺少的是显式离场/让座过渡；但由于存在长时间间隔，这个 guard 是否必要并不确定。
- `mechanismStatement`: 证据不足：旧的角色位置事实和长时间未出镜之间存在合理解释空间，不能仅因没有可见离场就判定 turn 119 坐下必然冲突。
- `directCause`: 评测对‘未显式移动’采取了严格延续假设，而该假设在多轮时间跳跃和猫角色上不够稳固。
- `propagation`: 无确定系统错误可追；turn 119 后续继续把主角坐在壁炉边作为当前状态。
- `nonCauses`: 不能把内部 stateView 或 hidden prompt 当作玩家可见冲突证据。；不能仅凭‘卡尔本轮不出场’说明卡尔仍占矮凳。

## Root Cause
不适用：issueValidity=`questionable`，玩家可见证据不足以支撑对系统 rootCause 的确定归因。

## Evidence
- `playerVisible`: turn 110 的“壁炉旁矮凳上蜷着的卡尔”与 turn 119 的“在壁炉边的矮凳上坐下”之间相隔多轮等待和天色变化；没有近端文本确认卡尔仍占据矮凳。
- `internalTrace`: turn-119/04-output.json 的 Director/Narrator 确实没有处理卡尔；但这是在 validity 尚不足的情况下的内部风险，而非可直接定罪的根因。

## Recommended Fix Area
评测侧建议降低长时间 offscreen character-location 冲突的确定性；系统侧可选增强 current-scene character-position tracking，并在重要角色让出道具/座位时补一笔过渡。

## Confidence
`medium`
