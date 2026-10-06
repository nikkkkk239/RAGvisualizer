import { AppHeader } from "./components/layout/AppHeader";
import { ModelBootstrapScreen } from "./components/layout/ModelBootstrapScreen";
import { PipelineStepper } from "./components/pipeline/PipelineStepper";
import { StepContent } from "./components/pipeline/StepContent";
import { useModelPreload } from "./context/ModelPreloadContext";
import { useRagPipeline } from "./context/RagPipelineContext";

function AppContent() {
  const { state, activeStep, setActiveStep } = useRagPipeline();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-panel sm:p-4">
          <PipelineStepper
            activeStep={activeStep}
            statuses={state.stepStatuses}
            onSelect={setActiveStep}
          />
        </div>
        <div className="mt-6">
          <StepContent stepId={activeStep} />
        </div>
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Processing stays in this browser tab. Chunk vectors can be stored in IndexedDB.
      </footer>
    </div>
  );
}

export default function App() {
  const { status } = useModelPreload();

  return (
    <>
      <ModelBootstrapScreen />
      {status === "ready" && <AppContent />}
    </>
  );
}
