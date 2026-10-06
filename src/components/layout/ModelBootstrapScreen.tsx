import { useModelPreload } from "../../context/ModelPreloadContext";
import { Button } from "../ui/Button";

export function ModelBootstrapScreen() {
  const { status, progress, error, retry } = useModelPreload();

  if (status === "ready") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <h1 className="text-lg font-semibold text-slate-900">RAG Visualizer</h1>
        <p className="mt-2 text-sm text-slate-600">
          {status === "error"
            ? "Local models could not be loaded."
            : "Loading on-device models for embeddings and answers. This runs once per browser tab; later visits use the cache."}
        </p>

        {status === "loading" && progress && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-700">{progress.message}</p>
            <div className="flex gap-2 text-xs text-slate-500">
              <span
                className={
                  progress.embeddingReady ? "text-emerald-600 font-medium" : ""
                }
              >
                Embedding {progress.embeddingReady ? "✓" : "…"}
              </span>
              <span>·</span>
              <span
                className={
                  progress.answerReady ? "text-emerald-600 font-medium" : ""
                }
              >
                Answer {progress.answerReady ? "✓" : "…"}
              </span>
            </div>
            {progress.percent !== undefined && (
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-sky-600 transition-[width] duration-300"
                  style={{ width: `${Math.min(100, progress.percent)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
            <Button onClick={retry}>Retry loading models</Button>
          </div>
        )}
      </div>
    </div>
  );
}
