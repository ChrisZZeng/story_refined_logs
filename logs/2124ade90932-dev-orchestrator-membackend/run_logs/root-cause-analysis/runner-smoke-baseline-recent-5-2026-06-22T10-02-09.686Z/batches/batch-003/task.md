请使用这个 skill 分析一个互动叙事一致性问题批次的根因：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/skills/consistency_root_cause/skills/issue_tracer/SKILL.md

运行目录：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z

一致性评测输出目录：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z

玩家可见时间线：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/visible-timeline.jsonl

本批次 issue 列表：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-003/batch-issues.json

输出目录：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/batches/batch-003

批次说明：
按 turn 顺序自动切分，控制单个 subagent 的分析负载。

本批次包含的 issue：
- issueIndex=7, turn=19, severity=low, type=quality-regression, scope=visibleText：句子存在明显残缺和误词，影响玩家阅读理解，属于局部文本质量回退。
- issueIndex=8, turn=19, severity=medium, type=repeated-scene, scope=visibleText：上一轮刚完成的称呼、同意调查和规矩提醒在第 19 轮被当作新内容再次演出，导致剧情进度倒退和重复。
- issueIndex=9, turn=19, severity=medium, type=unsupported-jump, scope=visibleText：德索洛从站立、双手垂在身侧突然变成单膝跪地并握住卡琳娜手指，中间没有玩家可见动作承接，明显改变了人物姿态和互动状态。
- issueIndex=10, turn=21, severity=medium, type=repeated-scene, scope=visibleText：上一轮已经完成的跟进、站到窗台前、询问德索洛是否可怜的场景在第 21 轮被完整当作新正文重复，导致交互进度短暂回退。

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
