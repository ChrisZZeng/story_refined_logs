export const PROMPT_ACCESS = {
  editable: {
    id: 'editable',
    title: 'Editable',
    badge: 'Edit',
  },
  viewOnly: {
    id: 'view-only',
    title: 'View only',
    badge: 'View',
  },
};

export function promptSourceEditState(source, { replayTurnCount } = {}) {
  if (source?.unavailable === true) {
    return {
      editable: false,
      reasonCode: 'PROMPT_SOURCE_UNAVAILABLE',
      reason: source.unavailableReason ?? 'Prompt source is unavailable for this version.',
    };
  }
  if (replayTurnCount === undefined && source?.editable === true) return { editable: true };
  if (replayTurnCount === undefined && source?.editable === false) {
    return {
      editable: false,
      ...(source.editBlockReasonCode !== undefined ? { reasonCode: source.editBlockReasonCode } : {}),
      ...(source.editBlockReason !== undefined ? { reason: source.editBlockReason } : {}),
    };
  }
  if (isTurnScopedObservedMaterial(source)) {
    if (replayTurnCount === 1) {
      return { editable: true };
    }
    return {
      editable: false,
      reasonCode: 'MULTI_TURN_TURN_SCOPED_PROMPT',
      reason: 'Turn-scoped prompt material can only be edited when the replay task contains exactly one turn.',
    };
  }
  if (source?.editable === true) return { editable: true };
  if (source?.editable === false) return { editable: false };
  if (source?.fieldPath === 'system') return { editable: true };
  if (isEditablePromptLabel(source?.label)) return { editable: true };
  if (leadingXmlTag(source?.originalText ?? source?.draftText ?? '') === 'player_input') {
    return { editable: true };
  }
  return { editable: false };
}

export function isEditablePromptSource(source, options) {
  return promptSourceEditState(source, options).editable;
}

export function promptSourceAccess(source, options) {
  return isEditablePromptSource(source, options) ? PROMPT_ACCESS.editable : PROMPT_ACCESS.viewOnly;
}

export function withPromptSourceAccess(source, options) {
  const editState = promptSourceEditState(source, options);
  const access = editState.editable ? PROMPT_ACCESS.editable : PROMPT_ACCESS.viewOnly;
  return {
    ...source,
    editable: editState.editable,
    access: access.id,
    accessLabel: access.title,
    ...(editState.reasonCode !== undefined ? { editBlockReasonCode: editState.reasonCode } : {}),
    ...(editState.reason !== undefined ? { editBlockReason: editState.reason } : {}),
  };
}

export function groupPromptSourcesByAccess(sources, options) {
  const editable = [];
  const viewOnly = [];
  for (const source of sources) {
    if (isEditablePromptSource(source, options)) {
      editable.push(source);
    } else {
      viewOnly.push(source);
    }
  }
  return [
    { ...PROMPT_ACCESS.editable, sources: editable },
    { ...PROMPT_ACCESS.viewOnly, sources: viewOnly },
  ].filter((group) => group.sources.length > 0);
}

function leadingXmlTag(content) {
  return /^<([a-zA-Z][\w:-]*)>/.exec(String(content ?? '').trim())?.[1] ?? null;
}

function isEditablePromptLabel(label) {
  return /\s\/\s(?:System|player_input)$/.test(String(label ?? ''));
}

function isTurnScopedObservedMaterial(source) {
  if (source?.patchScope === 'turn') return true;
  if (source?.sourceKind !== 'observed-llm-call') return false;
  if (source?.fieldPath === 'system') return false;
  return leadingXmlTag(source?.originalText ?? source?.draftText ?? '') !== 'player_input';
}
