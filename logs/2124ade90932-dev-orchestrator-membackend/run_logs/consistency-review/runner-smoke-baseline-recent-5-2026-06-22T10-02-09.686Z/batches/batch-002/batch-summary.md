# Batch 002 Summary

- 运行目录：`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z`
- 玩家可见时间线：`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/visible-timeline.jsonl`
- 窗口范围：`1-20`
- 重点评估范围：`11-20`
- 审阅 turn 数：`10`
- 问题数：`4`
- 不一致 turn：`11, 19`
- 首个不一致 turn：`11`
- 不确定 turn：无

## 主要发现

1. Turn 11 有一处轻微空间连续性问题：卡尔在 turn 10 已从窗台跳下并蹲到沙发另一端，但 turn 11 又无承接地出现在窗台薄荷叶间。
2. Turn 19 是本批次主要问题点：正文无承接地把德索洛写成单膝跪地并握住卡琳娜指尖，同时重复演出了 turn 18 已经完成的“阁下 / 很好 / 可以查 / 规矩”交换。
3. Turn 19 另有一句明显残缺的中文表达：“不想在提起她面前——在一个陌生提她面前”，属于局部文本质量回退。

## Scope 覆盖

本批次逐轮检查了 `visibleText`、`choices` 和 `preLlmEvents`。窗口内 `preLlmEvents` 均为空；未发现选项本身造成的新不一致。所有已记录问题均发生在 `visibleText`。
