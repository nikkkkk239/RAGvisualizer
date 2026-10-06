import type { TextChunk } from "../../types/rag";
import type { ChunkEmbedding } from "../../types/rag";
import { computeVectorStats, normalizedPreview } from "../../utils/vectorStats";

type Props = {
  chunk: TextChunk;
  embedding: ChunkEmbedding;
  defaultOpen?: boolean;
};

export function EmbedVectorCard({ chunk, embedding, defaultOpen }: Props) {
  const stats = computeVectorStats(embedding.vector);
  const bars = normalizedPreview(embedding.vector, 12);
  const previewValues = embedding.vector.slice(0, 6);

  return (
    <details
      className="group rounded-lg border border-slate-200 bg-white open:shadow-sm"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            Chunk #{chunk.index}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
            {stats.dimensions} numbers
          </span>
          <span className="text-xs text-slate-500">
            magnitude {stats.magnitude.toFixed(3)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{chunk.text}</p>
      </summary>

      <div className="border-t border-slate-100 px-3 py-3 sm:px-4 space-y-4">
        <p className="text-sm text-slate-700">
          An <strong>embedding</strong> is a list of numbers describing the meaning of
          text. Similar chunks get similar lists, which helps retrieval compare your
          question to each chunk.
        </p>

        <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">Dimensions</dt>
            <dd className="font-mono font-medium text-slate-900">{stats.dimensions}</dd>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">Magnitude</dt>
            <dd className="font-mono font-medium text-slate-900">
              {stats.magnitude.toFixed(4)}
            </dd>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">Min / max</dt>
            <dd className="font-mono font-medium text-slate-900">
              {stats.min.toFixed(3)} / {stats.max.toFixed(3)}
            </dd>
          </div>
          <div className="rounded-md bg-slate-50 p-2">
            <dt className="text-slate-500">Average</dt>
            <dd className="font-mono font-medium text-slate-900">
              {stats.mean.toFixed(4)}
            </dd>
          </div>
        </dl>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            First 12 dimensions (bar height = size)
          </p>
          <div className="mt-2 flex h-16 items-end gap-1">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-sky-500/80"
                style={{ height: `${Math.max(8, h * 100)}%` }}
                title={`dim ${i}: ${embedding.vector[i]?.toFixed(4)}`}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Raw preview (first 6 values)
          </p>
          <code className="mt-1 block overflow-x-auto rounded-md bg-slate-900 p-2 font-mono text-xs text-slate-100">
            [{previewValues.map((v) => v.toFixed(5)).join(", ")}
            {embedding.vector.length > 6 ? ", …" : ""}]
          </code>
        </div>
      </div>
    </details>
  );
}
