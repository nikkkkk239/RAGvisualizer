import type { DocumentSource, UploadedDocument } from "../../types/rag";
import type { DocumentIngestService } from "../interfaces";
import { extractFileText } from "./extractFileText";
import { detectIngestKind } from "./fileKind";
import { validateUploadBatch } from "./validateUploadBatch";

function sourceHeader(name: string): string {
  return `\n\n--- ${name} ---\n\n`;
}

function buildDocumentName(files: File[]): string {
  if (files.length === 1) return files[0].name;
  return `${files.length} files`;
}

async function parseFiles(files: File[]): Promise<UploadedDocument> {
  const batch = validateUploadBatch(files);
  const sources: DocumentSource[] = [];
  const textParts: string[] = [];
  let totalBytes = 0;

  for (const file of batch) {
    const text = await extractFileText(file);
    const kind = detectIngestKind(file)!;
    sources.push({
      name: file.name,
      byteSize: file.size,
      mediaType: kind,
      charCount: text.length,
    });
    totalBytes += file.size;
    textParts.push(
      batch.length > 1 ? sourceHeader(file.name) + text : text
    );
  }

  const combined =
    batch.length > 1 ? textParts.join("").trim() : textParts[0] ?? "";

  return {
    id: crypto.randomUUID(),
    name: buildDocumentName(batch),
    text: combined,
    byteSize: totalBytes,
    uploadedAt: Date.now(),
    sources,
  };
}

export const browserDocumentIngest: DocumentIngestService = {
  async parseFiles(files) {
    return parseFiles(files);
  },
};
