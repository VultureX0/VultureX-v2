/** Upload rules for pitch deck files and questionnaire attachments. */

export const DECK_MAX_BYTES = 20 * 1024 * 1024; // 20 MB
export const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const DECK_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
] as const;

export const DECK_EXTENSIONS = [".pdf", ".pptx", ".ppt"] as const;

export const SCREENSHOT_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateDeckFile(file: { name: string; type: string; size: number }): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const typeOk =
    (DECK_MIME_TYPES as readonly string[]).includes(file.type) ||
    (file.type === "" && (DECK_EXTENSIONS as readonly string[]).includes(ext));
  if (!typeOk) return "Only PDF or PPTX files can be uploaded as a pitch deck.";
  if (file.size > DECK_MAX_BYTES) {
    return `That file is ${formatBytes(file.size)}. The maximum size is ${formatBytes(DECK_MAX_BYTES)}.`;
  }
  if (file.size === 0) return "The uploaded file is empty.";
  return null;
}

export function validateScreenshot(file: { name: string; type: string; size: number }): string | null {
  if (!(SCREENSHOT_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "Screenshots must be PNG, JPG or WebP.";
  }
  if (file.size > SCREENSHOT_MAX_BYTES) {
    return `That image is ${formatBytes(file.size)}. The maximum size is ${formatBytes(SCREENSHOT_MAX_BYTES)}.`;
  }
  if (file.size === 0) return "The uploaded file is empty.";
  return null;
}

/** Extension used for the download filename. */
export function safeFileName(name: string): string {
  return name.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "pitch-deck";
}
