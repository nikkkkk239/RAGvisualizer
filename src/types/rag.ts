/** Pipeline stages shown in the learning UI */
export type PipelineStepId =
  | "upload"
  | "chunk"
  | "embed"
  | "retrieve"
  | "answer";

export type StepStatus = "idle" | "ready" | "running" | "done" | "error";

export type EmbeddingBackend = "none" | "browser";

export type EmbedLoadPhase =
  | "idle"
  | "preparing"
  | "downloading"
  | "loading"
  | "ready"
  | "fallback";

export interface EmbedLoadProgress {
  phase: EmbedLoadPhase;
  message: string;
  percent?: number;
  fileName?: string;
}

export interface EmbedChunkProgress {
  current: number;
  total: number;
  chunkIndex: number;
  chunkId: string;
}

export type ChunkSplitMethod = "fixed" | "paragraph" | "sentence";

export interface ChunkSettings {
  chunkSize: number;
  overlap: number;
  method: ChunkSplitMethod;
}

export interface DocumentSource {
  name: string;
  byteSize: number;
  mediaType: "text" | "pdf";
  charCount: number;
}

export interface UploadedDocument {
  id: string;
  /** Single filename or summary label for multi-file uploads */
  name: string;
  text: string;
  byteSize: number;
  uploadedAt: number;
  sources: DocumentSource[];
}

export interface TextChunk {
  id: string;
  documentId: string;
  index: number;
  text: string;
  /** Character offsets in source document */
  start: number;
  end: number;
}

/** Float32 embeddings are typical for in-browser transformers */
export interface ChunkEmbedding {
  chunkId: string;
  /** Dimension matches the embedding model (384 for MiniLM) */
  vector: number[];
  modelId: string;
}

export interface RetrievalHit {
  chunk: TextChunk;
  score: number;
  embedding: ChunkEmbedding;
}

export interface RetrievalSettings {
  /** Maximum number of chunks to return after filtering by score */
  topK: number;
  /** Minimum cosine similarity (0–1) to include a chunk */
  minScore: number;
}

export interface RetrievalResultMeta {
  totalCompared: number;
  aboveThreshold: number;
  returned: number;
  topK: number;
  minScore: number;
}

export type AnswerBackend = "browser" | "fallback";

export type AnswerLoadPhase = EmbedLoadPhase;

export interface AnswerLoadProgress {
  phase: AnswerLoadPhase;
  message: string;
  percent?: number;
  fileName?: string;
}

export interface AnswerCitation {
  chunkId: string;
  chunkIndex: number;
  score: number;
  excerpt: string;
}

export interface RagAnswer {
  query: string;
  text: string;
  /** Full prompt / context string sent to the model (or shown in fallback) */
  prompt: string;
  citations: AnswerCitation[];
  modelId: string;
  backend: AnswerBackend;
  usedFallback: boolean;
  fallbackReason?: string;
}

export interface PipelineState {
  stepStatuses: Record<PipelineStepId, StepStatus>;
  document: UploadedDocument | null;
  /** Last upload validation or parse error (cleared on success) */
  uploadError: string | null;
  chunkSettings: ChunkSettings;
  chunks: TextChunk[];
  embeddings: ChunkEmbedding[];
  embeddingBackend: EmbeddingBackend;
  embedChunkProgress: EmbedChunkProgress | null;
  embedError: string | null;
  /** True when chunk vectors are persisted in IndexedDB for this document */
  embeddingsPersisted: boolean;
  retrievalSettings: RetrievalSettings;
  lastQuery: string;
  lastQueryVector: number[] | null;
  retrievalHits: RetrievalHit[];
  retrievalMeta: RetrievalResultMeta | null;
  answerLoadProgress: AnswerLoadProgress | null;
  answer: RagAnswer | null;
}
