import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Panel({ title, description, children, footer }: PanelProps) {
  return (
    <section className="rounded-md border border-ink/15 bg-surface shadow-panel">
      <header className="border-b border-ink/10 px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-lg text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-ink/75">{description}</p>
        )}
      </header>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      {footer && (
        <footer className="border-t border-ink/10 px-4 py-3 sm:px-6">
          {footer}
        </footer>
      )}
    </section>
  );
}
