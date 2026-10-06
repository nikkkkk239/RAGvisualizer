import { ANSWER_MODEL_LABEL } from "../../config/models";
import { useRagPipeline } from "../../context/RagPipelineContext";
import { AnswerContextPanel } from "../answer/AnswerContextPanel";
import { AnswerResultCard } from "../answer/AnswerResultCard";
import { AnswerSourceChunks } from "../answer/AnswerSourceChunks";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

export function AnswerStep() {
  const { state, runAnswer } = useRagPipeline();
  const status = state.stepStatuses.answer;
  const isGenerating = status === "running";
  const canRun =
    state.retrievalHits.length > 0 &&
    state.lastQuery &&
    (status === "ready" || status === "done");

  const showSupplementary =
    !isGenerating && state.answer !== null;

  return (
    <Panel
      title="Answer"
      description={`Generate an answer from retrieved chunks using ${ANSWER_MODEL_LABEL} (preloaded at startup).`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge status={status} />
        {state.lastQuery && (
          <span className="text-sm text-slate-600">
            Question: &ldquo;{state.lastQuery}&rdquo;
          </span>
        )}
        <Button
          onClick={() => runAnswer()}
          disabled={!canRun || isGenerating}
        >
          {status === "done" ? "Regenerate answer" : "Generate answer"}
        </Button>
      </div>

      {state.retrievalHits.length === 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Retrieve relevant chunks before generating an answer.
        </p>
      )}

      <AnswerResultCard isGenerating={isGenerating} answer={state.answer} />

      {showSupplementary && state.answer && (
        <article className="mt-6 space-y-4">
          <AnswerContextPanel prompt={state.answer.prompt} />
          <AnswerSourceChunks
            citations={state.answer.citations}
            hits={state.retrievalHits}
          />
        </article>
      )}
    </Panel>
  );
}
