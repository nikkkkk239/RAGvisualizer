import type { ChunkingService } from "../interfaces";
import { chunkDocument, clampChunkSettings } from "./chunkDocument";

export const browserChunking: ChunkingService = {
  async chunk(document, options = {}) {
    const settings = clampChunkSettings({
      chunkSize: options.chunkSize ?? 400,
      overlap: options.overlap ?? 80,
      method: options.method ?? "fixed",
    });
    return chunkDocument(document, settings);
  },
};
