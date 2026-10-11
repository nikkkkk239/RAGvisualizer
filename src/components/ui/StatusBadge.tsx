import type { StepStatus } from "../../types/rag";

const labels: Record<StepStatus, string> = {
  idle: "Waiting",
  ready: "Ready",
  running: "Running…",
  done: "Done",
  error: "Error",
};

const styles: Record<StepStatus, string> = {
  idle: "bg-sage/80 text-ink/75",
  ready: "bg-sage text-forest ring-1 ring-forest/25",
  running: "bg-rust/10 text-ink ring-1 ring-rust/35",
  done: "bg-sage text-forest ring-1 ring-forest/30",
  error: "bg-rust/10 text-ink ring-1 ring-rust/40",
};

export function StatusBadge({ status }: { status: StepStatus }) {
  return (
    <span
      className={`inline-flex rounded-sm px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
