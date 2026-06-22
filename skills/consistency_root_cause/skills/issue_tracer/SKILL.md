---
name: narrative-consistency-root-cause-tracer
description: Use when tracing evaluated interactive narrative consistency issues back to root causes from run logs, consistency evaluator outputs, visible timelines, Director/Narrator/Choice prompts, story state, runtime artifacts, and LLM call logs. Trigger when asked why a specific evaluated issue happened, whether an issue came from memory/context/agent pipeline/model behavior, or when producing root-cause reports for one or more consistency issues.
---

# Narrative Consistency Root Cause Tracer

Use this skill after a consistency evaluator has identified a possible player-visible issue. The goal is to decide whether the issue is real, then trace how it arose, and finally classify the underlying system capability that failed. Do not re-review the whole story unless the target issue cannot be understood without more context.

`trace.md` is an index packet, not the analysis itself. Use it to locate artifacts, then synthesize the visible timeline, story state, prompts, outputs, and handoffs before assigning a root cause.

Trace causes to the system-mechanism layer. The report must explain what made the bad continuation likely, and what system-level guard would have prevented the same failure shape from recurring.

Use this depth ladder:

- L0 `symptom`: what the player saw. This proves the issue; it is not the root cause.
- L1 `divergence`: the first artifact where the chain went wrong, such as a Director decision, Narrator output, Choice output, story state, event, or writeback. This locates the failure; it is not enough by itself.
- L2 `direct cause`: the local pressure that made that artifact go wrong, such as a foregrounded instruction, stale summary, buried recent fact, ambiguous selected action, over-strong fixed beat, missing player input, or unsupported inference.
- L3 `root mechanism`: the reusable system mechanism that allowed L2 to happen, such as weak handoff contract, missing current-scene anchor, unclear context priority, fixed beat lifecycle gap, choice-action binding gap, state writeback gap, memory persistence gap, or model-local failure after clear instructions. This is the target depth for `rootCause`.
- L4 `fix surface`: the concrete code, prompt, schema, state model, evaluator, or script area to change. Include it as `fixSurface` or `recommendedFixArea`; do not confuse it with the causal claim.

Stop at L3 unless the logs prove a narrower implementation bug. Do not stop at L1 component names, and do not jump beyond L3 into speculation about model training, provider quality, or broad architecture preferences.

## Diagnostic Protocol

Apply these gates in order. Do not skip straight to a worker name.

### 1. Target

Identify the run, consistency output, issue index or turn, and target issue type. Build a trace packet when possible:

```bash
node <skill-dir>/scripts/build-trace-packet.mjs \
  --run <run-dir> \
  --review <consistency-output-dir> \
  --issue-index <1-based-index> \
  --out <analysis-dir>
```

For turn-only analysis:

```bash
node <skill-dir>/scripts/build-trace-packet.mjs \
  --run <run-dir> \
  --review <consistency-output-dir> \
  --turn <turn-number> \
  --out <analysis-dir>
```

### 2. Validity Gate

Use only player-visible evidence to decide whether the evaluated issue is valid: player input, selected choice, visible text, visible choices, and visible pre-LLM events. Use hidden artifacts only after the player-visible problem is established.

Set `issueValidity`:

- `valid`: the player-visible output contains a real inconsistency, unsupported jump, ignored core action, repetition, or degradation that is not reasonably explained by the scene.
- `questionable`: the evaluator may be pointing at a real risk, but the visible evidence allows plausible readings.
- `invalid`: the issue is unsupported, depends on hidden facts, or mistakes legitimate interactive adaptation for an error.

For player-input issues, judge core actionable intent rather than literal wording. Interactive fiction may adapt the player's phrasing through character knowledge, risk, world rules, tone, and pacing. Treat it as valid only when the output replaces or blocks the core intent without a plausible in-world reason, or when later choices lock the player into the replacement.

If the issue is `invalid`, stop root-cause tracing. Report the evaluation mismatch and omit `rootCause`.

### 3. Context Assessment

Reconstruct the story situation immediately before the target output. For each relevant fact, intention, constraint, or scene state, record where it appears and how strong it is.

