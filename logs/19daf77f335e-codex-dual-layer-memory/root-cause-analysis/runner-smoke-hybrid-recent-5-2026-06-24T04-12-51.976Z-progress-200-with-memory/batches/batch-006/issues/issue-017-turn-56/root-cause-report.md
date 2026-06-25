# issue-17-turn-56 Root Cause Report

## Problem

- issueId: `issue-17-turn-56`
- turn: `56`
- problemSummary: 第 56 轮 choices 中出现“她也在沙发上坐下，等你自己开口说想说的话”，把玩家选项写成直接安排卡琳娜行动，并与同轮正文“卡琳娜没有坐下来”冲突。

## Validity

- issueValidity: `valid`
- verdictReason: valid。玩家可见正文刚明确卡琳娜仍倚靠桌沿、没有坐下；同轮选项却让玩家选择“她也在沙发上坐下”，既控制了 NPC 动作，也把 NPC 姿态改成与正文相反。
- playerVisibleSupport: visible-timeline.jsonl turn 56 显示：玩家输入“在沙发上坐下”后，正文写玩家坐进沙发凹陷，随后写“卡琳娜没有坐下来。她仍然倚靠在桌沿”；同轮 choices 第 4 项为“她也在沙发上坐下，等你自己开口说想说的话”。
- caveats:
  - 这是低严重度选项质量问题；该选项未在下一轮被玩家选择，因此没有继续固化为后续剧情。
  - 如果选项改写成“安静等她是否坐下/继续说”，可能是合理玩家行动；问题在当前文本直接决定了 NPC 的动作和等待状态。

## Context Assessment

- actualStateBeforeIssue: 玩家已经在卡琳娜真正的家中坐到深棕色皮质沙发上；黑猫仍在沙发扶手附近；卡琳娜没有坐下，而是倚靠旧木桌边，继续围绕晚宴“演角色”的话题与玩家对话。
- relevantFacts:
  - `present-clear` 玩家已坐在沙发上，这是本轮玩家输入和正文完成的核心动作。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl turn 56`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-56/04-output.json`
    notes: 正文开头明确“你绕过沙发的扶手边缘，在那道被坐压了太多次的凹陷里坐下来”。
  - `present-clear` 卡琳娜没有坐下，仍倚靠桌沿。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl turn 56`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-56/04-output.json`
    notes: 同轮正文直接写出“卡琳娜没有坐下来。她仍然倚靠在桌沿”。
  - `present-clear` Choice worker 收到的最终判断依据中包含上述当前正文。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-56/06c-choice-prompt.md lines 469-482`
    notes: choice prompt 的“本轮玩家已经看到的正文”完整保留了玩家坐下和卡琳娜未坐下的状态。
  - `present-clear` 玩家选项应是玩家下一步可主动选择的行动，而不是直接替 NPC 执行动作。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-56/06c-choice-prompt.md lines 11-27`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-56/06-llm-calls.json call 2`
    notes: Choice system/prompt 写明“只生成玩家下一步可以主动选择的行动”和“选项必须站在玩家视角”，但该约束没有被输出验证。
  - `absent` 结构化 runtime 没有可供 Choice worker 校验的卡琳娜/玩家姿态字段。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-56/05-runtime-after.json`
    notes: runtime-after 主要保留 worldState/entityStates/internal，没有把“玩家已坐下、卡琳娜未坐下”作为可机检姿态状态。
- competingPressures:
  - Director summary 强调“双方进入更放松的交流状态”，容易诱导生成一个安静共处选项。
  - 场景中反复出现沙发、坐下、放松等意象，Choice worker 需要补足 2-4 个可选方向。
  - 玩家与卡琳娜的亲密氛围提供了“等待对方开口”的普通行动压力，但没有授权玩家决定卡琳娜是否坐下。

## Causal Chain

- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-56/06-llm-calls.json call 2 / turn-56/07-events.json choiceGenerator worker-done`
- triggeringPressure: Choice worker 在一个安静、放松、围绕沙发的场景中需要生成普通后续选项；“共同坐下、等待开口”是符合氛围的场面形状，但它把场面愿望写成了 NPC 主语动作。
- missingGuard: 缺少对选项主语和行动控制权的硬校验：选项可以描述玩家“等待/邀请/示意”，但不能直接宣告 NPC 已执行动作；同时缺少对当前姿态冲突的机检。
- mechanismStatement: 当 Choice worker 只用宽泛的“玩家视角”提示而没有 subject/precondition validator 时，它会把放松共处的目标场面直接写成“她也坐下”的 NPC 动作，且没有把当前正文中“卡琳娜没有坐下”的姿态作为不可违反约束拦截。
- directCause: Choice LLM 生成了第 4 个 option：“她也在沙发上坐下，等你自己开口说想说的话”。
- propagation: 该文本进入 `turn-56/04-output.json choices` 和 visible timeline；玩家下一轮选择了其他选项，因此错误没有继续写入 state。
- nonCauses:
  - Narrator 不是主因；Narrator 正文正确写明卡琳娜没有坐下。
  - Director 不是主因；Director 只安排玩家坐下与氛围放松，没有要求卡琳娜坐到沙发。
  - 不是长期记忆缺失；冲突事实就在同轮正文和 Choice prompt 中。

## Root Cause

- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: none
- description: Choice 生成/绑定缺少“玩家可控制动作”与“当前姿态 precondition”的硬约束；在沙发和放松共处的场景压力下，模型把普通等待选项误写为 NPC 已坐下并等待玩家开口，违反了同轮正文刚建立的 NPC 姿态。
- fixSurface:
  - `choiceGenerator subject-control validator`
  - `choice option precondition checker`
  - `current-scene posture anchor for Choice prompt`

## Evidence

- playerVisible: turn 56 正文先写玩家坐下、卡琳娜未坐下且倚靠桌沿；同轮 choices 第 4 项却写“她也在沙发上坐下”。
- internalTrace: `turn-56/06c-choice-prompt.md` lines 469-482 把该正文作为最终判断依据；`turn-56/06-llm-calls.json` call 2 和 `turn-56/07-events.json` choiceGenerator worker-done 首次出现问题选项；`turn-56/04-output.json` 发布该选项。

## Recommended Fix Area

优先修复 Choice 选项生成与后处理：为 option 增加 subject/action controllability 检查，禁止“她/他/他们 + 直接动作完成”这类替 NPC 决策的玩家选项，并用最近正文抽取的姿态 precondition 做冲突过滤。

## Confidence

`high`
