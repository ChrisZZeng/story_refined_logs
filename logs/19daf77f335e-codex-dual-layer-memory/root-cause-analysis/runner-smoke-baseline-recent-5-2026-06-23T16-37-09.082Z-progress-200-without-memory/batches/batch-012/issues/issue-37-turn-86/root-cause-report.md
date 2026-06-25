# Root Cause Report: issue-37-turn-86

## Problem
- issueId: `issue-37-turn-86`
- turn: `86`
- problemSummary: turn 85 玩家选择“问她今晚打算住哪里”，turn 86 却把问题写成“今晚——我住哪里？”，将询问对象从卡琳娜的住处/安排改成了玩家自己的住宿。

## Validity
- issueValidity: `valid`
- verdictReason: valid。turn 85 选项文本显式包含“她”，核心意图是问卡琳娜今晚打算住哪里；turn 86 可见正文改写为第一人称“我住哪里”，并让卡琳娜回答“你今晚不用住这里”，从而替换了玩家问题目标。
- playerVisibleSupport: visible-timeline turn 85 choices: “问她今晚打算住哪里”；visible-timeline turn 86 visibleText: “今晚——我住哪里？”、“你今晚不用住这里”。
- caveats:
  - 在“住宿安排”语境里，玩家也可能关心自己住哪；但当前选项的代词“她”明确指向卡琳娜，且输出没有先回答她的安排，而是直接锁定玩家住宿，因此仍是有效的 core intent replacement。

## Context Assessment
- actualStateBeforeIssue: turn 85 三人从公园回到卡尔小屋门前；卡琳娜开门并站在门口等玩家决定是否进去。玩家选择询问她今晚打算住哪里。
- relevantFacts:
  - claim: 玩家输入的目标是“她”今晚打算住哪里。
    availability: `present-clear`
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/06a-director-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/04-output.json`
    notes: turn 86 prompt 的“玩家输入”字段原样是“问她今晚打算住哪里”。
  - claim: 当前 storyline followup 强推“卡琳娜邀请主角前去她真正的家”。
    availability: `over-constraining`
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/03-story-state.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/06a-director-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/06b-narrator-prompt.md`
    notes: prompt 中“玩家行动后的情节承接方式”明确写当态度值>=2，卡琳娜邀请主角去真正的家。
  - claim: Director handoff 将玩家输入软化为“询问住宿安排/今晚住哪里”，没有保留问句目标“她”。
    availability: `present-ambiguous`
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/06-llm-calls.json`
    notes: Director summary 写“卡琳娜今晚的住宿安排”，但 beats 只写“主角询问今晚住哪里”，requiredContent 则变成邀请主角去真正的家。
  - claim: Narrator 被要求不要改变 Director 已确定的剧情方向。
    availability: `present-clear`
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/06b-narrator-prompt.md`
    notes: 一旦 Director 绑定为邀请主角去真正的家，Narrator 很难再恢复原始“问她”的目标。
- competingPressures:
  - 玩家选项的代词目标：询问卡琳娜本人
  - storyline followup：卡琳娜邀请主角去真正的家
  - 小屋门口情境自然联想到玩家是否进屋/住下
  - Director 输出的 requiredContent 比原始问句更强

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/06-llm-calls.json (Director generateObject) / logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-86/04-output.json`
- triggeringPressure: active storyline 的 interactionFollowup 明确要求卡琳娜邀请主角去“真正的家”，而当前场景又在小屋门口，容易把“今晚住哪里”解释为主角自己的住宿承接。
- missingGuard: 缺少 choice-action-binding guard：自由文本选项中的核心参数 target=卡琳娜/ask about her lodging 没有被结构化保留为 must-satisfy contract，Director 可在固定 beat 压力下改写问句目标。
- mechanismStatement: 选项文本的代词目标没有被绑定进 Director schema；在“邀请主角去真正的家”的 storyline followup 过强时，Director 把“问她今晚打算住哪里”软化为“询问今晚住哪里/住宿安排”，Narrator 继而自然写成“我住哪里”，使玩家的核心询问对象被替换。
- directCause: Director 输出 beats “主角询问今晚住哪里”并把 requiredContent 设为“卡琳娜邀请主角去真正的家”；Narrator 按这个 handoff 写出“今晚——我住哪里？”
- propagation: turn 86 可见正文和后续 choices 都进入“跟上卡琳娜去真正的家”的路径，玩家没有得到关于卡琳娜今晚住在哪里的回答。
- nonCauses:
  - 不是隐藏设定揭示问题；玩家可见选项和正文已足够确认目标反转。
  - 不是 Choice UI 原文本错误；错误发生在 turn 86 Director 对该文本的语义绑定。
  - 不是 Narrator 独自发挥；Narrator 主要执行了 Director 已偏移的 requiredContent。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 自由文本选择没有被解析成带 target/subject 的行动合约，导致 storyline fixed followup“邀请主角去真正的家”覆盖了玩家原本询问“她今晚住哪里”的核心意图；Director 的 handoff 丢失代词目标后，Narrator 将问题反写为玩家自己的住宿。
- fixSurface:
  - choice schema/action parser with target and askSubject fields
  - Director must-satisfy player intent contract before applying storyline followup
  - fixed beat adapter that answers/bridges selected question before advancing invitation beat
  - regression tests for pronoun-target preservation in Chinese choices

## Evidence
- playerVisible: turn 85 option “问她今晚打算住哪里” -> turn 86 spoken line “今晚——我住哪里？” and Karina response “你今晚不用住这里”。
- internalTrace: turn-86/06a-director-prompt.md contains the exact player input, but Director output changes it to broad “住宿安排/今晚住哪里” and hard requiredContent “卡琳娜邀请主角去真正的家”；turn-86/06b-narrator-prompt.md then instructs Narrator to follow that Director arrangement. 

## Recommended Fix Area
优先修复 selected choice 到 Director 的 action binding：把代词目标和询问对象结构化，并要求固定剧情 beat 在满足核心玩家问题后才能推进。

## Confidence
`high`

## Output Files
- JSON: `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-37-turn-86/root-cause-result.json`
- Markdown: `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-37-turn-86/root-cause-report.md`
