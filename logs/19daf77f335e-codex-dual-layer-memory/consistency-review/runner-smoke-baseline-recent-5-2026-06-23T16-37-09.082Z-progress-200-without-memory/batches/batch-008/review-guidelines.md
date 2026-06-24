# Review Guidelines Used

This batch used the local `narrative-consistency-batch-reviewer` skill and its referenced `review_guidelines.md`.

Key rules applied:

- Count only issues first manifesting in the evaluated range, turns 71-80.
- Use turns 61-70 only as context or conflict evidence.
- Review complete player-visible turns: `visibleText`, `choices`, and `preLlmEvents`.
- Use only player-visible evidence: player inputs, visible generated text, visible choices, and visible pre-LLM events.
- Do not use hidden script facts or internal runtime state.
- Mark each issue with `scope`, `type`, `severity`, `source`, current evidence, conflicting evidence, and reason.
