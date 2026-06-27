# issue-69-turn-159 Root Cause Report

## Problem
第159轮玩家站在卡尔小屋门口/石阶前活动身体后，正文突然写“你低头看了一眼相机包。一切都在原位”，使相机包在没有可见搬移动作的情况下出现在门外可见位置。

## Validity
- issueValidity: `valid`
- 判定理由：该 issue 有效。玩家可见文本中，相机包此前被放在屋内椅子扶手附近；玩家随后开门、坐到石阶上、抽烟，正文没有让玩家拿起或带出相机包。第158轮还把“从相机包里拿出烟”的选项执行成“从外套内袋里摸出烟盒”，没有建立相机包在室外。因此第159轮低头看到相机包属于无支撑位置跳跃。
- 玩家可见证据：turn-153 写“指尖落在相机包的拉链头上”，并把它定位为由椅子扶手和包面固定出的习惯姿势；turn-155 到 turn-157 玩家在门口和石阶上等待；turn-158 visibleText 写“你从外套内袋里摸出烟盒”；turn-159 visibleText 写“你低头看了一眼相机包。一切都在原位”。
- 注意事项：
- turn-157 的可见选项和 turn-158 的 playerInput 曾写“从相机包里拿出烟”，但 turn-158 正文实际改写为从外套内袋取烟；因此该选项文本不能单独算作已完成的搬包动作。

## Context Assessment
实际问题前状态：问题发生前，玩家可见状态是：主角已在屋外石阶/门口等待并抽烟，烟盒来自外套内袋；相机包最后清楚定位在屋内椅子扶手附近，且没有被带到门外的可见动作。

相关事实与可用性：
- `present-buried` 相机包在屋内椅子扶手附近，主角手指曾落在拉链头上。 证据：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-159/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`。turn-159 的 recentTurns 仍包含 turn-153 正文，但该事实埋在长篇近期正文中，没有以 objectLocation/currentScene anchor 形式出现。
- `present-clear` 主角从屋内移动到门口和石阶上，没有拿起相机包。 证据：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-159/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`。turn-155 到 turn-158 的近期正文连续描写门口、石阶、抽烟动作；没有搬包动作。
- `contradicted` turn-158 的选项/玩家输入声称从相机包拿烟，但正文改成从外套内袋拿烟。 证据：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-158/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/summary.json`。selectedFromPreviousTurn 保存了不可靠的选项文本；visibleText 才是已发生事实。后续 prompt 未显式标记这两者的冲突。
- `absent` 本轮 Director 只要求掐灭烟、站起活动，没有要求确认相机包。 证据：`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-159/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-159/06a-director-prompt.md`。plotPoint beats 为“掐灭烟头”“晨光继续推移”，没有物件位置桥接。

竞争压力：
- turn-157 choice output 给了一个不可达物件动作
- inputStrategy=choice 使该选项文本变成下一轮 playerInput
- recentTurns 长正文中 playerInput 与 visibleText 并列呈现但没有优先级标记
- 慢铺等待场景需要继续提供可操作选项，容易把装备拉回前景

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-157/04-output.json choices.options[2]`
- triggeringPressure: Choice worker 在主角坐在门外石阶上、相机包仍应在屋内的场景下，生成了“从相机包里拿出烟点上，让呼吸更稳一些”。该不可达动作随后作为 turn-158 playerInput 进入 recentTurns。
- missingGuard: 缺少 choice-action-binding 的场景可达性校验，也缺少“当 Narrator 改写了不可达选项来源时，后续 prompt 不得再把原始选项文本当事实”的冲突标记。
- mechanismStatement: 不可达的 choice text 把“相机包可在门外触及”作为隐含前提写入后续上下文，而系统没有用玩家可见正文优先覆盖该前提，Narrator 在 turn-159 将这个未被证实的前提落实成“低头看到相机包”。
- directCause: turn-159 Narrator 采纳了“相机包在当前场景可见/可触及”的隐含前提，在活动身体后追加“你低头看了一眼相机包”。
- propagation: turn-159 visibleText 固化了相机包出现在门口的错误；同轮 choices 又提供“拿起相机包”，turn-160 检查装备时继续围绕相机包展开。
- nonCauses:
- 不是隐藏设定或固定剧本要求；Director 本轮没有要求相机包出现在门外。
- 不是长期记忆缺失的主因；相关室内位置和门外移动都还在近期正文中，只是没有被选项和叙述阶段强制遵守。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 触发压力是 Choice worker 把不可达物件“相机包”写进可选行动，并由 inputStrategy=choice 转成下一轮 playerInput；缺失防线是选项可达性校验、selected choice 与实际 visibleText 的冲突标记，以及 Narrator 对玩家可见正文优先级的强约束；失败运动是后续 Narrator 将选项里的隐含物件位置误当成当前场景事实，生成相机包在门外的可见跳跃。
- fixSurface:
- `Choice generator 的 current-scene affordance/object reachability check`
- `selected choice -> playerIntent normalization 中的 source-of-truth 标记`
- `Narrator prompt 中 playerInput 与 visibleText 冲突时的优先级规则`
- `轻量 objectLocation state，用于常用道具的当前可达性`

## Evidence
- playerVisible: turn-153：相机包在椅子扶手附近；turn-155/156：主角到门口并坐石阶；turn-158：正文从外套内袋拿烟；turn-159：门口低头看到相机包。
- internalTrace: turn-157/04-output.json 的 choice 生成了“从相机包里拿出烟”；run summary turn-158 selectedFromPreviousTurn 保存该文本；turn-159 Director plotPoint 没有包相关 beat；turn-159 Narrator 输出把包写入 visibleText。
- tracePacket: `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-021/issues/issue-69-turn-159/trace-packet.json`

## Recommended Fix Area
优先修复 Choice 选项生成与 selected-action handoff：选项必须通过当前场景可达性校验；当叙述阶段改写选项中的物件来源时，应把原选项标记为不可靠来源，后续只以 visibleText 为已发生事实。

## Confidence
`high`
