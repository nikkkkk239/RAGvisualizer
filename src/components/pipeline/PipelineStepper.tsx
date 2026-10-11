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
  return done ? "bg-blue-300" : "bg-gray-300";
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
                  className={`group flex flex-1 items-center gap-3 rounded border px-3 py-3 text-left transition sm:rounded-none sm:border-0 sm:border-b-2 sm:px-4 ${
                    isActive
                      ? "border-forest/40 bg-sage sm:border-b-forest"
                      : "border-ink/15 bg-surface hover:bg-sage/40 sm:border-b-transparent"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-sm font-semibold ${
                      status === "done"
                        ? "bg-forest text-paper"
                        : isActive
                          ? "bg-forest text-paper"
                          : "bg-sage text-ink"
                    }`}
                  >
                    {status === "done" ? "✓" : step.short}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">
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
                      prevDone && status !== "idle",
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
