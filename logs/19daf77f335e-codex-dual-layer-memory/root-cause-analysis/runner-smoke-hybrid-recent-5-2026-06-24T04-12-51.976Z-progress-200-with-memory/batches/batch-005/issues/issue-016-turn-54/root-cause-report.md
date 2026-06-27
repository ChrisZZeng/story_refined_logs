# Root Cause Report: issue-16 turn 54

## Problem
- issueIndex: `16`
- severity: `medium`
- type: `unsupported-jump`
- scope: `visibleText`
- problemSummary: turn 54 让黑猫在没有任何跟随、绕路或提前到达交代的情况下出现在另一处室内沙发扶手上，违背 turn 51 明确可见的“黑猫没有跟来，留在铁门边”。

## Validity
- issueValidity: `valid`
- verdictReason: valid。玩家可见文本在 turn 51 明确写黑猫没有跟来，并在铁门边看着主角和卡琳娜离开；turn 52-53 没有任何黑猫移动或提前到达的承接；turn 54 直接写它“不知什么时候已经蹲坐在沙发扶手上”，属于未铺垫的位置跳跃。
- playerVisibleSupport: visible-timeline.jsonl turn 51：黑猫没有跟来、在铁门边蹲坐、没有动；turn 53：前往铁门途中只写主角和卡琳娜；turn 54：黑猫突然已在沙发扶手上。
- caveats:
- 内部设定中黑猫可能对应 `卡尔`，但这种可能性没有在玩家可见层面为瞬移或提前到达提供解释，因此不能用于否定可见问题。
- “不知什么时候”只是叙述遮蔽，不是位置变化的因果桥。

## Context Assessment
- actualStateBeforeIssue: 在玩家可见连续性中，黑猫最后明确位置是 turn 51 的上一扇铁门边。主角和卡琳娜随后在公园对话，并于 turn 53 前往所谓另一处铁门，途中没有黑猫。进入 turn 54 前，除非正文补写黑猫跟随、另有通道或由卡琳娜安排，否则黑猫不应直接出现在室内沙发扶手上。
- relevantFacts:
- `present-clear` 黑猫没有跟来，停在上一扇铁门边。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-51/04-output.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/06a-director-prompt.md`
  notes: turn 54 prompt 最近几轮仍包含这句可见事实，但它没有成为 Director 的硬约束。
- `absent` turn 52-53 没有交代黑猫移动、跟随或提前到达。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-52/04-output.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-53/04-output.json`
  notes: 两轮可见正文的移动主体只有主角与卡琳娜，未出现黑猫位置迁移。
- `over-constraining` 地点模板把黑猫描述为 `卡琳娜的家（真正的家）` 的常驻元素。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/06a-director-prompt.md`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/06b-narrator-prompt.md`
  notes: 地点记忆写明该空间有“一只琥珀眼的黑猫常驻于此”，与最近可见的铁门边位置冲突时没有优先级规则。
- `over-constraining` Director 将黑猫作为本轮必写室内陈设的一部分。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/04-output.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/07-events.json`
  notes: plotPoint beats/requiredContent 包含 `黑猫在暖光边缘` 和 `描写室内陈设...黑猫`，Narrator 被要求自然融入。
- `absent` 运行态没有可执行的黑猫 location state。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-51/05-runtime-after.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/02-script-state.json`
  notes: turn 51 之后 runtime `charactersOnStage` 不含黑猫，`entityStates` 没有黑猫/卡尔位置，不能向 Director 提供强约束。
- competingPressures:
- 黑猫/卡尔是卡琳娜私人空间的重要氛围元素，地点记忆把它常驻化。
- turn 54 复用 `卡琳娜的家（真正的家）` 房间模板，模板自带黑猫。
- 最近可见事实明确黑猫留在上一门边，但只是长上下文中的 prose，不是硬状态字段。
- Narrator 被上一步 Director 的 requiredContent 约束必须写出黑猫。

## Causal Chain
- firstDivergenceArtifact: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/07-events.json director worker-done；同样内容落在 /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-54/04-output.json 的 plotPoint beats/requiredContent。`
- triggeringPressure: turn 54 prompt 中 `卡琳娜的家（真正的家）` 地点模板和前一轮重复入室链路把黑猫当作室内常驻氛围物件；Director 因此把黑猫列入 requiredContent，而没有处理 turn 51 的最近可见位置。
- missingGuard: 缺少 movable entity continuity guard：没有 `blackCat.location=上一扇铁门边` 的结构化状态，也没有 prompt 规则要求最近可见位置必须覆盖地点默认模板；Director/Narrator 也没有被要求在移动实体跨场景出现时写出桥接动作。
- mechanismStatement: 地点模板中的“黑猫常驻于此”与最近可见的“黑猫没有跟来”发生冲突时，prompt/Director 没有明确优先 recent visible entity position，反而把模板元素变成 requiredContent；Narrator 为满足 requiredContent 用“不知什么时候”把黑猫放进新室内，形成无承接的位置跳跃。
- directCause: turn 54 Director 将黑猫纳入“室内陈设/暖光边缘”的必写内容；Narrator 随后输出“那只黑猫不知什么时候已经蹲坐在沙发扶手上”。
- propagation: 错误在 turn 54 可见正文中出现，并被 turn 55/56 继续承认为沙发扶手上的黑猫，后续场景位置也随之被固化。
- nonCauses:
- 不能用隐藏的 `卡尔` 设定解释玩家可见位置跳跃。
- 不是 Choice 生成的问题；Choice 只是接收已出现的室内状态。
- 不是单纯 memory absence：turn 54 prompt 里有 turn 51 `黑猫没有跟来`，但该事实没有优先权。

## Root Cause
- label: `context-priority`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 可移动实体的位置事实只以最近正文 prose 形式存在，而地点/角色记忆把黑猫作为房间默认元素呈现；prompt 和 Director 缺少优先级与桥接要求，导致较旧/模板化的地点描述压过最近可见位置。缺失的防线是：最近明确位置必须覆盖 location template，并且跨场景出现必须有可见移动承接。
- fixSurface: `prompt assembly priority rules：recent visible entity position > location default/template > character flavor`, `entity/location state writeback：为黑猫/卡尔等可移动实体记录 `lastVisibleLocation` 和 `lastVisibleTurn``, `Director validator：当 requiredContent 会改变实体位置时，强制加入 bridge 或拒绝该 requiredContent`, `Narrator contract：禁止用 `不知什么时候` 代替实体跨场景移动承接`

## Evidence
- playerVisible: turn 51 黑猫明确留在铁门边且没有动；turn 53 没有黑猫；turn 54 黑猫突然在室内沙发扶手上。
- internalTrace: turn 54 prompt 同时含最近可见事实和地点模板；turn 54 Director `requiredContent` 要求写黑猫；turn 54 Narrator 按 requiredContent 输出 `不知什么时候已经蹲坐在沙发扶手上`。runtime/entity state 没有黑猫位置字段可约束该决策。

## Recommended Fix Area
优先修复 prompt 上下文优先级和可移动实体位置写回；对 Director requiredContent 增加位置连续性校验。

## Confidence
`high`
