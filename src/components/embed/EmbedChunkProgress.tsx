import type { EmbedChunkProgress as ChunkState } from "../../types/rag";

type Props = {
  progress: ChunkState | null;
};

export function EmbedChunkProgressBar({ progress }: Props) {
  if (!progress) return null;
  const pct = (progress.current / progress.total) * 100;

  return (
    <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3">
      <p className="text-sm text-sky-900">
        Embedding chunk <strong>#{progress.chunkIndex}</strong> ({progress.current}{" "}
        of {progress.total})
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-sky-600 transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
