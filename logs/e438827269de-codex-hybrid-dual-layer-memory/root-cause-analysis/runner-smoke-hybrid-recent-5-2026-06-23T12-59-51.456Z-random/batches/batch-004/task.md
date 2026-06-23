请使用这个 skill 分析一个互动叙事一致性问题批次的根因：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/skills/consistency_root_cause/skills/issue_tracer/SKILL.md

运行目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random

一致性评测输出目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random

玩家可见时间线：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl

本批次 issue 列表：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-004/batch-issues.json

输出目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-004

批次说明：
按 turn 顺序自动切分，控制单个 subagent 的分析负载。

本批次包含的 issue：
- issueIndex=13, turn=43, severity=medium, type=event-negated, scope=visibleText：上一轮刚完成的黑猫退回动作在本轮开头被回滚为尚未发生，并在本轮内重复演出，造成即时动作连续性断裂。
- issueIndex=14, turn=46, severity=low, type=space-time-break, scope=visibleText：黑猫上一轮已从椅子腿旁移动到书堆前，本轮没有移动承接就把它写回椅子旁，造成位置连续性错误。
- issueIndex=15, turn=47, severity=low, type=quality-regression, scope=choices：选项中的“她也想”把表达主体写得含混甚至错误，和后续实际展开的“我也想”不一致，影响玩家对所选行动的理解。
- issueIndex=16, turn=47, severity=low, type=unsupported-jump, scope=visibleText：正文替玩家断言卡琳娜曾说地图册读得最多，但此前玩家可见内容没有这个信息，导致对话依据被凭空添加。

要求：
- 必须逐条分析 batch-issues.json 中的每个 issue，包括 low。
- 每条 issue 都必须先做 issueValidity 判断：valid、questionable 或 invalid。
- 对 valid issue，必须追到 L3 root mechanism，不要停在 Director、Narrator、Choice、storyline、statefold、agent-system 或 recent-context。
- 对 questionable 或 invalid issue，也要写明为什么证据不足或为什么是评测误判。
- 每条 issue 都要生成独立目录：issues/issue-<index>-turn-<turn>/。
- 每条 issue 都要落盘 root-cause-report.md 和 root-cause-result.json。
- 可以使用 issue_tracer 的 build-trace-packet.mjs 为每条 issue 生成 trace packet。
- 分析必须综合玩家可见时间线、story state、Director/Narrator/Choice prompt、LLM calls、output、events 和 runtime-after 中必要的 artifact。
- 不要用隐藏信息倒推玩家可见错误；只有先用玩家可见证据确认问题成立后，才能使用内部 artifact 追根因。
- 报告用中文编写，enum、机制标签、字段名和文件路径保持英文。
- 完成后生成 batch-root-cause-summary.md 和 batch-root-cause-summary.json，汇总本批次每条 issue 的 validity、rootCause.label、family、confidence 和报告路径。
