import { canAttemptBrowserModel, warmUpEmbeddingModel } from "../embedding/browserEmbedding";

export type ModelPreloadItem = "embedding";

export interface ModelPreloadProgress {
  message: string;
  percent?: number;
  embeddingReady: boolean;
}

export async function preloadAllModels(
  onProgress?: (progress: ModelPreloadProgress) => void
): Promise<void> {
  if (!canAttemptBrowserModel()) {
    throw new Error(
      "WebAssembly is not available. Use a modern browser to run local models."
    );
  }

  let embeddingReady = false;
  let embedPercent: number | undefined;

  const report = (message: string) => {
    onProgress?.({
      message,
      percent: embedPercent,
      embeddingReady,
    });
  };

  report("Loading the embedding model…");

  await warmUpEmbeddingModel((p) => {
    if (p.percent !== undefined) embedPercent = p.percent;
    report(p.message);
  });
  embeddingReady = true;
  onProgress?.({
    message: "Embedding model ready.",
    percent: 100,
    embeddingReady: true,
  });
}
