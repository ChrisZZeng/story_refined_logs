import { createHash } from 'node:crypto';

export function applyPatchBundleToCall({ patchBundle, stage, callKind, params }) {
  let nextParams = cloneParams(params);
  const applications = [];
  const patchMatches = analyzePatchMatches({ patchBundle, params });

  for (const patchMatch of patchMatches) {
    const { patch, match, totalMatches } = patchMatch;
    if (totalMatches === 0) {
      throw new Error(`patch ${patch.id} not found in ${stage} ${callKind}`);
    }
    if (totalMatches > 1) {
      throw new Error(`patch ${patch.id} has multiple matches in ${stage} ${callKind}`);
    }

    nextParams = applyPatchToField({ params: nextParams, patch, match });
    applications.push({
      patchId: patch.id,
      stage,
      callKind,
      fieldPath: match.path,
      originalHash: hashText(patch.originalText),
      replacementHash: hashText(patch.replacementText),
    });
  }

  return { params: nextParams, applications };
}

export function applyAvailablePatchesToCall({
  patchBundle,
  appliedPatchIds,
  stage,
  callKind,
  params,
}) {
  let nextParams = cloneParams(params);
  const applications = [];
  const patchMatches = analyzePatchMatches({ patchBundle, params });

  for (const patchMatch of patchMatches) {
    const { patch, match, totalMatches } = patchMatch;
    if (totalMatches === 0) continue;
    if (totalMatches > 1) {
      throw new Error(`patch ${patch.id} has multiple matches in ${stage} ${callKind}`);
    }

    nextParams = applyPatchToField({ params: nextParams, patch, match });
    applications.push({
      patchId: patch.id,
      stage,
      callKind,
      fieldPath: match.path,
      originalHash: hashText(patch.originalText),
      replacementHash: hashText(patch.replacementText),
      ...(appliedPatchIds.has(patch.id) ? { propagated: true } : {}),
    });
  }

  return { params: nextParams, applications };
}

export function assertAllPatchesApplied({ patchBundle, applications }) {
  const appliedPatchIds = new Set(
    applications
      .filter((application) => application.propagated !== true)
      .map((application) => application.patchId),
  );
  const missing = patchBundle.patches
    .map((patch) => patch.id)
    .filter((patchId) => !appliedPatchIds.has(patchId));
  if (missing.length > 0) {
    throw new Error(`patches not applied in call chain: ${missing.join(', ')}`);
  }
}

export function hashText(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function cloneParams(params) {
  return {
    ...params,
    ...(Array.isArray(params.messages)
      ? { messages: params.messages.map((message) => ({ ...message })) }
      : {}),
  };
}

function collectTextFields(params) {
  const fields = [];
  if (typeof params.system === 'string') {
    fields.push({ path: 'system', value: params.system });
  }
  if (typeof params.prompt === 'string') {
    fields.push({ path: 'prompt', value: params.prompt });
  }
  if (Array.isArray(params.messages)) {
    params.messages.forEach((message, index) => {
      if (typeof message?.content === 'string') {
        fields.push({ path: `messages[${index}].content`, value: message.content });
      }
    });
  }
  return fields;
}

function setTextField(params, fieldPath, value) {
  if (fieldPath === 'system') return { ...params, system: value };
  if (fieldPath === 'prompt') return { ...params, prompt: value };

  const match = /^messages\[(\d+)\]\.content$/.exec(fieldPath);
  if (!match) throw new Error(`Unsupported patch field path: ${fieldPath}`);
  const index = Number(match[1]);
  return {
    ...params,
    messages: params.messages.map((message, messageIndex) =>
      messageIndex === index ? { ...message, content: value } : message,
    ),
  };
}

function getTextField(params, fieldPath) {
  if (fieldPath === 'system') return params.system;
  if (fieldPath === 'prompt') return params.prompt;

  const match = /^messages\[(\d+)\]\.content$/.exec(fieldPath);
  if (!match) throw new Error(`Unsupported patch field path: ${fieldPath}`);
  return params.messages[Number(match[1])].content;
}

function applyPatchToField({ params, patch, match }) {
  const currentValue = getTextField(params, match.path);
  if (!currentValue.includes(patch.originalText)) {
    throw new Error(
      `patch ${patch.id} original text was removed by an overlapping earlier replacement`,
    );
  }
  return setTextField(
    params,
    match.path,
    currentValue.replace(patch.originalText, patch.replacementText),
  );
}

function analyzePatchMatches({ patchBundle, params }) {
  const fields = collectTextFields(params);
  return patchBundle.patches.map((patch) => {
    const matches = fields
      .map((field) => ({
        ...field,
        occurrenceCount: countOccurrences(field.value, patch.originalText),
      }))
      .filter((field) => field.occurrenceCount > 0);
    const totalMatches = matches.reduce((sum, field) => sum + field.occurrenceCount, 0);
    return { patch, match: matches[0], totalMatches };
  });
}

function countOccurrences(haystack, needle) {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}
