import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_CHUNK_SETTINGS } from "../config/chunkDefaults";
import { clampRetrievalSettings } from "../config/clampRetrievalSettings";
import { DEFAULT_RETRIEVAL_SETTINGS } from "../config/retrievalDefaults";
import { browserDocumentIngest } from "../services/ingest/browserDocumentIngest";
import { formatIngestError } from "../services/ingest/errors";
import {
  chunkDocument,
  chunksSignature,
  clampChunkSettings,
} from "../services/chunking/chunkDocument";
import {
  embedQueryForActiveBackend,
  resetEmbeddingRuntime,
  runEmbedChunks,
} from "../services/embedding/embeddingCoordinator";
import { retrieveByCosine } from "../services/retrieval/retrieveChunks";
import { runGenerateAnswer } from "../services/answer/answerCoordinator";
import {
  clearAllCorpora,
  deleteCorpusFromIndexedDb,
  loadCorpusFromIndexedDb,
  saveCorpusToIndexedDb,
} from "../storage/embeddingStore";
import type {
  ChunkSettings,
  PipelineState,
  PipelineStepId,
  RetrievalSettings,
  StepStatus,
} from "../types/rag";
import { yieldToMain } from "../utils/yieldToMain";

const initialStatuses: Record<PipelineStepId, StepStatus> = {
  upload: "ready",
  chunk: "idle",
  embed: "idle",
  retrieve: "idle",
  answer: "idle",
};

function initialState(): PipelineState {
  return {
    stepStatuses: { ...initialStatuses },
    document: null,
    chunks: [],
    embeddings: [],
    lastQuery: "",
    retrievalHits: [],
    answer: null,
    uploadError: null,
    chunkSettings: { ...DEFAULT_CHUNK_SETTINGS },
    embeddingBackend: "none",
    embedChunkProgress: null,
    embedError: null,
    embeddingsPersisted: false,
    retrievalSettings: { ...DEFAULT_RETRIEVAL_SETTINGS },
    lastQueryVector: null,
    retrievalMeta: null,
    answerLoadProgress: null,
  };
}

type RagPipelineContextValue = {
  state: PipelineState;
  activeStep: PipelineStepId;
  setActiveStep: (id: PipelineStepId) => void;
  uploadFiles: (files: File[]) => Promise<void>;
  setChunkSettings: (patch: Partial<ChunkSettings>) => void;
  setRetrievalSettings: (patch: Partial<RetrievalSettings>) => void;
  runEmbed: () => Promise<void>;
  runRetrieve: (query: string) => Promise<void>;
  runAnswer: () => Promise<void>;
  resetPipeline: () => void;
};

const RagPipelineContext = createContext<RagPipelineContextValue | null>(null);

function setStep(
  statuses: Record<PipelineStepId, StepStatus>,
  id: PipelineStepId,
  status: StepStatus
) {
  return { ...statuses, [id]: status };
}

