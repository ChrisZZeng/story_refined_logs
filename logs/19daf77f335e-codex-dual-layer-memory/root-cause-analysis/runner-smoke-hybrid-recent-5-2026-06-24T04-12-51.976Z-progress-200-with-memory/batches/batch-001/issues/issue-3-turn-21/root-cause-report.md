# issue-3-turn-21 Root Cause Report

## Problem

- issueId: `issue-3-turn-21`
- turn: `21`
- problemSummary: 第 21 轮正文“你的声音打断了它自己”出现指代/搭配错误，应是在主角打断德索洛辩解的语境中写成了无清晰先行词的病句。

## Validity

- issueValidity: `valid`
- verdictReason: valid。玩家可见语境中，德索洛正在说“如果我——”，随后主角用“所以你选择了安全的那一边”打断他；“它自己”没有清晰可指对象，且读起来像声音自我打断，局部破坏阅读流畅性。
- playerVisibleSupport: turn 21 visibleText 连续呈现德索洛辩解、主角插话，然后紧跟“你的声音打断了它自己。不尖锐，但像一张纸被平稳地从中间撕开。”
- caveats:
  - 该问题是局部文字质量问题，不改变剧情事实或角色意图。

## Context Assessment

- actualStateBeforeIssue: 德索洛站在门外为自己辩解，主角继续逼问他这些年疏远卡琳娜的原因；卡琳娜保持挡门姿态，观察这场对峙。
- relevantFacts:
  - `present-clear` 玩家选择的核心行动是继续质问德索洛。 artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-21/01-summary.json`, `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl turn 21`. notes: selectedFromPreviousTurn 明确为“继续质问德索洛，逼问他为什么这些年疏远卡琳娜”。
  - `present-clear` Director 明确要求德索洛试图辩解并被主角连续质问打断。 artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-21/06-llm-calls.json call 0`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-21/04-output.json plotPoint`. notes: beats 包含“德索洛试图辩解，但被主角连续质问打断”。
  - `present-ambiguous` “它自己”在目标句没有清晰先行词。 artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-21/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-21/06-llm-calls.json call 1`. notes: 最近的可指对象包括“暗街”这个词、德索洛的句子、主角声音，但都不能自然匹配“声音打断了它自己”。
  - `present-buried` 同段前文有“让它自己显出形状”的抽象代词结构。 artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-21/06-llm-calls.json call 1`. notes: 局部生成中可能复用了“它自己”句式，造成后续指代污染。
- competingPressures:
  - Narrator 试图写出锐利但克制的文学化打断效果。
  - 同段已有“让它自己显出形状”的抽象修辞。
  - 场面节奏需要快速交锋，降低了局部句法自检空间。

## Causal Chain

- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-21/06-llm-calls.json call 1
- triggeringPressure: Narrator 在清晰对峙场景中追求文学化节奏，前文刚使用过“让它自己显出形状”的抽象代词句式，随后又生成“你的声音打断了它自己”。
- missingGuard: 缺少针对 Narrator 输出的局部指代/搭配自检，尤其是“X 打断了它自己”这类无先行词或自反异常的句子没有被二次改写。
- mechanismStatement: 在上下文和 Director 指令都清楚的情况下，Narrator 的局部语言生成把前一句抽象代词结构迁移到“打断”动作上，缺少句级 pronoun/collocation 校验，于是产生了无清晰指代的病句。
- directCause: Narrator raw text 生成“你的声音打断了它自己”，并被原样写入最终正文。
- propagation: 错误从 `turn-21/06-llm-calls.json` call 1 进入 `turn-21/04-output.json`，再进入 visible timeline；后续 choices 与 state 不参与该病句生成。
- nonCauses:
  - Director 不是主因；Director 明确了德索洛被主角打断。
  - Choice worker 不是主因；问题在正文而非选项。
  - 不是记忆缺失；所需语境在同一段可见文本中。

## Root Cause

- label: `model-local`
- family: `llm-self`
- secondaryFamilies: none
- description: 在清晰上下文与清晰 Director brief 下，Narrator 本地生成发生代词/搭配滑移，把前文“它自己”的抽象修辞错误套到“打断”动作上；系统没有句级质量校验来拦截该局部病句。
- fixSurface:
  - `Narrator post-generation copyedit pass`
  - `pronoun antecedent / collocation lint`
  - `quality-regression evaluator feedback loop`

## Evidence

- playerVisible: turn 21 中德索洛说“如果我——”，主角接“所以你选择了安全的那一边。”，随后正文写“你的声音打断了它自己”。
- internalTrace: `turn-21/06-llm-calls.json` call 0 的 Director object 明确“德索洛试图辩解，但被主角连续质问打断”；call 1 Narrator raw text 首次出现病句，并进入 `turn-21/04-output.json`。

## Recommended Fix Area

为 Narrator 输出增加轻量 copyedit/自检步骤，重点检测自反代词、无先行词代词和“动作-受事”搭配异常。

## Confidence

`high`
