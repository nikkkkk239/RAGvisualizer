import type { PipelineStepId, StepStatus } from "../../types/rag";
import { StatusBadge } from "../ui/StatusBadge";

const STEPS: { id: PipelineStepId; label: string; short: string }[] = [
  { id: "upload", label: "Upload", short: "1" },
  { id: "chunk", label: "Chunk", short: "2" },
  { id: "embed", label: "Embed", short: "3" },
  { id: "retrieve", label: "Retrieve", short: "4" },
];

type Props = {
  activeStep: PipelineStepId;
  statuses: Record<PipelineStepId, StepStatus>;
  onSelect: (id: PipelineStepId) => void;
};

function connectorClass(done: boolean) {
  return done ? "bg-emerald-300" : "bg-slate-200";
}

export function PipelineStepper({ activeStep, statuses, onSelect }: Props) {
  return (
    <nav aria-label="RAG pipeline steps" className="w-full">
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        {STEPS.map((step, i) => {
          const status = statuses[step.id];
          const isActive = activeStep === step.id;
          const prevDone =
            i === 0 ? true : statuses[STEPS[i - 1].id] === "done";
          return (
            <li key={step.id} className="flex flex-1 flex-col sm:flex-row">
              <div className="flex flex-1 flex-col">
                <button
                  type="button"
                  onClick={() => onSelect(step.id)}
                  className={`group flex flex-1 items-center gap-3 rounded-lg border px-3 py-3 text-left transition sm:rounded-none sm:border-0 sm:border-b-2 sm:px-4 ${
                    isActive
                      ? "border-sky-300 bg-sky-50 sm:border-b-sky-500"
                      : "border-slate-200 bg-white hover:bg-slate-50 sm:border-b-transparent"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      status === "done"
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "bg-sky-600 text-white"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {status === "done" ? "✓" : step.short}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {step.label}
                    </span>
                    <StatusBadge status={status} />
                  </span>
                </button>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`hidden h-auto w-px shrink-0 sm:block sm:w-auto sm:flex-1 sm:self-center sm:px-1`}
                  aria-hidden
                >
                  <div
                    className={`mx-auto h-0.5 w-full max-w-[48px] ${connectorClass(
                      prevDone && status !== "idle"
                    )}`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
