import { useEffect, useRef } from "react";
import { ANSWER_MODEL_LABEL } from "../../config/models";
import { useRagPipeline } from "../../context/RagPipelineContext";
import { AnswerContextPanel } from "../answer/AnswerContextPanel";
import { AnswerResultCard } from "../answer/AnswerResultCard";
import { AnswerSourceChunks } from "../answer/AnswerSourceChunks";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

export function AnswerStep() {
  const { state, runAnswer, activeStep } = useRagPipeline();
  const status = state.stepStatuses.answer;
  const isGenerating = status === "running";
  const autoStartedRef = useRef(false);

  const canGenerate =
    state.retrievalHits.length > 0 && Boolean(state.lastQuery);

  useEffect(() => {
    if (activeStep !== "answer") {
      autoStartedRef.current = false;
      return;
    }
    if (!canGenerate || isGenerating) return;
    if (status === "done" && state.answer) return;
    if (autoStartedRef.current) return;
    if (status !== "ready" && status !== "idle") return;

    autoStartedRef.current = true;
    void runAnswer();
  }, [
    activeStep,
    canGenerate,
    isGenerating,
    runAnswer,
    state.answer,
    status,
  ]);

  const showSupplementary = !isGenerating && state.answer !== null;
  const showWaiting =
    canGenerate &&
    !isGenerating &&
    !state.answer &&
    (status === "ready" || status === "idle");

  return (
    <Panel
      title="Answer"
      description={`Answers are generated with ${ANSWER_MODEL_LABEL} from your retrieved chunks.`}
      footer={
        status === "done" && state.answer && !isGenerating ? (
          <div className="flex justify-end">
            <Button variant="ghost" className="text-sm" onClick={() => void runAnswer()}>
              Regenerate answer
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {state.lastQuery && (
          <span className="text-sm text-slate-600">
            Question: &ldquo;{state.lastQuery}&rdquo;
          </span>
        )}
      </div>

      {!canGenerate && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Retrieve relevant chunks, then use Continue to Answer on the Retrieve step.
        </p>
      )}

      {(isGenerating || state.answer || showWaiting) && (
        <AnswerResultCard
          isGenerating={isGenerating || showWaiting}
          answer={state.answer}
        />
      )}

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
