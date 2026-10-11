import { Button } from "../ui/Button";
import { useRagPipeline } from "../../context/RagPipelineContext";

export function AppHeader() {
  const { resetPipeline } = useRagPipeline();

  return (
    <header className="border-b border-ink/15 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          
          <h1 className="mt-1 text-xl text-ink">RAG Visualizer</h1>
          <p className="mt-1 max-w-xl text-sm text-ink/75">
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
