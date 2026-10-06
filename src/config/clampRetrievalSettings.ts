import { DEFAULT_RETRIEVAL_SETTINGS, RETRIEVAL_LIMITS } from "./retrievalDefaults";
import type { RetrievalSettings } from "../types/rag";

export function clampRetrievalSettings(
  settings: Partial<RetrievalSettings> | RetrievalSettings
): RetrievalSettings {
  const base = { ...DEFAULT_RETRIEVAL_SETTINGS, ...settings };
  const topK = Math.min(
    RETRIEVAL_LIMITS.topKMax,
    Math.max(RETRIEVAL_LIMITS.topKMin, Math.round(base.topK))
  );
  const minScore = Math.min(
    RETRIEVAL_LIMITS.minScoreMax,
    Math.max(RETRIEVAL_LIMITS.minScoreMin, base.minScore)
  );
  return { topK, minScore };
}
