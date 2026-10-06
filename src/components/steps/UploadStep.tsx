import { useRef, useState } from "react";
import {
  ACCEPTED_UPLOAD_ACCEPT,
  UPLOAD_LIMITS,
} from "../../config/uploadLimits";
import { useRagPipeline } from "../../context/RagPipelineContext";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { StatusBadge } from "../ui/StatusBadge";

function formatLimitBytes(n: number): string {
  if (n >= 1024 * 1024) return `${n / (1024 * 1024)} MB`;
  return `${n / 1024} KB`;
}

export function UploadStep() {
  const { state, uploadFiles } = useRagPipeline();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const status = state.stepStatuses.upload;

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    uploadFiles(Array.from(files));
    if (inputRef.current) inputRef.current.value = "";
  };

  const limitsLine = `Up to ${UPLOAD_LIMITS.maxFiles} files · ${formatLimitBytes(UPLOAD_LIMITS.maxFileBytes)} each · ${formatLimitBytes(UPLOAD_LIMITS.maxTotalBytes)} total · .txt, .md, text-based .pdf`;

  return (
    <Panel
      title="Upload"
      description="Files are read and parsed entirely in your browser—nothing is uploaded to a server."
      footer={
        <p className="text-xs text-slate-500">
          Scanned PDFs (image-only) have no extractable text. Password-protected
          PDFs are not supported.
        </p>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {state.document && (
          <span className="text-sm text-slate-600">
            Loaded: <strong>{state.document.name}</strong> (
            {state.document.byteSize.toLocaleString()} bytes,{" "}
            {state.document.text.length.toLocaleString()} characters)
          </span>
        )}
      </div>

      {state.uploadError && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.uploadError}
        </div>
      )}

      <div
        className={`mt-4 rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragOver ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-slate-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
      >
        <p className="text-sm font-medium text-slate-800">
          Drop files here or choose from your device
        </p>
        <p className="mt-1 text-xs text-slate-500">{limitsLine}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={status === "running"}
          >
            Choose files
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_UPLOAD_ACCEPT}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {state.document && state.document.sources.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Sources
          </p>
          <table className="mt-2 min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2 pr-4">File</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Size</th>
                <th className="py-2">Chars extracted</th>
              </tr>
            </thead>
            <tbody>
              {state.document.sources.map((src, i) => (
                <tr key={`${src.name}-${i}`} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-800">
                    {src.name}
                  </td>
                  <td className="py-2 pr-4 uppercase text-xs text-slate-600">
                    {src.mediaType}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">
                    {src.byteSize.toLocaleString()} B
                  </td>
                  <td className="py-2 text-slate-600">
                    {src.charCount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {state.document && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Extracted text preview
          </p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-left text-xs text-slate-100 font-mono whitespace-pre-wrap">
            {state.document.text.slice(0, 2000)}
            {state.document.text.length > 2000 ? "\n…" : ""}
          </pre>
        </div>
      )}
    </Panel>
  );
}
