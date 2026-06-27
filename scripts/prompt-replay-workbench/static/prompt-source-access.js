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

export function isEditablePromptSource(source) {
  if (source?.unavailable === true) return false;
  if (source?.editable === true) return true;
  if (source?.editable === false) return false;
  if (source?.fieldPath === 'system') return true;
  if (isEditablePromptLabel(source?.label)) return true;
  return leadingXmlTag(source?.originalText ?? source?.draftText ?? '') === 'player_input';
}

export function promptSourceAccess(source) {
  return isEditablePromptSource(source) ? PROMPT_ACCESS.editable : PROMPT_ACCESS.viewOnly;
}

export function withPromptSourceAccess(source) {
  const access = promptSourceAccess(source);
  return {
    ...source,
    editable: access.id === PROMPT_ACCESS.editable.id,
    access: access.id,
    accessLabel: access.title,
  };
}

export function groupPromptSourcesByAccess(sources) {
  const editable = [];
  const viewOnly = [];
  for (const source of sources) {
    if (isEditablePromptSource(source)) {
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
