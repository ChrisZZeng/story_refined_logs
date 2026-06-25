# Root Cause Report - issue-64 turn 147
## Problem
turn 146 选项突然引入未建立的‘相机包里的钱包’，turn 147 玩家承接该选项后，正文把相机包固定在椅子扶手边，并把原本在防水袋里的备用胶卷写进相机包。
## Validity
- issueValidity: `valid`
- verdictReason: 玩家输入来自上一轮系统选项，因此不是玩家无端发明物品；系统先提供了未铺垫的相机包/钱包，再在正文中把它实体化并转移备用胶卷归属。此前玩家可见装备一直是胸前相机、肩侧防水袋、内袋铃铛。
- playerVisibleSupport: turn 128 写备用胶卷在斜挎防水袋最底下，五卷且用密封袋包着；turn 133 再写肩侧防水袋里那五卷备用胶卷。turn 146 choices 出现‘把相机包里的钱包拿出来，清点现金’；turn 147 visibleText 写椅子扶手边有相机包，里面有备用胶卷、镜头布、铅笔头和钱包。
- caveats:
  - 如果把‘相机包’解释为防水袋的别称，仍无法解释它被固定在椅子扶手边且里面新增钱包、镜头布、铅笔头，并把备用胶卷从肩侧防水袋改入包内。

## Context Assessment
主角坐在椅子上等待，胸前/外套内侧有相机；此前备用胶卷稳定在肩侧防水袋中，银色铃铛在内袋。玩家在 turn 147 选择的是系统上一轮给出的相机包/钱包选项。

### Relevant Facts
- `present-buried` 备用胶卷归属为肩侧防水袋，而非相机包。
  - artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl turn 128`, `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl turn 133`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-147/03-story-state.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-147/06b-narrator-prompt.md`
  - notes: 玩家可见层 present-clear；在 turn 147 内部 prompt 只以 currentStoryline 长摘要中的‘防水袋封口/胶卷准备’出现，低于当前玩家输入的显著度。
- `absent` 相机包、钱包、椅子扶手边的包此前未被建立。
  - artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-146/06c-choice-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-146/04-output.json choices`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-147/01-summary.json`
  - notes: turn 146 Choice prompt 在生成前没有 `相机包` 或 `钱包`；它们首先出现在 turn 146 choices，并通过 `selectedFromPreviousTurn` 进入 turn 147 playerInput。
- `present-clear` 玩家输入承接的是系统选项，后续 worker 应保留核心动作但校验未铺垫实体。
  - artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-147/01-summary.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-147/06a-director-prompt.md`
  - notes: `selectedFromPreviousTurn` 与 `playerInput` 均为‘把相机包里的钱包拿出来，清点现金’，Director 直接将其概括为翻找相机包。

### Competing Pressures
- Choice worker 需要给等待场景生成日常可做的物资检查选项。
- 当前玩家输入来自系统选项，Director/Narrator 倾向把它当作必须满足的事实。
- turn 147 Narrator prompt 中当前输入和 Director beats 比防水袋归属更靠近生成末端、更强势。
- 没有结构化 inventory/affordance 校验来标记‘相机包/钱包’是未建立新物件。

## Causal Chain
- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-146/06-llm-calls.json call[2] / logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-146/04-output.json choices
- triggeringPressure: turn 146 Choice 在相机高显著场景下生成普通后续动作，为了提供物资/等待相关选择，模型推断出‘相机包里的钱包’这一未铺垫实体。
- missingGuard: Choice 没有基于已建立 inventory 生成选项；选项被选中后，Director/Narrator handoff 也没有‘unsupported object reconciliation’机制来改写为已知防水袋、钱包在口袋中，或提示该物品未建立。
- mechanismStatement: 当 Choice 可以把未建立物件写进玩家可见选项，且被选中的选项在下一轮被视为硬玩家输入时，choice-action-binding 会把无根据的物件推断升级为场景事实，Narrator 再为兑现它补造位置和内容，导致相机包实体化并覆盖原有防水袋归属。
- directCause: turn 146 Choice 首次引入‘相机包里的钱包’；turn 147 Director 将其摘要为‘主角翻找相机包’，Narrator 写出椅子扶手边相机包及其内部物品。
- propagation: turn 147 visibleText 固化相机包、钱包和备用胶卷归属；turn 148 又让玩家整理相机包并写备用胶卷轮廓在包内，进一步延续错误。
- nonCauses:
  - 不是玩家主动凭空输入物品；该输入来自 turn 146 系统选项。
  - 不是单纯同义词替换；防水袋此前在肩侧，turn 147 的相机包在椅子扶手边且内容不同。
  - Director/Narrator 是传播和固化点，但第一偏离在上一轮 Choice。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `detail-memory`
- description: Choice 缺少 grounded inventory/affordance 合同，允许未建立的相机包和钱包进入可选动作；选择后该文本被当作玩家事实强绑定，后续 Director/Narrator 没有校验或桥接，反而补造位置和内容并覆盖已建立的防水袋胶卷归属。
- fixSurface:
  - `Choice generation grounded inventory filter`
  - `selected choice to playerInput handoff validator`
  - `Director/Narrator unsupported-object reconciliation prompt`

## Evidence
- playerVisible: turn 128/133 稳定显示防水袋与五卷备用胶卷；turn 146 系统选项首次出现相机包/钱包；turn 147 正文把相机包实体化并写入备用胶卷。
- internalTrace: `turn-146/06c-choice-prompt.md` 生成前没有 `相机包`/`钱包`；`turn-146/06-llm-calls.json` call[2] 首次输出相机包选项；`turn-147/01-summary.json` 显示该选项作为 `selectedFromPreviousTurn` 进入，`turn-147/06a-director-prompt.md` 和 `06b-narrator-prompt.md` 随后固化它。

## Recommended Fix Area
为 Choice 增加 inventory-grounded action 生成与选中选项校验：未建立物件只能通过明确发现/取出/回忆来桥接，不能直接作为已存在容器。

## Confidence
`high`
