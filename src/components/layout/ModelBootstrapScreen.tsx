import { useModelPreload } from "../../context/ModelPreloadContext";
import { Button } from "../ui/Button";

export function ModelBootstrapScreen() {
  const { status, progress, error, retry } = useModelPreload();

  if (status === "ready") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md rounded-md border border-ink/15 bg-surface p-6 shadow-panel">
        <h1 className="text-lg text-ink">RAG Visualizer</h1>
        <p className="mt-2 text-sm text-ink/75">
          {status === "error"
            ? "Local models could not be loaded."
            : "Loading the on-device embedding model. This runs once per browser tab; later visits use the cache."}
        </p>

        {status === "loading" && progress && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-ink">{progress.message}</p>
            <div className="flex gap-2 text-xs text-ink/65">
              <span
                className={
                  progress.embeddingReady ? "text-forest font-medium" : ""
                }
              >
                Embedding {progress.embeddingReady ? "✓" : "…"}
              </span>
            </div>
            {progress.percent !== undefined && (
              <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-forest transition-[width] duration-300"
                  style={{ width: `${Math.min(100, progress.percent)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 space-y-3">
            <p className="rounded bg-rust/10 px-3 py-2 text-sm text-ink">
              {error}
            </p>
            <Button onClick={retry}>Retry loading models</Button>
          </div>
        )}
      </div>
    </div>
  );
}
