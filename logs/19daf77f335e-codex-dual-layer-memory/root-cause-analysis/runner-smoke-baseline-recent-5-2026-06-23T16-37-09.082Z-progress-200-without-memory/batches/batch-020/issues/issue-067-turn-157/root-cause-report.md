# issue-67-turn-157

## Problem
第 157 轮玩家正坐在卡尔小屋门外石阶上，但选项提供“从相机包里拿出烟点上，让呼吸更稳一些”。相机包最近明确仍在屋内椅子扶手/玩家手边，没有被带出门。

## Validity
- issueValidity: valid
- 玩家可见支持：第 153 轮“指尖落在相机包的拉链头上”；第 155 轮玩家只是开门透气，且选项里还有“回屋拿相机”；第 156-157 轮玩家坐在门前石阶。没有带相机包出门的动作。
- caveat: 烟盒此前没有稳定位置，问题核心是“相机包不可达”，不是烟盒记忆。

## Context Assessment
玩家当前坐在门外石阶上，后背靠门框，继续看巷口和晨光等待。相机包最近一次明确在屋内椅子扶手/手边；从第 155 到 157 轮，没有携带相机包的可见动作。

- relevantFacts:
  - 玩家当前在门外石阶上：availability=present-clear 于 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-157/06c-choice-prompt.md` 和 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-157/04-output.json`。
  - 相机包仍在屋内手边：availability=present-clear 于第 153 轮 recentTurns。
  - 无带包出门动作：availability=present-clear 于第 155-156 轮 recentTurns。
  - Choice 需要先以正文结尾判断可做动作：availability=present-clear，但只是原则性指令，缺少可达性校验。
- competingPressures: 第 152-153 轮相机包/侧袋高显著；等待场景需要轻量选项；系统没有 actor location + item location 的 reachable state。

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-157/07-events.json` 的 choiceGenerator worker-done / `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-157/04-output.json` choices
- 第 157 轮 Director/Narrator 正确维持玩家坐在门外石阶上。
- Choice prompt 同时包含当前石阶位置和 recentTurns 中相机包在屋内的线索。
- ChoiceGenerator 没有执行“当前可达物件”校验，输出“从相机包里拿出烟点上”。
- 第 158 轮玩家选择后，Narrator 改成从外套内袋取烟，说明后续尝试绕开前一轮选项的空间问题。

## Root Cause
- label: choice-action-binding
- family: agent-system
- secondaryFamilies: recent-context
- L3 root mechanism: Choice 生成缺少 current-scene affordance/reachability 校验，未把“玩家在门外石阶上”和“相机包仍在屋内手边”合成硬约束；在等待场景需要动作选项和相机包近期高显著的压力下，生成了不可执行的取物动作。
- fixSurface:
  - choice generation：引入 reachable item/action validator。
  - state model：记录 actor location、item location、carried/on-person/nearby。
  - prompt assembly：在 Choice prompt 高优先级列出 current affordances。

## Evidence
- playerVisible: 第 153、155、156、157 轮组合证明相机包不可达；第 157 轮选项要求从相机包取烟。
- internalTrace: 第 157 轮 Choice prompt 的“最终判断依据”明确玩家坐在石阶上，choiceGenerator 仍输出相机包取物选项。

## Recommended Fix Area
优先修复 Choice 的 current-scene affordance 与 item reachability 校验，防止等待场景中把室内物件当作室外手边物件。

## Confidence
high
