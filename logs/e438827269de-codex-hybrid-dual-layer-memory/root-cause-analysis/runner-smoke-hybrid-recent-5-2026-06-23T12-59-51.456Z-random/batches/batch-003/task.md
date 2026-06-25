请使用这个 skill 分析一个互动叙事一致性问题批次的根因：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/skills/consistency_root_cause/skills/issue_tracer/SKILL.md

运行目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random

一致性评测输出目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random

玩家可见时间线：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl

本批次 issue 列表：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003/batch-issues.json

输出目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003

批次说明：
按 turn 顺序自动切分，控制单个 subagent 的分析负载。

本批次包含的 issue：
- issueIndex=9, turn=27, severity=medium, type=repeated-scene, scope=visibleText：新一轮没有直接承接玩家的确认动作，而是近乎逐句重复上一轮已完成的回答，并出现对白标点退化，形成明显重复演出。
- issueIndex=10, turn=34, severity=medium, type=space-time-break, scope=visibleText：出门目的此前被建立为去凯旋门晚宴，但当前轮在没有过渡或解释的情况下改成去公园，削弱了玩家对路线和行动目标的理解。
- issueIndex=11, turn=37, severity=low, type=quality-regression, scope=choices：这些选项从可执行的玩家动作漂移成较长的元叙事式意图说明，降低了互动选项的清晰度和格式稳定性。
- issueIndex=12, turn=39, severity=low, type=language-drift, scope=visibleText：单个繁体字混入简体中文正文，属于轻微但玩家可见的语言/字形稳定性问题。

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
