import type { AnswerCitation, RetrievalHit } from "../../types/rag";

const MAX_CONTEXT_CHARS = 2_400;

export function buildRagPrompt(query: string, hits: RetrievalHit[]): {
  prompt: string;
  citations: AnswerCitation[];
} {
  const citations: AnswerCitation[] = hits.map((h) => ({
    chunkId: h.chunk.id,
    chunkIndex: h.chunk.index,
    score: h.score,
    excerpt:
      h.chunk.text.slice(0, 160) + (h.chunk.text.length > 160 ? "…" : ""),
  }));

  const blocks: string[] = [];
  let used = 0;

  for (let i = 0; i < hits.length; i++) {
    const h = hits[i];
    const body = h.chunk.text.trim().replace(/\s+/g, " ");
    const block = `Passage ${i + 1}: ${body}`;
    if (used + block.length > MAX_CONTEXT_CHARS && blocks.length > 0) break;
    blocks.push(block);
    used += block.length + 2;
  }

  const context = blocks.join("\n\n");
  const q = query.trim();

  const prompt = `You are a helpful assistant. Use only the passages below to answer the question. If the answer is not in the passages, say you do not have enough information.

${context}

Question: ${q}
Answer:`;

  return { prompt, citations };
}
