import type { RetrievalHit } from "../../types/rag";
import { generateFallbackAnswer } from "./fallbackAnswer";
import type { AnswerRunOptions, AnswerRunResult } from "./answerTypes";
import { generateBrowserAnswer } from "./browserAnswer";

export async function runGenerateAnswer(
  query: string,
  hits: RetrievalHit[],
  options: AnswerRunOptions = {}
): Promise<AnswerRunResult> {
  try {
    const answer = await generateBrowserAnswer(query, hits, options);
    return { answer };
  } catch (err) {
    const reason =
      err instanceof Error
        ? err.message
        : "The local answer model could not run.";
    options.onFallback?.(reason);
    options.onLoadProgress?.({
      phase: "fallback",
      message: "Answer model failed — showing retrieved passages only.",
    });
    return { answer: generateFallbackAnswer(query, hits, reason) };
  }
}
