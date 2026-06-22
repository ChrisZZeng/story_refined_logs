# Problem

issueIndex=21，turn=49，type=`repeated-scene`，scope=`visibleText`。

玩家在 turn 48 已经选择“接受邀请，跟她一起去晚宴”，正文完整演出了跟随卡琳娜进入凯旋门宴会厅、站在门槛、观察吊灯、人群、食物、音乐、卡琳娜半步位置、卡尔在身边，并听到卡琳娜提醒“别站在门口太久。你一停，别人就会注意你。”turn 49 玩家选择“注意康纳的位置（远观，不互动）”后，正文却再次以“你踏入宴会厅的那一刻”开场，重新描写暖意、吊灯、人群、食物香气、卡琳娜半步位置，并再次出现同一句门口提醒。玩家会感到刚完成的入场段落被当作新场景重演，进度回退。

# Validity

`issueValidity`: `valid`

只看玩家可见证据，问题成立。turn 48 的可见正文已经把“进入宴会厅”和“门口附近环境建立”演完，结尾还明确说“你跟上她的脚步，在踏进那一刻感受到身后的大门无声合拢”，并给出后续选项“注意康纳的位置（远观，不互动）”。turn 49 不是从“已经在宴会厅内远观康纳”继续，而是回到“踏入宴会厅的那一刻”，重复上一轮的场景建立和同一句提醒。

可见证据不依赖隐藏设定。唯一 caveat 是 turn 49 后半段确实推进了罗英与康纳登场，因此不是整轮无效；但前半段的入场重演足以构成 `repeated-scene`。

# Context Assessment

问题发生前玩家实际看到的状态是：主角已经随卡琳娜和卡尔进入宴会厅，门已经在身后合拢，宴会厅的灯光、人群、食物、音乐和窗外天光已经被建立。康纳尚未被看到，但被提示“应该在这里”。玩家随后选择远观康纳，不互动。

相关事实与可用性：

| claim | availability | artifacts | notes |
|---|---|---|---|
| turn 48 已完成宴会厅入场与环境建立。 | `present-clear` | `visible-timeline.jsonl`, `turn-48/04-output.json`, `turn-49/03-story-state.json` | 最近一轮全文进入 Director prompt，包含门槛、吊灯、人群、食物、音乐、同一句提醒和门合拢。 |
| turn 49 玩家核心动作是远观康纳，不主动互动。 | `present-clear` | `visible-timeline.jsonl`, `turn-49/02-script-state.json`, `turn-49/03-story-state.json`, `turn-49/06a-director-prompt.md` | Director 正确识别 `playerIntent` 为 `observe`，并保留“主角不主动与康纳互动”。 |
| `4-03-第一章` 入场 beat 已完成。 | `present-clear` | `turn-48/05-runtime-after.json`, `turn-49/02-script-state.json` | runtime 的 `completedBeatIds` 已包含 `4-03-第一章`，当前 active beat 已切到 `5-01-第一章`。 |
| `5-01-第一章` 仍要求“先描写宴会厅环境，建立氛围”。 | `over-constraining` | `turn-49/02-script-state.json`, `turn-49/03-story-state.json`, `turn-49/06a-director-prompt.md` | 该要求与上一轮已完成的环境建立重叠，却没有说明要基于已在厅内的状态轻量承接。 |
| prompt 中有“已完成的部分不要重复安排”和“检查上文是不是写过内容，不要重复”。 | `present-buried` | `turn-49/06a-director-prompt.md`, `turn-49/06b-narrator-prompt.md` | 这些是通用规则，位置和力度弱于当前 storyline 的核心事件与 Narrator 的 `requiredContent` 强约束。 |

主要 competing pressures：

- `5-01-第一章` 的 storyline 标题和内容都强调“宴会厅环境与人群”“建立宴会厅氛围”。
- `5-01-第一章` 同时要求“康纳必须在环境建立后才出场”，使环境描写成为康纳登场的前置。
- turn 49 的玩家选择要求远观康纳，正好触发康纳登场，但没有要求重新入场。
- Narrator 合同把 Director 的 `requiredContent` 定义为本轮必须体现的固定演出，不允许丢失或改义。

# Causal Chain

`firstDivergenceArtifact`: `turn-49/07-events.json` 中的 Director `worker-done` 输出，等价归档在 `turn-49/04-output.json` 的 `plotPoint`。

上游触发压力来自 `turn-49/03-story-state.json` 和 `turn-49/06a-director-prompt.md`：当前 storyline 是 `5-01-第一章`，内容显著要求“先描写宴会厅环境，建立氛围”，并约束“康纳必须在环境建立后才出场”。同时，上一轮可见正文和历史摘要清楚说明 `4-03-第一章` 已经把宴会厅入场和环境建立演完。

Director 的偏离是把这段 storyline 素材提升为本轮 `beats` 和 `requiredContent`：`beats[0]` 为“描写宴会厅环境与人群”，`requiredContent[0]` 为“描写宴会厅的灯光、声音、人群衣着和食物香气”，并新增 `currentTurnConstraints` “康纳出场前必须先建立宴会厅环境”。这一步没有把“环境已经建立”转译为“承接已在厅内，从康纳方向和人群反应继续”，而是把已消费的入场/环境建立子 beat 再次作为前置执行。

Narrator 随后按合同执行。`turn-49/06b-narrator-prompt.md` 明确要求如果导演安排里有 `requiredContent`，它就是“本轮必须体现的固定演出、对白或资源安排”，不得丢失或改义。因此 Narrator 从“你踏入宴会厅的那一刻”开始，复写上一轮已经建立过的感官要素和卡琳娜提醒。Choice worker 后续生成的选项能够承接康纳已出现，说明错误没有阻断推进，但已经固化在 turn 49 的玩家可见正文和 `writes.target=turnContent` 中。

