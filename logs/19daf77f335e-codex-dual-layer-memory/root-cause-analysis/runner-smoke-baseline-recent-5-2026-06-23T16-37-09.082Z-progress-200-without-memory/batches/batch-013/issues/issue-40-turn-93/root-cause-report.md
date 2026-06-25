# Root Cause Report: issue-40-turn-93

## Problem
- issueIndex: `40`
- turn: `93`
- problemSummary: turn 93 在仓库扫视中写旧书‘翻开且书脊背朝上’，同时让玩家扫到书页文字，造成旧书摆放方向与可读页面之间的物理关系不清。

## Validity
- issueValidity: `valid`
- verdictReason: 该 issue 有效但严重度低。玩家可见文本把旧书描述为翻开、书脊背朝上；按通常摆放理解，这接近书页向下或至少不是平摊可读的状态。随后同一句又让玩家扫到书页并辨认文字体系，缺少翻转、侧看或重新摆正的动作桥接。
- playerVisibleSupport: turn 92 先建立长桌上有一本‘翻开的、书脊朝上的旧书’；turn 93 重复‘翻开的旧书脊背朝上’，并马上写玩家扫到书页上的非英语/意大利语文字。
- caveats: 如果读者把‘书脊朝上’理解成书像帐篷一样支起，页表面可能仍局部可见；但文本没有说明这种支起角度。；该问题主要影响物件空间清晰度，不改变剧情信息。

## Context Assessment
- actualStateBeforeIssue: turn 92 玩家刚进入‘另一边’仓库并环顾，长桌上被描写为有陶杯、油灯和一本翻开的、书脊朝上的旧书；turn 93 玩家选择继续环顾整个仓库，而不是专门操作旧书。
- relevantFacts:
- `present-clear` 旧书的初始可见摆放是‘翻开的、书脊朝上’。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl:turn-92, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/06b-narrator-prompt.md, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/03-story-state.json。这是 turn 92 Narrator 自行加入的装饰性细节，进入 turn 93 最近上下文。
- `present-clear` 玩家本轮只是广泛观察仓库陈设。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/01-summary.json, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/06a-director-prompt.md。输入没有要求拿起、翻转或阅读旧书。
- `present-ambiguous` Director 要求描写旧书作为陈设，但没有要求读取书页文字。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/04-output.json, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/06b-narrator-prompt.md。requiredContent 列出‘长桌、陶杯、旧书、油灯’，没有给旧书 orientation 或 readable-surface contract。
- `over-constraining` 写作一致性要求优先相信最近几轮玩家看到的正文。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/06b-narrator-prompt.md。该规则鼓励保留‘书脊朝上’，但没有附带物理 affordance 检查。
- `absent` 旧书的可读面、朝向和是否可被扫到没有结构化状态。 artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/05-runtime-after.json, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/07-events.json。runtime-after 没有 prop orientation/readableSurface；events 也没有改变摆放的动作。
- competingPressures: 环境慢铺要求细节密度，促使 Narrator 给每件陈设附加视觉信息。；turn 92 的‘书脊朝上’作为最近事实被一致性规则保留。；神秘仓库氛围需要旧书承载未知符号，拉动生成去读取页面。；玩家只是扫视，没有提供操作旧书的动作来修复方向问题。

## Causal Chain
- firstDivergenceArtifact: precursor: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-92/04-output.json Narrator invented ‘翻开的、书脊朝上’; target conflict: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/06-llm-calls.json[1] / logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-93/04-output.json
- triggeringPressure: turn 92 的装饰性 orientation 被最近上下文带入 turn 93；turn 93 又需要详细描写仓库陈设，旧书被选作神秘信息载体。
- missingGuard: 没有 prop affordance contract 检查‘书脊朝上’与‘扫到书页文字’是否兼容，也没有要求在读取前先改写为可读姿态或展示玩家调整旧书。
- mechanismStatement: 当环境描写中的装饰性 prop orientation 被后续细节描写复用时，缺少 object affordance continuity 检查使 Narrator 同时保留‘书脊朝上’和新增‘可见书页文字’，导致玩家无法判断旧书实际如何摆放。
- directCause: Narrator 在 turn 93 没有解决 turn 92 的书脊朝上状态，就添加了可读书页文字。
- propagation: turn 93 的 Choice 输出进一步提供‘走向长桌，看看那本翻开的旧书’，把这个物件变成下一轮交互焦点；turn 94 因此重复并放大同一方向问题。
- nonCauses: 不是评测使用隐藏设定；冲突来自玩家可见的物理描述。；不是旧书文字体系本身的问题；问题是 orientation/readable-surface 关系。；不是 state-writeback 的长期记忆失败；错误源自最近可见文本和 Narrator 的局部物理 affordance 处理。

## Root Cause
- label: `object-affordance-continuity`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 具体机制是陈设物的 orientation 与可交互 affordance 没有跨轮被校验：触发压力来自 turn 92 已写入的‘书脊朝上’和 turn 93 环境细节/神秘旧书描写需求，缺失防线是没有 prop readableSurface/requiredRepair 的约束，失败运动是 Narrator 保留旧朝向同时新增可读页面。
- fixSurface: scene prop state 增加 orientation、accessibleSurface、readableSurface 字段；Narrator 在复用最近 prop 描述前执行 physical-affordance self-check；Director requiredContent 对可读物件要求说明是否需要玩家翻开、扶正、拿起或只远观

## Evidence
- playerVisible: turn 92：长桌有翻开的、书脊朝上的旧书。turn 93：同一本书仍书脊背朝上，但玩家扫到书页上非英语/意大利语的短线条和弧点。
- internalTrace: turn-93/06b-narrator-prompt.md 近处上下文保留 turn 92 的‘书脊朝上’；turn-93/04-output.json 的 plotPoint 只要求描写旧书陈设，Narrator streamText 却加入页面文字；turn-93/05-runtime-after.json 没有 prop orientation 修正。

## Recommended Fix Area
优先增加 prop affordance/orientation 状态和 Narrator 物理可读性自检，避免把装饰性朝向和互动可读面混合。

## Confidence
`medium`
