import type { TextUnit } from "./units";

/** Split any unit longer than maxSize into consecutive windows. */
export function normalizeUnits(units: TextUnit[], maxSize: number): TextUnit[] {
  const out: TextUnit[] = [];
  for (const u of units) {
    if (u.end - u.start <= maxSize) {
      out.push(u);
      continue;
    }
    let start = u.start;
    while (start < u.end) {
      const end = Math.min(start + maxSize, u.end);
      out.push({ start, end });
      if (end >= u.end) break;
      start = end;
    }
  }
  return out;
}

function packOne(
  units: TextUnit[],
  charStart: number,
  chunkSize: number
): TextUnit | null {
  let i = 0;
  while (i < units.length && units[i].end <= charStart) i += 1;
  if (i >= units.length) return null;

  const start = Math.max(charStart, units[i].start);
  let end = units[i].end;
  let j = i + 1;
  while (j < units.length && units[j].end - start <= chunkSize) {
    end = units[j].end;
    j += 1;
  }
  if (end <= start) return null;
  return { start, end };
}

export function packUnits(
  units: TextUnit[],
  chunkSize: number,
  overlap: number
): TextUnit[] {
  const normalized = normalizeUnits(units, chunkSize);
  if (normalized.length === 0) return [];

  const safeOverlap = Math.min(Math.max(0, overlap), Math.max(0, chunkSize - 1));
  const docEnd = normalized[normalized.length - 1].end;
  const chunks: TextUnit[] = [];
  let cursor = normalized[0].start;

  while (cursor < docEnd) {
    const window = packOne(normalized, cursor, chunkSize);
    if (!window) break;
    chunks.push(window);
    if (window.end >= docEnd) break;
    const next = window.end - safeOverlap;
    if (next <= cursor) break;
    cursor = next;
  }

  return chunks;
}