机制说明：`5-01-第一章` 把“宴会厅环境建立”作为康纳登场前置固定 beat，而系统没有对跨 storyline 的场景建立子 beat 做 consumed-state 过滤；Director 在最近可见正文已清楚写过入场的情况下，仍把该前置提升为本轮 `requiredContent`，Narrator 又被要求完整执行这些 `requiredContent`，于是已消费的入场段落被重演成新场景。

非主因：

- 不是玩家选择绑定错误。turn 49 的 `playerIntent` 为 `observe`，且正文后半段确实远观康纳，没有把玩家动作改成主动互动。
- 不是长期记忆缺失。上一轮完整可见正文就在 `recentTurns` 中，信息并未离开近期上下文。
- 不是单纯 `llm-self`。模型面对的是强 storyline 前置和强 `requiredContent` 合同，系统压力足以解释重复。

# Root Cause

`rootCause.label`: `fixed-beat-consumption`

`family`: `agent-system`

`secondaryFamilies`: [`recent-context`]

L3 root mechanism 是：固定剧情/当前 storyline 中的“宴会厅环境建立”子 beat 在 `4-03-第一章` 已经被玩家可见正文消费后，没有被生命周期状态或 scene anchor 标记为 consumed，也没有在切到 `5-01-第一章` 时被改写成“承接已入场状态”。于是 `5-01` 的“先描写宴会厅环境，建立氛围”和“康纳必须在环境建立后才出场”继续以未消费前置的形态进入 Director prompt。Director 把它转成 `requiredContent`，Narrator 又必须照单执行，最终重复了上一轮入场段落。

这个问题的 coarse family 是 `agent-system`，因为需要的信息存在于最近可见上下文和 runtime 状态中，但 beat lifecycle、prompt assembly 和 handoff contract 没有把“已写过的 scene-establishment 内容”转成可执行的禁止重复约束。`recent-context` 是次要因素，因为最近正文虽然在 prompt 中清楚可见，但优先级和可执行性低于当前 storyline 的固定 beat。

# Evidence

玩家可见证据：

- `visible-timeline.jsonl` turn 48：玩家接受邀请后，正文写“你跟着卡琳娜穿过暗街边缘的暮色，走进凯旋门的灯火里”，随后描写宴会厅大门、吊灯、人群、食物、音乐、卡琳娜半步位置、卡尔，并出现“别站在门口太久。你一停，别人就会注意你。”
- `visible-timeline.jsonl` turn 48 结尾：正文写“你跟上她的脚步，在踏进那一刻感受到身后的大门无声合拢”，选项包含“注意康纳的位置（远观，不互动）”。
- `visible-timeline.jsonl` turn 49：玩家选择远观康纳后，正文以“你踏入宴会厅的那一刻”开场，再次写暖意、吊灯、人群、食物香气、卡琳娜半步位置，并再次出现同一句“别站在门口太久”。

内部链路证据：

- `turn-48/05-runtime-after.json`: `completedBeatIds` 已包含 `4-03-第一章`，`activeBeatIds` 已切到 `5-01-第一章`。
- `turn-49/02-script-state.json`: `currentLocationId` 是 `宴会厅`，`questStates.completedBeatIds` 包含 `4-03-第一章`，但 `context.items` 中 `5-01-第一章` 的 `beat::core_flow` 仍包含“先描写宴会厅环境，建立氛围”。
- `turn-49/03-story-state.json`: `recentTurns` 清楚包含 turn 48 的完整入场可见正文；`currentStoryline.content` 仍要求“先描写宴会厅环境，建立氛围”。
- `turn-49/06a-director-prompt.md`: 当前故事线区域把 `5-01-第一章` 的“建立宴会厅氛围”“先描写宴会厅环境”放在显著位置；“已完成的部分不要重复安排”只是通用说明。
- `turn-49/07-events.json`: Director 输出 `beats[0] = "描写宴会厅环境与人群"`，`requiredContent[0] = "描写宴会厅的灯光、声音、人群衣着和食物香气"`，`currentTurnConstraints` 包含“康纳出场前必须先建立宴会厅环境”。
- `turn-49/06b-narrator-prompt.md`: Narrator 被要求将 Director 的 `requiredContent` 作为本轮必须体现的固定演出，不要丢失或改义。
- `turn-49/04-output.json`: 最终 `normalizedContent.visibleText` 从“你踏入宴会厅的那一刻”开始，并将重复段落写入 `writes.target=turnContent`。

# Recommended Fix Area

优先修复 `storyline beat lifecycle` 和 `Director prompt/context assembly`：

1. 为场景建立、入场、角色登场前置等 fixed beat 增加可消费的子状态，例如 `sceneEstablished: 宴会厅`、`entryPerformed: 宴会厅`、`beatFragmentsConsumed`，并在跨 beat 切换时过滤或改写已消费内容。
2. 在 Director 输入中把最近一轮的场景锚点提升成可执行约束，例如“玩家已经在宴会厅内，门已合拢；本轮不得重写进入宴会厅或门口提醒，只能用一句承接性环境细节后推进康纳/罗英”。
3. 对 `requiredContent` 增加去重/降级规则：当 storyline 要求与最近可见正文重叠时，Director 应把它改成“承接/变奏/只补未写信息”，而不是直接列为必须重演的固定演出。

# Confidence

`confidence`: `high`

证据链从玩家可见重复、runtime beat 状态、当前 storyline 内容、Director 输出、Narrator 合同到最终正文完整闭合。根因不是隐藏剧情误读，也不是长期记忆缺失，而是已消费固定 beat 在 storyline 切换与 worker handoff 中缺少可执行的消费防线。
