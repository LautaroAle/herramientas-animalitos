import { clsx, type ClassValue } from "clsx";

/** Merge conditional class names (thin wrapper so call sites read cleanly). */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Copies text to the clipboard and reports success/failure to the caller. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Triggers a browser download for a Blob or data URL, then cleans up the object URL. */
export function downloadFile(data: Blob | string, filename: string): void {
  const url = typeof data === "string" ? data : URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof data !== "string") {
    URL.revokeObjectURL(url);
  }
}

/**
 * Converts a data: URL (e.g. from canvas.toDataURL() or FileReader) to raw
 * bytes. Deliberately avoids fetch(dataUrl) — browsers route that through
 * the page's connect-src CSP directive, which usually doesn't (and
 * shouldn't need to) list `data:` as an allowed source, so that fetch can
 * fail silently. Decoding the base64 payload directly sidesteps CSP
 * entirely, since no network/script-interface request is involved.
 */
export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
/** Formats a number of bytes as a human-readable size string. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}
