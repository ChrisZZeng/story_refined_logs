# issue-19-turn-65 Root Cause Report

## Problem

- issueId: `issue-19-turn-65`
- turn: `65`
- problemSummary: 第 65 轮在玩家选择继续听后，先重复第 64 轮已经建立的“好”“刺不是比喻”“真相扎在那里”“怎么变成这样”等铺垫，再进入“我来暗街的第一年”新内容，形成轻微重复演出。

## Validity

- issueValidity: `valid`
- verdictReason: valid。玩家可见 turn 64 已完成同一组情绪和信息节点，并以“然后她开口了”把叙述推到讲述起点；turn 65 的玩家输入只是点头继续听，却先重放同一组台词和情绪动作。
- playerVisibleSupport: visible-timeline.jsonl turn 64 写了“好”“我刚才说'刺'一一那不是什么比喻”“有些真相就是这样……扎在那里”“那你知道这个人是怎么变成这样的吗？”；turn 65 再次写“好”“我刚才说‘刺’——那不是比喻”“有些事就是这样……扎在那里”“那你知道——这个人是怎么变成这样的吗？”。
- caveats:
  - 重复之后 turn 65 进入了新信息“我来暗街的第一年”，因此问题是低严重度节奏重复而非完全卡死。
  - turn 65 对异常标点做了正常化，但这不抵消内容层面的重复。

## Context Assessment

- actualStateBeforeIssue: turn 64 末尾，卡琳娜已经说明“刺”不是比喻，解释知道真相后会被影响，并问玩家是否想知道“这个人是怎么变成这样”；玩家选择“点头，表示愿意听下去”。下一轮应承接“然后她开口了”直接进入转变经历。
- relevantFacts:
  - `present-clear` “刺不是比喻/真相扎在那里/怎么变成这样”这一铺垫在 turn 64 已经玩家可见。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl turn 64`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-64/04-output.json`
    notes: 该组台词和动作是 turn 65 重复的核心内容。
  - `present-clear` turn 65 玩家输入只是同意继续听，没有要求卡琳娜重新确认或重说上一段。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl turn 65`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-65/06a-director-prompt.md lines 755-777`
    notes: 玩家输入为“点头，表示愿意听下去。”，核心意图是继续。
  - `stale` turn 65 生成前的 currentStoryline summary 只写“卡琳娜确认他是否真的准备好承受”，没有记录 turn 64 已经解释过“刺”的实际含义并提出“怎么变成这样”的问题。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-65/03-story-state.json currentStoryline.summary`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-65/06a-director-prompt.md`
    notes: 该摘要把上一轮进度压缩成“确认准备好”，弱化了已消费的铺垫内容。
  - `present-buried` turn 65 Director prompt 中最近可见正文保留了 turn 64 全文，但该事实埋在长段 recentTurns prose 中。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-65/06a-director-prompt.md lines 755-771`
    notes: recent context 有正确事实，但没有以“已消费 beat”形式高优先级标注。
  - `over-constraining` turn 65 Director output 把已消费铺垫重新列为本轮 requiredContent。
    artifacts: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-65/06-llm-calls.json call 0`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-65/06b-narrator-prompt.md lines 809-840`
    notes: Director requiredContent 写明“卡琳娜必须说出‘刺’的比喻的实际含义”，直接推动 Narrator 重写上一轮内容。
- competingPressures:
  - 玩家选择“继续听”容易诱导模型用“确认—再开口”的慢铺模板。
  - currentStoryline summary 比 recent visible 更短、更靠前，给 Director 一个“尚未真正说出”的进度印象。
  - 阶段约束要求不揭示核心秘密，促使系统反复停留在同一层情绪铺垫。

## Causal Chain

- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-64/04-output.json writes.currentStoryline.update.turnSummary / turn-65/03-story-state.json currentStoryline.summary`
- triggeringPressure: turn 64 writeback 将实际已经呈现的“刺不是比喻、真相会扎住你、怎么变成这样”压缩成“确认是否准备好承受”；turn 65 Director 在这个欠细节 summary 和“继续听”的输入压力下，把已消费铺垫重新规划为 requiredContent。
- missingGuard: 缺少 per-beat consumed-state 写回和优先级规则：当 recent visible 已完成某个情绪/信息节点时，Director 不应把同一节点再次列为本轮必须内容，除非玩家要求复述。
- mechanismStatement: 当上一轮的已消费铺垫只以长 recent prose 存在、而结构化 storyline summary 把进度写得过粗时，Director 会把“继续听”误判为需要重新确认并重说“刺”的含义，再由 Narrator 按 requiredContent 重演同一节点。
- directCause: turn 65 Director output 的 requiredContent “卡琳娜必须说出‘刺’的比喻的实际含义”与 beats“卡琳娜确认玩家决定后，开口讲述”把上一轮已完成铺垫重新推给 Narrator。
- propagation: Narrator 在 `turn-65/06-llm-calls.json` call 1 先重写“好/刺不是比喻/扎在那里/怎么变成这样”，再进入新内容；该重复进入 `turn-65/04-output.json` 和 visible timeline。
- nonCauses:
  - 不是玩家输入歧义；“点头，表示愿意听下去”清楚指向继续。
  - 不是长期记忆缺失；冲突事实来自上一轮且仍在 recent context。
  - 不是固定剧本必须重演；当前 storyline 只要求情感铺垫和不揭示核心秘密，没有要求重复同一段台词。

## Root Cause

- label: `state-writeback`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 上一轮已完成的细粒度信息节点没有被结构化写回为 consumed beat；currentStoryline summary 的粗粒度进度压过了埋在 recent prose 中的可见事实，导致 Director 把“刺的含义”重新列为 requiredContent，Narrator 随后重演上一轮铺垫。
- fixSurface:
  - `turnSummary consumed-beat writeback`
  - `Director prompt current-progress anchor`
  - `repeated-scene validator for adjacent turns`

## Evidence

- playerVisible: turn 64 已经呈现“好/刺不是比喻/真相扎在那里/怎么变成这样”，turn 65 在玩家点头后又重复这些句子，然后才进入“我来暗街的第一年”。
- internalTrace: `turn-65/03-story-state.json` currentStoryline.summary 只记录“确认是否真的准备好承受”；`turn-65/06a-director-prompt.md` lines 755-771 虽保留 turn 64 全文但埋在 recent prose 中；`turn-65/06-llm-calls.json` call 0 把“刺的比喻实际含义”列为 requiredContent；call 1 生成重复正文。

## Recommended Fix Area

优先修复 state writeback 与 Director handoff：把“已解释/已追问/已消费”的细粒度 beat 写入 current progress，并在 Director 生成 requiredContent 前检查相邻 turn 是否已经完成同一情绪或信息节点。

## Confidence

`high`
