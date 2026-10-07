import { useEffect, useRef } from "react";
import { BROWSER_MODEL_LABEL } from "../../services/embedding/browserEmbedding";
import { useRagPipeline } from "../../context/RagPipelineContext";
import { EmbedVectorCard } from "../embed/EmbedVectorCard";
import { EmbeddingBackendBadge } from "../embed/EmbeddingBackendBadge";
import { GeneratingIndicator } from "../ui/GeneratingIndicator";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

export function EmbedStep() {
  const { state, runEmbed, setActiveStep, activeStep } = useRagPipeline();
  const status = state.stepStatuses.embed;
  const isEmbedding = status === "running";
  const autoStartedRef = useRef(false);

  const chunkById = new Map(state.chunks.map((c) => [c.id, c]));
  const chunkProgress = state.embedChunkProgress;
  const embedPercent = chunkProgress
    ? (chunkProgress.current / chunkProgress.total) * 100
    : undefined;

  useEffect(() => {
    if (activeStep !== "embed") {
      autoStartedRef.current = false;
      return;
    }
    if (autoStartedRef.current || isEmbedding) return;
    if (state.chunks.length === 0) return;
    if (state.embeddings.length > 0) return;
    if (status !== "ready") return;

    autoStartedRef.current = true;
    void runEmbed();
  }, [
    activeStep,
    isEmbedding,
    runEmbed,
    state.chunks.length,
    state.embeddings.length,
    status,
  ]);

  const showWorking = isEmbedding || (status === "ready" && state.embeddings.length === 0 && state.chunks.length > 0);

  return (
    <Panel
      title="Embed"
      description={`Vectorize each chunk with ${BROWSER_MODEL_LABEL}. Vector size is fixed at 384 numbers per chunk for this model—you cannot change dimension without switching models in config.`}
      footer={
        state.embeddings.length > 0 && !isEmbedding ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" className="text-xs" onClick={() => void runEmbed()}>
              Re-run embeddings
            </Button>
            <Button variant="secondary" onClick={() => setActiveStep("retrieve")}>
              Continue to Retrieve →
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        <span className="text-sm text-slate-600">
          {state.embeddings.length > 0 && !isEmbedding
            ? `${state.embeddings.length} vectors ready`
            : showWorking
              ? "Embedding in progress…"
              : "Waiting for chunks"}
        </span>
        {state.embeddingsPersisted && !isEmbedding && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
            Saved to IndexedDB
          </span>
        )}
      </div>

      {state.embedError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.embedError}
        </p>
      )}

      {state.chunks.length === 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Complete chunking before embedding.
        </p>
      )}

      {showWorking && (
        <GeneratingIndicator
          label="Generating embeddings…"
          detail={
            chunkProgress
              ? `Processing chunk #${chunkProgress.chunkIndex} (${chunkProgress.current} of ${chunkProgress.total})`
              : "Starting…"
          }
          percent={embedPercent}
        />
      )}

      {!isEmbedding && state.embeddings.length > 0 && (
        <>
          <div className="mt-4">
            <EmbeddingBackendBadge />
          </div>
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Per-chunk vectors</h3>
            {state.embeddings.map((e, i) => {
              const chunk = chunkById.get(e.chunkId);
              if (!chunk) return null;
              return (
                <EmbedVectorCard
                  key={e.chunkId}
                  chunk={chunk}
                  embedding={e}
                  defaultOpen={i === 0}
                />
              );
            })}
          </div>
        </>
      )}
    </Panel>
  );
}
