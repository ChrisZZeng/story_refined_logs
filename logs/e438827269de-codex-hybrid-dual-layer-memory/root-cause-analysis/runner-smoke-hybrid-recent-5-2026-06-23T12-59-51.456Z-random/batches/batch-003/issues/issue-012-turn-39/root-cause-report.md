# Root Cause Report: issue-12-turn-39

## Problem
- issueIndex: 12
- turn: 39
- severity: `low`
- type: `language-drift`
- scope: `visibleText`
- summary: 第 39 轮正文中出现“它慢悠悠地站起来，在石凳上伸了个懒腰——两隻前爪向前探出去”，单个繁体字“隻”混入简体中文叙事。

## Validity
- issueValidity: `valid`
- verdictReason: valid。玩家可见正文整体使用简体中文，同一段和相邻文本多次使用“那只黑猫”“两只猫耳朵”，只有“两隻前爪”混入繁体字形，属于轻微但真实可见的 language-drift。
- playerVisibleSupport: visible-timeline.jsonl turn 39 可见“两隻前爪”；同一 turn 后文又写“两只猫耳朵中间”，相邻 turn 也持续使用“那只黑猫”。
- caveats:
- 这是单字字形问题，不改变剧情事实或行动理解，因此 severity low 合理。

## Context Assessment
- actualStateBeforeIssue: 玩家在公园与卡琳娜谈论晚宴角色定位。黑猫卡尔蜷在石凳另一头，随后起身、伸懒腰、跳下石凳到卡琳娜脚边。
- relevantFacts:
- `present-clear` 目标文本环境是简体中文。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-39/06b-narrator-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-39/03-story-state.json`
  notes: prompt、recentTurns 和同轮输出普遍使用“只”等简体字形。
- `absent` Director 没有要求或引入繁体字形。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-39/06-llm-calls.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-39/04-output.json`
  notes: Director call[0] 只安排卡尔跳下石凳、打破沉思，没有“两隻”或任何繁体要求。
- `absent` Narrator prompt 缺少显式 zh-Hans/简体输出约束与字形校验。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-39/06b-narrator-prompt.md`
  notes: v3-html 协议和写正文要求约束结构、信息边界和台词格式，但没有明示“使用简体中文”或输出后 normalization。
- `present-clear` 输出归一化未修正繁体字。
  artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-39/04-output.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-39/07-events.json`
  notes: narrator worker-done、04-output.rawHtml/visibleText 均保留“两隻前爪”。
- competingPressures: 长篇自由生成中的局部字形采样, 大量动物量词“只”的重复, 缺少 zh-Hans hard contract, 无 output-normalization pass

## Causal Chain
- firstDivergenceArtifact: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-39/06-llm-calls.json call[1] / story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-39/06b-narrator-prompt.md`
- triggeringPressure: Narrator 在长段描写黑猫动作时自由生成“两个前爪”的量词，局部采样成繁体“隻”。周围上下文虽是简体，但没有显式字形约束。
- missingGuard: 缺少 orthography normalization：Narrator prompt 没有 zh-Hans 要求，输出管线也没有繁简检测/转换或拒绝混排校验。
- mechanismStatement: 自由文本 Narrator 在没有字形标准化 contract 的情况下产生单字繁体漂移；由于 output normalizer 只保留文本结构而不做简繁校验，错误直接进入玩家可见正文。
- directCause: Narrator streamText 输出了“两隻前爪”，并由 07-events worker-done 与 04-output.json 原样提交。
- propagation: 该字形错误没有进入长期事实层，但出现在 normalizedContent/visibleText 和 visible-timeline 中，成为玩家可见质量退化。
- nonCauses:
- 不是剧情状态或记忆事实错误；问题只在字形层。
- 不是 Director 要求；Director output 没有繁体字。
- 不是玩家输入带入；玩家输入为简体。

## Root Cause
- label: `orthography-normalization-gap`
- family: `agent-system`
- secondaryFamilies: `llm-self`
- description: Narrator 局部生成了繁体字形，但系统没有明确 zh-Hans 输出契约，也没有后处理/validator 将繁体字转换或标记为失败，导致单字 language-drift 透传。
- fixSurface:
- `Narrator prompt: 明确要求 zh-Hans/简体中文输出`
- `Output normalizer: 对 visibleText 做繁简检测或 OpenCC zh-Hans normalization`
- `Quality validator: 对混入繁体字的正文触发重采样或自动修正`

## Evidence
- playerVisible: turn 39 只有“两隻前爪”混入繁体；同轮后文为“两只猫耳朵”，相邻文本为“那只黑猫”。
- internalTrace: turn-39/06-llm-calls.json call[0] 无繁体要求；call[1] 首次出现“两隻前爪”；turn-39/07-events.json worker-done 和 04-output.json 保留该字形；runtime-after 无相关事实写入。

## Recommended Fix Area
优先在 Narrator 输出后增加 zh-Hans normalization/validator；对玩家可见正文进行混排字符扫描，低成本自动修正“隻”等繁体字。

## Confidence
`medium`
