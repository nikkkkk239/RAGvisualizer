import type {
  ChunkEmbedding,
  RetrievalHit,
  RetrievalResultMeta,
  TextChunk,
} from "../../types/rag";
import type { RetrievalOptions } from "../interfaces";
import { DEFAULT_RETRIEVAL_SETTINGS } from "../../config/retrievalDefaults";
import { cosineSimilarity } from "./cosine";

export function retrieveByCosine(
  queryVector: number[],
  chunks: TextChunk[],
  embeddings: ChunkEmbedding[],
  options: RetrievalOptions = {}
): { hits: RetrievalHit[]; meta: RetrievalResultMeta } {
  const topK = options.topK ?? DEFAULT_RETRIEVAL_SETTINGS.topK;
  const minScore = options.minScore ?? DEFAULT_RETRIEVAL_SETTINGS.minScore;

  const byChunkId = new Map(embeddings.map((e) => [e.chunkId, e]));
  const scored: RetrievalHit[] = [];

  for (const chunk of chunks) {
    const embedding = byChunkId.get(chunk.id);
    if (!embedding) continue;
    const score = cosineSimilarity(queryVector, embedding.vector);
    scored.push({ chunk, embedding, score });
  }

  scored.sort((a, b) => b.score - a.score);

  const aboveThreshold = scored.filter((h) => h.score >= minScore);
  const hits = aboveThreshold.slice(0, topK);

  return {
    hits,
    meta: {
      totalCompared: scored.length,
      aboveThreshold: aboveThreshold.length,
      returned: hits.length,
      topK,
      minScore,
    },
  };
}
