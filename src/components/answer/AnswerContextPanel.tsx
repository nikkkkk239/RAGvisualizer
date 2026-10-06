type Props = {
  prompt: string;
};

export function AnswerContextPanel({ prompt }: Props) {
  return (
    <details className="rounded-lg border border-slate-200 bg-white open:shadow-sm">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-900">
        Exact context sent to the model
      </summary>
      <div className="border-t border-slate-100 px-4 py-3">
        <p className="text-xs text-slate-600">
          This is the full prompt string built from your retrieved chunks and
          question. The local model reads only this text — not your files directly.
        </p>
        <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100 whitespace-pre-wrap font-mono">
          {prompt}
        </pre>
      </div>
    </details>
  );
}
