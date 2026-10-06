export type IngestFileKind = "text" | "pdf";

const TEXT_EXTENSIONS = new Set(["txt", "md", "markdown"]);
const PDF_EXTENSIONS = new Set(["pdf"]);

export function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function detectIngestKind(file: File): IngestFileKind | null {
  const ext = extensionOf(file.name);
  if (TEXT_EXTENSIONS.has(ext)) return "text";
  if (PDF_EXTENSIONS.has(ext)) return "pdf";

  const type = file.type.toLowerCase();
  if (type === "text/plain" || type === "text/markdown") return "text";
  if (type === "application/pdf") return "pdf";

  return null;
}

export function isSupportedUpload(file: File): boolean {
  return detectIngestKind(file) !== null;
}
