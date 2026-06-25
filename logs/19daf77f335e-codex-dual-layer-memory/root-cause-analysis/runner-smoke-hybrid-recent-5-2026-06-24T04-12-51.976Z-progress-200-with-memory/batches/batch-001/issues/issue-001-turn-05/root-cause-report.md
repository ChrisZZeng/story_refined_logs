# issue-1-turn-5 Root Cause Report

## Problem

- issueId: `issue-1-turn-5`
- turn: `5`
- problemSummary: 第 5 轮玩家选项把可执行行动“直接去暗街”和无承接的诗性残片“往日总是如影随形”拼接在一起，导致选项语义不清。

## Validity

- issueValidity: `valid`
- verdictReason: valid。玩家可见正文只建立了“去暗街找卡琳娜/换取敏特情报”的行动目标，没有建立“往日总是如影随形”的对象、关系或可点击行动含义。该短语出现在选项位，而选项应是短、具体的玩家行动，因此构成低严重度的可读性退化。
- playerVisibleSupport: visible-timeline.jsonl 的第 3-5 轮显示：玩家持续向小贩追问卡琳娜、暗街和换情报的代价；第 5 轮正文只讨论“用什么代价”与“值不值得她花时间”，随后 choices 中出现“直接去暗街，往日总是如影随形”。
- caveats:
  - 该问题不改变可执行主动作“去暗街”，主要损害选项可读性。
  - “往日”可能试图呼应主角创伤主题，但在玩家可见选项语境中没有被铺垫为行动。

## Context Assessment

- actualStateBeforeIssue: 帕兹仍在中央区小贩摊位前，已经得知卡琳娜在暗街、可能知道敏特线索，并刚向小贩追问从卡琳娜那里换取情报需要什么代价。此时自然的下一步是继续问代价、观察周围，或动身去暗街。
- relevantFacts:
  - `present-clear` “前往暗街”是此刻自然可用的玩家行动。 artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl turn 3-5`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-05/04-output.json`. notes: 小贩多次指出暗街和卡琳娜是下一条线索，第 5 轮正文也结束在情报代价话题上。
  - `absent` “往日总是如影随形”没有玩家可见承接对象，也不是清晰行动。 artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl turn 3-5`. notes: 前文有创伤与过去阴影主题，但没有把这个短语建立为要调查、要携带或要执行的对象。
  - `over-constraining` 预置候选动作的显示文案已经包含问题短语。 artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-05/02-script-state.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-05/01-summary.json`. notes: candidateActions[0] 为 actionId `choice:前往暗街`，text 是“直接去暗街，往日总是如影随形”。
  - `present-clear` Choice LLM 曾生成更清晰的绑定选项，但最终输出没有保留该自然化文案。 artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-05/06-llm-calls.json call 2`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-05/07-events.json`. notes: raw object 中有“谢过小贩，直接动身前往暗街”并绑定 `choice:前往暗街`；最终 worker-done / 04-output.json 变成候选动作的 canonical text。
- competingPressures:
  - 关键剧情出口需要让玩家进入暗街。
  - 当前 storyline 的情感弧线包含“从往日阴影中逃离 → 来到现实”，可能污染了行动文案。
  - 绑定 key choice 时，候选动作 text 被当成权威显示文本。

## Causal Chain

- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-05/02-script-state.json candidateActions[0].text
- triggeringPressure: `choice:前往暗街` 是关键剧情出口，且候选动作自带显示文案“直接去暗街，往日总是如影随形”。在最终绑定时，系统更信任候选动作 canonical text，而不是 Choice LLM 生成的更自然选项。
- missingGuard: 缺少对候选动作显示文案的“短、具体、可执行”校验；也缺少绑定 actionId 后保留/审核 Choice LLM 自然化文本的规则，导致不清晰的候选文案覆盖了可读性更好的选项。
- mechanismStatement: 当 key choice 的候选动作携带未清理的诗性残片时，choice-action binding 把该候选显示文案作为权威文本回填到玩家选项，且没有行动文案可读性校验，于是一个本可清晰表达为“前往暗街”的选择被发布成语义混杂的选项。
- directCause: 候选动作 `choice:前往暗街` 的 display text 不合格，并在最终 choices 中覆盖了 raw Choice LLM 的清晰表达。
- propagation: 问题文本进入 `turn-05/04-output.json`、`visible-timeline.jsonl` 和 `turn-05/01-summary.json selectedForNext`；第 6 轮 playerInput 也继承了该选项文本。
- nonCauses:
  - Narrator 正文不是主因；第 5 轮正文没有生成该短语。
  - 长期记忆不是主因；前往暗街这个事实在最近上下文中很清楚。
  - 动作可用性不是主因；问题集中在绑定后的显示文案。

## Root Cause

- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: none
- description: 关键候选动作的 canonical display text 混入了未清理的诗性残片；绑定流程把该 text 当成权威选项文本，并缺少“玩家选项必须是短、具体、可执行行动”的强校验，最终覆盖了 Choice LLM 生成的清晰文案。
- fixSurface:
  - `candidateAction authoring / generation text sanitizer`
  - `choiceGenerator actionId binding merge policy`
  - `choice option readability validator`

## Evidence

- playerVisible: 第 5 轮 choices 显示“直接去暗街，往日总是如影随形”；第 3-5 轮玩家可见内容只支持“前往暗街找卡琳娜/换取情报”。
- internalTrace: `turn-05/02-script-state.json` 和 `turn-05/01-summary.json` 的 candidateActions[0].text 已是问题文本；`turn-05/06-llm-calls.json` call 2 raw options 中曾出现“谢过小贩，直接动身前往暗街”；`turn-05/07-events.json` choiceGenerator worker-done 与 `turn-05/04-output.json` 最终发布候选动作原文。

## Recommended Fix Area

优先修复 choice-action binding：绑定 actionId 时不要无条件回填候选动作 text，并在候选动作入库/出库时做可执行性与残片检测。

## Confidence

`high`
