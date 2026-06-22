# Problem

issueIndex=9，turn=19，type=`unsupported-jump`，scope=`visibleText`。

turn 18 末尾德索洛仍是站立状态：“双手垂在身侧”，称呼“……阁下。”之后抬头看卡琳娜。turn 19 开头却直接写成“德索洛的单膝跪在地板上”“左手握着卡琳娜纤细的指尖”。中间没有玩家可见的下跪、伸手、卡琳娜是否允许触碰等动作承接，人物姿态和互动状态突然改变。

# Validity

`issueValidity`: `valid`

只看玩家可见时间线即可确认。下跪并握住卡琳娜手指是显著身体状态变化，尤其在这场“尊严换公道”的权力关系里具有强叙事意义。turn 19 没有先展示该动作，只把完成后的姿态作为开场事实，因此是不受玩家可见文本支撑的跳变。

# Context Assessment

问题发生前的玩家实际状态是：德索洛站在门口，双手垂在身侧，低声称呼“阁下”；卡琳娜已回应并提醒规矩。若本轮要让德索洛进一步下跪并拉手，系统需要从该末帧开始，明确描写他如何从站立变为跪下、如何伸手、卡琳娜是否默许，而不是直接切到完成态。

Relevant facts:

- claim: turn 18 的末帧姿态是站立、双手垂在身侧。availability: `present-clear`。artifacts: `visible-timeline.jsonl`, `turn-19/06a-director-prompt.md`。notes: 最近几轮玩家经历中明确有“德索洛的双手垂在身侧”。
- claim: turn 19 开场姿态已经变成单膝跪地并握住卡琳娜指尖。availability: `present-clear`。artifacts: `turn-19/04-output.json`, `turn-19/06-llm-calls.json[1].text`。notes: 这是 Narrator 正文第一段，缺少动作桥。
- claim: Director 安排了“德索洛主动单膝跪地，拉起卡琳娜的手”。availability: `present-clear`。artifacts: `turn-19/06-llm-calls.json[0].object`, `turn-19/06b-narrator-prompt.md`。notes: Director 把动作作为本轮 requiredContent，但没有附带“必须从上一轮站立末帧桥接”的约束。
- claim: 德索洛角色资料固定写了“单膝跪地，拉起卡琳娜的纤细的左手”。availability: `over-constraining`。artifacts: `turn-19/02-script-state.json`, `turn-19/06a-director-prompt.md`。notes: 这是动作来源，但不是当前场景的已发生事实。

Competing pressures:

- fixed script 强力要求单膝跪地和拉手。
- recentTurns 明确提供上一轮站立/双手垂侧状态。
- Narrator 最终提示要求以 Director 安排为骨架，不改变剧情方向。
- prompt 没有把“上一轮最后一帧姿态”作为必须连续承接的显式字段。

# Causal Chain

First divergence artifact: `turn-19/06-llm-calls.json[0].object` 先把“主动单膝跪地，拉起卡琳娜的手”定为本轮 `requiredContent`；玩家可见的跳变首次出现在 `turn-19/06-llm-calls.json[1].text` 开头。

Triggering pressure: fixed material 中有精确动作“单膝跪地、拉起左手、卡琳娜阁下”，Director 将其选为本轮必须演出的动作。

Missing guard: 缺少 current-scene anchor / pose-transition contract。Director 和 Narrator handoff 没有显式传递“上一帧：德索洛站立，双手垂在身侧；若执行下跪拉手，必须先写动作过程并处理卡琳娜的反应”。

Mechanism statement: 固定动作 beat 被提升为 requiredContent，但 handoff 只传递目标动作，没有传递上一帧姿态和必需桥接；Narrator 为了快速落地 requiredContent，直接从动作完成后的 tableau 开场，造成玩家可见 unsupported posture jump。

Direct cause: Narrator 将 Director 的动作 beat 压缩成开场完成态，而不是从上一轮可见姿态连续演出。

Propagation: `04-output.json` 将开场完成态写入 `visibleText`；后续同轮继续围绕“手仍然握着她的指尖”展开，进一步固化该跳变。

Non-causes:

- 不是玩家输入主动要求德索洛跪地或拉手。
- 不是 memory 缺失；上一轮姿态在 recentTurns 中可见。
- 不是单纯 evaluator 误判；姿态变化对玩家可见且缺少承接。

# Root Cause

`rootCause.label`: `current-scene-anchor`

`family`: `agent-system`

`secondaryFamilies`: `recent-context`

根因是 worker handoff 缺少当前场景末帧锚点和动作桥接契约。系统把固定动作作为本轮 requiredContent 交给 Narrator，但没有把最近可见姿态作为硬约束，也没有要求目标动作必须从上一帧连续演出。结果 Narrator 直接选择动作完成态开场。

`fixSurface`:

- Director output schema 增加 `startFrame` / `lastVisibleState` 与 `transitionRequirements`。
- Narrator prompt 在最终指令处硬性要求从上一轮最后可见姿态开始，不得以目标完成态开场。
- 对 `requiredContent` 中改变姿态、接触、位置的动作增加 bridge validator。

# Evidence

Player-visible evidence:

- turn 18: “德索洛的双手垂在身侧，指节微微收紧。”
- turn 19: “德索洛的单膝跪在地板上……他的左手握着卡琳娜纤细的指尖。”

Internal trace:

- `turn-19/06-llm-calls.json[0].object`: Director `requiredContent` 包含“德索洛主动单膝跪地，拉起卡琳娜的手。”
- `turn-19/06-llm-calls.json[1].text`: Narrator 第一段已经是跪地握手完成态。
- `turn-19/02-script-state.json`: 德索洛角色资料固定交易过程包含同一动作，说明动作来源是固定素材。

# Recommended Fix Area

优先补 current-scene anchor 和动作桥接校验。任何 requiredContent 若会改变角色姿态、相对位置或身体接触，都必须附带“从上一帧如何到达”的 transition requirement；Narrator 输出若第一段直接出现完成态，应被拒绝或局部修复。

# Confidence

`high`

上一帧状态、Director 动作安排和 Narrator 开场完成态都在 artifact 中直接可见。
