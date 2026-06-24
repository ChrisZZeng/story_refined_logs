# Batch Method

Input:

- Run dir: `/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory`
- Timeline: `/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`
- Window range: 131-150
- Eval range: 141-150
- Output dir: `/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-015`

Method:

1. Read the specified window turns in order.
2. Treat 131-140 as context only.
3. Review each full player-visible turn in 141-150, including `visibleText`, `choices`, and `preLlmEvents`.
4. Check for continuity, unsupported jumps, action/space-time breaks, language drift, and other visible quality issues.
5. Count only issues that fall inside 141-150.

