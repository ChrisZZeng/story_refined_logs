# Root Cause Report - issue-9-turn-16

## Problem

第 16 轮选项让玩家询问“卡琳娜她和德索洛是什么关系”，但截至该轮玩家可见内容尚未介绍德索洛。

## Validity

- issueValidity: `valid`
- verdictReason: 该选项把尚未玩家可见的角色名和人物关系提前变成可点击行动，构成真实的 unsupported-jump。
- playerVisibleSupport: visible-timeline.jsonl 中第 11-16 轮只出现门外未具名男子、费舍尔、凯旋门和敏特相关谈话；第 16 轮正文结尾仍停在卡琳娜判断“她喜欢你”，随后选项却出现“避开话题，反问卡琳娜她和德索洛是什么关系”。德索洛的正式可见登场在第 18 轮。
- caveats: 内部剧本和角色卡已经包含德索洛，但这些不是玩家可见证据，不能用来否定问题。

## Context Assessment

第 16 轮正文前后仍是卡琳娜公寓内关于敏特、战场经历和主角创伤的私人谈话。玩家知道门外曾有无名黑帮成员提到费舍尔和凯旋门，也知道卡琳娜有暗街权威；玩家尚不知道德索洛这个名字，也不知道他与卡琳娜的旧识/家人关系。

Relevant facts:
- `absent` 德索洛及其与卡琳娜的关系在第 16 轮前对玩家不可见。 Artifacts: logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-16/04-output.json. Notes: 第 16 轮 visibleText 和前几轮选择都未出现德索洛。
- `present-clear` Choice worker 被要求先以本轮正文结尾为准，并且不要提前泄露玩家尚未看到的信息。 Artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-16/06c-choice-prompt.md. Notes: 判断流程和输出前再次确认都明确要求以本轮玩家已经看到的正文为最终判断依据。
- `over-constraining` 未来 beat 02-03 和德索洛角色卡已经进入第 16 轮 choice prompt。 Artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-16/03-story-state.json, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-16/06c-choice-prompt.md. Notes: prompt 的“当前情节边界参考”是“推进节点 02-03：尊严换公道的交易”，并在“当前可见处境”里放入德索洛角色卡，包含“与卡琳娜的关系”。
- `stale` 运行时在可见交易发生前已经把 DeSolo 相关 anchor/beat 推进到后续节点。 Artifacts: logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-15/05-runtime-after.json, logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-16/03-story-state.json. Notes: turn-15 runtime-after 显示 currentBeatId 已变为 2-03，且 anchor “德索洛的倾诉”为 true；但玩家可见第 15、16 轮仍未出现德索洛。

Competing pressures:
- storyline 已提前切到德索洛交易 beat，强烈前景化后续事件。
- 德索洛角色卡把“旧识/家人关系”作为显著关系素材暴露给 Choice worker。
- 本轮可见正文只支持继续敏特谈话或询问已知门口事件，二者与隐藏 beat 发生冲突。

## Causal Chain

- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-16/03-story-state.json and logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-16/06c-choice-prompt.md`
- triggeringPressure: 运行时/故事线生命周期提前激活“推进节点 02-03：尊严换公道的交易”，并把德索洛完整角色卡放进 Choice worker 的当前处境上下文；该卡片包含德索洛与卡琳娜的关系，且比最近可见正文更像可用剧情素材。
- missingGuard: 缺少基于玩家可见实体的 option gate：Choice worker 没有一个可执行的“只能命名玩家已见过/已听过的人物”的结构化约束；storyline 激活也缺少“可见触发发生后才解锁后续 beat/角色卡”的生命周期校验。
- mechanismStatement: 未来 storyline beat 在可见触发前被解锁，并通过 prompt assembly 把未登场角色卡当成当前处境交给 Choice worker；由于缺少玩家可见实体过滤，Choice worker 将隐藏关系素材转换成了玩家选项。
- directCause: Choice generator 在 turn-16/06-llm-calls.json 的第三个调用中输出“避开话题，反问卡琳娜她和德索洛是什么关系”。
- propagation: 错误直接落入 turn-16/04-output.json 的 choices；玩家没有选择该选项，德索洛随后在第 18 轮才被正文正式介绍。
- nonCauses: 不是长期记忆缺失；信息不是被忘记，而是隐藏信息过早进入了当前选项上下文。；Narrator 本轮正文没有提前泄露德索洛，偏离发生在 choice handoff/choice 输出。；第 11 轮门外无名男子不构成德索洛的玩家可见来源。

## Root Cause

- label: `storyline-lifecycle`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 具体机制是 storyline beat 的可见触发与上下文解锁不同步：后续德索洛交易节点和角色卡在玩家尚未见到德索洛时已作为当前情节边界进入 Choice prompt；缺失的防线是玩家可见实体/已解锁 beat 过滤，导致 Choice worker 把隐藏角色关系转成可点击选项。
- fixSurface: `storyline beat activation/consumption guard`, `choice prompt context assembly visible-entity filter`, `choice output validator for unseen named entities`

## Evidence

- playerVisible: 第 16 轮正文仍是敏特话题；第 16 轮选项出现“德索洛”；visible-timeline 显示德索洛到第 18 轮才被卡琳娜叫出名字。
- internalTrace: turn-16/03-story-state.json 的 currentStoryline 已是 2-03；turn-16/06c-choice-prompt.md 把德索洛角色卡放在“当前可见处境”里；turn-15/05-runtime-after.json 已将 2-02 完成并把 currentBeatId 推到 2-03。

## Recommended Fix Area

优先修复 storyline 生命周期与 Choice prompt 的解锁边界：只有玩家可见触发已发生的 beat、角色名和关系才能进入选项可用素材；对输出选项做 unseen entity 检测。

## Confidence

`high`
