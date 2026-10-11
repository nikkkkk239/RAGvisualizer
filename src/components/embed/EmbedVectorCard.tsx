import type { TextChunk } from "../../types/rag";
import type { ChunkEmbedding } from "../../types/rag";
import { computeVectorStats } from "../../utils/vectorStats";

type Props = {
  chunk: TextChunk;
  embedding: ChunkEmbedding;
  defaultOpen?: boolean;
};

export function EmbedVectorCard({ chunk, embedding, defaultOpen }: Props) {
  const stats = computeVectorStats(embedding.vector);
  const previewValues = embedding.vector.slice(0, 6);

  return (
    <details
      className="group rounded border border-ink/15 bg-surface open:shadow-sm"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink">
            Chunk #{chunk.index}
          </span>
          <span className="rounded-sm bg-sage/80 px-2 py-0.5 font-mono text-xs text-ink/75">
            {stats.dimensions} numbers
          </span>
          <span className="text-xs text-ink/65">
            magnitude {stats.magnitude.toFixed(3)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-ink/75">{chunk.text}</p>
      </summary>

      <div className="border-t border-ink/10 px-3 py-3 sm:px-4 space-y-4">
        <p className="text-sm text-ink">
          An <strong>embedding</strong> is a list of numbers describing the
          meaning of text. Similar chunks get similar lists, which helps
          retrieval compare your question to each chunk.
        </p>

        <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-md bg-sage/40 p-2">
            <dt className="text-ink/65">Dimensions</dt>
            <dd className="font-mono font-medium text-ink">
              {stats.dimensions}
            </dd>
          </div>
          <div className="rounded-md bg-sage/40 p-2">
            <dt className="text-ink/65">Magnitude</dt>
            <dd className="font-mono font-medium text-ink">
              {stats.magnitude.toFixed(4)}
            </dd>
          </div>
          <div className="rounded-md bg-sage/40 p-2">
            <dt className="text-ink/65">Min / max</dt>
            <dd className="font-mono font-medium text-ink">
              {stats.min.toFixed(3)} / {stats.max.toFixed(3)}
            </dd>
          </div>
          <div className="rounded-md bg-sage/40 p-2">
            <dt className="text-ink/65">Average</dt>
            <dd className="font-mono font-medium text-ink">
              {stats.mean.toFixed(4)}
            </dd>
          </div>
        </dl>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/65">
            Raw preview (first 6 values)
          </p>
          <code className="mt-1 block overflow-x-auto rounded-md bg-ink p-2 font-mono text-xs text-paper">
            [{previewValues.map((v) => v.toFixed(5)).join(", ")}
            {embedding.vector.length > 6 ? ", …" : ""}]
          </code>
        </div>
      </div>
    </details>
  );
}
