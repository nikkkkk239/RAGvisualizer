import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Panel({ title, description, children, footer }: PanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-panel">
      <header className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        )}
      </header>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      {footer && (
        <footer className="border-t border-slate-100 px-4 py-3 sm:px-6">
          {footer}
        </footer>
      )}
    </section>
  );
}
