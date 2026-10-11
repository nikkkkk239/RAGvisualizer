import type {
  ChunkEmbedding,
  RetrievalHit,
  RetrievalResultMeta,
  TextChunk,
} from "../../types/rag";
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
        <p className="text-sm text-ink/75">
          Compared <strong>{meta.totalCompared}</strong> chunks ·{" "}
          <strong>{meta.aboveThreshold}</strong> met threshold ≥{" "}
          {meta.minScore.toFixed(2)} · showing top{" "}
          <strong>{meta.returned}</strong> (K={meta.topK})
        </p>
      )}

      {hits.length === 0 && meta && (
        <p className="rounded border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-ink">
          No chunks passed your filters. Lower the similarity threshold or
          increase top K, then search again.
        </p>
      )}

      {hits.length > 0 && (
        <ol className="space-y-3">
          {hits.map((hit, rank) => (
            <li
              key={hit.chunk.id}
              className="rounded border border-ink/15 bg-surface shadow-sm overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-sage/40 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-sm border border-rust/40 bg-rust/15 px-2 py-0.5 font-medium text-ink">
                    Rank #{rank + 1}
                  </span>
                  <span className="font-mono text-ink/75">
                    cosine {hit.score.toFixed(4)}
                  </span>
                  <span className="text-ink/65">{scoreLabel(hit.score)}</span>
                </div>
              </div>
              <div className="px-3 py-2 text-xs text-ink/65 space-y-1">
                <p>
                  <span className="font-medium text-ink">Source:</span>{" "}
                  {documentName} · chunk #{hit.chunk.index} · characters{" "}
                  {hit.chunk.start}–{hit.chunk.end}
                </p>
                <p className="font-mono text-muted">id {hit.chunk.id}</p>
              </div>
              <p className="border-t border-ink/10 px-3 py-3 text-sm text-ink whitespace-pre-wrap">
                {hit.chunk.text}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
