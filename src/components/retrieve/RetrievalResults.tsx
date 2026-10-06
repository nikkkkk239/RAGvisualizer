import type { RetrievalHit, RetrievalResultMeta } from "../../types/rag";
import { normalizedPreview } from "../../utils/vectorStats";

type Props = {
  documentName: string;
  hits: RetrievalHit[];
  meta: RetrievalResultMeta | null;
  queryVector: number[] | null;
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
}: Props) {
  if (!meta && hits.length === 0) return null;

  const queryBars = queryVector ? normalizedPreview(queryVector, 8) : null;

  return (
    <div className="mt-6 space-y-4">
      {queryVector && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-medium text-slate-900">Query embedding</p>
          <p className="mt-1 text-xs text-slate-600">
            Your question was converted to a {queryVector.length}-dimensional vector
            using the same model as the chunks. Retrieval compares this vector to each
            stored chunk vector with cosine similarity.
          </p>
          <div className="mt-2 flex h-10 items-end gap-1">
            {queryBars?.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-violet-500/80"
                style={{ height: `${Math.max(10, h * 100)}%` }}
              />
            ))}
          </div>
        </div>
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
