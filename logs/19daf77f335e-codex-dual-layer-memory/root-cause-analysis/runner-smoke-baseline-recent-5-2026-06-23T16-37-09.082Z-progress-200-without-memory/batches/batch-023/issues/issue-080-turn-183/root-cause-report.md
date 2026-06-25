# Root Cause Report: issue-80-turn-183

## Problem
- issueIndex: 80
- turn: 183
- problemSummary: 第二人称叙事中，turn 183 同段从“你把手伸进外套内袋”漂移到“它安静地躺在他内袋底部”，出现不应有的第三人称代词。

## Validity
- issueValidity: valid
- verdictReason: 全文叙述稳定使用第二人称“你/你的”，且本轮玩家输入也以主角摸内袋为行动核心；“他内袋”不是剧情事实变化，而是明显的代词/视角漂移，会破坏阅读连续性。
- playerVisibleSupport: turn 183 正文第一句写“你把手伸进外套内袋”，下一段写“它安静地躺在他内袋底部”；同轮其余句子继续使用“你”。
- caveats: 这是语言层面的低严重度问题，不改变银铃铛位置或剧情事实。

## Context Assessment
- actualStateBeforeIssue: 主角离开公园后在街道上停步检查环境，下一步选择伸手摸内袋里的银铃铛确认仍在。叙事视角一直是第二人称，主角=玩家=帕兹。
- relevantFacts:
  - 正文叙述应使用第二人称，正文中你=帕兹=玩家=主角。 availability=present-clear artifacts=logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-183/06a-director-prompt.md；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-183/06b-narrator-prompt.md notes=角色说明和写作规则明确要求以“你”写主角经历。
  - 本轮玩家输入和 Director requiredContent 都指向摸内袋里的银铃铛。 availability=present-clear artifacts=logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-183/06b-narrator-prompt.md；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-183/04-output.json notes=Director 输出 requiredContent：“主角伸手触摸内袋中的银铃铛，确认其存在。”
  - 没有其他男性第三人称角色参与本轮。 availability=present-clear artifacts=logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-183/03-story-state.json；logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-183/04-output.json notes=involvedCharacters 只有主角/帕兹，卡琳娜本轮不出场。
- competingPressures: Director JSON 使用“主角”第三人称概述动作；正文需要在短段内多次指代铃铛、内袋、肋侧；长 prompt 中角色资料大量使用第三人称“主角/帕兹”

## Causal Chain
- firstDivergenceArtifact: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-183/06-llm-calls.json#narrator-streamText
- triggeringPressure: Narrator 需要把 Director 的第三人称动作摘要转成第二人称感官正文；同一局部短语“内袋底部”附近存在主角/他/你等潜在代词竞争。
- missingGuard: 缺少输出后的视角一致性校验；prompt 有第二人称规则，但没有在生成后扫描“他/她 + 主角随身物”这类局部漂移。
- mechanismStatement: 在第二人称正文生成中，模型局部 token 选择把“你/外套内袋”误替为“他内袋”，而流水线没有 pronoun/perspective guard 在提交前拦截，导致单处语言漂移进入玩家可见文本。
- directCause: Narrator 输出“它安静地躺在他内袋底部”。
- propagation: 错误文本进入 04-output.json 的 narrative 和 turnContent write；events 中 narrator worker-done 后 Choice 继续生成选项，runtime-after 没有语言层校正。
- nonCauses: 不是剧情视角切换；本轮没有引入第三人称 focalizer。；不是隐藏身份线索；玩家可见上下文和 prompt 都指向第二人称主角。；不是 Choice 或 state writeback 导致；问题已经在 narrator 文本中出现。

## Root Cause
- label: model-local
- family: llm-self
- secondaryFamilies: agent-system
- description: 在清晰的第二人称约束下，Narrator 局部生成仍出现单个第三人称代词；系统缺少提交前的视角/代词一致性 lint，因此本可机械检测的语言漂移被提交。
- fixSurface: post-generation style lint: 检测第二人称模式下的 他/她 + 主角随身物 短语；Narrator prompt: 将 perspective contract 放到输出前检查清单；normalizer/evaluator: 对低成本代词替换给出自动修复或重试

## Evidence
- playerVisible: turn 183 同轮文本同时出现“你把手伸进外套内袋”和“他内袋底部”，其余叙述保持“你”。
- internalTrace: turn-183/06b-narrator-prompt.md 明确第二人称规则并给出玩家输入；turn-183/06-llm-calls.json 的 narrator streamText 首次产生“他内袋”；turn-183/04-output.json 和 07-events.json 证明该文本被直接提交。

## Recommended Fix Area
为 Narrator 输出增加 perspective/pronoun lint，尤其在第二人称叙事中拦截“他/她的/他内袋/他的手”等与主角随身物或动作绑定的第三人称片段。

## Confidence
high
