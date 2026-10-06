import type { AnswerCitation, RetrievalHit } from "../../types/rag";

type Props = {
  citations: AnswerCitation[];
  hits: RetrievalHit[];
};

export function AnswerSourceChunks({ citations, hits }: Props) {
  const hitById = new Map(hits.map((h) => [h.chunk.id, h]));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900">Linked sources</h3>
      <p className="text-xs text-slate-600">
        Each citation maps to a retrieved chunk. Click a citation to jump to the
        full source text below.
      </p>
      <ul className="flex flex-wrap gap-2">
        {citations.map((c, i) => (
          <li key={c.chunkId}>
            <a
              href={`#answer-source-${c.chunkId}`}
              className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-900 hover:bg-sky-200"
            >
              Source {i + 1} · chunk #{c.chunkIndex} · {c.score.toFixed(3)}
            </a>
          </li>
        ))}
      </ul>
      <ol className="space-y-3">
        {citations.map((c, i) => {
          const hit = hitById.get(c.chunkId);
          if (!hit) return null;
          return (
            <li
              key={c.chunkId}
              id={`answer-source-${c.chunkId}`}
              className="scroll-mt-4 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
            >
              <div className="border-b border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  Source {i + 1}
                </span>
                {" · "}
                chunk #{hit.chunk.index} · similarity {hit.score.toFixed(4)}
              </div>
              <p className="px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap">
                {hit.chunk.text}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
