请使用这个 skill 分析一个互动叙事一致性问题批次的根因：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/skills/consistency_root_cause/skills/issue_tracer/SKILL.md

运行目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random

一致性评测输出目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random

玩家可见时间线：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl

本批次 issue 列表：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-002/batch-issues.json

输出目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-002

批次说明：
按 turn 顺序自动切分，控制单个 subagent 的分析负载。

本批次包含的 issue：
- issueIndex=5, turn=16, severity=low, type=quality-regression, scope=choices：两个选项都留下未配对的右引号，属于玩家可见选项格式瑕疵。
- issueIndex=6, turn=20, severity=medium, type=fact-conflict, scope=visibleText：玩家刚要应对第三次敲门，下一轮却把这次敲门的声源和质感从短促用力的指节敲击改写成喘息的手掌拍门，导致同一即时事件的感知证据前后不一致。
- issueIndex=7, turn=24, severity=low, type=fact-conflict, scope=visibleText：门此前刚被明确锁上，之后没有可见开锁动作，却被说成没有锁，造成局部物件状态冲突。
- issueIndex=8, turn=24, severity=medium, type=unsupported-jump, scope=visibleText：晚宴路线被说成一个仍然有效的既有邀请，但此前玩家只看到过去公寓的邀请，没有看到晚宴邀请被提出。

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
