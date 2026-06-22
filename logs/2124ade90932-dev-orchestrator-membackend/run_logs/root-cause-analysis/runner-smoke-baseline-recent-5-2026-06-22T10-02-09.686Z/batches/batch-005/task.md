请使用这个 skill 分析一个互动叙事一致性问题批次的根因：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/skills/consistency_root_cause/skills/issue_tracer/SKILL.md

运行目录：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z

一致性评测输出目录：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z

玩家可见时间线：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/visible-timeline.jsonl

本批次 issue 列表：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-005/batch-issues.json

输出目录：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-005

批次说明：
按 turn 顺序自动切分，控制单个 subagent 的分析负载。

本批次包含的 issue：
- issueIndex=15, turn=49, severity=low, type=space-time-break, scope=visibleText：前一轮她已经面对玩家并靠在窗台上，本轮却无过渡回退成刚把手搭上窗台且背对玩家。
- issueIndex=16, turn=50, severity=low, type=fact-conflict, scope=choices：选项把此前玩家可见环境中明确不存在的墙上照片当成可检查对象，制造了错误的交互 affordance。

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
