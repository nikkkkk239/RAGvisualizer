import type { ChunkSettings, TextChunk, UploadedDocument } from "../../types/rag";
import { CHUNK_LIMITS, DEFAULT_CHUNK_SETTINGS } from "../../config/chunkDefaults";
import { packUnits } from "./packUnits";
import {
  fixedUnits,
  paragraphUnits,
  sentenceUnits,
  type TextUnit,
} from "./units";

export function clampChunkSettings(settings: ChunkSettings): ChunkSettings {
  const chunkSize = Math.min(
    CHUNK_LIMITS.sizeMax,
    Math.max(CHUNK_LIMITS.sizeMin, settings.chunkSize)
  );
  const overlapMax = Math.min(CHUNK_LIMITS.overlapMax, chunkSize - 1);
  const overlap = Math.min(
    overlapMax,
    Math.max(CHUNK_LIMITS.overlapMin, settings.overlap)
  );
  return {
    method: settings.method,
    chunkSize,
    overlap,
  };
}

function unitsForMethod(
  text: string,
  settings: ChunkSettings
): TextUnit[] {
  switch (settings.method) {
    case "fixed":
      return fixedUnits(text, settings.chunkSize, settings.overlap);
    case "paragraph":
      return packUnits(
        paragraphUnits(text),
        settings.chunkSize,
        settings.overlap
      );
    case "sentence":
      return packUnits(
        sentenceUnits(text),
        settings.chunkSize,
        settings.overlap
      );
    default:
      return fixedUnits(text, settings.chunkSize, settings.overlap);
  }
}

export function chunkDocument(
  document: UploadedDocument,
  settings: ChunkSettings = DEFAULT_CHUNK_SETTINGS
): TextChunk[] {
  const text = document.text;
  if (!text.length) return [];

  const clamped = clampChunkSettings(settings);
  const windows = unitsForMethod(text, clamped);

  return windows.map((w, index) => ({
    id: `${document.id}-chunk-${index}`,
    documentId: document.id,
    index,
    text: text.slice(w.start, w.end),
    start: w.start,
    end: w.end,
  }));
}

export function chunksSignature(chunks: TextChunk[]): string {
  return chunks
    .map((c) => `${c.index}:${c.start}-${c.end}:${c.text.length}`)
    .join("|");
}
