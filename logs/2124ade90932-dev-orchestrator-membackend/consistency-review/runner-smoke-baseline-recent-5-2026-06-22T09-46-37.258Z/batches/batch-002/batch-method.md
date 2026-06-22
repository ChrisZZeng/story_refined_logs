# Batch Method

This batch used the narrative consistency batch reviewer skill and its referenced review guidelines.

- Read the skill file at `skills/consistency_evaluator/skills/batch_reviewer/SKILL.md`.
- Read the guideline file at `skills/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md`.
- Read `visible-timeline.jsonl` for turns 1-20.
- Used turns 1-10 only as context and conflict evidence.
- Evaluated and counted only turns 11-20.
- Checked `visibleText`, `choices`, and `preLlmEvents` for every evaluated turn.
- Did not read the full run prose outside the player-visible timeline.

The evaluated turns had no `preLlmEvents`; all reported issues therefore come from `visibleText`.
