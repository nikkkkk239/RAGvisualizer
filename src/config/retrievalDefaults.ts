import type { RetrievalSettings } from "../types/rag";

export const RETRIEVAL_LIMITS = {
  topKMin: 1,
  topKMax: 20,
  minScoreMin: 0,
  minScoreMax: 1,
  minScoreStep: 0.05,
} as const;

export const DEFAULT_RETRIEVAL_SETTINGS: RetrievalSettings = {
  topK: 5,
  minScore: 0.35,
};
