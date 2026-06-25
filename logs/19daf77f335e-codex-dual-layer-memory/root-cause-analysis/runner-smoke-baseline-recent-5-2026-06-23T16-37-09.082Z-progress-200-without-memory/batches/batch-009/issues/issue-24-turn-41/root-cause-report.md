# Root Cause Report - issue-24 / turn 41

## Problem
turn 41 将晚宴称为“德索洛的宴会”，并让帕兹追问“如果不是康纳派人来”，使晚宴归属从 turn 27 的康纳转向德索洛，同时引入玩家可见文本没有支持的“康纳派人”因果。

## Validity
- issueValidity: `valid`
- verdictReason: 有效。玩家可见文本中，turn 27 明确称康纳·凯拉宁是凯旋门实际管理者和“这场晚宴的主人”；turn 28 玩家选择离开，没有出现康纳派人邀请或召回卡琳娜的事件。turn 41 的“康纳派人来”和“德索洛的宴会”使原因和所有权都发生不稳定变化。
- playerVisibleSupport: turn 27 可见正文：“康纳·凯拉宁。凯旋门的实际管理者。这场晚宴的主人。”turn 28 可见正文只写卡琳娜未挽留、提醒暗街夜路、玩家离开宴会厅。turn 41 可见正文写帕兹说“如果不是康纳派人来，你还会去吗？”以及卡琳娜说“德索洛的宴会上必须有一个来自暗街的位置”。
- caveats: “德索洛的事务/这张网”此前可见存在，因此德索洛与宴会相关并非完全无来源；问题在于 turn 41 把“德索洛事务”升级成宴会所有权，同时给康纳添加了派人因果。

## Context Assessment
问题发生前，玩家知道德索洛是一条事务/交易线，康纳才是晚宴主人；玩家曾决定不见康纳而离开。当前公园对话是在宴会后，卡琳娜与玩家谈“宴会让人不舒服”和她为何去，应该维持“康纳主持/德索洛事务相关/没有康纳派人”这组边界。

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 晚宴主人是 Connor Keilanen。 | `absent` | `turn-41/03-story-state.json`<br>`turn-41/06a-director-prompt.md` | 该事实出现在 turn 27 玩家可见文本，但 turn 41 的 recentTurns 只覆盖 turn 36-40；historyStoryline 仅概括“等待卡琳娜继续提及康纳”，没有保留“这场晚宴的主人”。 |
| DeSollo 是事务/网络相关方，而不是已确认为晚宴主人。 | `present-ambiguous` | `turn-41/03-story-state.json`<br>`turn-41/06a-director-prompt.md` | 历史摘要保留“德索洛这张网”，但没有和“康纳是主人”并列澄清，给 Narrator 把宴会归属说成 DeSollo 留下空间。 |
| 玩家可见文本没有“Connor sent someone for Karina”。 | `absent` | `turn-41/06a-director-prompt.md`<br>`turn-41/06-llm-calls.json` | Director output 却要求“她提到康纳和卡尔都知道她会露面，暗示这背后有交易或仪式”，把康纳参与感前置。 |
| 卡琳娜参加宴会的回答应解释职责/习惯，不应新增召唤原因。 | `present-ambiguous` | `turn-41/06-llm-calls.json`<br>`turn-41/04-output.json` | Director requiredContent 同时要求“职责和习惯，但今晚不同”与“康纳和卡尔都知道她会露面”，但没有禁止将“知道”改写为“派人来”。 |

Competing pressures:
- 历史摘要中“德索洛这张网”比 turn 27 的精确主人事实更容易进入当前 prompt。
- Director 想让卡琳娜的动机显得有仪式/交易重量，主动引入康纳与卡尔都知道她会露面的暗示。
- 最近几轮只在公园谈宴会感受，不再包含 turn 27 对康纳身份的原文。

## Causal Chain
- firstDivergenceArtifact: `turn-41/06-llm-calls.json call 0 (Director output), materialized in call 1 (Narrator output)`
- triggeringPressure: turn 41 prompt 中精确的“康纳是晚宴主人”事实已掉出 recentTurns 且未被 story state 持久化；保留下来的高层摘要却有“德索洛这张网”，Director 又要求提到康纳和卡尔都知道她会露面。
- missingGuard: 缺少稳定的 scene-fact memory/canonical relation，用于声明 banquet.host=Connor、DeSollo=transaction-line、no-visible-summons；也缺少对“知道会露面”不得推断为“派人来”的因果 guard。
- mechanismStatement: 当关键场景归属事实没有从 turn 27 写入可检索状态，而旧摘要保留了 DeSollo 关联、Director 又前置康纳参与暗示时，Narrator 用这些松散线索补全成“康纳派人”和“德索洛的宴会”，造成可见事实冲突。
- directCause: Director requiredContent 制造“康纳和卡尔都知道她会露面”的压力；Narrator 在此基础上生成帕兹口中的“如果不是康纳派人来”以及卡琳娜口中的“德索洛的宴会”。
- propagation: turn 41 的可见文本把错误原因和归属写入对话；后续选项继续在该公园对话上推进，错误可能被 story summary 再次写回。
- nonCauses: 不是玩家输入要求的；玩家只问“为什么今晚会去那个宴会”。；不是单纯 hidden lore；玩家可见的 host 事实与缺少 summons 事实足以判定问题。

## Root Cause
- label: `scene-fact-persistence-gap`
- family: `detail-memory`
- secondaryFamilies: `agent-system`
- description: 关键场景事实（晚宴 host、DeSollo 只是事务线、没有康纳派人事件）没有作为 canonical scene facts 持久化到 story state；后续 prompt 只剩模糊摘要和角色关系压力，Director/Narrator 因此用不受约束的因果补全重写了晚宴归属和卡琳娜到场原因。
- fixSurface: `story state scene-fact writeback`, `history summarizer fact retention`, `director contradiction check against canonical scene facts`, `narrator unsupported-cause guard`

## Evidence
- playerVisible: turn 27 明确“康纳·凯拉宁……这场晚宴的主人”；turn 28 玩家离开且没有康纳派人；turn 41 出现“如果不是康纳派人来”和“德索洛的宴会”。
- internalTrace: turn-41/03-story-state.json historyStoryline 仅保留 DeSollo 网与康纳相关概括，没有 banquet owner；turn-41/06a-director-prompt.md recentTurns 为 turn 36-40，不含 turn 27 原文；turn-41/06-llm-calls.json call 0 requiredContent 引入“康纳和卡尔都知道她会露面”；call 1 将其扩展为“派人来/德索洛的宴会”。

## Recommended Fix Area
为关键场景建立 canonical scene facts，并在 statefold/history summarizer 中保留“host/owner/venue/visible cause”等字段；Director 生成涉及既有场景归属或因果的 requiredContent 前，应检查 canonical facts，Narrator 应禁止把“知道/会注意到”升级成“派人/邀请”等新事件。

## Confidence
`medium`
