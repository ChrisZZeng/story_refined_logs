export function caseTurnSelection({
  selectedCaseTurn,
  selectedPromptTurn,
  nextTurn,
  hasDirtyPromptEdits,
} = {}) {
  return {
    selectedCaseTurn: nextTurn ?? selectedCaseTurn,
    selectedPromptTurn,
    selectedRunIndex: 1,
    shouldLoadPromptSources: false,
    shouldConfirmDirtyPromptEdits: false,
  };
}

export function promptTurnLoadState({
  selectedCaseTurn,
  selectedPromptTurn,
  hasDirtyPromptEdits,
} = {}) {
  if (selectedCaseTurn === selectedPromptTurn) {
    return {
      canLoad: false,
      needsConfirmation: false,
      reason: 'same-turn',
    };
  }
  return {
    canLoad: true,
    needsConfirmation: hasDirtyPromptEdits === true,
    reason: hasDirtyPromptEdits === true ? 'dirty-drafts' : 'different-turn',
  };
}
