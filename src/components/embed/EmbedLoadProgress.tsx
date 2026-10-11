import type { EmbedLoadProgress as LoadState } from "../../types/rag";

type Props = {
  progress: LoadState | null;
  title?: string;
  fallbackTitle?: string;
};

export function EmbedLoadProgressPanel({
  progress,
  title = "Model loading",
  fallbackTitle = "Fallback",
}: Props) {
  if (!progress || progress.phase === "idle") return null;

  const showBar =
    progress.percent !== undefined &&
    (progress.phase === "downloading" || progress.phase === "loading");

  const heading = progress.phase === "fallback" ? fallbackTitle : title;

  return (
    <div className="mt-4 rounded border border-ink/15 bg-sage/40 px-4 py-3">
      <p className="text-sm font-medium text-ink">{heading}</p>
      <p className="mt-1 text-sm text-ink/75">{progress.message}</p>
      {progress.fileName && (
        <p className="mt-1 font-mono text-xs text-ink/65">
          {progress.fileName}
        </p>
      )}
      {showBar && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-forest transition-[width] duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, progress.percent ?? 0))}%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-ink/65">
            {Math.round(progress.percent ?? 0)}% — first download may take a
            minute on slow networks; later visits use the browser cache.
          </p>
        </div>
      )}
    </div>
  );
}
