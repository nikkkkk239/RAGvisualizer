import type { EmbedChunkProgress as ChunkState } from "../../types/rag";

type Props = {
  progress: ChunkState | null;
};

export function EmbedChunkProgressBar({ progress }: Props) {
  if (!progress) return null;
  const pct = (progress.current / progress.total) * 100;

  return (
    <div className="mt-3 rounded border border-forest/20 bg-sage px-4 py-3">
      <p className="text-sm text-forest">
        Embedding chunk <strong>#{progress.chunkIndex}</strong> (
        {progress.current} of {progress.total})
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-forest transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
