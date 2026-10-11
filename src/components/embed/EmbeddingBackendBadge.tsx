import { BROWSER_MODEL_LABEL } from "../../services/embedding/browserEmbedding";

export function EmbeddingBackendBadge() {
  return (
    <div className="rounded border border-forest/30 bg-sage px-3 py-2 text-sm text-forest">
      <p className="font-medium">Local embedding model</p>
      <p className="mt-1 text-xs opacity-90">
        {BROWSER_MODEL_LABEL} — vectors run in your browser.
      </p>
    </div>
  );
}
