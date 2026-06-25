# Root Cause Report: issue-050-turn-120

## Problem

turn 120 的取景框描写把防水袋写成在窗台边缘，但 turn 119 刚把它明确放在主角肩上、身侧，期间没有玩家可见的放回窗台动作。

## Validity

- issueValidity: `valid`
- verdictReason: valid。玩家可见文本中，turn 119 的最新物品状态是“防水袋斜挎过肩，搁在身侧”，turn 120 却写“窗台边缘那卷防水袋的轮廓”。即使主角为了拍照可能站起来靠近窗口，文本也没有交代把防水袋从肩/身侧移回窗台。
- playerVisibleSupport: visible-timeline.jsonl 中 turn 119 写主角坐在壁炉边且防水袋斜挎过肩、搁在身侧；turn 120 写透过目镜看见窗台边缘那卷防水袋。
- caveats: 严重度较低，因为后续 turn 121 和 turn 122 又把防水袋写回肩上/身侧，未长期固化；但 turn 120 本轮可见正文仍出现了瞬时位置冲突。

## Context Assessment

- actualStateBeforeIssue: 问题发生前，主角已从窗边走到壁炉边并坐下；相机挂在胸前，防水袋斜挎过肩、搁在身侧。玩家本轮输入只是拿起相机对准窗外拍照，没有把防水袋放回窗台。
- relevantFacts:
  - `present-clear` 防水袋在 turn 119 的最新玩家可见位置是主角肩上/身侧。 Artifacts: `visible-timeline.jsonl:turn-119`, `turn-120/06b-narrator-prompt.md`, `turn-120/03-story-state.json`. Notes: 该事实在最近几轮文本的最后一轮出现，应该覆盖更早的窗台位置。
  - `stale` turn 117-118 曾多次把防水袋和相机放在窗台/窗边语境中。 Artifacts: `visible-timeline.jsonl:turn-117`, `visible-timeline.jsonl:turn-118`, `turn-120/06b-narrator-prompt.md`. Notes: 这些旧文本在 Narrator prompt 的 recentTurns 中仍很显眼，但已被 turn 119 的移动和随身携带状态更新。
  - `absent` Director 对 turn 120 只要求拍照、通过取景框描写窗外，没有要求描写防水袋位置。 Artifacts: `turn-120/06-llm-calls.json:call[0]`, `turn-120/04-output.json`. Notes: Director handoff 没有把当前物品位置作为必须遵守的 anchor 传给 Narrator。
  - `absent` 结构化 story state 没有给防水袋提供当前 location slot。 Artifacts: `turn-120/03-story-state.json`, `turn-120/02-script-state.json`. Notes: 当前物品位置只存在于 recentTurns prose 中，没有被抽成可校验的当前场景状态。
- competingPressures: 玩家输入要求“对准窗外准备拍一张”，使窗口/窗台成为强视觉框架。；旧 recentTurns 反复出现“窗台上的相机和防水袋”“窗台边缘”等短语。；Narrator 被要求慢铺感官细节，容易拿旧的窗台物件作为取景前景。

## Causal Chain

- firstDivergenceArtifact: turn-120/06b-narrator-prompt.md assistant output, persisted in turn-120/04-output.json
- triggeringPressure: Narrator prompt 中旧的 turn 117-118 窗台物件描写和本轮“通过取景框描写窗外”的 Director requiredContent 共同把窗台边缘前景推到高显著位置。
- missingGuard: 缺少一个明确的 current-scene object-location anchor，也缺少“latest explicit visible location wins over older recent prose”的硬约束或自动校验。
- mechanismStatement: 在旧窗台描写与取景框任务共同 foreground 的情况下，Narrator 没有被结构化地告知防水袋当前仍在肩上/身侧，于是把 stale 窗台位置复用到新正文，形成玩家可见的无动作位移。
- directCause: Narrator 从 recent prose 中选用了已过期的窗台物件位置，而不是 turn 119 的最新随身位置。
- propagation: 错误被写入 turn-120 visibleText；后续 turn 121/122 又恢复肩上/身侧，因此没有通过 state-writeback 长期扩散。
- nonCauses: 不是玩家输入造成的；玩家只要求拍照，没有要求移动防水袋。；不是 storyline 固定剧情要求；当前 storyline 只要求等待和准备出发。；不是长期 memory 缺失；正确事实就在 recentTurns 中。

## Root Cause

- label: `context-priority`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 系统把同一物品的新旧位置都以 prose 形式放进 prompt，却没有结构化当前物品位置，也没有显式规定最新玩家可见状态优先；当拍照任务 foreground 旧窗台语境时，Narrator 复用 stale 位置并写成可见事实。
- fixSurface: `context assembly: current-scene object-location anchor`, `Narrator prompt: latest-visible-state priority rule`, `post-generation continuity check for object relocation without action`

## Evidence

- playerVisible: turn 119：“防水袋斜挎过肩，搁在身侧”；turn 120：“透过目镜，你能看见窗台边缘那卷防水袋的轮廓”。
- internalTrace: turn-120/06b-narrator-prompt.md 同时包含 turn 117-118 的窗台防水袋描写和 turn 119 的肩上/身侧描写；turn-120/06-llm-calls.json call[0] 的 Director output 没有指定防水袋位置；call[1] 首次输出错误位置。
- tracePacket: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-016/issues/issue-050-turn-120/trace-packet.json`

## Recommended Fix Area

为 Narrator/Choice 的 prompt assembly 增加“当前物品位置”结构化摘要，并在生成后检查同一物品是否从 latest-visible location 无动作跳转。

## Confidence

`high`
