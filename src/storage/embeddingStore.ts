import type {
  ChunkEmbedding,
  EmbeddingBackend,
  TextChunk,
} from "../types/rag";
import { idbClear, idbDelete, idbGet, idbPut } from "./ragDatabase";

export interface StoredCorpusRecord {
  documentId: string;
  documentName: string;
  chunksSignature: string;
  embeddingBackend: EmbeddingBackend;
  modelId: string;
  chunks: TextChunk[];
  embeddings: ChunkEmbedding[];
  savedAt: number;
}

export async function saveCorpusToIndexedDb(
  record: StoredCorpusRecord
): Promise<void> {
  await idbPut(record);
}

export async function loadCorpusFromIndexedDb(
  documentId: string
): Promise<StoredCorpusRecord | undefined> {
  return idbGet<StoredCorpusRecord>(documentId);
}

export async function deleteCorpusFromIndexedDb(documentId: string): Promise<void> {
  await idbDelete(documentId);
}

export async function clearAllCorpora(): Promise<void> {
  await idbClear();
}
