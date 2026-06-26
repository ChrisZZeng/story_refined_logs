# Batch 001 Consistency Review

## Scope

- Run directory: `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/08ced2b5a658-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-25T15-11-25.586Z`
- Visible timeline: `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/08ced2b5a658-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-25T15-11-25.586Z/visible-timeline.jsonl`
- Window range: 1-10
- Evaluated range: 1-10

## Method

I reviewed turns 1-10 from the player-visible timeline, including `visibleText`, `choices`, and `preLlmEvents`. All turns in this batch had empty `preLlmEvents`, so no issue was based on pre-generation events. I counted only issues whose problematic player-visible occurrence was inside turns 1-10.

## Summary

- Evaluated turns: 10
- Issue count: 8
- Inconsistent turns: 4
- First inconsistent turn: 6
- Uncertain turns: 0

## Issues

1. Turn 6, `visibleText`, `space-time-break`, low: the earlier meeting with Karina is described as daytime or afternoon, while the established scene was at night during the celebration.
2. Turn 7, `visibleText`, `protocol-break`, low: one Karina dialogue line is missing the opening quote after the speaker tag.
3. Turn 9, `mixed`, `fact-conflict`, medium: the anonymous clue changes from a photo with one printed line into a letter with an address and a different photograph.
4. Turn 10, `visibleText`, `identity-drift`, medium: the player's selected line is tagged as Karina's dialogue while the narration says it is the player's voice.
5. Turn 10, `visibleText`, `fact-conflict`, medium: the camera changes from Nikon FM2 to Canon F1, and the red cord changes from Mint tying it to the protagonist tying it.
6. Turn 10, `visibleText`, `fact-conflict`, medium: the old group photo changes its scene, Mint's appearance, and the text on the back.
7. Turn 10, `visibleText`, `user-input-ignored`, medium: Karina treats an unspoken or unselected “should have died in another hemisphere” statement as something the player just said.
8. Turn 10, `visibleText`, `quality-regression`, low: “英浾” appears where the language list needs a readable language name.
