import type { ZodError } from "zod";

/**
 * Formats Zod validation issues into a single descriptive string.
 * @param error - Zod validation error object.
 * @returns Concatenated path and error messages string.
 */
export function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

/**
 * Sanitizes strings for safe file system usage.
 * @param name - Raw filename or path segment input.
 * @returns Cleaned string free of invalid path characters.
 */
export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[<>:"/\\|?*\s]/g, "_")
    .trim();
}
