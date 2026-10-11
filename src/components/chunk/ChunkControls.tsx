import { CHUNK_LIMITS } from "../../config/chunkDefaults";
import type { ChunkSettings, ChunkSplitMethod } from "../../types/rag";

const METHODS: { id: ChunkSplitMethod; label: string; hint: string }[] = [
  {
    id: "fixed",
    label: "Fixed size",
    hint: "Sliding character windows with overlap.",
  },
  {
    id: "paragraph",
    label: "Paragraphs",
    hint: "Pack paragraphs up to the size limit, then overlap.",
  },
  {
    id: "sentence",
    label: "Sentences",
    hint: "Pack sentences up to the size limit, then overlap.",
  },
];

type Props = {
  settings: ChunkSettings;
  onChange: (patch: Partial<ChunkSettings>) => void;
  disabled?: boolean;
};

export function ChunkControls({ settings, onChange, disabled }: Props) {
  const overlapMax = Math.min(CHUNK_LIMITS.overlapMax, settings.chunkSize - 1);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <fieldset className="space-y-2 sm:col-span-2 lg:col-span-1">
        <legend className="text-sm font-medium text-ink">Split method</legend>
        <div className="flex flex-col gap-2">
          {METHODS.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer gap-2 rounded border px-3 py-2 text-sm transition ${
                settings.method === m.id
                  ? "border-forest bg-sage ring-1 ring-forest/25"
                  : "border-ink/15 bg-surface hover:border-ink/30"
              } ${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="chunk-method"
                className="mt-1"
                checked={settings.method === m.id}
                disabled={disabled}
                onChange={() => onChange({ method: m.id })}
              />
              <span>
                <span className="font-medium text-ink">{m.label}</span>
                <span className="block text-xs text-ink/65">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium text-ink">
          Chunk size
          <span className="font-mono text-xs text-ink/75">
            {settings.chunkSize} chars
          </span>
        </label>
        <input
          type="range"
          min={CHUNK_LIMITS.sizeMin}
          max={CHUNK_LIMITS.sizeMax}
          step={CHUNK_LIMITS.sizeStep}
          value={settings.chunkSize}
          disabled={disabled}
          className="w-full accent-forest"
          onChange={(e) => onChange({ chunkSize: Number(e.target.value) })}
        />
        <input
          type="number"
          min={CHUNK_LIMITS.sizeMin}
          max={CHUNK_LIMITS.sizeMax}
          step={CHUNK_LIMITS.sizeStep}
          value={settings.chunkSize}
          disabled={disabled}
          className="w-full rounded border border-ink/15 px-2 py-1 text-sm"
          onChange={(e) => onChange({ chunkSize: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium text-ink">
          Overlap
          <span className="font-mono text-xs text-ink/75">
            {settings.overlap} chars
          </span>
        </label>
        <input
          type="range"
          min={CHUNK_LIMITS.overlapMin}
          max={overlapMax}
          step={CHUNK_LIMITS.overlapStep}
          value={Math.min(settings.overlap, overlapMax)}
          disabled={disabled}
          className="w-full accent-forest"
          onChange={(e) => onChange({ overlap: Number(e.target.value) })}
        />
        <input
          type="number"
          min={CHUNK_LIMITS.overlapMin}
          max={overlapMax}
          step={CHUNK_LIMITS.overlapStep}
          value={Math.min(settings.overlap, overlapMax)}
          disabled={disabled}
          className="w-full rounded border border-ink/15 px-2 py-1 text-sm"
          onChange={(e) => onChange({ overlap: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
