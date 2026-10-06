import type { FeatureExtractionPipeline, ProgressInfo } from "@huggingface/transformers";
import type { ChunkEmbedding, EmbedLoadProgress, TextChunk } from "../../types/rag";
import { loadTransformers } from "../models/transformersEnv";
import type { EmbedRunOptions } from "./embeddingTypes";

import {
  EMBEDDING_MODEL_ID,
  EMBEDDING_MODEL_LABEL,
} from "../../config/models";
import { yieldToMain } from "../../utils/yieldToMain";

export const BROWSER_MODEL_ID = EMBEDDING_MODEL_ID;
export const BROWSER_MODEL_LABEL = `${EMBEDDING_MODEL_LABEL} (384 dimensions)`;
export const BROWSER_DIMENSION = 384;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

export function canAttemptBrowserModel(): boolean {
  try {
    return (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    );
  } catch {
    return false;
  }
}

export function resetEmbeddingModel(): void {
  extractorPromise = null;
}

function mapLoadProgress(info: ProgressInfo): EmbedLoadProgress {
  switch (info.status) {
    case "initiate":
      return {
        phase: "preparing",
        message: `Embedding model: preparing ${info.file}…`,
        fileName: info.file,
      };
    case "download":
      return {
        phase: "downloading",
        message: `Embedding model: downloading ${info.file}…`,
        fileName: info.file,
      };
    case "progress":
      return {
        phase: "downloading",
        message: `Embedding model: downloading ${info.file}…`,
        fileName: info.file,
        percent: info.progress,
      };
    case "progress_total":
      return {
        phase: "downloading",
        message: "Embedding model: downloading files…",
        percent: info.progress,
      };
    case "done":
      return {
        phase: "loading",
        message: `Embedding model: loaded ${info.file}`,
        fileName: info.file,
      };
    case "ready":
      return {
        phase: "ready",
        message: "Embedding model ready.",
      };
    default:
      return { phase: "preparing", message: "Loading embedding model…" };
  }
}

async function createExtractor(
  onLoadProgress?: (progress: EmbedLoadProgress) => void
): Promise<FeatureExtractionPipeline> {
  const { pipeline } = await loadTransformers();
  const extractor = await pipeline("feature-extraction", BROWSER_MODEL_ID, {
    progress_callback: (info: ProgressInfo) => {
      onLoadProgress?.(mapLoadProgress(info));
    },
  });
  onLoadProgress?.({ phase: "ready", message: "Embedding model ready." });
  return extractor;
}

async function getExtractor(
  onLoadProgress?: (progress: EmbedLoadProgress) => void
): Promise<FeatureExtractionPipeline> {
  if (extractorPromise) {
    return extractorPromise;
  }
  extractorPromise = createExtractor(onLoadProgress).catch((err) => {
    extractorPromise = null;
    throw err;
  });
  return extractorPromise;
}

export function warmUpEmbeddingModel(
  onLoadProgress?: (progress: EmbedLoadProgress) => void
): Promise<FeatureExtractionPipeline> {
  return getExtractor(onLoadProgress);
}

async function embedText(
  extractor: FeatureExtractionPipeline,
  text: string
): Promise<number[]> {
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data as Float32Array);
}

export async function embedChunksWithBrowser(
  chunks: TextChunk[],
  options: EmbedRunOptions = {}
): Promise<ChunkEmbedding[]> {
  const extractor = await getExtractor();
  const results: ChunkEmbedding[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    options.onChunkProgress?.({
      current: i + 1,
      total: chunks.length,
      chunkIndex: chunk.index,
      chunkId: chunk.id,
    });
    await yieldToMain();
    const vector = await embedText(extractor, chunk.text);
    results.push({
      chunkId: chunk.id,
      vector,
      modelId: BROWSER_MODEL_ID,
    });
  }

  return results;
}

export async function embedQueryWithBrowser(query: string): Promise<number[]> {
  const extractor = await getExtractor();
  return embedText(extractor, query);
}
