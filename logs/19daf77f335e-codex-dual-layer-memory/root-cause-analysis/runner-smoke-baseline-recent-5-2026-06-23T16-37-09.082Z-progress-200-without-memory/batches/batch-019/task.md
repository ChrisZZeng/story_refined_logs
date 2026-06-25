请使用这个 skill 分析一个互动叙事一致性问题批次的根因：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/skills/consistency_root_cause/skills/issue_tracer/SKILL.md

运行目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory

一致性评测输出目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory

玩家可见时间线：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl

本批次 issue 列表：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-019/batch-issues.json

输出目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-019

批次说明：
按 turn 顺序自动切分，控制单个 subagent 的分析负载。

本批次包含的 issue：
- issueIndex=61, turn=139, severity=medium, type=event-negated, scope=visibleText：此前壁炉灰烬已彻底冷透，后文却恢复为有余热且会崩裂作响的炭火，否定了已建立的物件状态。
- issueIndex=62, turn=139, severity=medium, type=space-time-break, scope=visibleText：屋内光照从已经整间明亮倒退成只有门缝和窗口小片天光，时间与空间状态缺少承接。
- issueIndex=63, turn=146, severity=low, type=fact-conflict, scope=choices：此前刚建立底片相机不能直接查看已拍画面的规则，当前选项却让玩家通过检查胶卷确认拍到了什么，造成相机规则上的轻微冲突。
- issueIndex=64, turn=147, severity=medium, type=unsupported-jump, scope=mixed：当前玩家输入承接了上轮选项里突然出现的相机包，模型正文又把它固定为椅子扶手边的实体，并把备用胶卷从此前稳定的防水袋归属改到相机包内。

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
