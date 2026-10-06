import type {
  EmbedChunkProgress,
  EmbedLoadProgress,
  TextChunk,
} from "../../types/rag";

export type EmbeddingBackend = "none" | "browser";

export interface EmbedRunOptions {
  onChunkProgress?: (progress: EmbedChunkProgress) => void;
}

export interface EmbeddingRunResult {
  backend: EmbeddingBackend;
  usedFallback: boolean;
}

export type ChunkBatch = TextChunk[];

export type { EmbedChunkProgress, EmbedLoadProgress };
