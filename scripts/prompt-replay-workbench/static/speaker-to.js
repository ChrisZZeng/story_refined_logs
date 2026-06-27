const PARAGRAPH_PATTERN = /<p\b([^>]*)>([\s\S]*?)<\/p>/gi;

export function parseNarrativeSegments(rawHtml, fallbackText = '') {
  if (!hasParagraphMarkup(rawHtml)) {
    return [{ type: 'text', text: String(fallbackText || rawHtml || '-') }];
  }

  const segments = [];
  let match;
  let cursor = 0;
  PARAGRAPH_PATTERN.lastIndex = 0;
  while ((match = PARAGRAPH_PATTERN.exec(rawHtml)) !== null) {
    pushLooseText(segments, rawHtml.slice(cursor, match.index));
    const attrs = match[1] ?? '';
    const text = htmlFragmentToText(match[2]);
    if (text) {
      const speaker = getHtmlAttribute(attrs, 'data-speaker');
      const to = getHtmlAttribute(attrs, 'data-to');
      if (speaker && to) {
        segments.push({ type: 'speaker', speaker, to, text });
      } else {
        segments.push({ type: 'text', text });
      }
    }
    cursor = PARAGRAPH_PATTERN.lastIndex;
  }
  pushLooseText(segments, rawHtml.slice(cursor));

  if (segments.length > 0) return segments;
  return [{ type: 'text', text: htmlFragmentToText(rawHtml) || fallbackText || '-' }];
}

function pushLooseText(segments, value) {
  const text = htmlFragmentToText(value);
  if (!text) return;
  for (const block of text.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean)) {
    segments.push({ type: 'text', text: block });
  }
}

function hasParagraphMarkup(value) {
  return typeof value === 'string' && /<p\b/i.test(value);
}

function getHtmlAttribute(attrs, name) {
  const escapedName = escapeRegExp(name);
  const doubleQuoted = attrs.match(new RegExp(`\\s${escapedName}\\s*=\\s*"([^"]*)"`, 'i'));
  if (doubleQuoted) return decodeHtml(doubleQuoted[1]);
  const singleQuoted = attrs.match(new RegExp(`\\s${escapedName}\\s*=\\s*'([^']*)'`, 'i'));
  if (singleQuoted) return decodeHtml(singleQuoted[1]);
  return null;
}

function htmlFragmentToText(html) {
  return decodeHtml(
    String(html ?? '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim(),
  );
}

function decodeHtml(value) {
  return String(value ?? '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
