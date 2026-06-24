# Review Guidelines Used

This batch follows the `narrative-consistency-batch-reviewer` skill.

- Only player-visible evidence is used: `playerInput`, `preLlmEvents`, `visibleText`, and `choices`.
- The window range provides context; only the eval range counts toward this batch's issue total.
- Full turns are reviewed end-to-end, including body text, choices, and any pre-LLM events.
- Issues are labeled with `scope` as `visibleText`, `choices`, `preLlmEvents`, or `mixed`.
- Issue types follow the skill taxonomy such as `fact-conflict`, `unsupported-jump`, `quality-regression`, and `protocol-break`.
- If evidence is insufficient, the turn is left unflagged rather than guessed.

