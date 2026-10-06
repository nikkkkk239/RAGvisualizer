export interface TextUnit {
  start: number;
  end: number;
}

/** Character windows for fixed-size splitting. */
export function fixedUnits(
  text: string,
  chunkSize: number,
  overlap: number
): TextUnit[] {
  const units: TextUnit[] = [];
  const safeOverlap = Math.min(Math.max(0, overlap), Math.max(0, chunkSize - 1));
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    if (end > start) units.push({ start, end });
    if (end >= text.length) break;
    const next = end - safeOverlap;
    start = next <= start ? end : next;
  }
  return units;
}

export function paragraphUnits(text: string): TextUnit[] {
  const units: TextUnit[] = [];
  const separator = /\n\s*\n+/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = separator.exec(text)) !== null) {
    const end = match.index;
    if (end > cursor && text.slice(cursor, end).trim().length > 0) {
      units.push({ start: cursor, end });
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length && text.slice(cursor).trim().length > 0) {
    units.push({ start: cursor, end: text.length });
  }
  if (units.length === 0 && text.trim().length > 0) {
    units.push({ start: 0, end: text.length });
  }
  return units;
}

export function sentenceUnits(text: string): TextUnit[] {
  const units: TextUnit[] = [];
  const re =
    /[^.!?\n]+[.!?]+(?:\s+|$)|[^.!?\n]+(?:\n+|$)|[^.!?\n]+$/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const raw = match[0];
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lead = raw.indexOf(trimmed);
    const start = match.index + lead;
    const end = start + trimmed.length;
    units.push({ start, end });
  }
  if (units.length === 0 && text.trim().length > 0) {
    units.push({ start: 0, end: text.length });
  }
  return units;
}
