import type {
  ChunkEmbedding,
  ChunkSettings,
  ChunkSplitMethod,
  RagAnswer,
  RetrievalHit,
  TextChunk,
  UploadedDocument,
} from "../types/rag";

/** Service contracts for pipeline stages (browser implementations today). */
export interface DocumentIngestService {
  parseFiles(files: File[]): Promise<UploadedDocument>;
}

export interface ChunkingService {
  chunk(document: UploadedDocument, options?: ChunkOptions): Promise<TextChunk[]>;
}

export interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
  method?: ChunkSplitMethod;
}

export type { ChunkSettings };

export interface EmbeddingService {
  readonly modelId: string;
  readonly dimension: number;
  embedChunks(chunks: TextChunk[]): Promise<ChunkEmbedding[]>;
  embedQuery(query: string): Promise<number[]>;
}

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
}

export interface RetrievalService {
  retrieve(
    queryVector: number[],
    chunks: TextChunk[],
    embeddings: ChunkEmbedding[],
    options?: RetrievalOptions
  ): Promise<RetrievalHit[]>;
}

export interface AnswerService {
  readonly modelId: string;
  generate(query: string, hits: RetrievalHit[]): Promise<RagAnswer>;
}
