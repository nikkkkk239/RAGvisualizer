import type { TextChunk } from "../../types/rag";
import { chunkBarColor } from "./chunkColors";

type Props = {
  chunks: TextChunk[];
};

function overlapChars(prev: TextChunk | undefined, cur: TextChunk): number {
  if (!prev) return 0;
  const start = Math.max(cur.start, prev.start);
  const end = Math.min(cur.end, prev.end);
  return Math.max(0, end - start);
}

export function ChunkList({ chunks }: Props) {
  if (chunks.length === 0) return null;

  const totalChars = chunks.reduce((n, c) => n + (c.end - c.start), 0);
  const docSpan =
    chunks.length > 0
      ? chunks[chunks.length - 1].end - chunks[0].start
      : 0;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        <strong>{chunks.length}</strong> chunks ·{" "}
        <strong>{totalChars.toLocaleString()}</strong> characters in chunks
        {docSpan > 0 && (
          <>
            {" "}
            (span {chunks[0].start}–{chunks[chunks.length - 1].end})
          </>
        )}
      </p>
      <ul className="space-y-3">
        {chunks.map((c, i) => {
          const prev = chunks[i - 1];
          const overlap = overlapChars(prev, c);
          const len = c.end - c.start;
          return (
            <li
              key={c.id}
              className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 text-xs">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${chunkBarColor(c.index)}`}
                />
                <span className="font-semibold text-slate-800">#{c.index}</span>
                <span className="font-mono text-slate-500">
                  [{c.start} – {c.end}]
                </span>
                <span className="text-slate-600">{len.toLocaleString()} chars</span>
                {overlap > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">
                    {overlap} char overlap with #{prev!.index}
                  </span>
                )}
              </div>
              <p className="px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap">
                {c.text}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
