import { formatDate as baseFormatDate } from "@/packages/times";

/**
 * @fileoverview Extended JavaScript context for template rendering.
 * Provides a typed API to transform, format, and secure data before injection into views.
 */

/**
 * Converts a Date instance, ISO string, or timestamp into a valid Date object.
 * @param value - The input value to normalize.
 * @returns A native Date instance.
 */
const toDate = (value: Date | string | number): Date =>
  value instanceof Date ? value : new Date(value);

/** Cache map for Intl.NumberFormat instances to optimize formatting performance. */
const formattersCache = new Map<string, Intl.NumberFormat>();

/**
 * Retrieves or creates a cached Intl.NumberFormat instance.
 * @param locale - BCP 47 language tag.
 * @param options - Formatting configuration options.
 * @returns Cached Intl.NumberFormat instance.
 */
const getNumberFormatter = (
  locale: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  const key = `${locale}-${JSON.stringify(options)}`;
  if (!formattersCache.has(key)) {
    formattersCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return formattersCache.get(key)!;
};

export const additionalJsContext = {
  // --- String Transformers ---

  /**
   * Converts a string to uppercase safely.
   * @param value - The string to convert.
   * @returns Uppercased string or empty string if input is nullish.
   */
  toUpperCase: (value: string | null | undefined): string =>
    value?.toUpperCase() ?? "",

  /**
   * Converts a string to lowercase safely.
   * @param value - The string to convert.
   * @returns Lowercased string or empty string if input is nullish.
   */
  toLowerCase: (value: string | null | undefined): string =>
    value?.toLowerCase() ?? "",

  /**
   * Capitalizes the first letter of a string and lowercases the rest.
   * @param value - The input string.
   * @returns Capitalized string.
   */
  capitalize: (value: string | null | undefined): string =>
    value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",

  /**
   * Truncates a string to a specified length and appends an ellipsis if necessary.
   * @param value - The input string.
   * @param maxLength - Maximum allowed length (default: 50).
   * @returns Truncated string.
   */
  truncate: (
    value: string | null | undefined,
    maxLength: number = 50,
  ): string =>
    value && value.length > maxLength
      ? `${value.substring(0, maxLength)}...`
      : (value ?? ""),

  // --- Date Formatters ---

  /**
   * Formats a date value into a readable string using the global date engine.
   * @param value - Date, string, or timestamp.
   * @returns Formatted date string.
   */
  formatDate: (value: Date | string | number): string =>
    baseFormatDate(toDate(value)),

  /**
   * Alias for date-time template consistency.
   * @param value - Date, string, or timestamp.
   * @returns Formatted date-time string.
   */
  formatDateTime: (value: Date | string | number): string =>
    baseFormatDate(toDate(value)),

  /**
   * Formats a date relative to current time or falls back to full date if > 7 days.
   * @param value - Date, string, or timestamp.
   * @returns Localized relative time string.
   */
  timeAgo: (value: Date | string | number): string => {
    const date = toDate(value);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return baseFormatDate(date);
  },

  // --- Boolean & Status ---

  /**
   * Formats a boolean value with customizable text or icon representations.
   * @param value - Target boolean condition.
   * @param options - Custom mappings for true and false values.
   * @returns Mapped label string.
   */
  formatBoolean: (
    value: boolean,
    options: { trueLabel?: string; falseLabel?: string } = {},
  ): string => {
    const { trueLabel = "Yes", falseLabel = "No" } = options;
    return value ? trueLabel : falseLabel;
  },

  /**
   * Returns a standard visual icon representation for a boolean state.
   * @param value - Target boolean condition.
   * @returns Checkmark or cross icon.
   */
  formatBooleanAsIcon: (value: boolean): string => (value ? "✅" : "❌"),

  /**
   * Formats a status badge label based on boolean active state.
   * @param value - Target status state.
   * @param active - Active label (default: "Active").
   * @param inactive - Inactive label (default: "Inactive").
   * @returns Formatted status label.
   */
  formatStatusBadge: (
    value: boolean,
    active: string = "Active",
    inactive: string = "Inactive",
  ): string => (value ? active : inactive),

  // --- Number & Currency ---

  /**
   * Formats a numeric value with controlled fraction digits.
   * @param value - Numeric input.
   * @param decimals - Maximum fraction digits (default: 0).
   * @param locale - BCP 47 locale string (default: "en-US").
   * @returns Formatted number string.
   */
  formatNumber: (
    value: number | null | undefined,
    decimals: number = 0,
    locale: string = "en-US",
  ): string => {
    if (value === null || value === undefined || Number.isNaN(value))
      return "0";
    return getNumberFormatter(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  /**
   * Formats a numeric value as currency.
   * @param value - Amount to format.
   * @param currency - ISO 4217 currency code (default: "USD").
   * @param locale - BCP 47 locale string (default: "en-US").
   * @returns Formatted currency string.
   */
  formatCurrency: (
    value: number | null | undefined,
    currency: string = "CDF",
    locale: string = "fr-FR",
  ): string => {
    if (value === null || value === undefined || Number.isNaN(value)) return "";
    return getNumberFormatter(locale, {
      style: "currency",
      currency,
    }).format(value);
  },

  /**
   * Formats a decimal number as a percentage string.
   * @param value - Decimal ratio value (e.g., 0.15 for 15%).
   * @param decimals - Decimal places precision (default: 1).
   * @returns Formatted percentage string.
   */
  formatPercentage: (
    value: number | null | undefined,
    decimals: number = 1,
  ): string => {
    if (value === null || value === undefined || Number.isNaN(value))
      return "0%";
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // --- Logic Helpers ---

  /**
   * Evaluates a value and returns a default fallback if nullish.
   * @param value - Target value.
   * @param fallbackValue - Fallback string value (default: "—").
   * @returns Original value or fallback string.
   */
  fallback: <T>(
    value: T | null | undefined,
    fallbackValue: string = "—",
  ): T | string => value ?? fallbackValue,

  /**
   * Type guard validating that a given value is neither null nor undefined.
   * @param value - Target value to verify.
   * @returns True if value is defined and non-null.
   */
  isDefined: <T>(value: T | null | undefined): value is T =>
    value !== null && value !== undefined,

  /**
   * Joins array items with a specified separator string safely.
   * @param array - Array of elements to join.
   * @param separator - Joining separator character (default: ", ").
   * @returns Joined string output.
   */
  join: (
    array: string[] | null | undefined = [],
    separator: string = ", ",
  ): string => (array ? array.join(separator) : ""),

  /**
   * Safely calculates array length without throwing nullish errors.
   * @param array - Input array instance.
   * @returns Array length or 0 if array is nullish.
   */
  count: <T>(array: T[] | null | undefined): number => array?.length ?? 0,

  /**
   * Conditional helper resolving values based on a boolean condition.
   * @param condition - Boolean evaluation condition.
   * @param trueValue - Return value when condition evaluates to true.
   * @param falseValue - Return value when condition evaluates to false.
   * @returns Evaluated conditional result value.
   */
  conditionalFormat: <T>(condition: boolean, trueValue: T, falseValue: T): T =>
    condition ? trueValue : falseValue,
};

export type AdditionalJsContext = typeof additionalJsContext;
