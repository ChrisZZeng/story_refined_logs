# issue-15-turn-24 Root Cause Report

## Problem
Turn 24 选项继续允许“拿起信封再仔细看一遍地址”，但 turn 19 玩家已看到德索洛接过信封并带着它离开；这是早先无效选项被选中后传播到后续选择的物件位置冲突。

## Validity
- issueValidity: `valid`
- verdictReason: 该 issue 有效，但它是传播型问题。玩家可见的 turn 19 明确写德索洛接过信封、握着那封信、随后快步走出公寓；因此公寓内不应再有同一信封可拿。turn 24 选项继续提供拿起信封，沿用的是 turn 20 起已被错误重建的可见状态。
- playerVisibleSupport: turn 19：卡琳娜给出信封，德索洛“接过信封”“握着那封信”并“快步走了出去”；turn 24 选项：“沉默片刻，拿起信封再仔细看一遍地址”。
- caveats: 从 turn 20 到 turn 23，系统已经多次把信封重新写在茶几上；所以 turn 24 选项相对上一两轮即时文本是连贯的，但相对 turn 19 的物件转移仍是可见事实冲突。根因应追溯到 turn 19/20，而不是只看 turn 24 Choice。

## Context Assessment
actualStateBeforeIssue: 按 turn 19 的可见交易结果，信封已由德索洛带离公寓；按后续错误传播的即时文本，turn 21/23 又把信封放回/看向茶几，turn 24 Choice 因此继续把它当作当前可互动道具。

relevantFacts:
- claim: turn 19 最终物件状态：德索洛接过并握着信封离开公寓。
  availability: `present-clear`
  artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/06c-choice-prompt.md`
  notes: turn 19 Choice prompt 自身也包含“德索洛接过信封”“快步走了出去”，因此生成选项时可见事实并未缺失。
- claim: turn 19 Choice output 首次把信封作为玩家可拿取对象提供。
  availability: `present-clear`
  artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/06-llm-calls.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/07-events.json`
  notes: 选项“拿过信封看看”是第一处偏离；它没有 actionId，但仍可被玩家选择。
- claim: turn 20 Director/Narrator 接受该无效选择并把信封实体化到茶几上。
  availability: `present-clear`
  artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-20/06-llm-calls.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-20/04-output.json`
  notes: Director actionHint 写“伸手拿起茶几上的信封”，Narrator 写“它躺在木纹表面”。这是传播与固化。
- claim: 系统没有结构化 object owner/location 约束来表示 envelope 已离开房间。
  availability: `absent`
  artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/03-story-state.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/05-runtime-after.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/03-story-state.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/05-runtime-after.json`
  notes: runtime-after 搜索不到信封/茶几/物件位置状态；Choice 只能从 prose 与显著道具名推断可用性。
- claim: turn 24 Choice 继续输出拿起信封，并给出 invented actionId anchor:reread_envelope。
  availability: `present-clear`
  artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06-llm-calls.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06c-choice-prompt.md`
  notes: turn 24 prompt 中没有该 candidate actionId，说明 Choice 在已污染的可见上下文上自行构造了该 affordance。

competingPressures:
- 信封是刚揭示的高价值线索，Choice 模型倾向提供“查看/追问”这种玩家自然会想做的选项。
- turn 19 的 Director/剧本只强调“卡琳娜给出信封；德索洛离开”，没有把信封最终 owner/location 写成结构化状态。
- Choice prompt 只有自然语言流程“以本轮正文结尾为准”，没有对象可用性清单或 hard validation。
- turn 20 起的错误可见文本连续强化“信封在茶几上”，使 turn 24 的局部上下文看起来支持该选项。

## Causal Chain
- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/06-llm-calls.json call[2] choiceGenerator object / logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/04-output.json choices
- triggeringPressure: 信封作为刚出现的线索道具高度显著，Choice prompt 让模型生成贴近当前处境的普通行动；剧本/Director 用“给出信封”强调道具，却没有把“德索洛带走”变成可校验的 object state。
- missingGuard: 缺少 choice affordance gating：没有 envelope.owner/location、availableObjects 或 unavailableObjects；玩家选中无效选项后，Director 也没有重新验证动作是否可执行。
- mechanismStatement: 当 Choice 只从长正文 prose 里推断可互动道具、缺少结构化物件可用性与选中动作重验证时，显著线索物会被错误地当作仍在场，先生成无效选项，再被 Director/Narrator 实体化并传播到后续 turns。
- directCause: turn 19 Choice 在“德索洛带走信封”的同一轮结尾后仍提供“拿过信封看看”；turn 20 接受该选项并写成茶几上的信封。
- propagation: turn 20 玩家选择后，Narrator 把信封写在茶几上；turn 21 把信封放回茶几；turn 23 看向茶几上的信封；turn 24 Choice 继续提供“拿起信封再仔细看地址”。
- nonCauses:
  - 不是 turn 24 Choice 单点失误：到 turn 24 时 recent visible context 已被早先错误污染。
  - 不是长期 detail-memory 遗忘：冲突事实在 turn 19 同轮 Choice prompt 中清楚存在。
  - 不是玩家强行脱轨：玩家是在系统提供的“拿过信封看看”选项基础上行动。

## Root Cause
- label: `choice-affordance-state-gating`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 触发压力是信封作为新线索道具在 prose 中高显著；缺失防线是 Choice/Director 没有结构化 object availability 与 selected action revalidation；失败运动是 Choice 把已被德索洛带走的物件作为可拿选项，随后 Director/Narrator 将无效选项实体化，造成 turn 24 继续互动同一物件。
- fixSurface:
  - Choice generation: 从上一轮正文抽取 availableObjects/unavailableObjects，并按 owner/location gate 选项
  - selected action validation: 玩家选择涉及物件时，在 Director 前校验物件是否在当前 scene 可触达
  - statefold/writeback: 记录 envelope.owner=德索洛、location=outside/apartment-left，并在后续 prompt 中高优先级展示
  - Choice schema: 禁止模型发明未在 candidateActions 中存在的 actionId，普通选项也需通过 affordance check

## Evidence
- playerVisible: turn 19 玩家看到德索洛接过并带走信封；turn 20/21/23 又看到信封被重建在茶几上；turn 24 选项继续允许拿起信封看地址。
- internalTrace: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/06c-choice-prompt.md 在输出前包含“德索洛接过信封”“快步走了出去”，但 logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-19/06-llm-calls.json call[2] 输出“拿过信封看看”；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-20/06-llm-calls.json call[0] 把无效选择写成“伸手拿起茶几上的信封”；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-24/06-llm-calls.json call[2] 输出“拿起信封再仔细看一遍地址”。

## Recommended Fix Area
优先修复 Choice affordance gating 与 selected action revalidation：对被转移/离场/消耗的道具写入结构化 object state，并在 Choice 和 Director 前阻断不可触达物件选项。

## Confidence
`high`
