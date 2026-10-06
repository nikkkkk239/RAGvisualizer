import { DocumentIngestError } from "./errors";
import { detectIngestKind } from "./fileKind";
import { extractPdfText } from "./extractPdfText";

const MIN_TEXT_CHARS = 1;

export async function extractFileText(file: File): Promise<string> {
  if (file.size === 0) {
    throw new DocumentIngestError(
      "empty_file",
      "This file is empty.",
      file.name
    );
  }

  const kind = detectIngestKind(file);
  if (!kind) {
    throw new DocumentIngestError(
      "unsupported_type",
      "Unsupported file type. Use .txt, .md, or text-based .pdf files.",
      file.name
    );
  }

  try {
    if (kind === "text") {
      const text = (await file.text()).trim();
      if (text.length < MIN_TEXT_CHARS) {
        throw new DocumentIngestError(
          "no_extractable_text",
          "No readable text found in this file.",
          file.name
        );
      }
      return text;
    }

    const buffer = await file.arrayBuffer();
    const text = await extractPdfText(file, buffer);
    if (text.length < MIN_TEXT_CHARS) {
      throw new DocumentIngestError(
        "no_extractable_text",
        "No extractable text in this PDF. It may be scanned images only—try a text-based PDF or paste content as .txt.",
        file.name
      );
    }
    return text;
  } catch (e) {
    if (e instanceof DocumentIngestError) throw e;
    throw new DocumentIngestError(
      "read_failed",
      "Could not read this file in the browser.",
      file.name
    );
  }
}
