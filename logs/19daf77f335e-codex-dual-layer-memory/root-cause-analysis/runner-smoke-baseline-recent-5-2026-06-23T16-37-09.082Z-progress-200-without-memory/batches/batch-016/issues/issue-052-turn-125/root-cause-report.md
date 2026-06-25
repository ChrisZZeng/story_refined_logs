# Root Cause Report: issue-052-turn-125

## Problem

turn 125 的选项“拿起相机翻翻刚才拍的那张照片”继续把刚拍在胶卷上的画面当成可以即时翻看的照片。

## Validity

- issueValidity: `valid`
- verdictReason: valid。turn 120 明确刚拍下的画面变成“银盐颗粒上一组不可逆的化学反应”，且相机为尼康 FM2 胶片机；到 turn 125 之间玩家只检查门锁、拉开窗帘、检查铃铛、倒水和喝水，没有任何显影/冲洗/打印过程。选项要求翻看“刚才拍的那张照片”直接违反胶片摄影设定。
- playerVisibleSupport: visible-timeline.jsonl:turn-120 建立胶片成像；turn 121-125 的玩家可见行动没有冲洗流程；turn 125 choices 出现“拿起相机翻翻刚才拍的那张照片”。
- caveats: 该选项未被玩家选择，因此冲突停留在 choices 层；但 choices 本身是玩家可见输出，仍为有效一致性问题。

## Context Assessment

- actualStateBeforeIssue: 主角坐在壁炉边，刚把搪瓷杯放回地砖，仍在等待卡琳娜消息。相机挂在胸前；刚才拍摄的照片尚在胶卷上，没有经过显影。
- relevantFacts:
  - `present-clear` turn 120 的照片是胶片/银盐成像，不可即时翻看。 Artifacts: `visible-timeline.jsonl:turn-120`, `turn-125/06c-choice-prompt.md`, `turn-125/03-story-state.json`. Notes: 这条信息在 turn 125 Choice prompt 的最近几轮玩家经历开头直接出现，但没有被转化为选项约束。
  - `present-clear` turn 121-125 没有冲洗、取卷、显影或拿到照片。 Artifacts: `visible-timeline.jsonl:turn-121`, `visible-timeline.jsonl:turn-122`, `visible-timeline.jsonl:turn-123`, `visible-timeline.jsonl:turn-124`, `visible-timeline.jsonl:turn-125`. Notes: 中间所有可见行动都是等待、检查门锁/窗帘/铃铛/喝水。
  - `present-clear` 相机仍在主角身上，容易成为普通后续动作来源。 Artifacts: `turn-124/04-output.json`, `turn-125/06c-choice-prompt.md`. Notes: turn 124 结尾写“相机挂在胸前”，这使“拿起相机”自然，但不使“翻看照片”可行。
  - `absent` Choice prompt 没有把“刚拍的照片仍未显影”作为 choice-level hard constraint。 Artifacts: `turn-125/06c-choice-prompt.md`, `turn-125/03-story-state.json`. Notes: prompt 要求以本轮正文结尾判断可做什么，但没有物理 affordance schema 或禁止未冲洗照片回看的规则。
- competingPressures: turn 125 本轮正文收束在安静等待，Choice generator 需要补出普通行动。；turn 120 “刚拍一张”在 recentTurns 中仍很显眼，容易被转化为“看看刚拍效果”。；主角战地记者 persona 和相机在胸前的当前状态共同提高相机选项显著性。

## Causal Chain

- firstDivergenceArtifact: turn-125/06c-choice-prompt.md assistant output / turn-125/06-llm-calls.json call[2], persisted in turn-125/04-output.json choices
- triggeringPressure: 静态等待场景缺少剧情出口，且 prompt 近期上下文 foreground 了 turn 120 刚拍照片和 turn 124 相机挂在胸前。
- missingGuard: 缺少选项可行性检查，尤其是设备能力约束“FM2/胶片拍摄后只能继续拍或等待冲洗，不能翻看刚拍照片”。
- mechanismStatement: 在“刚拍过照”的显著上下文和摄影记者 persona 压力下，Choice generator 没有胶片设备 affordance guard，于是把“检查刚拍效果”这一数码相机动作误绑定成当前可点击选项。
- directCause: Choice output 将“相机在身上”错误扩展为“相机里有可翻看的刚拍照片”。
- propagation: 错误显示为 turn 125 第二个选项；它不是从 turn 123 错误选项状态写回传播而来，因为 turn 123 该选项未被选中且 turn 125 choice prompt 不以旧 choices 作为核心状态。
- nonCauses: 不是 Narrator 正文中已经生成了照片；turn 125 正文只写喝水。；不是 state-writeback 把照片写成已显影；runtime/events 只记录 choiceGenerator 输出。；不是玩家输入要求回看照片；玩家输入是喝水。

## Root Cause

- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: Choice generator 缺少按设备状态约束可选动作的 binding 机制；当 recent context 里有刚拍照片且角色是摄影记者时，它按主题相似性生成“翻看照片”，却没有把胶片未显影状态作为必须满足的动作前置条件。
- fixSurface: `Choice generator action feasibility validator`, `equipment state model: cameraType and filmDevelopmentStatus`, `prompt contract: do not offer actions that require unavailable object affordances`

## Evidence

- playerVisible: turn 120：“尼康FM2”与“银盐颗粒上一组不可逆的化学反应”；turn 121-125 没有冲洗；turn 125 选项：“拿起相机翻翻刚才拍的那张照片”。
- internalTrace: turn-125/06c-choice-prompt.md 把 turn 120 胶片拍摄和 turn 124 相机挂胸前放入 recentTurns，但 system/user instruction 只要求短选项，没有设备可行性规则；turn-125/06-llm-calls.json call[2] 首次输出该错误选项。
- tracePacket: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-016/issues/issue-052-turn-125/trace-packet.json`

## Recommended Fix Area

为 Choice generator 增加 “object affordance + temporal precondition” 过滤：胶片相机的 justTakenFrame 只能“继续过片/检查设置/记录位置”，不能“翻看照片”，除非已有显影/打印可见事件。

## Confidence

`high`
