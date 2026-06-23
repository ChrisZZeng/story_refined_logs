# Root Cause Report - issue-1-turn-3

## Problem

- issueIndex: 1
- turn: 3
- issueValidity: valid
- problemSummary: turn 3 的玩家选项把可行动作“直接去暗街”和无上下文的抒情片段“往日总是如影随形”拼在一起，削弱了选项清晰度。
- tracePacket: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-001/issues/issue-1-turn-3/trace.md`

## Validity

- verdictReason: 该问题只凭玩家可见内容即可成立：当前场景正在让玩家选择是否去暗街或注意异常目光，选项文本却出现没有行动含义、没有场景 referent 的短句。它不是角色对白或已铺垫的记忆意象，而是玩家需要点击的行动标签。
- playerVisibleSupport: `visible-timeline.jsonl` turn 3 的 choices 包含 `直接去暗街，往日总是如影随形`；同一轮正文结尾是“暗街。卡琳娜。情报有价。”，另一个选项是明确行动 `你注意到了不寻常的目光——你被盯上了？`。
- caveats: 该问题是低严重度的可读性退化，不改变后续主线动作绑定；但它确实污染了玩家可点击文本。

## Context Assessment

- actualStateBeforeIssue: 玩家刚从摊贩处得知卡琳娜属于暗街、情报有价、外来记者应低调；当轮正文把视线投向通往内陆方向的道路，合理下一步是去暗街、继续打听路线，或警惕是否被盯上。
- relevantFacts:
  - `present-clear` 本轮需要给玩家一个清晰的前往暗街行动出口。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-03/04-output.json` notes: 玩家可见正文已明确“暗街。卡琳娜。情报有价。”，行动出口自然成立。
  - `over-constraining` 状态机候选动作的 text 已经含有无关抒情片段。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-03/02-script-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-03/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-03/06c-choice-prompt.md` notes: candidateActions[0].text 是 `直接去暗街，往日总是如影随形`，并被作为 `choice:前往暗街` 的 key choice 候选展示给 choiceGenerator。
  - `present-ambiguous` choice prompt 要求在候选动作自然可用时绑定完整 actionId，但没有要求改写或校验候选 text 的玩家可读性。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-03/06c-choice-prompt.md` notes: prompt 强调复制完整 actionId；对候选 text 是否包含非行动片段没有硬性质量门。
- competingPressures: state-machine candidateActions 作为关键剧情出口被高优先级注入；choiceGenerator 需要保留 actionId，以便进入下一节点；候选动作 text 同时承担内部锚点说明和玩家可见标签，缺少分离

## Causal Chain

- firstDivergenceArtifact: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-03/02-script-state.json candidateActions[0].text`
- triggeringPressure: `choice:前往暗街` 的候选动作在进入 choice prompt 前已经带有 `往日总是如影随形`；因为它是 key choice，choiceGenerator 倾向于保留并展示这个候选出口。
- missingGuard: 没有把 state-machine action label 和 player-facing choice text 分离，也没有对候选选项做“是否为短、具体、可点击行动”的语义/风格校验。
- mechanismStatement: 状态机候选动作把内部推进锚点和玩家可见文案耦合在同一个 `text` 字段中；当该字段含有无行动含义的抒情残片时，choiceGenerator 为保留 `actionId` 将其直接提交为选项，导致玩家看到被污染的 choice。
- directCause: choiceGenerator 最终提交了带有污染片段的 key choice 文本。
- propagation: `turn-03/07-events.json` 的 choiceGenerator worker-done 和 `turn-03/04-output.json` 都提交该选项；turn 4 的 `01-summary.json` 继续把该文本作为 playerInput 记录，但后续正文仍按 `choice:前往暗街` 正常推进。
- nonCauses: Narrator 正文本身没有产生该片段；问题只出现在 choices。；不是长程记忆遗忘；所需行动事实在本轮正文和 Director 摘要中都很清楚。

## Root Cause

- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: []
- description: 具体机制是 key choice 的 action binding 与玩家可见文案共用同一候选 `text`，且候选文案没有质量校验。`choice:前往暗街` 的绑定压力让系统优先保留该候选出口，缺失的文案防线使无关抒情残片穿透到玩家界面。
- fixSurface: script/state candidateActions schema：拆分 `intentLabel`、`playerFacingText`、`actionId`；choiceGenerator prompt：绑定 actionId 时允许重写玩家可见 text，并要求 action-only label；choice postprocessor/lint：拦截无谓抒情从句、非行动短语、与场景无 referent 的片段

## Evidence

- playerVisible: turn 3 choices: `直接去暗街，往日总是如影随形`；同轮正文只铺垫去暗街和被盯上的风险，没有铺垫“往日如影随形”的可操作含义。
- internalTrace: `turn-03/02-script-state.json` 和 `turn-03/03-story-state.json` 的 candidateActions 已含污染 text；`turn-03/06c-choice-prompt.md` 将其列为剧本/状态机候选推进动作；`turn-03/07-events.json` 与 `turn-03/04-output.json` 提交同一文本。

## Recommended Fix Area

优先修复 candidateActions 到 choiceGenerator 的绑定契约：候选动作应提供稳定 actionId 和语义 intent，但玩家可见文本必须经过 choice 文案生成/校验，而不是直接继承脚本文案。

## Confidence

`high`
