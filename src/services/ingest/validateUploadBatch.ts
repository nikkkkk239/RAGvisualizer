import { UPLOAD_LIMITS } from "../../config/uploadLimits";
import { DocumentIngestError } from "./errors";
import { isSupportedUpload } from "./fileKind";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateUploadBatch(files: File[]): File[] {
  if (files.length === 0) {
    throw new DocumentIngestError(
      "read_failed",
      "No files were selected."
    );
  }

  if (files.length > UPLOAD_LIMITS.maxFiles) {
    throw new DocumentIngestError(
      "too_many_files",
      `You can upload at most ${UPLOAD_LIMITS.maxFiles} files at once.`
    );
  }

  let total = 0;
  for (const file of files) {
    if (!isSupportedUpload(file)) {
      throw new DocumentIngestError(
        "unsupported_type",
        "Unsupported file type. Use .txt, .md, or text-based .pdf files.",
        file.name
      );
    }
    if (file.size === 0) {
      throw new DocumentIngestError(
        "empty_file",
        "This file is empty.",
        file.name
      );
    }
    if (file.size > UPLOAD_LIMITS.maxFileBytes) {
      throw new DocumentIngestError(
        "file_too_large",
        `Exceeds the ${formatBytes(UPLOAD_LIMITS.maxFileBytes)} per-file limit.`,
        file.name
      );
    }
    total += file.size;
  }

  if (total > UPLOAD_LIMITS.maxTotalBytes) {
    throw new DocumentIngestError(
      "total_too_large",
      `Combined size exceeds the ${formatBytes(UPLOAD_LIMITS.maxTotalBytes)} limit for one upload.`
    );
  }

  return files;
}