Use these availability labels:

- `absent`: not present in the artifact that needed it.
- `present-clear`: present in a concise, unambiguous form.
- `present-buried`: present only inside long prose or low-salience context.
- `present-ambiguous`: present but open to multiple readings.
- `contradicted`: present alongside conflicting information.
- `stale`: present but outdated relative to newer visible text.
- `over-constraining`: an artifact pushes too hard toward a specific action or fact.
- `not-needed`: artifact did not need this information for its role.

Check these sources as needed:

- Player-visible timeline and choices.
- `turn-XX/03-story-state.json`.
- `turn-XX/04-output.json`.
- `turn-XX/06a-director-prompt.md`.
- `turn-XX/06b-narrator-prompt.md`.
- `turn-XX/06c-choice-prompt.md`.
- `turn-XX/06-llm-calls.json`.
- `turn-XX/07-events.json`.
- `turn-XX/05-runtime-after.json`, only when writeback or transition is suspected.

Synthesize data by role:

- **Validity evidence**: player input, selected choice, visible text, visible choices, and visible pre-LLM events. Use these to decide whether the issue exists. Do not use hidden script, secrets, or internal state to call something player-visible wrong.
- **Situation reconstruction**: previous visible turns, current turn trigger, `recentTurns`, current and history storyline summaries, current scene/entity states, candidate actions, and runtime state before the target turn. Use these to state what the system should have continued from.
- **Contract and salience evidence**: Director/Narrator/Choice prompts, LLM call messages, system prompts, resolved plot point, required content, constraints, and prompt ordering. Use these to decide what each worker was actually asked to do, what was foregrounded, what was buried, and what was absent.
- **Propagation evidence**: raw worker outputs, normalized `04-output.json`, choices, writes, events, and runtime-after. Use these to trace where the bad interpretation first appeared and whether it was later locked into state or options.
- **Environment and configuration evidence**: run metadata, branch or code version when available, model/provider, recent-turn settings, memory backend settings, and script parameters. Use these to explain why a failure shape may differ across runs, but do not let configuration comparison replace artifact-level tracing.
- **Cross-turn evidence**: target turn, at least one preceding turn, and the next turn when propagation or writeback matters. Use extra turns only when the issue depends on longer memory or storyline lifecycle.

Do not read every artifact mechanically. Pick the smallest set that can answer validity, current situation, worker contract, first divergence, and propagation.

Also record competing pressures: fixed script, storyline, player input, selected choice semantics, pacing, style instructions, secret boundaries, current scene affordances, or world rules.

Do not stop at "the needed fact was present" or "the needed fact was missing." Explain prompt salience and enforceability:

- Was the fact in a dedicated field, or buried inside long prose?
- Was it closer to the final instruction than the conflicting material?
- Did another artifact phrase the next action more forcefully?
- Did the prompt include a hard constraint, or only a general principle such as "stay consistent"?
- Was the player input visible to the worker that wrote the bad output, or only translated through another worker?
- If a fixed beat was active, did the prompt say how to adapt it when the literal trigger no longer matched the latest visible state?

### 4. Causal Chain

Find the first artifact where the output diverged from the valid visible context. Then trace how later artifacts propagated or corrected it.

Common divergence points:

- Input or choice binding changes what the player selected.
- Story state or summary starts from stale, missing, or over-authoritative context.
- Director output makes a wrong plot decision or weakens an important constraint.
- Narrator output violates the Director brief or visible context.
- Choice output offers options that contradict the ending state or lock in a bad interpretation.
- Runtime events or writeback make the next turn start from the wrong state.
- The evaluator itself is the first bad artifact, meaning the issue is invalid or questionable.

Do not make the divergence point the root cause class. `Director`, `Narrator`, `Choice`, `storyline`, and `statefold` are locations in the chain, not root-cause classes.

After identifying the first divergence, write a concrete mechanism statement before choosing any label. It must cover all three causal roles:

