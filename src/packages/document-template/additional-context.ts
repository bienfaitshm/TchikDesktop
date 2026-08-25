import { formatDate as baseFormatDate } from "@/packages/times";

/**
 * Normalizes input values (Date, ISO string, or timestamp) into a valid Date object.
 * @param value - The raw input to be normalized.
 * @returns A validated native Date instance.
 * @throws {TypeError} If the input cannot be parsed into a valid Date.
 */
const toDate = (value: Date | string | number): Date => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid date value provided: ${value}`);
  }
  return date;
};

/** Bounded cache map for Intl.NumberFormat instances to prevent memory leaks. */
const MAX_CACHE_SIZE = 100;
const formattersCache = new Map<string, Intl.NumberFormat>();

/**
 * Retrieves an existing Intl.NumberFormat instance or creates and caches a new one.
 * @param locale - BCP 47 language tag.
 * @param options - Standard Intl number formatting options.
 * @returns Cached Intl.NumberFormat instance.
 */
const getNumberFormatter = (
  locale: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  const key = `${locale}-${JSON.stringify(options)}`;
  if (!formattersCache.has(key)) {
    if (formattersCache.size >= MAX_CACHE_SIZE) {
      const firstKey = formattersCache.keys().next().value;
      if (firstKey) formattersCache.delete(firstKey);
    }
    formattersCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return formattersCache.get(key)!;
};

export const additionalJsContext = {
  // --- String Transformers ---

  /**
   * Safely converts a string to uppercase.
   * @param value - Target string value.
   * @returns Uppercased string, or empty string if input is nullish.
   */
  toUpperCase: (value: string | null | undefined): string =>
    value?.toUpperCase() ?? "",

  /**
   * Safely converts a string to lowercase.
   * @param value - Target string value.
   * @returns Lowercased string, or empty string if input is nullish.
   */
  toLowerCase: (value: string | null | undefined): string =>
    value?.toLowerCase() ?? "",

  /**
   * Capitalizes the first character and lowercases the remainder of a string.
   * @param value - Target string value.
   * @returns Capitalized string, or empty string if input is nullish.
   */
  capitalize: (value: string | null | undefined): string =>
    value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",

  /**
   * Truncates a string to a specified length and appends ellipsis if needed.
   * @param value - Target string value.
   * @param maxLength - Maximum character length limit (default: 50).
   * @returns Truncated string, or original value if within bounds.
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
   * Formats a date using the primary date formatting provider.
   * @param value - Target Date, string, or timestamp.
   * @returns Formatted date string.
   */
  formatDate: (value: Date | string | number): string =>
    baseFormatDate(toDate(value)),

  /**
   * Alias for date formatting to ensure template semantic consistency.
   * @param value - Target Date, string, or timestamp.
   * @returns Formatted date string.
   */
  formatDateTime: (value: Date | string | number): string =>
    baseFormatDate(toDate(value)),

  /**
   * Formats a date relative to current time in French, falling back to full date after 7 days.
   * @param value - Target Date, string, or timestamp.
   * @returns Localized relative time string.
   */
  timeAgo: (value: Date | string | number): string => {
    const date = toDate(value);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Il y a ${diffDays} j`;

    return baseFormatDate(date);
  },

  // --- Boolean & Status ---

  /**
   * Maps a boolean value to customizable string representations in French.
   * @param value - Target boolean state.
   * @param options - Custom labels for true and false values.
   * @returns Configured label string.
   */
  formatBoolean: (
    value: boolean,
    options: { trueLabel?: string; falseLabel?: string } = {},
  ): string => {
    const { trueLabel = "Oui", falseLabel = "Non" } = options;
    return value ? trueLabel : falseLabel;
  },

  /**
   * Maps a boolean condition to a standard visual indicator icon.
   * @param value - Target boolean state.
   * @returns Status icon string.
   */
  formatBooleanAsIcon: (value: boolean): string => (value ? "✅" : "❌"),

  /**
   * Formats an activation state using configurable badge labels in French.
   * @param value - Active status condition.
   * @param active - Active label text (default: "Actif").
   * @param inactive - Inactive label text (default: "Inactif").
   * @returns Status badge label.
   */
  formatStatusBadge: (
    value: boolean,
    active: string = "Actif",
    inactive: string = "Inactif",
  ): string =>
    additionalJsContext.formatBoolean(value, {
      trueLabel: active,
      falseLabel: inactive,
    }),

  // --- Number & Currency ---

  /**
   * Formats a numeric value with configurable decimal precision via Intl.
   * @param value - Numeric value to format.
   * @param decimals - Fractional digit limit (default: 0).
   * @param locale - BCP 47 locale identifier (default: "fr-FR").
   * @returns Formatted number string or fallback default.
   */
  formatNumber: (
    value: number | null | undefined,
    decimals: number = 0,
    locale: string = "fr-FR",
  ): string => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "0";
    }
    return getNumberFormatter(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  /**
   * Formats a number as a localized currency value via Intl.
   * @param value - Amount to format.
   * @param currency - ISO 4217 currency code (default: "EUR").
   * @param locale - BCP 47 locale identifier (default: "fr-FR").
   * @returns Formatted currency string, or empty string if input is invalid.
   */
  formatCurrency: (
    value: number | null | undefined,
    currency: string = "CDF",
    locale: string = "fr-FR",
  ): string => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "";
    }
    return getNumberFormatter(locale, {
      style: "currency",
      currency,
    }).format(value);
  },

  /**
   * Formats a numeric decimal value as a localized percentage via Intl.
   * @param value - Decimal ratio (e.g., 0.15 for 15%).
   * @param decimals - Fraction digits limit (default: 1).
   * @param locale - BCP 47 locale identifier (default: "fr-FR").
   * @returns Formatted percentage string.
   */
  formatPercentage: (
    value: number | null | undefined,
    decimals: number = 1,
    locale: string = "fr-FR",
  ): string => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "0%";
    }
    return getNumberFormatter(locale, {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  // --- Logic Helpers ---

  /**
   * Returns the value or a default string fallback if the target is nullish.
   * @param value - Target input value.
   * @param fallbackValue - Replacement string (default: "—").
   * @returns Original value or default fallback.
   */
  fallback: <T>(
    value: T | null | undefined,
    fallbackValue: string = "—",
  ): T | string => value ?? fallbackValue,

  /**
   * Asserts whether a value is non-null and defined.
   * @param value - Target input value.
   * @returns True if value is defined and non-null.
   */
  isDefined: <T>(value: T | null | undefined): value is T =>
    value !== null && value !== undefined,

  /**
   * Safely joins array elements into a single delimited string.
   * @param array - Target array of strings.
   * @param separator - Delimiter character sequence (default: ", ").
   * @returns Joined output string.
   */
  join: (
    array: string[] | null | undefined = [],
    separator: string = ", ",
  ): string => (array ? array.join(separator) : ""),

  /**
   * Calculates the length of an array without risking runtime nullish errors.
   * @param array - Target array.
   * @returns Array length, or 0 if array is nullish.
   */
  count: <T>(array: T[] | null | undefined): number => array?.length ?? 0,
};

export type AdditionalJsContext = typeof additionalJsContext;
