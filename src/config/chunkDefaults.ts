import type { ChunkSettings } from "../types/rag";

export const CHUNK_LIMITS = {
  sizeMin: 120,
  sizeMax: 2000,
  sizeStep: 40,
  overlapMin: 0,
  overlapMax: 600,
  overlapStep: 10,
} as const;

export const DEFAULT_CHUNK_SETTINGS: ChunkSettings = {
  chunkSize: 400,
  overlap: 80,
  method: "fixed",
};
