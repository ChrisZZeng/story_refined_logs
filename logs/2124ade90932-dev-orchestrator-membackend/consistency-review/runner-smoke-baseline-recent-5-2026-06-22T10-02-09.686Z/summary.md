# 一致性评测汇总

本次评测只跑一次 coordinator 和 batch reviewer。批次审阅会标注每条 issue 的 scope，聚合层再同时生成两种报告。

- 运行目录：/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z
- 总轮数：50
- 批次数：5

## visibleText 正文报告

- 第一次出现问题的轮次：3
- 出现问题的轮次数：11
- 问题总数：13
- 不确定问题轮次数：0
- 问题轮次：3, 8, 9, 10, 11, 19, 21, 38, 43, 47, 49

## fullTurn 完整玩家体验报告

- 第一次出现问题的轮次：3
- 出现问题的轮次数：13
- 问题总数：16
- 问题 scope 分布：{"choices":2,"visibleText":13,"mixed":1}
- 不确定问题轮次数：0
- 问题轮次：3, 8, 9, 10, 11, 19, 21, 29, 38, 43, 47, 49, 50
