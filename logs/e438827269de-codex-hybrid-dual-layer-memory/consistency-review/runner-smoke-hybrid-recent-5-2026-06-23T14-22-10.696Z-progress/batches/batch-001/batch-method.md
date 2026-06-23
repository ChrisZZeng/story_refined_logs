# Batch 001 审阅方法

输入任务指定：

- 运行目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory-remote-backup-20260623-214734/tmp/hybrid-progress-50-rerun-20260623-v2/runner-smoke-hybrid-recent-5-2026-06-23T14-22-10.696Z`
- 玩家可见时间线：`consistency-review/visible-timeline.jsonl`
- 窗口范围：1-10
- 重点评估范围：1-10
- 输出目录：`consistency-review/batches/batch-001`

执行步骤：

1. 完整读取并遵循指定的 `batch_reviewer/SKILL.md`。
2. 读取其引用的 `references/review_guidelines.md`，按玩家可见证据边界进行判断。
3. 从 `visible-timeline.jsonl` 只读取第1-10轮，覆盖每轮 `playerInput`、`visibleText`、`choices` 和 `preLlmEvents`。
4. 顺序核对空间时间、动作承接、物件状态、交互状态、剧情推进和语言格式。
5. 本批次重点评估范围等于窗口范围，因此所有发现问题均可计入；没有读取完整运行正文，也没有修改其他 batch。

判定边界：

- 只使用玩家输入、生成前玩家可见事件、正文和选项作为证据。
- 合理新增细节不判错；只有否定、改写或破坏已见上下文时计入。
- 明确但局部的连续性错误按 `low` 记录。
- 本窗口内 `preLlmEvents` 全为空；未基于隐藏状态或内部字段判错。
