# Issue 16 / Turn 50 Root Cause Report

## Problem

`issueValidity`: `valid`

第 50 轮 choices 中出现“在客厅里慢慢走动，留意书架上的书和墙上的照片”。“书架”本身早先可被玩家看作存在，因为卡琳娜曾允许玩家翻她书架上的小说；问题是“墙上的照片”。第 7 轮首次观察公寓时，玩家可见文本明确写过“没有多余的装饰，没有照片墙，没有招贴画”，并把唯一的“装饰”限定为墙角帆布背包。第 50 轮把墙上照片作为可检查对象，制造了错误的交互 affordance。

## Validity

该 issue 只用玩家可见证据即可成立。第 7 轮明确否定照片墙和招贴画；第 50 轮 choice 却把“墙上的照片”当成可留意对象。玩家当前第 50 轮正文也没有重新建立墙上照片，只有茶几、厨房、水槽、茶壶、厨房窗台、里间门和窄窗。因此这是玩家可见环境事实冲突，不依赖隐藏信息。

可 caveat 的空间在于房间之后理论上可以新增摆设，但故事没有写过任何新增照片，也没有写过主角发现或移动到有墙上照片的位置；choice 不能凭空创建可检查对象。

## Context Assessment

问题发生前，主角转身去厨房倒早餐，卡琳娜留在里间没有出来。玩家可见的当前可交互环境是厨房、客厅经过路径、茶几、杯子、茶壶、水槽、窗台、里间门和窄窗。此前公寓客厅被明确描述为没有照片墙和招贴画。

Relevant facts:

- `claim`: 公寓客厅没有照片墙、没有招贴画，唯一装饰是墙角帆布背包。
  `availability`: `absent`
  `artifacts`: `visible-timeline.jsonl` turn 7, `turn-07/04-output.json`, `turn-50/03-story-state.json`, `turn-50/06c-choice-prompt.md`
  `notes`: 玩家可见事实在 turn 7 清楚成立，但到 turn 50 时不在 recent window 中，也没有写入 `locationStates.卡琳娜的公寓.content`；Choice 需要该信息时已经不可用。

- `claim`: 第 50 轮当前正文没有建立墙上照片。
  `availability`: `present-clear`
  `artifacts`: `turn-50/04-output.json`, `turn-50/06c-choice-prompt.md`
  `notes`: Choice prompt 明确包含“本轮玩家已经看到的正文”，其中没有墙上照片。

- `claim`: Choice 任务要求先按本轮正文结尾判断玩家能合理做什么，不要提前泄露或展示未铺垫动作。
  `availability`: `present-clear`
  `artifacts`: `turn-50/06c-choice-prompt.md`
  `notes`: 这是通用约束，但没有绑定到结构化场景物件清单，也没有硬性禁止新增未见 inspectable objects。

- `claim`: Choice output 引入“墙上的照片”。
  `availability`: `contradicted`
  `artifacts`: `turn-50/06-llm-calls.json`, `turn-50/04-output.json`, `turn-50/07-events.json`
  `notes`: 这是第一处把不存在对象变成可交互 affordance 的 artifact。

Competing pressures:

- 玩家当前进入安静等待状态，Choice 需要提供低强度探索选项。
- 主角是记者，角色资料多次强调照片、相机、观察取证，容易把“照片”作为可检查物。
- 当前场景是公寓，模型有通用先验会把“书架、墙上照片”组合成室内观察选项。
- `locationStates.卡琳娜的公寓.content` 为空，没有可供 Choice 约束物件的稳定清单。

## Causal Chain

`firstDivergenceArtifact`: `turn-50/06-llm-calls.json[2].object.options[1].text`

`triggeringPressure`: 第 50 轮剧情进入日常等待和室内探索节奏，Choice 需要生成普通行动选项；主角资料和历史剧情中“照片”高频出现，公寓场景又容易触发“书架/照片”这类通用室内观察模板。

`missingGuard`: 公寓“没有照片墙”的负向场景事实没有持久化到 `locationStates` 或可交互物件清单；Choice prompt 也没有提供“当前允许检查的物件列表”或“不得新增未在 visible text/location state 中建立的具体对象”的硬约束。

`mechanismStatement`: 因为早期明确的负向房间细节没有被 `memory-persistence` 写入当前 location state，Choice 在缺少场景 affordance 清单的情况下用通用室内探索模板补全“墙上的照片”，把一个曾被玩家明确否定的对象变成选项。

`directCause`: Choice generator 输出“在客厅里慢慢走动，留意书架上的书和墙上的照片”。

`propagation`: 该 option 进入 `04-output.json.choices.options` 和最终 visible timeline，成为玩家可点击的错误 affordance。后续如果玩家选择它，会迫使 Narrator 解释一个此前不存在的物件。

`nonCauses`:

- 不是 Narrator 正文阶段的问题；第 50 轮正文没有墙上照片。
- 不是玩家输入引入；玩家选择的是去厨房倒早餐。
- 不是隐藏设定冲突；玩家可见环境已经足以判断错误。

## Root Cause

`rootCause.label`: `memory-persistence`

`family`: `detail-memory`

`secondaryFamilies`: [`agent-system`]

L3 机制是本地场景负向事实没有持久化。第 7 轮“没有照片墙、没有招贴画”是具体空间细节，过了 recent window 后没有进入 `locationStates.卡琳娜的公寓` 或交互 affordance 模型。Choice 阶段缺少可检查物件白名单和负向事实防线，只剩通用“当前正文结尾为准”的软规则。于是模型用普通室内探索模板生成了一个与早期场景事实冲突的对象。

## Evidence

Player-visible:

- `visible-timeline.jsonl` 第 7 轮：公寓“没有多余的装饰，没有照片墙，没有招贴画”，唯一“装饰”是墙角帆布背包。
- `visible-timeline.jsonl` 第 50 轮：choice 出现“留意书架上的书和墙上的照片”。
- 第 50 轮 visibleText 没有重新建立墙上照片。

Internal trace:

- `turn-50/03-story-state.json`: `locationStates.卡琳娜的公寓.content` 为空，没有保存“无照片墙/无招贴画”。
- `turn-50/06c-choice-prompt.md` lines 497-515：Choice 看到的当前正文和通用判断流程没有提供墙上照片，也没有结构化物件白名单。
- `turn-50/06-llm-calls.json[2].object.options[1].text`: Choice 首次生成“墙上的照片”。
- `turn-50/04-output.json`: 错误 option 被提交为玩家可见 choices。

## Recommended Fix Area

优先修复 location detail persistence 和 Choice affordance grounding。进入可重复探索的地点时，应把显式存在和显式不存在的关键物件写入 location state 或 scene inventory；Choice generator 应从当前 visibleText、location state 和明确候选 action 中取可检查对象，不应自行发明具体物件。对于“墙上照片”这类 inspectable object，若不在白名单中，应降级成“观察客厅陈设”这类泛化选项。

## Confidence

`high`
