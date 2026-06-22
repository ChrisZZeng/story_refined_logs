# Review Guidelines Used

The review used the referenced `review_guidelines.md` from the batch reviewer skill.

Key rules applied:

- Judge only player-visible evidence: player input, generated-before events visible to the player, visible prose, and choices.
- Do not use hidden plot facts, private director intent, character cards, or internal state as evidence.
- Count only issues inside the evaluation range, while using the wider window only as context and conflict evidence.
- Review every visible turn surface: `visibleText`, `choices`, and `preLlmEvents`.
- Mark each issue with `scope`: `visibleText`, `choices`, `preLlmEvents`, or `mixed`.
- Reasonable new detail is not an issue unless it negates, rewrites, or breaks earlier player-visible facts.
- Report clear continuity breaks in space, time, action, object state, interaction state, plot progress, language, names, or format.
- Use `source` values: `player-input`, `model-output`, `mixed`, or `uncertain`.
