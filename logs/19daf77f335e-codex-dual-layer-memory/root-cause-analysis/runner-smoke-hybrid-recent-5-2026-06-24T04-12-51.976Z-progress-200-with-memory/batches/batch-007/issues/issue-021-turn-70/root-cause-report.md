# Root Cause Report: issue-21-turn-70

## Problem
第70轮正文和选项把此前玩家只明确见到为“黑猫”的在场动物直接称作“卡尔”，并把“卡尔”当成可等待加入对话的对象；这把先前像暗街权威/创设者的人物名与黑猫无桥接地绑定在一起。

## Validity
- issueValidity: `valid`
- verdictReason: 该 issue 有效。玩家可见文本在第2、42、60、65轮将卡尔作为暗街秩序源头、把房间交给卡琳娜或带她来这里的人物处理；第69轮仍只把在场动物称为黑猫。第70轮突然用“卡尔有时候会在这个时间醒过来”“它晚上不怎么睡”并让选项写“看向卡尔”，缺少显式揭示或过渡。
- playerVisibleSupport: visible-timeline.jsonl 中第69轮黑猫在卡琳娜脚边合眼；第70轮黑猫跳到沙发另一头后，卡琳娜直接说“卡尔有时候会在这个时间醒过来”“它说——它在想事情”，正文再写她看向黑猫，选项也直接使用“卡尔”。早前第2轮称“卡尔大人……创建暗街秩序”，第42/60/65轮把卡尔作为影响卡琳娜过去的人物。
- caveats:
- 第42、60、65轮多次把黑猫动作放在提及卡尔的附近，存在伏笔效果；因此问题不是绝对矛盾，而是玩家可见身份桥接不足。

## Context Assessment
- actualStateBeforeIssue: 第69轮结束时，玩家看到的是卡琳娜与主角在真正的家里安静共处；黑猫从沙发扶手跳下，到卡琳娜脚边坐下并合眼。玩家尚未被明确告知黑猫名叫卡尔或卡尔就是这只猫。
- relevantFacts:
- 玩家可见层面，当前在场动物在第69轮仍主要被称为黑猫。 availability=present-clear artifacts=/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl, /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-69/04-output.json notes=该事实在最近一轮正文中直接出现，应当是第70轮称谓转换的优先锚点。
- 玩家可见层面，卡尔此前被塑造成暗街秩序源头/把房间交给卡琳娜/带卡琳娜来这里的重要存在。 availability=present-clear artifacts=/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl notes=第2、42、60、65轮提供的是人物/权威印象，而不是猫名确认。
- 内部角色卡明确卡尔是黑色短毛母猫、暗街真正秩序源头。 availability=present-clear artifacts=/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-70/06a-director-prompt.md, /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-70/06c-choice-prompt.md notes=这是内部设定，不等同于玩家已知事实；但它在提示中以角色资料形式强可见。
- 当前 storyline 推动“阶段六情感铺垫，引向后续卡尔对话”。 availability=over-constraining artifacts=/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-70/03-story-state.json, /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-70/06a-director-prompt.md notes=该压力要求把卡尔带入互动，但没有说明如何把玩家可见的黑猫与卡尔身份自然连接。
- 信息边界要求不从角色资料自行解锁新事实、不揭示核心秘密。 availability=present-ambiguous artifacts=/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-70/06a-director-prompt.md, /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-70/06b-narrator-prompt.md notes=原则存在，但没有把“卡尔=黑猫”作为需玩家可见揭示/桥接的身份关系来约束。
- competingPressures:
- storyline 要求引向卡尔对话
- 角色卡把卡尔定义为黑色短毛母猫
- 最近可见文本仍用黑猫泛称
- 不揭示核心秘密的约束只覆盖秘密内容，没有覆盖别名可见性
- 温馨慢铺节奏鼓励用日常动作替代解释

## Causal Chain
- firstDivergenceArtifact: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-70/06-llm-calls.json call[0] Director output`
- triggeringPressure: Director prompt 中内部角色卡明确“卡尔——黑色短毛母猫”，currentStoryline 又要求“阶段六情感铺垫，引向后续卡尔对话”；Director 因此输出 involvedCharacters=卡尔，并把 requiredContent 写成“卡尔以猫形态出现并简短发言”。
- missingGuard: 缺少 player-visible entity alias/identity contract：系统没有要求在玩家尚未明确知道“黑猫=卡尔”时必须先桥接、迟延称名或用卡琳娜的解释把身份关系显式落地。
- mechanismStatement: 内部角色卡和 storyline 把“卡尔=黑猫”作为可用事实强推给 Director，但缺少玩家可见别名揭示边界，导致 Director/Narrator/Choice 把隐藏身份当作已建立称谓直接写进正文和选项。
- directCause: Director 把卡尔的猫形态作为本轮必须呈现内容，Narrator 据此让卡琳娜直接以卡尔称呼黑猫，Choice 继续生成“看向卡尔”等选项。
- propagation: turn-70/04-output.json 固化了正文里的称谓转换；turn-70/06-llm-calls.json call[2] Choice output 又在玩家选项中继续使用“卡尔”，使该身份绑定成为后续交互默认前提。
- nonCauses:
- 不是缺少卡尔设定；内部设定反而过早、过强地进入生成。
- 不是纯 Narrator 局部幻觉；Director requiredContent 已把“卡尔以猫形态”交给 Narrator。
- 不是评测只依赖隐藏信息；玩家可见文本自身显示了称谓桥接不足。

## Root Cause
- label: `entity-alias-visibility-contract`
- family: `agent-system`
- secondaryFamilies: ["recent-context"]
- description: 内部角色资料中的实体别名/真实身份被上下游当作玩家已知称谓使用；触发压力是 storyline 要求进入卡尔互动且角色卡明确卡尔为黑猫，缺失防线是没有 player-visible identity/alias 状态与揭示桥接规则，失败运动是 Director 把隐藏身份写成 requiredContent，Narrator 与 Choice 再直接对玩家输出“卡尔=黑猫”的称谓。
- fixSurface: Director prompt 的 player-visible knowledge boundary, entity alias/state schema：区分 canonicalIdentity、playerVisibleName、revealedAliases, Choice prompt：生成选项前校验称谓是否已玩家可见, Narrator instructions：身份首次显式绑定必须桥接或延迟

## Evidence
- playerVisible: 第70轮：“卡尔有时候会在这个时间醒过来”“它晚上不怎么睡”，随后看向“沙发那头闭着眼睛的黑猫”；选项为“顺着她的话，看向卡尔，等它加入”。第69轮仍称“黑猫”。早前第2/42/60/65轮把卡尔作为重要存在，而非明确猫名。
- internalTrace: turn-70/06a-director-prompt.md 的角色卡写“卡尔：黑色短毛母猫”；turn-70/06-llm-calls.json call[0] 输出 requiredContent: “卡尔以猫形态出现并简短发言”；call[1] 正文执行称谓绑定；call[2] 选项继续使用“卡尔”。

## Recommended Fix Area
为角色/实体增加 player-visible alias reveal 状态，并在 Director 和 Choice 生成时强制检查：未被玩家显式确认的 canonical identity 不得直接作为玩家选项或旁白称谓；需要输出桥接句、继续使用泛称，或等待剧情正式揭示。

## Confidence
`medium`