export function RagPipelineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PipelineState>(initialState);
  const [activeStep, setActiveStep] = useState<PipelineStepId>("upload");

  const resetPipeline = useCallback(() => {
    resetEmbeddingRuntime();
    void clearAllCorpora();
    setState(initialState());
    setActiveStep("upload");
  }, []);

  const afterDocument = useCallback((doc: NonNullable<PipelineState["document"]>) => {
    const chunkSettings = { ...DEFAULT_CHUNK_SETTINGS };
    const chunks = chunkDocument(doc, chunkSettings);
    setState((s) => ({
      ...s,
      document: doc,
      chunks,
      embeddings: [],
      embeddingBackend: "none",
      embedChunkProgress: null,
      embedError: null,
      embeddingsPersisted: false,
      retrievalSettings: { ...DEFAULT_RETRIEVAL_SETTINGS },
      retrievalHits: [],
      retrievalMeta: null,
      lastQueryVector: null,
      answer: null,
      answerLoadProgress: null,
      lastQuery: "",
      uploadError: null,
      chunkSettings,
      stepStatuses: {
        upload: "done",
        chunk: chunks.length > 0 ? "done" : "ready",
        embed: chunks.length > 0 ? "ready" : "idle",
        retrieve: "idle",
        answer: "idle",
      },
    }));
    setActiveStep("chunk");
  }, []);

  const uploadFiles = useCallback(async (files: File[]) => {
    setState((s) => ({
      ...s,
      uploadError: null,
      stepStatuses: setStep(s.stepStatuses, "upload", "running"),
    }));
    try {
      const doc = await browserDocumentIngest.parseFiles(files);
      afterDocument(doc);
    } catch (err) {
      setState((s) => ({
        ...s,
        uploadError: formatIngestError(err),
        stepStatuses: setStep(s.stepStatuses, "upload", "error"),
      }));
    }
  }, [afterDocument]);

  const setChunkSettings = useCallback((patch: Partial<ChunkSettings>) => {
    setState((s) => ({
      ...s,
      chunkSettings: clampChunkSettings({ ...s.chunkSettings, ...patch }),
    }));
  }, []);

  const setRetrievalSettings = useCallback((patch: Partial<RetrievalSettings>) => {
    setState((s) => ({
      ...s,
      retrievalSettings: clampRetrievalSettings({ ...s.retrievalSettings, ...patch }),
    }));
  }, []);

  const documentId = state.document?.id;
  const documentText = state.document?.text;
  const chunkSize = state.chunkSettings.chunkSize;
  const chunkOverlap = state.chunkSettings.overlap;
  const chunkMethod = state.chunkSettings.method;

  useEffect(() => {
    if (!documentId || documentText === undefined) {
      setState((s) => {
        if (s.chunks.length === 0) return s;
        return {
          ...s,
          chunks: [],
          stepStatuses: {
            ...s.stepStatuses,
            chunk: "idle",
            embed: "idle",
          },
        };
      });
      return;
    }

    setState((s) => {
      if (!s.document || s.document.id !== documentId) return s;

      const chunks = chunkDocument(s.document, s.chunkSettings);
      const nextSig = chunksSignature(chunks);
      const prevSig = chunksSignature(s.chunks);
      if (prevSig === nextSig) return s;

      void deleteCorpusFromIndexedDb(documentId);

      return {
        ...s,
        chunks,
        embeddings: [],
        embeddingBackend: "none",
        embedChunkProgress: null,
        embedError: null,
        embeddingsPersisted: false,
        retrievalHits: [],
        retrievalMeta: null,
        lastQueryVector: null,
        answer: null,
        answerLoadProgress: null,
        stepStatuses: {
          ...s.stepStatuses,
          chunk: chunks.length > 0 ? "done" : "ready",
          embed: chunks.length > 0 ? "ready" : "idle",
          retrieve: "idle",
          answer: "idle",
        },
      };
    });
  }, [documentId, documentText, chunkSize, chunkOverlap, chunkMethod]);

  const chunksSignatureValue = state.chunks.length
    ? chunksSignature(state.chunks)
    : "";

  useEffect(() => {
    if (!documentId || !chunksSignatureValue || state.embeddings.length > 0) return;

    void loadCorpusFromIndexedDb(documentId).then((record) => {
      if (!record || record.chunksSignature !== chunksSignatureValue) return;
      setState((s) => {
        if (s.document?.id !== documentId || s.embeddings.length > 0) return s;
        return {
          ...s,
          embeddings: record.embeddings,
          embeddingBackend: record.embeddingBackend,
          embeddingsPersisted: true,
          stepStatuses: {
            ...s.stepStatuses,
            embed: "done",
            retrieve: "ready",
          },
        };
      });
    });
  }, [documentId, chunksSignatureValue, state.embeddings.length]);

  const runEmbed = useCallback(async () => {
    if (state.chunks.length === 0) return;
    setState((s) => ({
      ...s,
      embeddings: [],
      embedChunkProgress: null,
      embedError: null,
      stepStatuses: setStep(s.stepStatuses, "embed", "running"),
    }));

    const chunks = state.chunks;

    try {
      await yieldToMain();
      const { embeddings, meta } = await runEmbedChunks(chunks, {
        onChunkProgress: (progress) => {
          setState((s) => ({ ...s, embedChunkProgress: progress }));
        },
      });

      const modelId = embeddings[0]?.modelId ?? "unknown";
      const sig = chunksSignature(chunks);
      let persisted = false;
      if (state.document) {
        try {
          await saveCorpusToIndexedDb({
            documentId: state.document.id,
            documentName: state.document.name,
            chunksSignature: sig,
            embeddingBackend: meta.backend,
            modelId,
            chunks,
            embeddings,
            savedAt: Date.now(),
          });
          persisted = true;
        } catch {
          persisted = false;
        }
      }

      setState((s) => ({
        ...s,
        embeddings,
        embeddingBackend: meta.backend,
        embeddingsPersisted: persisted,
        embedChunkProgress: null,
        retrievalHits: [],
        retrievalMeta: null,
        lastQueryVector: null,
        answer: null,
        stepStatuses: {
          ...setStep(s.stepStatuses, "embed", "done"),
          retrieve: "ready",
          answer: "idle",
        },
      }));
      setActiveStep("retrieve");
    } catch (err) {
      setState((s) => ({
        ...s,
        embedError:
          err instanceof Error ? err.message : "Embedding failed.",
        stepStatuses: setStep(s.stepStatuses, "embed", "error"),
      }));
    }
  }, [state.chunks, state.document]);

  const runRetrieve = useCallback(
    async (query: string) => {
      if (!query.trim() || state.chunks.length === 0) return;

      let chunks = state.chunks;
      let embeddings = state.embeddings;
      let backend = state.embeddingBackend;

      if (embeddings.length === 0 && state.document) {
        const record = await loadCorpusFromIndexedDb(state.document.id);
        const sig = chunksSignature(chunks);
        if (record && record.chunksSignature === sig) {
          chunks = record.chunks;
          embeddings = record.embeddings;
          backend = record.embeddingBackend;
        }
      }

      if (embeddings.length === 0) return;

      setState((s) => ({
        ...s,
        lastQuery: query,
        retrievalHits: [],
        retrievalMeta: null,
        stepStatuses: setStep(s.stepStatuses, "retrieve", "running"),
      }));

      await yieldToMain();
      const qVec = await embedQueryForActiveBackend(query);
      const { hits, meta } = retrieveByCosine(
        qVec,
        chunks,
        embeddings,
        state.retrievalSettings
      );

      setState((s) => ({
        ...s,
        chunks,
        embeddings,
        embeddingBackend: backend === "none" ? "browser" : backend,
        embeddingsPersisted: s.embeddingsPersisted || embeddings.length > 0,
        lastQueryVector: qVec,
        retrievalHits: hits,
        retrievalMeta: meta,
        answer: null,
        answerLoadProgress: null,
        stepStatuses: {
          ...setStep(s.stepStatuses, "retrieve", "done"),
          answer: hits.length > 0 ? "ready" : "idle",
        },
      }));
      if (hits.length > 0) setActiveStep("answer");
    },
    [state.chunks, state.embeddings, state.embeddingBackend, state.document, state.retrievalSettings]
  );

  const runAnswer = useCallback(async () => {
    if (!state.lastQuery || state.retrievalHits.length === 0) return;
    setState((s) => ({
      ...s,
      answer: null,
      answerLoadProgress: { phase: "loading", message: "Generating answer…" },
      stepStatuses: setStep(s.stepStatuses, "answer", "running"),
    }));

    try {
      await yieldToMain();
      const { answer } = await runGenerateAnswer(
        state.lastQuery,
        state.retrievalHits,
        {
          onLoadProgress: (progress) => {
            setState((s) => ({ ...s, answerLoadProgress: progress }));
          },
        }
      );

      setState((s) => ({
        ...s,
        answer,
        answerLoadProgress: {
          phase: answer.usedFallback ? "fallback" : "ready",
          message: answer.usedFallback
            ? "Showing retrieved passages only."
            : "Answer generated.",
        },
        stepStatuses: setStep(s.stepStatuses, "answer", "done"),
      }));
    } catch {
      setState((s) => ({
        ...s,
        answerLoadProgress: {
          phase: "fallback",
          message: "Answer generation failed.",
        },
        stepStatuses: setStep(s.stepStatuses, "answer", "error"),
      }));
    }
  }, [state.lastQuery, state.retrievalHits]);

  const value = useMemo(
    () => ({
      state,
      activeStep,
      setActiveStep,
      uploadFiles,
      setChunkSettings,
      setRetrievalSettings,
      runEmbed,
      runRetrieve,
      runAnswer,
      resetPipeline,
    }),
    [
      state,
      activeStep,
      uploadFiles,
      setChunkSettings,
      setRetrievalSettings,
      runEmbed,
      runRetrieve,
      runAnswer,
      resetPipeline,
    ]
  );

  return (
    <RagPipelineContext.Provider value={value}>
      {children}
    </RagPipelineContext.Provider>
  );
}

export function useRagPipeline() {
  const ctx = useContext(RagPipelineContext);
  if (!ctx) throw new Error("useRagPipeline must be used within RagPipelineProvider");
  return ctx;
}
