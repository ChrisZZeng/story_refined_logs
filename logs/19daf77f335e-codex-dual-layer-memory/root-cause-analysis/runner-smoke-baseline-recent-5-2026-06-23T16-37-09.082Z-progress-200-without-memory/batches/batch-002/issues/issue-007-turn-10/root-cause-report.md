# issue-7-turn-10 root cause report

## Problem
第 10 轮开头把敲门声回卷到卡琳娜刚评价“信任”之后，抹掉了第 9 轮已经完成的交易谈判、取册子、要求主角讲经历和敲门发生位置。

## Validity
- issueValidity: `valid`
- verdictReason: 该问题成立。第 9 轮的敲门发生在卡琳娜提出条件、拿出册子、说出“那句话我没告诉过任何人”之后；第 10 轮却写成“你说‘信任’——有意思”之后立刻敲门，时间锚点明显回退。
- playerVisibleSupport: turn-09 visibleText 中，卡琳娜评价信任后继续说“交易可以”，走到书架抽出册子，要求主角讲述和敏特的真实经历，并说会告诉他敏特离开前的一句话；随后“你刚要开口——咚、咚、咚”。turn-10 visibleText 开头则是“你说‘信任’——有意思。她的尾音还没落尽，那三声敲门声...”。
- caveats:
  - turn-10 后半段仍推进到门口，没有完全重复整个第 9 轮；问题集中在开头锚点回卷和中间动作被抹除。

## Context Assessment
- actualStateBeforeIssue: 第 10 轮前，玩家刚看到敲门已经发生，卡琳娜已转头看铁门；当前玩家输入是在这个状态下低声问“你有客人？”。她手里应有刚拿出的册子，交易条件已经提出。
- relevantFacts:
  - claim: 敲门声已经在第 9 轮末尾发生，且发生在交易条件、取册子和等待主角开口之后。
    availability: `present-clear`
    artifacts: `turn-10/06a-director-prompt.md`, `turn-10/06b-narrator-prompt.md`, `turn-10/03-story-state.json`, `visible-timeline.jsonl`
    notes: 完整第 9 轮正文进入 recentTurns，应该作为当前场景锚点。
  - claim: 当前 storyline 仍带有“该节点结束时必须输出敲门声打断对话”的固定节点约束。
    availability: `over-constraining`
    artifacts: `turn-10/06a-director-prompt.md`, `turn-10/06b-narrator-prompt.md`
    notes: 该固定演出在第 9 轮已经被消费，但第 10 轮仍作为当前节点约束出现。
  - claim: storyline 已完成进展只摘要到“主角向卡琳娜提出以情报交换信任”，没有写明敲门、册子、证明条件已发生。
    availability: `stale`
    artifacts: `turn-10/06a-director-prompt.md`, `turn-10/03-story-state.json`
    notes: 该摘要比 recentTurns 落后，削弱了最新可见场景的权重。
  - claim: runtime-after 已有“敲门声打断了交谈” anchor。
    availability: `absent`
    artifacts: `turn-09/05-runtime-after.json`, `turn-10/06a-director-prompt.md`
    notes: runtime 中存在已消费锚点，但没有作为强约束显著进入 turn-10 worker prompt。
- competingPressures: 已消费的敲门固定演出；过期 currentStoryline summary；最近可见正文中的正确门口状态；玩家输入要求在门响后询问；Narrator 对上一句‘信任’的局部复用

## Causal Chain
- firstDivergenceArtifact: turn-10/06-llm-calls.json call[1] / turn-10/04-output.json 的 Narrator 正文输出
- triggeringPressure: turn-10 prompt 仍携带“节点结束时必须输出敲门声”的固定约束，且 currentStoryline 已完成进展没有记录第 9 轮的敲门和取册子细节；Director summary 也写成“敲门声打断了主角和卡琳娜的对话”，没有明确“敲门已发生，继续门口动作”。
- missingGuard: 缺少 fixed-beat consumed-state guard 和 current-scene anchor：固定敲门演出在 turn-09 消费后应标记为 consumed，并在下一轮要求从“门已响、卡琳娜看向门”继续，禁止重演触发。
- mechanismStatement: 已消费的敲门固定 beat 在后续 prompt 中仍以硬约束和过期 storyline 摘要形式存在，而最新场景锚点没有被提升为 must-continue 状态，Narrator 于是从更显眼的“信任”台词处重新触发敲门，造成时间回卷。
- directCause: Narrator 重新使用 turn-09 中较早的“信任”评价作为开场，并把敲门声放到那里之后。
- propagation: turn-10/04-output.json 固化了回卷文本；runtime-after 继续只有“敲门声打断了交谈”这一粗粒度 anchor，没有记录中间交易条件或册子状态。
- nonCauses:
  - 不是玩家输入导致：玩家是在门已经响后问“你有客人？”。
  - 不是缺少最近文本：turn-09 完整正文在 prompt 中。
  - 不是空间移动复杂度问题：场景仍在同一公寓内，错误来自固定演出重复消费。

## Root Cause
- label: `fixed-beat-consumption`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: 固定剧情 beat“敲门打断”在第 9 轮已经被消费，但 storyline lifecycle 没有把它标记为 consumed，也没有生成下一轮的 current-scene anchor；过期的节点约束继续压过最新可见状态，导致敲门被再次触发并回卷。
- fixSurface:
  - storyline lifecycle/statefold: consume fixed beats and remove or rewrite consumed constraints
  - runtime anchors: persist precise current-scene state such as doorKnocked/bookletInHand
  - Narrator prompt: require continuation from last visible sentence, not from earlier salient dialogue

## Evidence
- playerVisible: turn-09 已在“你刚要开口”处发生敲门；turn-10 又让敲门紧接“你说‘信任’——有意思”发生。
- internalTrace: turn-10/06a-director-prompt.md 仍有“该节点结束时，必须输出：一阵急促的敲门声...”约束，并且 currentStoryline 已完成进展只到“提出以情报交换信任”；turn-10/06-llm-calls.json call[1] 首次输出回卷开头。

## Recommended Fix Area
优先修复固定 beat 消费与场景锚点写回：turn 结束时把敲门 beat 标记 consumed，并把下一轮 prompt 的首要约束改为从门已响后的动作继续。

## Confidence
`high`
