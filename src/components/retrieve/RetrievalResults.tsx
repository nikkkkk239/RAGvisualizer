import type { ChunkEmbedding, RetrievalHit, RetrievalResultMeta, TextChunk } from "../../types/rag";
import { RetrievalVectorSpace } from "../viz/VectorSpace3D";

type Props = {
  documentName: string;
  hits: RetrievalHit[];
  meta: RetrievalResultMeta | null;
  queryVector: number[] | null;
  embeddings: ChunkEmbedding[];
  chunks: TextChunk[];
};

function scoreLabel(score: number): string {
  if (score >= 0.75) return "Strong match";
  if (score >= 0.5) return "Good match";
  if (score >= 0.35) return "Moderate match";
  return "Weak match";
}

export function RetrievalResults({
  documentName,
  hits,
  meta,
  queryVector,
  embeddings,
  chunks,
}: Props) {
  if (!meta && hits.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {queryVector && embeddings.length > 0 && (
        <RetrievalVectorSpace
          embeddings={embeddings}
          chunks={chunks}
          hits={hits}
          queryVector={queryVector}
        />
      )}

      {meta && (
        <p className="text-sm text-slate-600">
          Compared <strong>{meta.totalCompared}</strong> chunks ·{" "}
          <strong>{meta.aboveThreshold}</strong> met threshold ≥{" "}
          {meta.minScore.toFixed(2)} · showing top{" "}
          <strong>{meta.returned}</strong> (K={meta.topK})
        </p>
      )}

      {hits.length === 0 && meta && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No chunks passed your filters. Lower the similarity threshold or increase top
          K, then search again.
        </p>
      )}

      {hits.length > 0 && (
        <ol className="space-y-3">
          {hits.map((hit, rank) => (
            <li
              key={hit.chunk.id}
              className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-sky-600 px-2 py-0.5 font-semibold text-white">
                    Rank #{rank + 1}
                  </span>
                  <span className="font-mono text-slate-600">
                    cosine {hit.score.toFixed(4)}
                  </span>
                  <span className="text-slate-500">{scoreLabel(hit.score)}</span>
                </div>
              </div>
              <div className="px-3 py-2 text-xs text-slate-500 space-y-1">
                <p>
                  <span className="font-medium text-slate-700">Source:</span>{" "}
                  {documentName} · chunk #{hit.chunk.index} · characters{" "}
                  {hit.chunk.start}–{hit.chunk.end}
                </p>
                <p className="font-mono text-slate-400">id {hit.chunk.id}</p>
              </div>
              <p className="border-t border-slate-100 px-3 py-3 text-sm text-slate-800 whitespace-pre-wrap">
                {hit.chunk.text}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
