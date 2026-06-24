# Batch 004 审阅方法

## 输入

- 运行目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- 玩家可见时间线：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`
- 窗口范围：21-40
- 重点评估范围：31-40
- 输出目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/batches/batch-004`

## 读取方式

1. 完整读取指定 `SKILL.md`，并读取其引用的 `references/review_guidelines.md`。
2. 从 `visible-timeline.jsonl` 读取 21-40 轮玩家可见窗口。
3. 对 31-40 轮逐轮审阅 `preLlmEvents`、`visibleText` 和 `choices`。本窗口中 31-40 轮的 `preLlmEvents` 均为空。
4. 使用关键词回查玩家可见时间线中的 `康纳`、`敏特`、`卡尔` 等线索，以确认候选冲突是否已有玩家可见铺垫；未通读完整运行正文。
5. 只将 31-40 轮内的问题计入 `batch-issues.json` 和 `batch-summary.json`；21-30 轮只作为上下文或冲突证据。

## 判定说明

31 轮把玩家未选择、也未展示过的康纳会面写成已经发生，构成关键剧情进度改写。33-34 轮围绕“卡琳娜后来还说了什么”重复引出并重复演出 32 轮已经揭示的信息，分别记录为选项层面的低严重度质量问题和正文层面的低严重度重复场景问题。
