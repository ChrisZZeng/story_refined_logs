# Root Cause Report: issue-36-turn-84

## Problem
- issueId: `issue-36-turn-84`
- turn: `84`
- problemSummary: turn 84 玩家“从长椅上站起来”后，同一句仍写路灯光落在“你搁在膝盖上的手背上”，短暂保留了坐姿身体细节。

## Validity
- issueValidity: `valid`
- verdictReason: valid。玩家动作和叙述第一句明确是从长椅上站起；“手背搁在膝盖上”是坐在长椅时自然的姿态，紧接在站起之后出现，造成局部姿态连续性错误。
- playerVisibleSupport: visible-timeline turn 84 同一段：“你从长椅上站起来”与“你搁在膝盖上的手背”。
- caveats:
  - 该错误只持续一个短语，后文很快转为站立、捡外套和跟随离开，因此严重度低。

## Context Assessment
- actualStateBeforeIssue: turn 83 结束时主角、卡琳娜和卡尔仍在公园长椅场景中；turn 84 玩家选择站起来并提议回住处，这是从坐姿到离开公园的转场。
- relevantFacts:
  - claim: 玩家本轮核心动作是站起来。
    availability: `present-clear`
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/06a-director-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/04-output.json`
    notes: 玩家输入、Director beats、requiredContent 与正文开头都明确“站起来”。
  - claim: 最近几轮长期处于坐在长椅上的姿态，且多次使用“膝盖/手背/路灯光”身体描写。
    availability: `present-buried`
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/06a-director-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/06b-narrator-prompt.md`
    notes: prompt 的最近几轮中多处写“卡琳娜坐在长椅另一端”“手指在膝盖上”“光圈落在你搁在膝盖的手背上”。
  - claim: Director 要求本轮完成“站起->回应->离开公园”的动作序列。
    availability: `present-clear`
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/04-output.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/06-llm-calls.json`
    notes: Director output 的 beats 和 requiredContent 都把站起作为第一步。
  - claim: Narrator 没有收到“站起后不要继续使用坐姿 affordance”的硬约束或姿态状态更新。
    availability: `absent`
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/06b-narrator-prompt.md`
    notes: prompt 只有一般一致性规则和动作骨架，没有针对 body-state transition 的校验。
- competingPressures:
  - 新动作要求站起离开
  - 最近上下文反复强化坐姿和膝盖细节
  - Narrator 风格倾向复用感官光影句式
  - 本轮需要以温馨收束，容易使用柔和静态画面

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/06-llm-calls.json (Narrator streamText) / logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-84/04-output.json`
- triggeringPressure: Narrator prompt 中最近几轮坐姿描写非常密集，特别是 turn 79 曾有“光圈落在你搁在膝盖的手背上”的近似句式；本轮又要求感官细节优先。
- missingGuard: 缺少 posture transition anchor：站起动作没有转化为“玩家不再处于手搁膝盖的坐姿”的硬约束，也没有生成后同段身体姿态矛盾检查。
- mechanismStatement: 新动作“站起来”虽清晰，但旧坐姿感官短语在 recent context 中高频且高可复用，Narrator 在同一句内先执行站起动作、随后复用 seated-body detail，系统没有 posture-state 优先级或验证器拦截。
- directCause: turn 84 首段把“你从长椅上站起来”与“你搁在膝盖上的手背”并置。
- propagation: 错误仅局限于首段短语；后续写到卡琳娜站起、卡尔跳下、你弯腰捡外套并离开公园，姿态恢复正确。
- nonCauses:
  - 不是 story memory 缺失；相关动作在本轮 prompt 中清楚存在。
  - 不是玩家输入含混；“站起来”是明确物理动作。

## Root Cause
- label: `context-priority`
- family: `recent-context`
- secondaryFamilies: `llm-self`
- description: Narrator 没有把当前回合的新 posture action 置于旧坐姿描写之上；高近因的 seated sensory motif 压过了同句内的站起状态，缺少 body-state transition guard 让局部模型复用错误姿态短语。
- fixSurface:
  - Narrator prompt posture-state transition rules
  - short-horizon body affordance checker after generation
  - state representation for player/NPC posture in current scene
  - style phrase reuse guard when an action changes posture/location

## Evidence
- playerVisible: turn 84 首段同时出现“你从长椅上站起来”和“你搁在膝盖上的手背”。
- internalTrace: turn-84 Director output 明确 beats “主角站起来，提议回住处”；turn-84 Narrator prompt 的 recent turns 包含多个坐姿/膝盖短语；turn-84 Narrator raw output 复用该坐姿 affordance。

## Recommended Fix Area
优先增加短程姿态状态锚点：当本轮动作改变坐/站/走等 body state 时，Narrator 和后置检查必须让新姿态覆盖旧描述模板。

## Confidence
`medium`

## Output Files
- JSON: `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-36-turn-84/root-cause-result.json`
- Markdown: `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-36-turn-84/root-cause-report.md`
