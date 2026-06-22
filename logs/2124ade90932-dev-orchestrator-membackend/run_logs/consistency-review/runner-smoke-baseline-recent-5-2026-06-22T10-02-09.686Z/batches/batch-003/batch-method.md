# Batch 003 Method

- Used `skills/consistency_evaluator/skills/batch_reviewer/SKILL.md` and its `references/review_guidelines.md`.
- Read the visible timeline for turns 11-30 from `visible-timeline.jsonl`.
- Treated turns 11-20 only as window context and possible conflict evidence.
- Counted only problems whose affected turn is in the evaluated range 21-30.
- Reviewed `visibleText`, `choices`, and `preLlmEvents` for every turn in the window. All `preLlmEvents` in turns 11-30 were empty.
- Performed targeted visible-timeline lookups for earlier player-visible facts involving Karina, 德索洛, 暗街, the three-day condition, the bookshelf/drawer warning, and photo state. Did not read hidden script state or the full run body.
- Did not count reasonable elaborations, ambiguous rule refinements, or issues already counted in earlier batches unless they produced a new player-visible inconsistency inside turns 21-30.
