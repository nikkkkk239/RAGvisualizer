import type { AnswerLoadProgress, RagAnswer, RetrievalHit } from "../../types/rag";

export interface AnswerRunOptions {
  onLoadProgress?: (progress: AnswerLoadProgress) => void;
  onFallback?: (reason: string) => void;
}

export interface AnswerRunResult {
  answer: RagAnswer;
}

export type { RetrievalHit, RagAnswer, AnswerLoadProgress };
