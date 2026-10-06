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
  const overlapMax = Math.min(
    CHUNK_LIMITS.overlapMax,
    settings.chunkSize - 1
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <fieldset className="space-y-2 sm:col-span-2 lg:col-span-1">
        <legend className="text-sm font-medium text-slate-800">
          Split method
        </legend>
        <div className="flex flex-col gap-2">
          {METHODS.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                settings.method === m.id
                  ? "border-sky-400 bg-sky-50 ring-1 ring-sky-200"
                  : "border-slate-200 bg-white hover:border-slate-300"
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
                <span className="font-medium text-slate-900">{m.label}</span>
                <span className="block text-xs text-slate-500">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium text-slate-800">
          Chunk size
          <span className="font-mono text-xs text-slate-600">
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
          className="w-full accent-sky-600"
          onChange={(e) => onChange({ chunkSize: Number(e.target.value) })}
        />
        <input
          type="number"
          min={CHUNK_LIMITS.sizeMin}
          max={CHUNK_LIMITS.sizeMax}
          step={CHUNK_LIMITS.sizeStep}
          value={settings.chunkSize}
          disabled={disabled}
          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
          onChange={(e) => onChange({ chunkSize: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium text-slate-800">
          Overlap
          <span className="font-mono text-xs text-slate-600">
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
          className="w-full accent-sky-600"
          onChange={(e) => onChange({ overlap: Number(e.target.value) })}
        />
        <input
          type="number"
          min={CHUNK_LIMITS.overlapMin}
          max={overlapMax}
          step={CHUNK_LIMITS.overlapStep}
          value={Math.min(settings.overlap, overlapMax)}
          disabled={disabled}
          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
          onChange={(e) => onChange({ overlap: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