1. **Triggering pressure**: the prompt, state, output, lifecycle state, or handoff shape that locally pulled the system toward the bad result.
2. **Missing guard or weak contract**: the absent, buried, ambiguous, stale, contradicted, or non-enforceable instruction that should have prevented it.
3. **Failure motion**: how the worker or pipeline moved from that pressure to the visible issue.

If the mechanism statement can be reused unchanged for many unrelated issues, it is too generic. Refine it until it names the issue-specific artifact shape.

The mechanism statement should be issue-specific but not case-specific. Name the artifact shape, prompt salience, data transformation, lifecycle state, or contract strength. Do not name a remembered incident unless that exact incident is the current target.

Bad mechanism statements:

- "The prompt was unclear."
- "Narrator ignored context."
- "Director handoff issue."
- "recent-context failure."

### 5. Root Cause Mechanism

After the causal chain is clear, name the concrete mechanism that made the issue possible. This mechanism is the primary root-cause label. The coarse class is only a family for aggregation.

Use a short mechanism label. Prefer these when they fit, or write a similarly specific free-form label:

- `storyline-lifecycle`: storyline node activation, completion, transition, or consumed-state handling failed.
- `fixed-beat-consumption`: fixed script or required beat was reused after being consumed, resolved, or made incompatible by recent visible text.
- `context-priority`: conflict priority between recent visible text, storyline, state, or hidden material was unclear or wrong.
- `handoff-contract`: one worker handed off an underspecified, softened, or contradictory instruction to another worker.
- `choice-action-binding`: selected choice, action id, or option semantics did not match the player-visible situation.
- `state-writeback`: runtime events, summaries, or state writes made the next turn start from the wrong state.
- `memory-persistence`: a fact should have been persisted but was unavailable later.
- `unsupported-detail-inference`: the model converted an ordinary or ambiguous visible detail into an unsupported factual clue, object property, ability, motivation, or backstory.
- `model-local`: the local generation failed despite clear context and contract.

When storyline or fixed script participates, explicitly check whether the relevant beat is unstarted, active, consumed, resolved, or incompatible with the latest visible state. If a fixed beat is still narratively required but its literal entry action is no longer valid, say whether the system should bridge, rewrite the trigger, or delay the node.

Before finalizing the root cause, run this specificity check:

- The `label` must be a mechanism, not `Director`, `Narrator`, `Choice`, `storyline`, `statefold`, `agent-system`, `recent-context`, or `llm-self`.
- The `description` must name the concrete trigger and missing guard.
- The `fixSurface` must point to the system surface that would prevent the mechanism, not merely the component that emitted the bad text.
- If the issue depends on prompt layout, say what was foregrounded, what was buried, and what was absent.
- If the issue depends on a fixed beat, say whether the beat was valid, consumed, incompatible, or needed a bridge.
- If the issue depends on player input or selected choice, say whether the core action was preserved as a must-satisfy contract.

### 6. Root Cause Family

Classify only valid issues. Choose the coarse system capability whose improvement would most directly prevent recurrence. Do not present this family as the root cause when a more specific mechanism is known.

Use exactly one primary family:

- `meta-memory`: Long-term narrative memory failure. Use when a story-scale relationship, world rule, major event, secret boundary, character role, or cross-arc fact is forgotten or confused, usually outside the recent context window.
- `detail-memory`: Detail fact memory failure. Use when a concrete fact such as object location, appearance, door material, clothing, exact wording, or local scene detail was not persisted as a stable fact and is later contradicted.
- `recent-context`: Recent context or current scene maintenance failure. Use when the issue depends on the last few turns, the active scene state, repeated performance, immediate continuity, pacing drift, or stale current storyline.
- `agent-system`: Pipeline, handoff, schema, prompt contract, context assembly, choice semantics, action binding, priority rules, or constraint lifecycle failure. Use when needed information was available but lost, softened, contradicted, mispackaged, or not enforced between components.
- `llm-self`: Local model generation quality failure. Use when context and contract were present and clear, no pipeline pressure explains the issue, and the error is best described as a local slip, hallucination, malformed output, or style break.

Decision rules:

