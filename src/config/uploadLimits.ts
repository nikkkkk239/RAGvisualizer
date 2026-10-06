/** Hard limits for in-browser ingestion (adjust as needed). */
export const UPLOAD_LIMITS = {
  maxFiles: 5,
  /** Per-file cap */
  maxFileBytes: 2 * 1024 * 1024, // 2 MB
  /** Combined cap for one upload batch */
  maxTotalBytes: 5 * 1024 * 1024, // 5 MB
} as const;

export const ACCEPTED_UPLOAD_ACCEPT =
  ".txt,.md,.pdf,text/plain,text/markdown,application/pdf";
