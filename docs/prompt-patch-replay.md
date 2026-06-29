# Prompt Patch Replay

Prompt Patch Replay is the first-version entry point for lightweight badcase replay.
It applies one prompt patch bundle to multiple badcase turns, replays the same turn
call chain through the matching `oreturn` source version, writes a new
`04-output.json` style result, and optionally judges whether each original issue
was fixed.

## Inputs

Replay config:

```json
{
  "replayId": "director-fix-2026-06-25",
  "logGroupDir": "logs/a4a2cfc1e411-dev-orchestrator-opt-0624",
  "runId": "runner-smoke-baseline-recent-5-2026-06-24T23-42-22.095Z",
  "turns": [2, 4, 17],
  "patchBundlePath": "./patch-bundle.json",
  "source": {
    "oreturnRepo": "/Users/lidong/Projects/MemoraXAI/codebase/oreturn",
    "versionPolicy": "require-matching-worktree"
  },
  "models": {
    "replay": {
      "provider": "openai-compatible",
      "baseUrl": "https://api.example.com/v1",
      "apiKeyEnv": "REPLAY_API_KEY",
      "model": "replay-model",
      "thinkingEnabled": false
    },
    "judge": {
      "provider": "openai-compatible",
      "baseUrl": "https://api.example.com/v1",
      "apiKeyEnv": "JUDGE_API_KEY",
      "model": "judge-model"
    }
  }
}
```

Patch bundle:

```json
{
  "id": "director-local-consistency-fix",
  "patches": [
    {
      "id": "director-rule-001",
      "originalText": "the exact original prompt paragraph",
      "replacementText": "the full replacement prompt paragraph"
    }
  ]
}
```

Each patch uses exact text replacement. During one case replay, every patch must
match exactly once across the whole same-turn call chain. No match fails the case;
multiple matches fail the case and the user should provide a longer original
prompt segment.

## Commands

Build context only, without calling a model:

```bash
node scripts/prompt-patch-replay.mjs --config /path/to/replay-config.json --dry-run-context-only
```

Run replay and judging:

```bash
REPLAY_API_KEY=... JUDGE_API_KEY=... \
  node scripts/prompt-patch-replay.mjs --config /path/to/replay-config.json
```

## Version Lock

The source `oreturn` commit is resolved in this order:

1. Source fields in `00-run-config.json`, if available.
2. The commit prefix from `logs/<branch-version>`.
3. `source.oreturnCommit` in replay config, only when logs do not expose a source commit.

For real replay, `source.oreturnRepo` is treated as the source repository. The
tool creates or reuses an isolated managed worktree under
`.worktrees/prompt-patch-replay/oreturn-<sourceCommit>/` and runs replay there.
This protects replay from silently using a newer or different novel system
implementation than the badcase logs were generated with, without changing the
user's main `oreturn` checkout.
Set `source.followBadcaseCommit` to `false` to run replay from the current
`HEAD` of `source.oreturnRepo` instead. This is useful for local experiments,
but the replay engine version will no longer strictly match the original
badcase logs.
If `source.oreturnCommit` is provided while logs also expose a source commit, the
values must match by prefix.

## Outputs

Results are written under:

```text
logs/<branch-version>/prompt-patch-replay/<replay-id>/
```

Important files:

- `replay-config.json`: normalized replay config.
- `patch-bundle.json`: copied patch bundle.
- `resolved-source-version.json`: source/replay engine commit lock result.
- `cases/turn-XXX/turn-replay-context.json`: rebuilt case input.
- `cases/turn-XXX/new-04-output.json`: replayed player-visible output.
- `cases/turn-XXX/llm-calls.json`: patched LLM calls and metadata.
- `cases/turn-XXX/patch-application.json`: where each patch matched.
- `cases/turn-XXX/issues/*/judge-result.json`: per-issue judge result.
- `summary.md` and `summary.json`: replay summary.