- If the relevant information is absent because it was never persisted and is no longer recent, prefer `meta-memory` or `detail-memory`.
- If the relevant information is absent because prompt assembly or worker handoff failed, prefer `agent-system`.
- If the relevant information is recent but not preserved or prioritized, prefer `recent-context`; if it was present but not made actionable or enforceable, consider `agent-system` primary and `recent-context` secondary.
- If all needed information and constraints were clear in the worker prompt, use `llm-self` only after excluding system pressure, ambiguity, and contract gaps.
- Add secondary root causes only when they materially changed the outcome.

Do not let the coarse family hide the mechanism. For example, `agent-system` is incomplete and should not be the report headline unless no more specific mechanism can be identified. A report should say `fixed-beat-consumption` or `storyline-lifecycle` first, then say its family is `agent-system`.

## Output Contract

For each issue, produce one structured item:

Write reports in Chinese. Markdown prose and JSON explanatory fields should use Chinese. Keep enum values, mechanism labels, file paths, field names, code identifiers, and artifact names in their original language.

```json
{
  "issueId": "string",
  "turn": 45,
  "issueValidity": "valid",
  "problemSummary": "玩家可见问题摘要。",
  "validityAssessment": {
    "verdictReason": "为什么该 issue 有效、可疑或无效。",
    "playerVisibleSupport": "只使用玩家可见证据。",
    "caveats": ["解释空间或评测风险。"]
  },
  "contextAssessment": {
    "actualStateBeforeIssue": "问题发生前玩家实际看到的剧情状态。",
    "relevantFacts": [
      {
        "claim": "需要追踪的事实、意图或约束。",
        "availability": "present-clear",
        "artifacts": ["turn-45/06a-director-prompt.md"],
        "notes": "该信息以什么强度进入链路。"
      }
    ],
    "competingPressures": ["固定演出、storyline、玩家输入、节奏等压力。"]
  },
  "causalChain": {
    "firstDivergenceArtifact": "最早发生偏离的 artifact；无效 issue 可写 evaluator。",
    "triggeringPressure": "把生成拉向错误方向的具体 prompt、状态、固定演出、历史文本或输出片段。",
    "missingGuard": "本应阻止错误但缺失、被埋没、歧义、过期或不可执行的约束。",
    "mechanismStatement": "一句具体机制说明，必须说明 triggeringPressure + missingGuard 如何导致玩家可见问题。",
    "directCause": "直接原因。",
    "propagation": "错误如何传播或被固化。",
    "nonCauses": ["看似相关但不是主因的因素。"]
  },
  "rootCause": {
    "label": "mechanism-label",
    "family": "agent-system",
    "secondaryFamilies": ["recent-context"],
    "description": "具体机制说明，必须包含触发压力、缺失防线和失败运动。",
    "fixSurface": ["最直接能阻止该机制复发的系统表面"]
  },
  "evidence": {
    "playerVisible": "玩家可见证据。",
    "internalTrace": "内部链路证据。"
  },
  "recommendedFixArea": "优先修复的系统区域。",
  "confidence": "high"
}
```

`issueValidity` must be `valid`, `questionable`, or `invalid`.

`confidence` must be `high`, `medium`, or `low`.

For `invalid` issues, omit `rootCause` unless there is a separate real system issue to report.

When writing a Markdown report, use these sections:

- Problem
- Validity
- Context Assessment
- Causal Chain
- Root Cause
- Evidence
- Recommended Fix Area
- Confidence

## Discipline

- Start from the evaluated player-visible problem, not from code diffs or known prompt changes.
- Do not stop at the surface symptom. "Ignored context", "handoff failed", "Director was vague", and "agent-system" are starting points, not final root causes.
- Do not use hidden facts to declare a player-visible error.
- Do not require literal compliance with player input when the scene plausibly adapts the core intent.
- Do not treat every cross-turn issue as memory; first check whether the needed information was recent or already present.
- Do not treat every bad output as `llm-self`; first check whether context representation, prompt contract, or handoff made the error likely.
- Do not overfit to previous examples. If a new issue does not match a remembered pattern, follow the diagnostic gates again.
