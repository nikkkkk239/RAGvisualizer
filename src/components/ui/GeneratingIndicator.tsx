type Props = {
  label: string;
  detail?: string;
  /** 0–100 when chunk-style progress is available */
  percent?: number;
};

export function GeneratingIndicator({ label, detail, percent }: Props) {
  return (
    <div
      className="mt-6 rounded border border-forest/25 bg-sage px-4 py-4"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-forest">
        <span
          className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-forest/25 border-t-forest"
          aria-hidden
        />
        {label}
      </div>
      {detail && <p className="mt-2 text-sm text-forest">{detail}</p>}
      {percent !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-forest transition-[width] duration-200"
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      )}
      <p className="mt-3 text-xs text-forest/80">
        Local models run in this tab — the UI may pause briefly while each chunk
        is processed.
      </p>
    </div>
  );
}
