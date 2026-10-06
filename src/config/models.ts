/** On-device model IDs (Transformers.js / ONNX in the browser). */

export const EMBEDDING_MODEL_ID = "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_MODEL_LABEL = "all-MiniLM-L6-v2";

/**
 * Better grounded Q&A than flan-t5-small; still feasible in-browser.
 * Trade-off: larger download (~250M params) and slower inference.
 */
export const ANSWER_MODEL_ID = "Xenova/LaMini-Flan-T5-248M";
export const ANSWER_MODEL_LABEL = "LaMini FLAN-T5 248M";
