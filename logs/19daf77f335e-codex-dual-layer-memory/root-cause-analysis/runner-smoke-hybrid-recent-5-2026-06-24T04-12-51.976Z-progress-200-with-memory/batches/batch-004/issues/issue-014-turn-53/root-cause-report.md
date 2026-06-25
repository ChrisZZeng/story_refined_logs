# Root Cause Report: issue-14 / turn 53

## Problem
turn 53 同一句写“那把旧铜钥匙你在暗街铁门上见过的那把”，又写“但它的齿痕不同”，造成同一物件身份与属性自相矛盾。

- issueIndex: 14
- issueValidity: `valid`
- rootCause.label: `unsupported-detail-inference`
- family: `agent-system`

## Validity
valid：玩家可见文本若指同一把钥匙，就不应出现齿痕不同；若是另一把钥匙，就不应称为“那把”。该矛盾不依赖隐藏设定即可成立。

玩家可见证据：turn 9 只建立卡琳娜曾用“一把钥匙——老式的长柄铜钥匙”打开暗街铁门；turn 52 建立她真正的家不是暗街铁门后的房间，而是另一个地方；turn 53 到达另一扇铁门时写“那把旧铜钥匙……但它的齿痕不同”。

注意事项：
- 如果文本写成“另一把旧铜钥匙，齿痕不同”，就只是新物件描写；问题来自“那把”与“齿痕不同”的同句绑定。
- 该矛盾局限在一处物件细节，没有立即影响剧情推进，因此 severity=low 合理。

## Context Assessment
问题发生前的实际状态：问题发生前，主角在公园接受卡琳娜邀请，跟她离开长椅，前往她真正的家。玩家知道这不是暗街铁门后的房间，而是另一处与卡尔、暗街过去有关的隐秘地点；玩家也只见过此前暗街铁门上的老式长柄铜钥匙。

相关事实与可用性：
- `present-clear` 此前玩家可见的钥匙事实是 turn 9：卡琳娜用老式长柄铜钥匙打开暗街铁门；没有描述齿痕。 证据：`consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`；`run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-53/06b-narrator-prompt.md`。说明：event memory 也只概括为“老式铜钥匙打开一扇铁门”。
- `present-clear` turn 52 玩家可见文本明确真正的家不是暗街那间铁门后的房间，而是另一处。 证据：`run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-52/04-output.json`；`run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-53/06a-director-prompt.md`。说明：因此 turn 53 可以出现另一把钥匙，但必须清楚标成另一把；也可以复用同一把，但不能说齿痕不同。
- `present-clear` Director turn 53 只要求接受邀请、走夜路、抵达真正的家；没有要求钥匙齿痕或同一把钥匙。 证据：`run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-53/06-llm-calls.json`。说明：first divergence 不在 Director 输出。
- `present-ambiguous` Narrator prompt 含多个铁门/住所相关状态：旧铜钥匙记忆、真正的家、铁门后的短通道与内室等，但没有 key object identity 或齿痕属性表。 证据：`run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-53/03-story-state.json`；`run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-53/06b-narrator-prompt.md`。说明：上下文给了“旧铜钥匙”和“另一处铁门”的材料，但没有可执行的同一/不同钥匙判定。
- `absent` “齿痕不同”这个具体物件属性在玩家可见历史、Director 输出和 Narrator prompt 中均未建立。 证据：`run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-53/06b-narrator-prompt.md`；`run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-53/06-llm-calls.json`。说明：该细节是 Narrator 在生成正文时新增的 object property。

竞争压力：
- 两处相似空间都以铁门为入口，叙述需要让“真正的家”与暗街铁门居所区分开。
- 早期事件记忆突出“老式铜钥匙打开铁门”，当前场景也需要开另一扇铁门。
- 写作风格偏向以触觉/物件细节制造神秘感，容易把钥匙齿痕写成线索。
- 缺少 object identity/property registry，无法强制 Narrator 在“同一把钥匙”和“另一把钥匙”之间选择一致表达。

## Causal Chain
- firstDivergenceArtifact: `run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-53/06-llm-calls.json call[1] Narrator text；随后规范化到 turn-53/04-output.json。`
- triggeringPressure: Narrator prompt 同时给出此前“老式铜钥匙”记忆与当前“真正的家/另一扇铁门”的场景目标，文本又倾向用物件差异制造隐秘感。
- missingGuard: 缺少钥匙 object identity 和属性一致性约束：如果引用“那把”旧铜钥匙，就必须保持同一对象属性；如果要写齿痕不同，就必须显式写成另一把钥匙或删去比较。通用“不要编造”没有变成物件级校验。
- mechanismStatement: 在多个相似铁门和一个松散的“老式铜钥匙”记忆之间，系统没有提供可执行的 key identity contract，Narrator 将区分新地点的压力转化为无依据的“齿痕不同”物件线索，同时又用“那把”绑定到旧钥匙，形成同句事实冲突。
- directCause: Narrator 新增了未建立的 object property（齿痕不同），并把它错误地附着到此前见过的同一把钥匙上。
- propagation: 矛盾直接出现在 turn 53 玩家可见正文；turn 54 之后未继续提钥匙，因此本批次内没有进一步固化到选择或状态，但物件一致性已经被破坏。

nonCauses:
- 不是玩家输入造成：玩家只接受邀请并跟随。
- 不是评测误判：同一句内部已经足以构成冲突。
- 不是隐藏设定可解释的问题：即使隐藏世界里存在多把钥匙，玩家可见表达仍应避免把“那把”和“齿痕不同”绑定。
- 不是 Director 决策错误：Director 没有要求钥匙齿痕或同一钥匙。

## Root Cause
- label: `unsupported-detail-inference`
- family: `agent-system`
- secondaryFamilies: `llm-self`
- description: 系统没有为跨场景复用道具提供 object identity/property grounding。触发压力是旧铜钥匙记忆与另一扇铁门并存；缺失防线是“同一对象不得变更齿痕、不同对象不得称为那把”的物件级约束；失败运动是 Narrator 把普通开门动作扩写成一个 unsupported clue，并在同句中自相矛盾。

fixSurface:
- object identity registry: keyId、knownDescription、knownProperties、lastSeenTurn
- Narrator prompt guard: object properties not in visible/state evidence cannot be newly contrasted as facts
- post-generation consistency check: same-object reference + changed physical attribute triggers rewrite
- state/prompt assembly: distinguish prior key memory from current door affordance，避免只用泛称“旧钥匙”

## Evidence
玩家可见证据：turn 9 只有“一把钥匙——老式的长柄铜钥匙”打开暗街铁门；turn 53 写“那把旧铜钥匙你在暗街铁门上见过的那把，但它的齿痕不同”。

内部链路证据：turn-53/06-llm-calls.json call[0] Director output 没有钥匙齿痕；call[1] Narrator 首次生成矛盾句。turn-53/06b-narrator-prompt.md 中能找到旧铜钥匙记忆和多个铁门/真正的家状态，但没有“齿痕不同”依据或 key identity schema。

## Recommended Fix Area
优先建立物件身份与属性一致性层：对钥匙、门、照片等可复用道具在 state/prompt 中携带稳定 ID 和已知属性，并在 Narrator 输出后检查同一对象属性变更。

## Confidence
`high`
