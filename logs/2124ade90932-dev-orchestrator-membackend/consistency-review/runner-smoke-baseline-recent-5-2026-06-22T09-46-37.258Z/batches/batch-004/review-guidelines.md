# Review Guidelines Used

This batch was reviewed under the `narrative-consistency-batch-reviewer` rules.

Only player-visible evidence was used:

- player input
- generated-before-LLM visible events
- visible story text
- visible choices

Hidden script facts, private intent, internal state, and full run body details were not used as evidence.

Issues were counted only if they occurred in the evaluated range, turns 31-40. Turns 21-30 were used only as context or conflict evidence.

Each issue records:

- turn
- scope: `visibleText`, `choices`, `preLlmEvents`, or `mixed`
- type
- severity
- current evidence
- conflicting evidence
- conflicting turns
- source
- reason

Severity meanings:

- `high`: breaks core plot, identity, location, event, or readability.
- `medium`: clearly hurts continuity while the scene remains broadly understandable.
- `low`: local action, object, wording, or continuity issue worth recording.

Source meanings:

- `player-input`: mainly introduced by player input.
- `model-output`: mainly introduced by generated output.
- `mixed`: introduced by player input and reinforced by generated output.
- `uncertain`: visible problem is confirmable, but source is unclear.
