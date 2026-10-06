import type { ProgressInfo, Text2TextGenerationPipeline } from "@huggingface/transformers";
import {
  ANSWER_MODEL_ID,
  ANSWER_MODEL_LABEL,
} from "../../config/models";
import type { AnswerLoadProgress, RagAnswer, RetrievalHit } from "../../types/rag";
import { yieldToMain } from "../../utils/yieldToMain";
import { loadTransformers } from "../models/transformersEnv";
import { buildRagPrompt } from "./buildRagPrompt";
import type { AnswerRunOptions } from "./answerTypes";

export { ANSWER_MODEL_ID, ANSWER_MODEL_LABEL };

let generatorPromise: Promise<Text2TextGenerationPipeline> | null = null;

export function resetAnswerModel(): void {
  generatorPromise = null;
}

function mapLoadProgress(info: ProgressInfo): AnswerLoadProgress {
  switch (info.status) {
    case "initiate":
      return {
        phase: "preparing",
        message: `Answer model: preparing ${info.file}…`,
        fileName: info.file,
      };
    case "download":
      return {
        phase: "downloading",
        message: `Answer model: downloading ${info.file}…`,
        fileName: info.file,
      };
    case "progress":
      return {
        phase: "downloading",
        message: `Answer model: downloading ${info.file}…`,
        fileName: info.file,
        percent: info.progress,
      };
    case "progress_total":
      return {
        phase: "downloading",
        message: "Answer model: downloading files…",
        percent: info.progress,
      };
    case "ready":
      return { phase: "ready", message: "Answer model ready." };
    case "done":
      return {
        phase: "loading",
        message: `Answer model: loaded ${info.file}`,
        fileName: info.file,
      };
    default:
      return { phase: "preparing", message: "Loading answer model…" };
  }
}

async function createGenerator(
  onLoadProgress?: (progress: AnswerLoadProgress) => void
): Promise<Text2TextGenerationPipeline> {
  const { pipeline } = await loadTransformers();
  const generator = await pipeline("text2text-generation", ANSWER_MODEL_ID, {
    progress_callback: (info: ProgressInfo) => {
      onLoadProgress?.(mapLoadProgress(info));
    },
  });
  onLoadProgress?.({ phase: "ready", message: "Answer model ready." });
  return generator;
}

async function getGenerator(
  onLoadProgress?: (progress: AnswerLoadProgress) => void
): Promise<Text2TextGenerationPipeline> {
  if (generatorPromise) {
    return generatorPromise;
  }
  generatorPromise = createGenerator(onLoadProgress).catch((err) => {
    generatorPromise = null;
    throw err;
  });
  return generatorPromise;
}

export function warmUpAnswerModel(
  onLoadProgress?: (progress: AnswerLoadProgress) => void
): Promise<Text2TextGenerationPipeline> {
  return getGenerator(onLoadProgress);
}

function cleanModelOutput(raw: string, prompt: string): string {
  let text = raw.trim();
  if (text.startsWith(prompt)) {
    text = text.slice(prompt.length).trim();
  }
  const answerTag = text.lastIndexOf("Answer:");
  if (answerTag >= 0) {
    text = text.slice(answerTag + "Answer:".length).trim();
  }
  return text;
}

export async function generateBrowserAnswer(
  query: string,
  hits: RetrievalHit[],
  options: AnswerRunOptions = {}
): Promise<RagAnswer> {
  const { prompt, citations } = buildRagPrompt(query, hits);
  const generator = await getGenerator();

  await yieldToMain();

  options.onLoadProgress?.({
    phase: "loading",
    message: "Generating answer from retrieved context…",
  });

  const output = await generator(prompt, {
    max_new_tokens: 280,
    do_sample: false,
  });

  const raw =
    Array.isArray(output) && output[0] && "generated_text" in output[0]
      ? String(output[0].generated_text)
      : "";

  const text =
    cleanModelOutput(raw, prompt) ||
    "The model returned an empty answer. Try rephrasing your question, adjusting retrieval (top K / threshold), or using more relevant chunks.";

  return {
    query,
    text,
    prompt,
    citations,
    modelId: ANSWER_MODEL_ID,
    backend: "browser",
    usedFallback: false,
  };
}
