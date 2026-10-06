import type { TextChunk } from "../../types/rag";
import { chunkColorClass } from "./chunkColors";

type Props = {
  fullText: string;
  chunks: TextChunk[];
  maxChars?: number;
};

type Segment =
  | { kind: "plain"; text: string }
  | { kind: "chunk"; text: string; chunkIndex: number; role: "body" | "overlap" };

function buildSegments(
  fullText: string,
  chunks: TextChunk[],
  limit: number
): Segment[] {
  const end = Math.min(fullText.length, limit);
  if (chunks.length === 0) {
    return [{ kind: "plain", text: fullText.slice(0, end) }];
  }

  const boundaries = new Set<number>();
  boundaries.add(0);
  boundaries.add(end);
  for (const c of chunks) {
    if (c.start < end) boundaries.add(c.start);
    if (c.end <= end) boundaries.add(c.end);
  }
  const points = [...boundaries].sort((a, b) => a - b);

  const overlapRanges: Array<{ start: number; end: number }> = [];
  for (let i = 1; i < chunks.length; i++) {
    const prev = chunks[i - 1];
    const cur = chunks[i];
    const oStart = Math.max(cur.start, prev.start);
    const oEnd = Math.min(cur.end, prev.end);
    if (oEnd > oStart) overlapRanges.push({ start: oStart, end: oEnd });
  }

  function chunkAt(pos: number): TextChunk | undefined {
    return chunks.find((c) => pos >= c.start && pos < c.end);
  }

  function inOverlap(pos: number): boolean {
    return overlapRanges.some((r) => pos >= r.start && pos < r.end);
  }

  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (b <= a) continue;
    const text = fullText.slice(a, b);
    const chunk = chunkAt(a);
    if (!chunk) {
      segments.push({ kind: "plain", text });
      continue;
    }
    segments.push({
      kind: "chunk",
      text,
      chunkIndex: chunk.index,
      role: inOverlap(a) ? "overlap" : "body",
    });
  }
  return segments;
}

export function ChunkHighlightedText({
  fullText,
  chunks,
  maxChars = 2500,
}: Props) {
  const segments = buildSegments(fullText, chunks, maxChars);
  const truncated = fullText.length > maxChars;

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Colored spans show chunk coverage; dashed underline marks overlap between
        neighbors.
      </p>
      <div className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
        {segments.map((seg, i) => {
          if (seg.kind === "plain") {
            return <span key={i}>{seg.text}</span>;
          }
          const color = chunkColorClass(seg.chunkIndex);
          const overlap =
            seg.role === "overlap" ? "underline decoration-dashed decoration-amber-600" : "";
          return (
            <span
              key={i}
              className={`border border-transparent px-0.5 rounded-sm ${color} ${overlap}`}
              title={`Chunk #${seg.chunkIndex}`}
            >
              {seg.text}
            </span>
          );
        })}
        {truncated && (
          <span className="text-slate-400"> … (preview truncated)</span>
        )}
      </div>
    </div>
  );
}
