import { useState } from "react";
import { useRagPipeline } from "../../context/RagPipelineContext";
import { RetrievalControls } from "../retrieve/RetrievalControls";
import { RetrievalResults } from "../retrieve/RetrievalResults";
import { GeneratingIndicator } from "../ui/GeneratingIndicator";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

export function RetrieveStep() {
  const { state, runRetrieve, setRetrievalSettings, setActiveStep } = useRagPipeline();
  const [query, setQuery] = useState("What is retrieval-augmented generation?");
  const status = state.stepStatuses.retrieve;
  const isSearching = status === "running";
  const hasVectors =
    state.embeddings.length > 0 || state.embeddingsPersisted;
  const canRun =
    hasVectors &&
    state.chunks.length > 0 &&
    (status === "ready" || status === "done" || status === "idle");

  return (
    <Panel
      title="Retrieve"
      description="Embed your question, compare it to chunk vectors with cosine similarity, and rank the best matches. Vectors are read from memory or IndexedDB."
      footer={
        state.retrievalHits.length > 0 && !isSearching ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setActiveStep("answer")}>
              Continue to Answer →
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {state.embeddingsPersisted && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
            Chunk vectors in IndexedDB
          </span>
        )}
        {state.retrievalHits.length > 0 && state.lastQuery && (
          <span className="text-sm text-slate-600">
            {state.retrievalHits.length} result(s) for &ldquo;{state.lastQuery}&rdquo;
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-600">
        <strong>How it works:</strong> each chunk embedding lives in your browser&apos;s
        IndexedDB after the Embed step. Here we embed only the query, score every stored
        chunk, sort by similarity, apply your threshold, then return the top K.
      </p>

      {!hasVectors && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Run embedding before retrieval.
        </p>
      )}

      {hasVectors && (
        <div className="mt-4">
          <RetrievalControls
            settings={state.retrievalSettings}
            onChange={setRetrievalSettings}
            disabled={status === "running"}
          />
        </div>
      )}

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Query
        <span className="ml-1 font-normal text-slate-500">
          — natural language question to embed and match against chunks
        </span>
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          rows={2}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={!hasVectors}
        />
      </label>

      <div className="mt-4">
        <Button
          onClick={() => runRetrieve(query)}
          disabled={!canRun || isSearching || !query.trim()}
        >
          {isSearching ? "Searching…" : "Search chunks"}
        </Button>
      </div>

      {isSearching && (
        <GeneratingIndicator
          label="Searching…"
          detail="Embedding your question and ranking chunks by similarity."
        />
      )}

      {!isSearching && (
        <RetrievalResults
          documentName={state.document?.name ?? "Document"}
          hits={state.retrievalHits}
          meta={state.retrievalMeta}
          queryVector={state.lastQueryVector}
        />
      )}
    </Panel>
  );
}
