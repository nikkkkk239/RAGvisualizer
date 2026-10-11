import { useEffect, useState } from "react";
import { CHUNK_LIST_INITIAL_VISIBLE } from "../../config/chunkListUi";
import type { ChunkEmbedding, TextChunk } from "../../types/rag";
import { Button } from "../ui/Button";
import { EmbedVectorCard } from "./EmbedVectorCard";

type Props = {
  embeddings: ChunkEmbedding[];
  chunkById: Map<string, TextChunk>;
};

export function EmbedVectorList({ embeddings, chunkById }: Props) {
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [embeddings.length]);

  if (embeddings.length === 0) return null;

  const hasMore = embeddings.length > CHUNK_LIST_INITIAL_VISIBLE;
  const visible =
    showAll || !hasMore
      ? embeddings
      : embeddings.slice(0, CHUNK_LIST_INITIAL_VISIBLE);
  const hiddenCount = embeddings.length - CHUNK_LIST_INITIAL_VISIBLE;

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-sm font-semibold text-ink">
        Per-chunk vectors ({embeddings.length})
      </h3>
      <div className="space-y-3">
        {visible.map((e, i) => {
          const chunk = chunkById.get(e.chunkId);
          if (!chunk) return null;
          return (
            <EmbedVectorCard
              key={e.chunkId}
              chunk={chunk}
              embedding={e}
              defaultOpen={i === 0 && !showAll}
            />
          );
        })}
      </div>
      {hasMore && (
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? "Show fewer vectors"
            : `Show more vectors (${hiddenCount} more)`}
        </Button>
      )}
    </div>
  );
}
