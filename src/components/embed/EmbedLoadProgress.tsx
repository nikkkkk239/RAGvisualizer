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

  const heading =
    progress.phase === "fallback" ? fallbackTitle : title;

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm font-medium text-slate-900">{heading}</p>
      <p className="mt-1 text-sm text-slate-600">{progress.message}</p>
      {progress.fileName && (
        <p className="mt-1 font-mono text-xs text-slate-500">{progress.fileName}</p>
      )}
      {showBar && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-600 transition-[width] duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress.percent ?? 0))}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {Math.round(progress.percent ?? 0)}% — first download may take a minute on
            slow networks; later visits use the browser cache.
          </p>
        </div>
      )}
    </div>
  );
}
