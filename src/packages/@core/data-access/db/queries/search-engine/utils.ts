/**
 * Ensures a string value is returned, converting null or undefined to an empty string.
 * @param value - The input string that may be null or undefined.
 * @returns The original string or an empty string if null/undefined.
 */
export function ensureString(value: string | null | undefined): string {
  return value ?? "";
}

/**
 * Formats human names consistently into a single trimmed string.
 * @param lastName - Primary last name.
 * @param firstName - Optional first name.
 * @param middleName - Optional middle name.
 * @returns Trimmed full name string with proper spacing.
 */
export function formatFullName(
  lastName: string | null,
  firstName?: string | null,
  middleName?: string | null,
): string {
  return [lastName, middleName, firstName].filter(Boolean).join(" ").trim();
}
