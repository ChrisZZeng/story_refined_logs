# Issue 21 / Turn 31 Root Cause Report

## Problem
Turn 31 的 visibleText 把未发生的康纳会面写成既成事实：卡尔说“你见到康纳了”，叙述又替玩家回答“见到了。没多说几句——我提前走了”，并继续说“她今晚没留你”。这改写了玩家已经选择绕过的关键剧情进度。

## Validity
- `issueValidity`: `valid`
- 玩家可见证据足够：Turn 26 明说“你还没见过康纳”；Turn 27 只是介绍康纳并建议“你应该见见她”；Turn 28 玩家选择“仍然决定告辞，改日再说”，正文显示玩家离开宴会、走进雨里并回到暗街。
- Turn 31 没有把卡尔的话写成误判或试探，而是让玩家角色确认“见到了”，因此不是合理的角色推断或互动改写。
- 本判断只依赖 `visible-timeline.jsonl` 与玩家可见正文；隐藏状态只用于后续追因。

## Context Assessment
Turn 31 前的实际状态是：主角从宴会返回暗街，在卡尔小屋外检查无异常后进门，询问卡尔“今晚有什么需要我知道的”。康纳只被介绍过身份，主角没有接受引见，也没有与康纳交谈。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 主角尚未见过康纳，会面被推迟 | `present-clear` | `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`; `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06a-director-prompt.md`; `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06b-narrator-prompt.md` | 最近可见文本清楚包含 Turn 26“你还没见过康纳”、Turn 28 改日再说并离开。 |
| 康纳相关剧情应未来再处理 | story state 中 `present-clear`，作为当前 prompt 硬约束则 `absent` | `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-28/04-output.json`; `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/03-story-state.json` | Turn 28 写入“保持康纳尚未与主角正面接触的状态”，但 Turn 31 Director/Narrator prompt 没有把它提升为当前强约束。 |
| 隐藏 lifecycle 认为康纳节点已推进 | `contradicted` / `over-constraining` | `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-27/05-runtime-after.json`; `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-28/05-runtime-after.json`; `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/02-script-state.json` | Anchors 标记“康纳出场”“康纳和卡琳娜交互”“康纳的试探”“康纳和卡琳娜的交锋”为 true，与可见剧情冲突。 |
| 当前 6-02 beat 要做宴会后反思 | `over-constraining` | `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/03-story-state.json`; `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06a-director-prompt.md` | 当前 beat 素材推动卡尔/卡琳娜互动、对宴会的看法与卡琳娜状态，给 Director 引入康纳话题的压力。 |

Competing pressures：recent visible text 要求维持“未见康纳”；quest lifecycle 与历史节点标题/方向暗示康纳固定节点已走完；当前 6-02 需要宴会后反思；Narrator 又被要求落实 Director 的 requiredContent。

## Causal Chain
- Hidden first divergence: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-27/05-runtime-after.json` 在可见正文仅介绍康纳后，就把 `康纳出场`、`康纳和卡琳娜交互` 置为 true，并进入 `5-03-第一章`。
- Hidden lifecycle escalation: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-28/05-runtime-after.json` 在玩家明确“改日再说”并离开后，又把 `康纳的试探`、`康纳和卡琳娜的交锋` 置为 true，并把 `5-03-第一章` 记入 `completedBeatIds`。
- Prompt pressure: Turn 31 的历史情节概览列出 `05-02：康纳出场` 和 `05-03：权力试探与支线回响`，同时当前 6-02 beat 需要宴会后反思；最近正文虽然包含未会面证据，但 no-contact 约束没有成为当前硬约束。
- Director handoff: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06-llm-calls.json` / `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06b-narrator-prompt.md` 中 Director 输出 requiredContent：“卡尔提及康纳和今晚的宴会，暗示卡琳娜的状态”，但没有说明只能提及“尚未见面/未来再见”。
- Player-visible divergence: Narrator 在 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/04-output.json` 把“提及康纳”具体化为“你见到康纳了”，并替玩家回答“见到了”。
- Propagation: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06c-choice-prompt.md` 将错误正文作为本轮最终状态继续生成选项，Turn 32 的 recentTurns 也会携带该错误文本。

## Root Cause
- `rootCause.label`: `storyline-lifecycle`
- `family`: `agent-system`
- `secondaryFamilies`: [`recent-context`]

L3 机制：固定康纳 storyline 节点在玩家选择绕过后没有进入 `deferred` / `skipped` / `incompatible` 状态，而是按线性 quest lifecycle 被 `visited` / `completed`，并触发对应 anchors。系统缺少以玩家可见正文为准的 beat completion / anchor activation guard，也没有把“主角尚未见过康纳”提升为后续 prompt 的硬约束。后续 Director/Narrator 在“已完成康纳节点”的 lifecycle 压力与最近可见 no-contact 事实之间优先了前者，最终把未发生的会面补写为事实。

这不是主要的 `memory-persistence`：相关事实就在最近几轮。也不是单纯 `llm-self`：Narrator 有本地扩写错误，但上游 lifecycle 与 prompt handoff 已经制造了错误方向。

## Evidence
- Player-visible:
  - `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`: Turn 26 “你还没见过康纳”；Turn 27 介绍康纳；Turn 28 改日再说并离开；Turn 31 承认已见康纳。
  - `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/04-output.json`: 存储最终错误 visibleText。
- Internal trace:
  - `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-27/05-runtime-after.json`: anchors `康纳出场`、`康纳和卡琳娜交互` 为 true，quest 进入 `5-03-第一章`。
  - `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-28/05-runtime-after.json`: anchors `康纳的试探`、`康纳和卡琳娜的交锋` 为 true，`5-03-第一章` 被 completed。
  - `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/02-script-state.json`: Turn 31 仍携带上述 true anchors，并出现与当前情境不匹配的 candidate action `玩家接受卡琳娜的邀请`。
  - `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06b-narrator-prompt.md`: Director requiredContent 要求“卡尔提及康纳和今晚的宴会”，Narrator 被要求落实该安排。
  - `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06c-choice-prompt.md`: 错误正文被作为“本轮玩家已经看到的正文”继续使用。

## Recommended Fix Area
优先修复 quest/storyline lifecycle 与 prompt assembly：

1. 对 fixed beat completion 和 anchor activation 增加玩家可见证据校验；没有可见呈现时不得置 true。
2. 玩家绕过固定节点时，将 beat 标记为 `deferred`、`skipped` 或 `incompatible`，而不是 `completed`。
3. 将 Turn 28 这类 no-contact 约束提升为当前 Director/Narrator hard constraint，例如“主角尚未见过康纳；只能谈未来会面或康纳会注意到他”。
4. 在 Director handoff 中要求模糊指令如“提及康纳”必须携带 progress qualifier，避免 Narrator 自行补成已会面。

## Confidence
`high`。玩家可见问题明确；内部链路中 hidden lifecycle 与 prompt handoff 的矛盾能直接解释错误如何从固定节点状态传播到 Turn 31 正文。
