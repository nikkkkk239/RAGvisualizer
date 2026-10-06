import { ChunkBoundaryOverview } from "../chunk/ChunkBoundaryOverview";
import { ChunkControls } from "../chunk/ChunkControls";
import { ChunkHighlightedText } from "../chunk/ChunkHighlightedText";
import { ChunkList } from "../chunk/ChunkList";
import { useRagPipeline } from "../../context/RagPipelineContext";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

export function ChunkStep() {
  const { state, setChunkSettings, setActiveStep } = useRagPipeline();
  const status = state.stepStatuses.chunk;
  const doc = state.document;

  return (
    <Panel
      title="Chunk"
      description="Adjust size, overlap, and splitting method—the preview updates instantly as you change settings."
      footer={
        doc && state.chunks.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              When you&apos;re happy with the split, continue to embedding.
            </p>
            <Button variant="secondary" onClick={() => setActiveStep("embed")}>
              Continue to Embed →
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {state.chunks.length > 0 && (
          <span className="text-sm text-slate-600">
            Live preview · {state.chunks.length} chunks
          </span>
        )}
      </div>

      {!doc && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Upload a document first.
        </p>
      )}

      {doc && (
        <>
          <div className="mt-4">
            <ChunkControls
              settings={state.chunkSettings}
              onChange={setChunkSettings}
            />
          </div>

          {state.chunks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No chunks produced—try a larger chunk size or check that the
              document has text.
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              <ChunkBoundaryOverview
                totalChars={doc.text.length}
                chunks={state.chunks}
              />
              <ChunkHighlightedText fullText={doc.text} chunks={state.chunks} />
              <ChunkList chunks={state.chunks} />
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
