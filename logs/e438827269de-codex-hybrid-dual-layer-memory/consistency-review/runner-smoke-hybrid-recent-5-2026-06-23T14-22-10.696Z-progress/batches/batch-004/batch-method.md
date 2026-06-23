# Batch 004 审阅方法

本批次按 `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/evaluation_suite/tools/consistency_evaluator/skills/batch_reviewer/SKILL.md` 和其 `references/review_guidelines.md` 执行。

## 输入确认

- 运行目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory-remote-backup-20260623-214734/tmp/hybrid-progress-50-rerun-20260623-v2/runner-smoke-hybrid-recent-5-2026-06-23T14-22-10.696Z`
- 玩家可见时间线：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory-remote-backup-20260623-214734/tmp/hybrid-progress-50-rerun-20260623-v2/runner-smoke-hybrid-recent-5-2026-06-23T14-22-10.696Z/consistency-review/visible-timeline.jsonl`
- 窗口范围：21-40
- 重点评估范围：31-40
- 输出目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory-remote-backup-20260623-214734/tmp/hybrid-progress-50-rerun-20260623-v2/runner-smoke-hybrid-recent-5-2026-06-23T14-22-10.696Z/consistency-review/batches/batch-004`

## 读取方式

1. 读取输出目录中的 `task.md` 中文原文，确认运行目录、窗口、重点范围和输出要求。
2. 从 `visible-timeline.jsonl` 读取 21-40 的玩家可见 turn，逐轮检查 `visibleText`、`choices` 和 `preLlmEvents`。
3. 对 31-40 做计数审阅；21-30 只用于上下文和冲突证据。
4. 按需用关键词回查完整玩家可见时间线中的相关玩家可见证据，主要关键词包括“匿名信封”“今天早上才踏进暗街”“暗街公寓”“你记得拍下这张照片”“承认弄哑铃铛的人是你自己”“是别人放进去的”。未通读完整运行正文。

## 判定口径

只使用玩家已经输入的内容、生成前玩家可见事件和玩家实际看到的正文/选项作为证据。不使用隐藏剧本、内部状态、角色卡或导演私有意图。窗口上文的问题不在本批次重复计入，只在重点评估范围内产生新玩家可见问题时计入。
