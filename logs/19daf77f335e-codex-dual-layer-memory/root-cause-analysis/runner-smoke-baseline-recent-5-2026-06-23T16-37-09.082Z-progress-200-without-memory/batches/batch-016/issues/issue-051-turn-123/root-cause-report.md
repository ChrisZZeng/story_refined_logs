# Root Cause Report: issue-051-turn-123

## Problem

turn 123 的选项“翻看相机里昨晚拍的照片”把尼康 FM2 胶片相机当成可以直接回看照片的设备。

## Validity

- issueValidity: `valid`
- verdictReason: valid。玩家可见文本已建立主角使用的是尼康 FM2 和胶卷：turn 111 写“卷只拍了不到一半”、备用胶卷为 Tri-X/HP5；turn 120 写成像是“银盐颗粒上一组不可逆的化学反应”。在没有冲洗、显影或打印的情况下，不能“翻看相机里”的照片。
- playerVisibleSupport: visible-timeline.jsonl:turn-111、turn-120、turn-123；turn 123 choices 出现“翻看相机里昨晚拍的照片”。
- caveats: 如果选项说的是翻看已冲洗的实体照片，可能可解释；但“相机里”把照片位置绑定到相机内部，且当前相机是胶片机，因此仍成立。

## Context Assessment

- actualStateBeforeIssue: 主角在等待卡琳娜消息，刚检查完银色铃铛并坐回壁炉边。相机仍是挂在胸前的尼康 FM2；之前拍摄的画面在胶卷/银盐颗粒上，玩家没有看到任何冲洗、取卷或取得照片的过程。
- relevantFacts:
  - `present-clear` 相机是尼康 FM2，使用胶卷；备用胶卷为 Tri-X 和 HP5。 Artifacts: `visible-timeline.jsonl:turn-111`, `turn-111/04-output.json`. Notes: 这是玩家可见的设备设定，但 turn 123 Choice prompt 的结构化 curStates 没有保留成 equipment capability。
  - `present-clear` turn 120 刚拍的画面被描述为银盐颗粒上的化学反应，不能即时回看。 Artifacts: `visible-timeline.jsonl:turn-120`, `turn-123/06c-choice-prompt.md`, `turn-123/03-story-state.json`. Notes: 在 Choice prompt 中作为 recentTurns prose 出现，但只是叙述文本中的一句，不是硬性 affordance 约束。
  - `present-clear` turn 123 本轮正文只检查银色铃铛，没有冲洗胶卷或取得照片。 Artifacts: `visible-timeline.jsonl:turn-123`, `turn-123/04-output.json`, `turn-123/06c-choice-prompt.md`. Notes: Choice generator 应以本轮正文结尾为准，当前可做的是等待、走动、检查现实物件，而不是回看未冲洗影像。
  - `absent` Choice prompt/curStates 未提供“胶片相机不能即时回看照片”的行动约束。 Artifacts: `turn-123/06c-choice-prompt.md`, `turn-123/03-story-state.json`, `turn-123/02-script-state.json`. Notes: 角色 persona 反而高频出现“照片”和“观察取证：拿出相机”，形成相机/照片动作的联想压力。
- competingPressures: 当前剧情处于等待状态，Choice generator 需要生成 2-4 个普通行动选项。；主角 persona 强调战地记者、照片、观察取证和相机。；没有剧本候选动作时，prompt 要求生成贴近当前处境的普通行动，容易从“相机/照片”主题联想出回看动作。

## Causal Chain

- firstDivergenceArtifact: turn-123/06c-choice-prompt.md assistant output / turn-123/06-llm-calls.json call[2], persisted in turn-123/04-output.json choices
- triggeringPressure: Choice generator 面对静态等待场景需要补足普通行动；prompt 中主角 persona 与 recentTurns 都反复出现相机、照片和拍摄主题。
- missingGuard: 缺少 equipment affordance guard：没有把“尼康 FM2/胶卷/银盐成像/未冲洗”转成不可选择“翻看相机里的照片”的硬约束，也没有选项级物理可行性校验。
- mechanismStatement: 当普通选项生成被相机/照片主题吸引时，Choice generator 没有设备能力约束来区分胶片相机与可即时回看的数码相机，于是把“照片”绑定成“相机里可翻看”的可选行动。
- directCause: 选项生成阶段把主题相关动作误绑定为当前可执行动作，未校验胶片摄影的物理规则。
- propagation: 错误作为 turn 123 choices 对玩家可见；玩家下一轮未选择该选项，因此没有通过 Narrator 正文或 state-writeback 固化。
- nonCauses: 不是 Director 或 Narrator 本轮正文错误；turn 123 正文只检查铃铛。；不是隐藏设定导致；玩家可见文本已经足够证明胶片规则。；不是长期 meta-memory 问题；turn 120 的银盐描述就在 Choice prompt recentTurns 中。

## Root Cause

- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: Choice generator 的 action binding 只按主题相关性生成“相机/照片”动作，没有从 recent visible prose 和设备设定中抽取胶片相机的 affordance constraint；缺失的选项可行性守卫允许它把未冲洗胶卷误当成可翻看的相机内照片。
- fixSurface: `Choice prompt: equipment affordance constraints`, `choice validator: impossible-action filter`, `story state: persisted camera type and film-development status`

## Evidence

- playerVisible: turn 111 建立“尼康FM2”“卷只拍了不到一半”“三卷Tri-X、一盒HP5”；turn 120 建立“银盐颗粒上一组不可逆的化学反应”；turn 123 选项写“翻看相机里昨晚拍的照片”。
- internalTrace: turn-123/06c-choice-prompt.md 的 system 只要求生成可点击行动；recentTurns 中有 turn 120 的银盐描述，但没有显式禁止即时回看的规则；turn-123/03-story-state.json 的 curStates 没有 FM2/胶卷/显影状态。
- tracePacket: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-016/issues/issue-051-turn-123/trace-packet.json`

## Recommended Fix Area

在 Choice generator 前增加 equipment/action affordance 层，把胶片相机状态持久化为“canShoot=true, canReview=false until developed”，并在选项提交前过滤违反物理规则的 action text。

## Confidence

`high`
