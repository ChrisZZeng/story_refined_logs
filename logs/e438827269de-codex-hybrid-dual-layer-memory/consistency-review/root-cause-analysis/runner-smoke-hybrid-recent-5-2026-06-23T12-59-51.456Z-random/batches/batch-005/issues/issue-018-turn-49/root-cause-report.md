# Root Cause Report

## Problem
Turn 49 中卡琳娜刚说完“但只有叫她卡尔的时候，她会眨一下眼睛”，下一句却写“你说完这句话的时候”，把 NPC 的发言短暂归因给玩家。

## Validity
issueValidity: `valid`

valid。玩家本轮只提出“她叫什么名字？”；之后关于卡尔名字由来、叫她卡尔时会眨眼等内容都由卡琳娜回答。紧接 NPC 台词后出现“你说完这句话”会让玩家看到说话主体漂移。

玩家可见证据：visible-timeline.jsonl 的 Turn 49 显示玩家说出“她叫什么名字？”，卡琳娜随后回答“她叫卡尔”，讲述名字由来，并说“但只有叫她卡尔的时候，她会眨一下眼睛”。下一段却是“你说完这句话的时候，低头看了一眼那只黑猫”。

Caveats:
- 严重度为 low：后文又回到卡琳娜与卡尔互动，没有长期改变身份。
- 部分可见引号段没有显式说话标签，可能增加阅读歧义；但上下文和内部 v3-html 的 data-speaker 都指向卡琳娜，评测并非依赖隐藏信息。

## Context Assessment
Turn 49 中，主角低头看黑猫并问卡琳娜“她叫什么名字？”。卡琳娜负责回答，说明黑猫叫卡尔、名字由来，以及只有叫她卡尔时她会眨眼。问题句发生在卡琳娜这段说明之后，主角没有新的发言。

Relevant facts:
- `present-clear` 本轮玩家核心行动/台词只是询问黑猫名字。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/01-summary.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/03-story-state.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/04-output.json`
  notes: selectedFromPreviousTurn 和 playerInput 均为“低头看那只黑猫，轻声问卡琳娜她的名字”；04-output 中对应玩家可见台词是“她叫什么名字？”。
- `present-clear` Director 明确安排：主角询问，卡琳娜回应并分享名字故事。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/04-output.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/07-events.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/06b-narrator-prompt.md`
  notes: plotPoint.summary、characterBeats 和 requiredContent 都把回答者指定为卡琳娜，没有要求玩家补充那句说明。
- `present-clear` v3-html 协议要求角色对白使用 data-speaker/data-to。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/06b-narrator-prompt.md`
  notes: Narrator prompt 最终输出提醒写明“角色对白必须使用 <p data-speaker=...>”。
- `present-clear` 出错前一句“但只有叫她卡尔的时候，她会眨一下眼睛”在 rawHtml 中属于卡琳娜。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/06-llm-calls.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/04-output.json`
  notes: raw narrator text 使用了 <p data-speaker="卡琳娜" data-to="帕兹"> 包裹该句；下一段却写“你说完这句话”。
- `absent` 系统没有把每个 utterance 的 speaker ownership 作为结构化 schema 或提交前 validator。
  artifacts: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/04-output.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/07-events.json`, `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/05-runtime-after.json`
  notes: 输出中还出现了若干纯 <p> 引号台词；事件流直接 committed，runtime-after 只更新 beat 计数，没有对说话归属进行修正。

Competing pressures:
- Narrator 使用第二人称视角写主角动作，容易在对话后套用“你说完这句话”的叙述模板。
- 本轮有长段卡琳娜讲述和多次猫反应，speaker ownership 需要跨多个段落维持。
- v3-html 虽有 data-speaker 文字协议，但正文是自由文本生成，不是逐 utterance schema。
- 前一 issue 的黑猫位置错误被带入本轮，但它只影响空间连续性，不是本次说话主体漂移的触发点。

## Causal Chain
First divergence artifact: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/06-llm-calls.json [streamText narrator] / /home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-49/04-output.json`

Triggering pressure: Narrator 需要把“主角问名字、卡琳娜讲故事、卡尔以动作回应”写成自然慢铺 prose；同时系统要求用第二人称叙述主角，模型在 NPC 台词后套用了“你说完这句话”的动作承接模板。

Missing guard: 缺少 role-locked dialogue plan 和提交前 speaker validator：Director 的“卡琳娜回应”没有被转成每一句台词的不可变 speaker 字段；v3-html 协议要求 data-speaker，但未强制拒绝未标注对白或检查“上一句 speaker=卡琳娜，下一句却称你说完”。

Mechanism statement: 在自由文本 Narrator handoff 中，说话归属只由 prompt 软约束维持；当 NPC 长段回答与第二人称动作叙述交错时，模型把 NPC 刚说完的句子接成了主角动作模板，而缺少 schema/validator 让该错误直接进入玩家可见文本。

Direct cause: Narrator 在卡琳娜台词后写出“你说完这句话的时候”，造成即时 speaker attribution slip。

Propagation: 错误写入 04-output.json 的 narrative/writes.visibleText，并在 07-events.json 中 committed；turn-49/06c-choice-prompt.md 接收了该错误文本，但 Choice 输出没有进一步放大身份漂移；05-runtime-after.json 没有修正机制。

Non-causes:
- 不是玩家输入替换：玩家没有说“只有叫她卡尔时会眨眼”。
- 不是 Director 误判：Director 明确要求卡琳娜回应并分享故事。
- 不是记忆或 storyline 问题：所需 speaker 信息就在同一输出前后文中。
- 不是 Choice 输出造成：选项生成发生在错误已提交之后。

## Root Cause
label: `speaker-attribution-contract`

family: `agent-system`

secondaryFamilies: `llm-self`

根因是 Narrator 的说话主体合约停留在自由文本提示层：Director 明确了“卡琳娜回应”，但没有把后续每句对白固化为 role-tagged utterance schema；v3-html data-speaker 也没有提交前校验。触发压力是长段 NPC 回答与第二人称主角动作交错，局部模型 slip 把 NPC 台词承接成“你说完”。

fixSurface:
- `Narrator handoff schema for dialogue turns / utterance speaker ownership`
- `v3-html parser/validator requiring quoted speech to carry data-speaker`
- `post-generation speaker-continuity checker before commit`

## Evidence
Player visible: Turn 49 玩家只问“她叫什么名字？”；卡琳娜随后连续回答并讲述卡尔名字由来；在“但只有叫她卡尔的时候，她会眨一下眼睛”之后，正文写“你说完这句话的时候”。

Internal trace: turn-49/04-output.json 的 plotPoint 明确“卡琳娜回应”；turn-49/06b-narrator-prompt.md 要求角色对白使用 data-speaker；turn-49/06-llm-calls.json 和 04-output rawHtml 显示前一句 data-speaker=卡琳娜，下一句却是“你说完这句话”；turn-49/07-events.json 直接 committed，06c-choice-prompt.md 只继承错误文本。

## Recommended Fix Area
优先把 dialogue ownership 从 prompt 文字要求升级为结构化合约：Director/Narrator handoff 生成 role-tagged utterance plan；Narrator 输出后强制校验所有引号台词必须有 data-speaker，并检查相邻叙述中的“你说完/她说完”是否与上一 utterance speaker 一致。

## Confidence
`high`
