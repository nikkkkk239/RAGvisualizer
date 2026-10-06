import type { ChunkEmbedding, TextChunk } from "../../types/rag";
import {
  embedChunksWithBrowser,
  embedQueryWithBrowser,
} from "./browserEmbedding";
import { BROWSER_MODEL_ID } from "./browserEmbedding";
import type { EmbedRunOptions, EmbeddingRunResult } from "./embeddingTypes";

let activeBackend: "none" | "browser" = "none";

export function getActiveEmbeddingBackend(): "none" | "browser" {
  return activeBackend;
}

export function resetEmbeddingRuntime(): void {
  activeBackend = "none";
}

export async function runEmbedChunks(
  chunks: TextChunk[],
  options: EmbedRunOptions = {}
): Promise<{ embeddings: ChunkEmbedding[]; meta: EmbeddingRunResult }> {
  const embeddings = await embedChunksWithBrowser(chunks, options);
  activeBackend = "browser";
  return {
    embeddings,
    meta: { backend: "browser", usedFallback: false },
  };
}

export async function embedQueryForActiveBackend(query: string): Promise<number[]> {
  if (activeBackend !== "browser") {
    activeBackend = "browser";
  }
  return embedQueryWithBrowser(query);
}

export function modelLabelForBackend(): string {
  return activeBackend === "browser" ? BROWSER_MODEL_ID : "—";
}
