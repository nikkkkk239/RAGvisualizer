import { BROWSER_MODEL_LABEL } from "../../services/embedding/browserEmbedding";

export function EmbeddingBackendBadge() {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
      <p className="font-medium">Local embedding model</p>
      <p className="mt-1 text-xs opacity-90">
        {BROWSER_MODEL_LABEL} — vectors run in your browser.
      </p>
    </div>
  );
}
