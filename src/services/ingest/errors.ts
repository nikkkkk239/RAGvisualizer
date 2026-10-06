export type DocumentIngestErrorCode =
  | "too_many_files"
  | "file_too_large"
  | "total_too_large"
  | "unsupported_type"
  | "empty_file"
  | "no_extractable_text"
  | "pdf_parse_failed"
  | "read_failed";

export class DocumentIngestError extends Error {
  readonly code: DocumentIngestErrorCode;
  readonly fileName?: string;

  constructor(
    code: DocumentIngestErrorCode,
    message: string,
    fileName?: string
  ) {
    super(message);
    this.name = "DocumentIngestError";
    this.code = code;
    this.fileName = fileName;
  }
}

export function formatIngestError(err: unknown): string {
  if (err instanceof DocumentIngestError) {
    return err.fileName ? `${err.fileName}: ${err.message}` : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong while reading your files.";
}
