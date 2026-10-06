import type { RagAnswer } from "../../types/rag";
import { GeneratingIndicator } from "../ui/GeneratingIndicator";

type Props = {
  isGenerating: boolean;
  answer: RagAnswer | null;
};

export function AnswerResultCard({ isGenerating, answer }: Props) {
  if (!isGenerating && !answer) return null;

  if (isGenerating) {
    return <GeneratingIndicator label="Generating answer…" />;
  }

  if (!answer) return null;

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Answer</h3>
      <div className="mt-3 space-y-2">
        {answer.usedFallback && (
          <p className="text-xs text-amber-800 bg-amber-50 rounded-md px-2 py-1.5">
            Could not run the local model — showing retrieved passages instead.
            {answer.fallbackReason ? ` ${answer.fallbackReason}` : ""}
          </p>
        )}
        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
          {answer.text}
        </p>
      </div>
    </div>
  );
}
