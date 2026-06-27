# Root Cause Report - issue-62 turn 139
## Problem
屋内光照已经在 turn 122/129 被建立为整间明亮，turn 139 却退回到门缝一线光、朝壁炉慢慢爬、杯中只映一小片天光。
## Validity
- issueValidity: `valid`
- verdictReason: 玩家可见时间线中窗帘已完全拉开且太阳完全升起，没有重新拉上窗帘、遮光或时间倒退；turn 139 的描写把室内照明状态降级成清晨刚入屋的局部光线。
- playerVisibleSupport: turn 122 写‘整个房间亮了起来’；turn 129 写‘太阳已经完全升起来了，整间屋子都亮了起来’。turn 139 写‘晨光已经从门缝里渗进来了一线’、‘光线还在慢慢地向前延伸，朝着壁炉的方向爬去’和‘从窗口落进来的那一小片天光’。
- caveats:
  - 明亮房间中仍可有光束或阴影，但 turn 139 的措辞把光描述成刚开始进入并尚未到达壁炉，和此前全室明亮不兼容。

## Context Assessment
玩家已多轮在清晨等待。窗帘更早被完全拉开，太阳完全升起，屋内已经整体明亮；本轮只是从屋外返回喝水，没有改变光源或窗帘状态。

### Relevant Facts
- `present-buried` 窗帘已经完全拉开，室内已经整体变亮。
  - artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl turn 122`, `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl turn 129`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-139/03-story-state.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-139/06b-narrator-prompt.md`
  - notes: 完整可见事实在 turn 122/129 present-clear；在 turn 139 prompt 中只以 currentStoryline 长摘要里的‘晨光彻底涌入房间’等低显著度短句存在，同时被后续‘晨光渐亮’摘要软化。
- `present-clear` 最近几轮外部街道上的晨光仍在移动、檐影缩短。
  - artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-139/03-story-state.json recentTurns`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-139/06b-narrator-prompt.md`
  - notes: 近期正文反复写街道/石板上的光线爬行，这些高显著度近因被错误迁移到室内照明状态。
- `present-clear` 本轮没有关窗帘、遮光或时间回退。
  - artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-139/01-summary.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-139/06a-director-prompt.md`
  - notes: Director summary 只要求返回屋内喝水并继续等待。

### Competing Pressures
- 最近几轮反复出现‘晨光爬行/檐影缩短’的外部光线意象。
- currentStoryline summary 很长，早先‘整间屋子亮’事实不在 prompt 尾部和本轮导演约束中。
- Director 用‘晨光渐亮’概括本轮，降低了‘已经全亮’的优先级。
- 没有结构化 `curtains=open`、`roomLight=fully_lit` 的当前场景状态。

## Causal Chain
- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-139/06-llm-calls.json call[1] / logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-139/04-output.json
- triggeringPressure: prompt 中高显著度的最近上下文和 Director summary 都在重复‘晨光渐亮/光线移动’，而此前全室明亮事实被埋在长 storyline summary 中。
- missingGuard: 缺少上下文优先级规则：已经建立的单调时间/光照状态应高于局部氛围意象；也缺少当前房间光照锚点。
- mechanismStatement: 当当前场景光照事实被长摘要埋没且与近因‘晨光渐亮’意象竞争时，context-priority 没有把已建立的全室明亮状态设为高优先级，Narrator 便把外部光线爬行模板重新套回室内，造成光照倒退。
- directCause: Narrator 将房间写成只有门缝和窗口小片天光逐步照入，而不是承接已完全亮起的室内。
- propagation: turn 139 的正文和选项后续继续围绕这道爬行光线展开；turn 140 还写‘门槛内侧慢慢向前爬行的光线’，进一步固化了倒退后的光照状态。
- nonCauses:
  - 这不是玩家选择导致的空间变化；玩家只是回屋喝水。
  - 不是单纯措辞不同，因为‘朝壁炉方向爬去’否定了此前光已漫过壁炉/全室。
  - 隐藏资料不需要参与 validity 判断。

## Root Cause
- label: `context-priority`
- family: `agent-system`
- secondaryFamilies: `recent-context`, `detail-memory`
- description: 室内已全亮的旧但仍有效状态没有被 foreground 为当前场景锚点，而最近几轮和 Director 摘要中的‘晨光渐亮/爬行’意象更靠近生成末端；缺少优先级护栏让 Narrator 把高显著度近因当作室内状态，从而时间/光照回退。
- fixSurface:
  - `context assembly 的 current scene state priority`
  - `Director summary 中的 monotonic time/light-state constraints`
  - `Narrator prompt 的 recent-context vs established-state conflict guard`

## Evidence
- playerVisible: turn 122、129 已建立全室明亮；turn 139 写门缝一线光和一小片窗口天光，且没有可见遮光事件。
- internalTrace: `turn-139/06b-narrator-prompt.md` 中早先全亮事实低显著度，`turn-139/06a-director-prompt.md` 输出‘晨光渐亮’，`turn-139/06-llm-calls.json` call[1] 首次输出倒退后的局部光照。

## Recommended Fix Area
把光照/窗帘/时间推进等单调场景状态写入当前场景锚点，并在 prompt 排序中置于最近意象之前。

## Confidence
`high`
