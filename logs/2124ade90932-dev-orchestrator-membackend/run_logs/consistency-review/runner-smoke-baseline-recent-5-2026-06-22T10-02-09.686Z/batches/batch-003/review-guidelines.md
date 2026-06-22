# Review Guidelines Used

This batch used the rules from:

`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md`

Applied rules:

- Judge only player-visible evidence: player input, player-visible pre-LLM events, visible text, and choices.
- Do not use hidden script facts, private director state, role cards, or internal runtime state as evidence.
- Window context may provide conflict evidence, but only evaluated-range turns are counted.
- Review complete player-visible turns, including `visibleText`, `choices`, and `preLlmEvents`.
- Mark every issue with `scope`: `visibleText`, `choices`, `preLlmEvents`, or `mixed`.
- Record clear low-severity continuity or interaction-state problems, not only severe hard contradictions.
- Use `uncertain` only when the player-visible problem is real but the source or evidence cannot be pinned down reliably.
