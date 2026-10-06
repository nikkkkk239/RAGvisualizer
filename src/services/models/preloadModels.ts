import { warmUpAnswerModel } from "../answer/browserAnswer";
import { canAttemptBrowserModel, warmUpEmbeddingModel } from "../embedding/browserEmbedding";

export type ModelPreloadItem = "embedding" | "answer";

export interface ModelPreloadProgress {
  message: string;
  percent?: number;
  embeddingReady: boolean;
  answerReady: boolean;
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
  let answerReady = false;
  let embedPercent: number | undefined;
  let answerPercent: number | undefined;

  const report = (message: string) => {
    const parts = [embedPercent, answerPercent].filter((p) => p !== undefined) as number[];
    const percent =
      parts.length > 0
        ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
        : undefined;
    onProgress?.({
      message,
      percent,
      embeddingReady,
      answerReady,
    });
  };

  report("Loading embedding and answer models…");

  const embedTask = warmUpEmbeddingModel((p) => {
    if (p.percent !== undefined) embedPercent = p.percent;
    report(p.message);
  }).then(() => {
    embeddingReady = true;
    report("Embedding model ready.");
  });

  const answerTask = warmUpAnswerModel((p) => {
    if (p.percent !== undefined) answerPercent = p.percent;
    report(p.message);
  }).then(() => {
    answerReady = true;
    report("Answer model ready.");
  });

  await Promise.all([embedTask, answerTask]);
  onProgress?.({
    message: "All models ready.",
    percent: 100,
    embeddingReady: true,
    answerReady: true,
  });
}
