import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { DocumentIngestError } from "./errors";

let workerConfigured = false;

function ensurePdfWorker() {
  if (!workerConfigured) {
    GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    workerConfigured = true;
  }
}

export async function extractPdfText(
  file: File,
  arrayBuffer: ArrayBuffer
): Promise<string> {
  ensurePdfWorker();
  try {
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const parts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageText) parts.push(pageText);
    }

    return parts.join("\n\n").trim();
  } catch (e) {
    const msg =
      e instanceof Error && /password/i.test(e.message)
        ? "This PDF is password-protected. Remove the password and try again."
        : "Could not read this PDF. Use a text-based PDF (not a scanned image).";
    throw new DocumentIngestError("pdf_parse_failed", msg, file.name);
  }
}
