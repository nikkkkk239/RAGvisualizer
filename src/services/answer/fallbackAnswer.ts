import type { RagAnswer, RetrievalHit } from "../../types/rag";
import { buildRagPrompt } from "./buildRagPrompt";

export const FALLBACK_ANSWER_MODEL_ID = "extractive-fallback";

export function generateFallbackAnswer(
  query: string,
  hits: RetrievalHit[],
  reason?: string
): RagAnswer {
  const { prompt, citations } = buildRagPrompt(query, hits);

  const sections = hits.map((h, i) => {
    const snippet = h.chunk.text.trim().slice(0, 400);
    return `**Source ${i + 1}** (chunk #${h.chunk.index}, score ${h.score.toFixed(3)})\n${snippet}${h.chunk.text.length > 400 ? "…" : ""}`;
  });

  const text = [
    "Local text generation is unavailable on this device or failed to load.",
    reason ? `Reason: ${reason}` : "",
    "",
    "Below is an **extractive fallback**: the most relevant retrieved passages for your question.",
    "",
    `**Your question:** ${query}`,
    "",
    ...sections,
    "",
    "_Tip: enable WebAssembly, free memory, or use a smaller browser tab set, then try again for a synthesized local LLM answer._",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    query,
    text,
    prompt,
    citations,
    modelId: FALLBACK_ANSWER_MODEL_ID,
    backend: "fallback",
    usedFallback: true,
    fallbackReason: reason,
  };
}
