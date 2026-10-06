import { BROWSER_MODEL_LABEL } from "../../services/embedding/browserEmbedding";
import { useRagPipeline } from "../../context/RagPipelineContext";
import { EmbedVectorCard } from "../embed/EmbedVectorCard";
import { EmbeddingBackendBadge } from "../embed/EmbeddingBackendBadge";
import { GeneratingIndicator } from "../ui/GeneratingIndicator";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

export function EmbedStep() {
  const { state, runEmbed, setActiveStep } = useRagPipeline();
  const status = state.stepStatuses.embed;
  const isEmbedding = status === "running";
  const canRun = state.chunks.length > 0 && (status === "ready" || status === "done");

  const chunkById = new Map(state.chunks.map((c) => [c.id, c]));
  const chunkProgress = state.embedChunkProgress;
  const embedPercent = chunkProgress
    ? (chunkProgress.current / chunkProgress.total) * 100
    : undefined;

  return (
    <Panel
      title="Embed"
      description={`Vectorize each chunk with ${BROWSER_MODEL_LABEL} (loaded when you opened the app).`}
      footer={
        state.embeddings.length > 0 && !isEmbedding ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Retrieval uses the same embedding model as these vectors.
            </p>
            <Button variant="secondary" onClick={() => setActiveStep("retrieve")}>
              Continue to Retrieve →
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          <span className="text-sm text-slate-600">
            {state.embeddings.length > 0 && !isEmbedding
              ? `${state.embeddings.length} vectors ready`
              : "No embeddings yet"}
          </span>
          {state.embeddingsPersisted && !isEmbedding && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Saved to IndexedDB
            </span>
          )}
        </div>
        <Button onClick={() => runEmbed()} disabled={!canRun || isEmbedding}>
          {status === "done" ? "Re-run embedding" : "Generate embeddings"}
        </Button>
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

      {isEmbedding && (
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
