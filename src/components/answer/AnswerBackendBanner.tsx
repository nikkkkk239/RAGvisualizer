import type { RagAnswer } from "../../types/rag";
import { ANSWER_MODEL_LABEL } from "../../services/answer/browserAnswer";

type Props = {
  answer: RagAnswer;
};

export function AnswerBackendBanner({ answer }: Props) {
  const isFallback = answer.backend === "fallback";

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        isFallback
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-emerald-200 bg-emerald-50 text-emerald-950"
      }`}
    >
      <p className="font-medium">
        {isFallback ? "Extractive fallback answer" : "Local LLM answer"}
      </p>
      <p className="mt-1 text-xs opacity-90">
        {isFallback
          ? "No on-device text model was used — passages were quoted from retrieved chunks."
          : `Generated with ${ANSWER_MODEL_LABEL} in your browser using the context below.`}
      </p>
      {isFallback && answer.fallbackReason && (
        <p className="mt-2 text-xs">
          <span className="font-medium">Why:</span> {answer.fallbackReason}
        </p>
      )}
    </div>
  );
}
