import { useState } from "react";
import { CHUNK_LIST_INITIAL_VISIBLE } from "../../config/chunkListUi";
import type { TextChunk } from "../../types/rag";
import { Button } from "../ui/Button";
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
  const [showAll, setShowAll] = useState(false);

  if (chunks.length === 0) return null;

  const totalChars = chunks.reduce((n, c) => n + (c.end - c.start), 0);
  const docSpan =
    chunks.length > 0
      ? chunks[chunks.length - 1].end - chunks[0].start
      : 0;

  const hasMore = chunks.length > CHUNK_LIST_INITIAL_VISIBLE;
  const visible = showAll || !hasMore
    ? chunks
    : chunks.slice(0, CHUNK_LIST_INITIAL_VISIBLE);
  const hiddenCount = chunks.length - CHUNK_LIST_INITIAL_VISIBLE;

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
        {visible.map((c, i) => {
          const prev = i > 0 ? chunks[i - 1] : undefined;
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
                {overlap > 0 && prev && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">
                    {overlap} char overlap with #{prev.index}
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
      {hasMore && (
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? "Show fewer chunks"
            : `Show more chunks (${hiddenCount} more)`}
        </Button>
      )}
    </div>
  );
}
