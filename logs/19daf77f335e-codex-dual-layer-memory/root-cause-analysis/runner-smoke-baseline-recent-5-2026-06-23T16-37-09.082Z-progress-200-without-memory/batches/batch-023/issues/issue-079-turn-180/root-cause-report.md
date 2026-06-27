# Root Cause Report: issue-79-turn-180

## Problem
- issueIndex: 79
- turn: 180
- problemSummary: turn 180 正文刚明确胶片影像无法即时查看，Choice 却提供“检查一下刚才拍的照片效果如何”，与胶片相机的当前可见设备规则冲突。

## Validity
- issueValidity: valid
- verdictReason: 玩家可见正文直接说“当然，你无法看到胶片上的影像”，因此下一步选项不能要求立即检查照片效果。该选项会把玩家引向当前设备不可执行的行为。
- playerVisibleSupport: turn 180 正文写过片拨杆、胶片上的影像无法看到；turn 160 已展示备用胶卷，且多轮提到卷片/过片拨杆，说明这是胶片相机而非可即时预览的数码设备。
- caveats: 如果选项改写为检查相机设置或回想构图效果，就可以成立；但原文“照片效果如何”通常表示查看成片。

## Context Assessment
- actualStateBeforeIssue: 主角在公园长椅等待，拿出胶片相机拍下晨光中的公园。拍摄后正文明确相机过片、快门归位，并说明无法看到胶片影像，只能知道影像已经被固定在胶片上。
- relevantFacts:
  - 当前设备是胶片相机，拍摄后不能即时看到影像。 availability=present-clear artifacts=logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-180/06c-choice-prompt.md notes=Choice prompt 的“本轮玩家已经看到的正文”直接包含“当然，你无法看到胶片上的影像”。
  - 本轮选择生成器必须以正文结尾为最终判断依据，判断合理可做动作。 availability=present-clear artifacts=logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-180/06c-choice-prompt.md notes=choice prompt 的输出前确认要求先以本轮正文结尾判断玩家能合理做什么。
  - 历史/story state 中存在“检查相机刚才拍摄的一帧效果如何”的旧摘要，弱化了胶片限制。 availability=present-buried artifacts=logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-180/03-story-state.json；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-180/06c-choice-prompt.md notes=该历史摘要在长 currentStoryline summary 和 prompt 早段出现，可能给 choiceGenerator 一个错误先例；但它应低于本轮可见正文。
- competingPressures: 刚完成拍摄，常见后续动作是检查照片；角色画像强调观察取证与照片；长历史摘要中已有一次“检查刚拍的一帧效果”的表述；choiceGenerator 被要求生成 2-4 个贴近当前处境的行动

## Causal Chain
- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-180/06-llm-calls.json#choiceGenerator-generateObject
- triggeringPressure: 拍照动作刚完成，prompt 中角色/历史材料频繁出现照片与相机，且旧 storyline summary 曾把“检查刚拍的一帧效果”当成正常动作。
- missingGuard: Choice 生成阶段没有设备 affordance validator，也没有把“无法看到胶片影像”转换成硬性 negative affordance；prompt 只泛化地要求合理和不违反约束。
- mechanismStatement: 在拍照后选项生成中，通用“检查照片”动作和旧摘要压力没有被当前胶片负能力覆盖，choiceGenerator 生成了与本轮可见设备规则冲突的选项，并且还在 LLM call object 中绑定了 hallucinated `anchor:check_photo`。
- directCause: ChoiceGenerator 输出“检查一下刚才拍的照片效果如何”。
- propagation: 该选项进入 04-output.json 的 choices，成为玩家下一步可点击行动；events 记录 choiceGenerator worker-done 后直接 committed，没有后置校验剔除。
- nonCauses: 不是 Narrator 正文错误；正文明确写了无法看到胶片影像。；不是玩家要求检查照片；玩家输入是拍下公园。；不是缺少可见世界规则；世界规则就在本轮可见正文中。

## Root Cause
- label: choice-action-binding
- family: agent-system
- secondaryFamilies: llm-self
- description: Choice 生成缺少对当前可见负能力的硬过滤：当本轮正文声明胶片不可预览时，系统没有把该约束绑定到可选行动空间，导致模型把拍照后的通用“检查效果”动作当作可点击选项，并生成未在 prompt 中铺垫的 `anchor:check_photo`。
- fixSurface: choiceGenerator prompt/schema: 增加 negative affordance 和 world-rule checklist；post-choice validator: 检查选项是否与本轮正文中的 cannot/无法/不能 约束冲突；actionId binding: 禁止生成未在候选动作中出现的 anchor/actionId

## Evidence
- playerVisible: turn 180 正文：“当然，你无法看到胶片上的影像”；同轮选项：“检查一下刚才拍的照片效果如何”。turn 160 可见备用胶卷，后续多处可见过片/卷片。
- internalTrace: turn-180/06c-choice-prompt.md 将无法看到胶片影像放入最终判断依据；turn-180/06-llm-calls.json 第三个 generateObject 输出包含该选项和 `anchor:check_photo`；turn-180/07-events.json 记录 choiceGenerator worker-done 后 committed。

## Recommended Fix Area
修复 Choice 层的 action affordance 约束：从本轮正文提取不可做事项，并在选项生成后进行冲突校验；同时禁止未提供候选的 actionId/anchor 幻觉。

## Confidence
high
