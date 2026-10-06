import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  preloadAllModels,
  type ModelPreloadProgress,
} from "../services/models/preloadModels";
import { resetAnswerModel } from "../services/answer/browserAnswer";
import { resetEmbeddingModel } from "../services/embedding/browserEmbedding";

type PreloadStatus = "loading" | "ready" | "error";

type ModelPreloadContextValue = {
  status: PreloadStatus;
  progress: ModelPreloadProgress | null;
  error: string | null;
  retry: () => void;
};

const ModelPreloadContext = createContext<ModelPreloadContextValue | null>(null);

export function ModelPreloadProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PreloadStatus>("loading");
  const [progress, setProgress] = useState<ModelPreloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const run = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setProgress({
      message: "Starting…",
      embeddingReady: false,
      answerReady: false,
    });
    try {
      await preloadAllModels(setProgress);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to load models.");
    }
  }, []);

  useEffect(() => {
    void run();
  }, [run, attempt]);

  const retry = useCallback(() => {
    resetEmbeddingModel();
    resetAnswerModel();
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ status, progress, error, retry }),
    [status, progress, error, retry]
  );

  return (
    <ModelPreloadContext.Provider value={value}>
      {children}
    </ModelPreloadContext.Provider>
  );
}

export function useModelPreload() {
  const ctx = useContext(ModelPreloadContext);
  if (!ctx) {
    throw new Error("useModelPreload must be used within ModelPreloadProvider");
  }
  return ctx;
}
