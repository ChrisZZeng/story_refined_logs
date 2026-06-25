# Issue 18 Turn 27 Root Cause Report

## Problem

turn 27 把帕兹和卡琳娜的对话继续放在未到达的 `宴会厅`/晚宴语境中，并让卡琳娜称康纳为“这场晚宴的主人”。玩家可见时间线此前没有完成晚宴邀请、接受、出门、移动或进入宴会厅的桥段，因此这是 `unsupported-jump`。

## Validity

- `issueValidity`: `valid`
- 玩家可见支持：turn 22-25 持续显示卡琳娜公寓/暗街室内的私人会谈，反复出现茶几、书架、沙发、暖气管、黑猫和窗外雨声。
- turn 26 已先漂移到“宴会厅高窗”“水晶吊灯”“酒会”；turn 27 又加固为“这场晚宴的主人”“人群里发现你”“宴会厅里的低语和杯盏声”。
- caveat：turn 27 不是首次漂移点，而是 turn 26 错误场景的传播；但 issue 指向 turn 27 的新剧情逻辑仍成立。

## Context Assessment

- 实际可见状态：问题发生前，玩家仍应处在卡琳娜的公寓/暗街室内私人会谈中；玩家输入“确认一下时间，考虑该不该告辞”和“留下来，等她继续说康纳的事”只支持继续谈话或准备离开，不支持已在晚宴中。
- 关键事实：
  - `present-clear`: `visible-timeline.jsonl:turn-25` 与 `turn-27/06a-director-prompt.md` 的最近几轮正文都保留公寓线索。
  - `absent`: 可见时间线没有晚宴邀请、接受邀请、出门、穿过街区、到达宴会厅。
  - `present-clear`: `turn-25/04-output.json` / `turn-25/06-llm-calls.json` 中 Director 写明“为前往宴会厅做铺垫，但不在此轮实际推进地点变化”。
  - `contradicted`: `turn-25/05-runtime-after.json` 却把 `4-03-第一章` 完成并激活 `5-01-第一章`。
  - `over-constraining`: `turn-26/03-story-state.json`、`turn-27/03-story-state.json` 与对应 Director prompt 高显著度前置 `宴会厅` 节点。
- 竞争压力：阶段五 storyline 要求宴会厅、人群、康纳出场；最近可见正文虽保留公寓事实，但在 prompt 中被放在当前故事线之后，且没有 location conflict 的硬优先级。

## Causal Chain

- `firstDivergenceArtifact`: `turn-25/05-runtime-after.json`（同见 `turn-25/01-summary.json` 的 `beatAfterStateFold`）。该处把未可见完成的 `4-03-第一章` 标记完成，并将 active/current beat 推到 `5-01-第一章`。
- `triggeringPressure`: turn 26/27 的 active storyline 分别是 `5-01-第一章` 与 `5-02-第一章`，都强推 `宴会厅`、人群和康纳晚宴关联。
- `missingGuard`: statefold 没有检查 turn 25 的“本轮不实际推进地点变化”，也没有要求 visible text 中出现入场 transition 后才消费 `4-03`；prompt assembly 也缺少 current-scene anchor 来阻止 currentStoryline 覆盖最近可见地点。
- `directCause`: turn 26 Director 要求“宴会灯光”，Narrator 输出 `data-bg="宴会厅"` 与酒会环境；turn 27 Director 将 `scene` 设为 `宴会厅`，requiredContent 包含“晚宴的关联”和“宴会厅低语”，Narrator 生成“这场晚宴的主人”和“人群里发现你”。
- `propagation`: turn 26 choices 生成“留下来，等她继续说康纳的事”并绑定 `choice:wait_for_conor`，turn 27 再把该选择解释成宴会中继续铺垫康纳，runtime-after 继续推进到 `5-03`。

## Root Cause

- `label`: `storyline-lifecycle`
- `family`: `agent-system`
- `secondaryFamilies`: `recent-context`
- L3 mechanism：storyline 生命周期把一个未被玩家可见内容消费、且被 Director 明确标注为“不在此轮实际推进地点变化”的地点切换节点视为完成，提前激活依赖宴会厅的阶段五节点；缺失的防线是 visible-transition completion predicate 与 current-scene anchor。错误随后通过 prompt ordering 和 worker handoff 变成 Director/Narrator/Choice 的共同前提。

## Evidence

- 玩家可见：turn 25 仍有茶几、沙发、书架、暖气管和黑猫；turn 26/27 突然出现宴会厅高窗、水晶吊灯、酒会、人群、晚宴主人。
- 内部 trace：
  - `turn-25/04-output.json`: Director 的 `currentStorylineConstraints` 写“为前往宴会厅做铺垫，但不在此轮实际推进地点变化”。
  - `turn-25/05-runtime-after.json`: `currentBeatId` 变为 `5-01-第一章`，`completedBeatIds` 包含 `4-03-第一章`。
  - `turn-26/06-llm-calls.json`: Director requiredContent 包含“宴会灯光”，Narrator 输出宴会厅/酒会正文。
  - `turn-27/06-llm-calls.json`: Director `scene` 为 `宴会厅`，Narrator 输出“这场晚宴的主人”“人群里发现你”。

## Recommended Fix Area

优先修复 `quest/storyline statefold` 的 beat 完成与地点切换门控：为 `04-02/04-03` 这类 transition beat 增加 visible-transition predicate（邀请、接受、移动、到达），并在 prompt assembly 中加入 `current-scene anchor` 和 currentStoryline-vs-recent-visible conflict check。若后续节点与最近可见地点冲突，Director 必须 bridge、rewrite 或 delay，而不是直接使用后续节点。

## Confidence

`high`。可见问题、首次内部偏离、prompt 压力、LLM 输出与后续传播链条都能在 artifacts 中直接对应。
