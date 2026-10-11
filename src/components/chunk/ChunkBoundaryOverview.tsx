import type { TextChunk } from "../../types/rag";
import { chunkBarColor } from "./chunkColors";

type Props = {
  totalChars: number;
  chunks: TextChunk[];
};

export function ChunkBoundaryOverview({ totalChars, chunks }: Props) {
  if (totalChars === 0 || chunks.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-ink/65">
        <span>Document map (character positions)</span>
        <span className="font-mono">0 – {totalChars.toLocaleString()}</span>
      </div>
      {/* <div
        className="relative h-8 w-full overflow-hidden rounded border border-ink/15 bg-sage/80"
        aria-hidden
      >
        {chunks.map((c) => {
          const left = (c.start / totalChars) * 100;
          const width = Math.max(((c.end - c.start) / totalChars) * 100, 0.4);
          return (
            <div
              key={c.id}
              title={`#${c.index} [${c.start}–${c.end}]`}
              className={`absolute top-1 bottom-1 rounded-sm opacity-85 ${chunkBarColor(c.index)}`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}
      </div> */}
      <div className="flex flex-wrap gap-2 text-xs text-ink/75">
        {chunks.map((c) => (
          <span key={c.id} className="font-mono">
            #{c.index}: {c.start}–{c.end}
          </span>
        ))}
      </div>
    </div>
  );
}
