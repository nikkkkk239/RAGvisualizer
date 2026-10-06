import { Button } from "../ui/Button";
import { useRagPipeline } from "../../context/RagPipelineContext";

export function AppHeader() {
  const { resetPipeline } = useRagPipeline();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-sky-600">
            Local-first RAG
          </p>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            RAG Visualizer
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Upload your documents and run the full RAG pipeline in the browser.
          </p>
        </div>
        <Button variant="secondary" onClick={resetPipeline}>
          Reset pipeline
        </Button>
      </div>
    </header>
  );
}
