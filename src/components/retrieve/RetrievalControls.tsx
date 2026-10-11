import {
  DEFAULT_RETRIEVAL_SETTINGS,
  RETRIEVAL_LIMITS,
} from "../../config/retrievalDefaults";
import type { RetrievalSettings } from "../../types/rag";

type Props = {
  settings: RetrievalSettings;
  onChange: (patch: Partial<RetrievalSettings>) => void;
  disabled?: boolean;
};

export function RetrievalControls({ settings, onChange, disabled }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 rounded border border-ink/15 bg-sage/40 p-3">
        <label className="flex items-center justify-between text-sm font-medium text-ink">
          Top K
          <span className="font-mono text-xs text-ink/75">{settings.topK}</span>
        </label>
        <input
          type="range"
          min={RETRIEVAL_LIMITS.topKMin}
          max={RETRIEVAL_LIMITS.topKMax}
          step={1}
          value={settings.topK}
          disabled={disabled}
          className="w-full accent-forest"
          onChange={(e) => onChange({ topK: Number(e.target.value) })}
        />
        <input
          type="number"
          min={RETRIEVAL_LIMITS.topKMin}
          max={RETRIEVAL_LIMITS.topKMax}
          value={settings.topK}
          disabled={disabled}
          className="w-full rounded border border-ink/15 px-2 py-1 text-sm"
          onChange={(e) => onChange({ topK: Number(e.target.value) })}
        />
        <p className="text-xs text-ink/75">
          <strong>Top K</strong> is how many of the best-matching chunks you
          keep after ranking. A higher K shows more matches and can include
          weaker ones. Default: {DEFAULT_RETRIEVAL_SETTINGS.topK}.
        </p>
      </div>

      <div className="space-y-2 rounded border border-ink/15 bg-sage/40 p-3">
        <label className="flex items-center justify-between text-sm font-medium text-ink">
          Similarity threshold
          <span className="font-mono text-xs text-ink/75">
            {settings.minScore.toFixed(2)}
          </span>
        </label>
        <input
          type="range"
          min={RETRIEVAL_LIMITS.minScoreMin}
          max={RETRIEVAL_LIMITS.minScoreMax}
          step={RETRIEVAL_LIMITS.minScoreStep}
          value={settings.minScore}
          disabled={disabled}
          className="w-full accent-forest"
          onChange={(e) => onChange({ minScore: Number(e.target.value) })}
        />
        <input
          type="number"
          min={RETRIEVAL_LIMITS.minScoreMin}
          max={RETRIEVAL_LIMITS.minScoreMax}
          step={RETRIEVAL_LIMITS.minScoreStep}
          value={settings.minScore}
          disabled={disabled}
          className="w-full rounded border border-ink/15 px-2 py-1 text-sm"
          onChange={(e) => onChange({ minScore: Number(e.target.value) })}
        />
        <p className="text-xs text-ink/75">
          <strong>Cosine similarity</strong> scores how aligned the query vector
          is with each chunk (1 = very similar, 0 = unrelated). Chunks below
          this threshold are dropped even if they would be in the top K. Try
          lowering it if you get no results.
        </p>
      </div>
    </div>
  );
}
