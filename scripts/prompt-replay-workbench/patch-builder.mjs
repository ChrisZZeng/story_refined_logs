export function buildPatchBundleFromPromptSources({ bundleId, description, sources }) {
  const patches = [];

  for (const [index, source] of sources.entries()) {
    validatePromptSource(source, index);

    if (source.dirty === true || source.originalText !== source.draftText) {
      patches.push({
        id: createPatchId(source.id),
        ...(source.patchMode === 'field' ? { matchMode: 'field' } : {}),
        ...(source.turn !== undefined ? { sourceTurn: source.turn } : {}),
        ...(source.patchScope === 'turn' && source.turn !== undefined ? { turn: source.turn } : {}),
        ...(source.stage !== undefined ? { stage: source.stage } : {}),
        ...(source.callKind !== undefined ? { callKind: source.callKind } : {}),
        ...(source.fieldPath !== undefined ? { fieldPath: source.fieldPath } : {}),
        ...(Array.isArray(source.preserveTags) && source.preserveTags.length > 0
          ? { preserveTags: source.preserveTags }
          : {}),
        originalText: source.originalText,
        replacementText: source.draftText,
      });
    }
  }

  if (patches.length === 0) {
    const error = new Error('没有修改可生成 patch bundle。请先编辑 prompt source 后再运行。');
    error.code = 'PATCH_BUNDLE_EMPTY';
    throw error;
  }

  return {
    id: bundleId,
    ...(description === undefined ? {} : { description }),
    patches,
  };
}

export function createPromptSourceDiff({ originalText, draftText }) {
  const originalLines = splitLines(originalText);
  const draftLines = splitLines(draftText);
  const table = buildLcsTable(originalLines, draftLines);
  const segments = [];

  let originalIndex = 0;
  let draftIndex = 0;
  while (originalIndex < originalLines.length || draftIndex < draftLines.length) {
    if (
      originalIndex < originalLines.length &&
      draftIndex < draftLines.length &&
      originalLines[originalIndex] === draftLines[draftIndex]
    ) {
      pushSegment(segments, 'equal', originalLines[originalIndex]);
      originalIndex += 1;
      draftIndex += 1;
    } else if (
      originalIndex < originalLines.length &&
      (draftIndex >= draftLines.length ||
        table[originalIndex + 1][draftIndex] >= table[originalIndex][draftIndex + 1])
    ) {
      pushSegment(segments, 'delete', originalLines[originalIndex]);
      originalIndex += 1;
    } else {
      pushSegment(segments, 'insert', draftLines[draftIndex]);
      draftIndex += 1;
    }
  }

  return segments;
}

function validatePromptSource(source, index) {
  const sourceId = source?.id;
  if (source?.unavailable === true) {
    const identity = sourceId === undefined ? `index ${index}` : `source ${sourceId}`;
    const error = new Error(`Cannot create a patch from unavailable prompt ${identity}`);
    error.code = 'PATCH_SOURCE_UNAVAILABLE';
    if (sourceId !== undefined) {
      error.sourceId = sourceId;
    }
    error.index = index;
    throw error;
  }

  const missingFields = [];
  if (typeof sourceId !== 'string' || sourceId.length === 0) {
    missingFields.push('id');
  }
  if (typeof source?.originalText !== 'string') {
    missingFields.push('originalText');
  }
  if (typeof source?.draftText !== 'string') {
    missingFields.push('draftText');
  }
  if (
    source?.preserveTags !== undefined &&
    (!Array.isArray(source.preserveTags) ||
      source.preserveTags.some((tag) => typeof tag !== 'string' || tag.length === 0))
  ) {
    missingFields.push('preserveTags');
  }

  if (missingFields.length > 0) {
    const identity = sourceId === undefined ? `index ${index}` : `source ${sourceId}`;
    const error = new Error(`Invalid prompt source at ${identity}: missing ${missingFields.join(', ')}`);
    error.code = 'PATCH_SOURCE_INVALID';
    if (sourceId !== undefined) {
      error.sourceId = sourceId;
    }
    error.index = index;
    throw error;
  }
}

function createPatchId(sourceId) {
  return `prompt-source-${sourceId.replaceAll(/[^a-zA-Z0-9]+/g, '-').replaceAll(/^-|-$/g, '')}`;
}

function splitLines(text) {
  return text.match(/[^\n]*\n|[^\n]+/g) ?? [];
}

function buildLcsTable(originalLines, draftLines) {
  const table = Array.from({ length: originalLines.length + 1 }, () =>
    Array.from({ length: draftLines.length + 1 }, () => 0),
  );

  for (let originalIndex = originalLines.length - 1; originalIndex >= 0; originalIndex -= 1) {
    for (let draftIndex = draftLines.length - 1; draftIndex >= 0; draftIndex -= 1) {
      table[originalIndex][draftIndex] =
        originalLines[originalIndex] === draftLines[draftIndex]
          ? table[originalIndex + 1][draftIndex + 1] + 1
          : Math.max(table[originalIndex + 1][draftIndex], table[originalIndex][draftIndex + 1]);
    }
  }

  return table;
}

function pushSegment(segments, type, text) {
  const previous = segments.at(-1);
  if (previous?.type === type) {
    previous.text += text;
    return;
  }

  segments.push({ type, text });
}
