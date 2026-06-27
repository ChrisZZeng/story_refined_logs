import { createHash } from 'node:crypto';

export function applyPatchBundleToCall({ patchBundle, stage, callKind, params }) {
  let nextParams = cloneParams(params);
  const applications = [];
  const patchMatches = analyzePatchMatches({ patchBundle, stage, callKind, params });

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
  turn,
  stage,
  callKind,
  params,
}) {
  let nextParams = cloneParams(params);
  const applications = [];
  const patchMatches = analyzePatchMatches({ patchBundle, turn, stage, callKind, params });

  for (const patchMatch of patchMatches) {
    const { patch, match, totalMatches } = patchMatch;
    if (totalMatches === 0) continue;
    if (totalMatches > 1) {
      throw new Error(`patch ${patch.id} has multiple matches in ${stage} ${callKind}`);
    }

    nextParams = applyPatchToField({ params: nextParams, patch, match });
    applications.push({
      patchId: patch.id,
      ...(turn !== undefined ? { turn } : {}),
      stage,
      callKind,
      fieldPath: match.path,
      ...(patch.matchMode !== undefined ? { matchMode: patch.matchMode } : {}),
      ...(Array.isArray(patch.preserveTags) && patch.preserveTags.length > 0
        ? { preserveTags: patch.preserveTags }
        : {}),
      originalHash: hashText(patch.originalText),
      replacementHash: hashText(patch.replacementText),
      ...(appliedPatchIds.has(patch.id) ? { propagated: true } : {}),
    });
  }

  return { params: nextParams, applications };
}

export function assertAllPatchesApplied({ patchBundle, applications, turn }) {
  const appliedPatchIds = new Set(
    applications
      .filter((application) => application.propagated !== true)
      .map((application) => application.patchId),
  );
  const missing = patchBundle.patches
    .filter((patch) => patchAppliesToTurn(patch, turn))
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
  if (patch.matchMode === 'field') {
    return setTextField(
      params,
      match.path,
      applyPreservedTags({
        patchId: patch.id,
        currentValue,
        replacementText: patch.replacementText,
        preserveTags: patch.preserveTags,
      }),
    );
  }
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

function applyPreservedTags({ patchId, currentValue, replacementText, preserveTags }) {
  if (!Array.isArray(preserveTags) || preserveTags.length === 0) {
    return replacementText;
  }

  let nextText = replacementText;
  for (const tag of preserveTags) {
    const currentBlock = findSingleTagBlock(currentValue, tag);
    const replacementBlock = findSingleTagBlock(nextText, tag);
    if (currentBlock === null || replacementBlock === null) {
      throw new Error(`patch ${patchId} cannot preserve missing <${tag}> tag`);
    }
    nextText =
      nextText.slice(0, replacementBlock.start) +
      currentBlock.text +
      nextText.slice(replacementBlock.end);
  }
  return nextText;
}

function findSingleTagBlock(text, tag) {
  const escapedTag = tag.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<${escapedTag}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${escapedTag}>`, 'g');
  const first = pattern.exec(text);
  if (first === null) return null;
  const second = pattern.exec(text);
  if (second !== null) {
    throw new Error(`preserved tag <${tag}> appears more than once`);
  }
  return {
    start: first.index,
    end: first.index + first[0].length,
    text: first[0],
  };
}

function analyzePatchMatches({ patchBundle, turn, stage, callKind, params }) {
  const fields = collectTextFields(params);
  return patchBundle.patches.map((patch) => {
    if (!patchAppliesToCall({ patch, turn, stage, callKind })) {
      return { patch, match: undefined, totalMatches: 0 };
    }
    if (patch.matchMode === 'field') {
      const field = fields.find((candidate) => candidate.path === patch.fieldPath);
      return {
        patch,
        match: field,
        totalMatches: field === undefined ? 0 : 1,
      };
    }
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

function patchAppliesToCall({ patch, turn, stage, callKind }) {
  if (!patchAppliesToTurn(patch, turn)) return false;
  if (patch.stage !== undefined && patch.stage !== stage) return false;
  if (patch.callKind !== undefined && patch.callKind !== callKind) return false;
  return true;
}

function patchAppliesToTurn(patch, turn) {
  if (patch.turn === undefined) return true;
  if (turn === undefined) return true;
  return Number(patch.turn) === Number(turn);
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
