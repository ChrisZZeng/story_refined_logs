# Root Cause Report: issue-6-turn-20

## Problem
Turn 20 把玩家刚要应对的第三次敲门，从 Turn 19 的短促用力指节砸门改写为带喘息的手掌拍门。

## Validity
- issueValidity: `valid`
- verdictReason: 玩家在 Turn 19 结尾刚看到当前危机的敲门声，并选择把相机背好准备应对；Turn 20 仍称其为第三次敲门，却明确说 `不是之前那种...指节砸击`，把同一即时事件的声源和质感重写。
- playerVisibleSupport: Turn 18 中卡琳娜已说 `刚才——那是第二次了`；Turn 19 结尾写 `门外传来一阵急促的敲门声...是指节砸在木门上的声音——短促，用力`；Turn 20 写 `然后门外响起了第三次敲门声。不是之前那种短促、用力的指节砸击。而是——手掌拍在门板上的声音，带着喘息`。
- caveats:
- 如果强行解释为 Turn 19 后又隔了两次呼吸才出现的新拍门，矛盾会减轻；但文本同时使用 `第三次` 并紧接玩家应对动作，玩家自然会把它视为同一当前敲门事件。

## Context Assessment
- actualStateBeforeIssue: Turn 20 开始前，玩家刚听到第三次门外急促敲门，声学证据是短促、用力的指节砸在木门上；玩家选择把相机背好，准备应对突发状况。门外身份尚未可见揭示。
- relevantFacts:
- `present-clear` 第三次敲门的最近可见声学事实是 `指节砸在木门上`、`短促，用力`。 证据：`story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/06b-narrator-prompt.md`。该句出现在 Turn 19 visible text 末尾，也进入 Turn 20 recentTurns。
- `present-clear` Turn 19 结束后 runtime 已把 `2-02` 完成并激活 `2-03` 交易节点。 证据：`story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-19/05-runtime-after.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/02-script-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/03-story-state.json`。`activeBeatIds` 变为 `2-03-第一章`，且 `德索洛的倾诉` anchor 已为 true；这比玩家可见的 DeSalo 入场/倾诉更靠前。
- `over-constraining` 当前故事线强制推进 DeSalo 交易全流程，突出 DeSalo `大口喘息`、汗湿、闯入。 证据：`story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/06-llm-calls.json`。Director requiredContent 包含 `门外第三次敲门并伴随男人喊声`，characterBeats 写 `大口喘息，汗湿西装`，但没有保留 `指节砸门` 的硬约束。
- `present-clear` 写作一致性原则要求最近可见事实优先。 证据：`story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/06b-narrator-prompt.md`。该原则是通用条款，未把当前敲门声 profile 提升为本轮 must-preserve anchor。
- competingPressures: `2-03` 节点必须在本轮完成 DeSalo 闯入、下跪、交易、离开, DeSalo 角色表现要求喘息、汗湿、急迫, 玩家输入只做准备动作，没有提供新的声学观察, 最近可见声学事实在长 prompt 中存在，但没有被 Director 结构化传递

## Causal Chain
- firstDivergenceArtifact: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-19/05-runtime-after.json -> story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-20/06a-director-prompt.md`
- triggeringPressure: Turn 19 只把第三次敲门带到门前，runtime 却已经切到 `2-03` 尊严交易节点；Turn 20 Director 因此把本轮目标设为 `门外第三次敲门并伴随男人喊声` 与 DeSalo 全流程交易。
- missingGuard: 缺少 unresolved current-scene event anchor：系统没有把 `当前这次敲门已被玩家听成短促用力的指节砸门` 作为 Narrator 必须保留的硬约束，也没有要求 fixed beat 入场时桥接已出现的感知证据。
- mechanismStatement: 过早激活 DeSalo 交易节点把未解决的当前敲门重包装成 fixed beat 入场；由于 handoff 只传递 `第三次敲门+男人喊声` 而未传递原声学 profile，Narrator 将 DeSalo 的喘息/急迫特征回填到敲门本身，改写了玩家刚看到的指节砸门。
- directCause: Narrator 在 `turn-20/06-llm-calls.json` call[1] 首次写出 `不是之前那种...而是手掌拍在门板上的声音，带着喘息`。
- propagation: 错误文本进入 `turn-20/04-output.json` narrative 与 `visible-timeline.jsonl`；后续 DeSalo 入场和交易继续沿该版本展开。
- nonCauses:
- 不是长期记忆缺失：Turn 19 声学事实仍在 recentTurns 中
- 不是玩家输入造成：玩家只是准备应对，没有改变敲门方式
- 不是单纯 Narrator 任意幻觉：active storyline 与 Director requiredContent 对 DeSalo 入场施加了强压力

## Root Cause
- label: `storyline-lifecycle`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: `2-02` 到 `2-03` 的 storyline transition 在可见 DeSalo 入场桥段完成前被推进，固定交易节点成为高优先级目标；系统缺少 current-scene event anchor 来保护上一轮刚建立的敲门声学事实，导致 DeSalo `喘息` 设定被错误合并进敲门质感。
- fixSurface: `quest/beat lifecycle transition guard`, `Director handoff schema for unresolved sensory events`, `Narrator prompt current-scene anchor section`

## Evidence
- playerVisible: Turn 19：第三次敲门是 `指节砸在木门上的声音——短促，用力`；Turn 20：同一应对链条中改成 `手掌拍在门板上的声音，带着喘息`。
- internalTrace: `turn-19/05-runtime-after.json` 已完成 `2-02` 并激活 `2-03`；`turn-20/03-story-state.json` currentStoryline 是 `推进节点 02-03：尊严换公道的交易`；Director requiredContent 只写 `门外第三次敲门并伴随男人喊声`，Narrator 输出首个错误声学改写。

## Recommended Fix Area
为 storyline transition 增加可见前置条件：只有 DeSalo 的第三次敲门/身份揭示桥段被玩家看见后才能完成 `2-02`；同时在 Director 输出中加入 `unresolvedImmediateEvents`，把 `soundProfile: knuckle/short/forceful` 传给 Narrator 并禁止改写。

## Confidence
`high`
