import type { StepStatus } from "../../types/rag";

const labels: Record<StepStatus, string> = {
  idle: "Waiting",
  ready: "Ready",
  running: "Running…",
  done: "Done",
  error: "Error",
};

const styles: Record<StepStatus, string> = {
  idle: "bg-slate-100 text-slate-600",
  ready: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  running: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  done: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  error: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export function StatusBadge({ status }: { status: StepStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
