import type { RetrievalService } from "../interfaces";
import { retrieveByCosine } from "./retrieveChunks";

export const browserRetrieval: RetrievalService = {
  async retrieve(queryVector, chunks, embeddings, options) {
    return retrieveByCosine(queryVector, chunks, embeddings, options).hits;
  },
};
