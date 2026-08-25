import type { Option } from "@/packages/@core/data-access/schema-validations";

/**
 * Type representing a display suggestion with a standard name and a short name.
 */
export type TSuggestion = { name: string; shortName: string };

/**
 * Map of French ordinal text terms to their corresponding numeric values.
 */
const ORDINAL_TEXT_MAP: Record<string, number> = {
  premier: 1,
  premiere: 1,
  "1er": 1,
  "1ere": 1,
  deuxieme: 2,
  second: 2,
  seconde: 2,
  "2eme": 2,
  "2e": 2,
  troisieme: 3,
  "3eme": 3,
  "3e": 3,
  quatrieme: 4,
  "4eme": 4,
  "4e": 4,
  cinquieme: 5,
  "5eme": 5,
  "5e": 5,
  sixieme: 6,
  "6eme": 6,
  "6e": 6,
  septieme: 7,
  "7eme": 7,
  "7e": 7,
  huitieme: 8,
  "8eme": 8,
  "8e": 8,
} as const;

/**
 * Configuration options for formatting French ordinals.
 */
interface OrdinalOptions {
  /** Indicates whether the feminine form should be used. */
  isFeminine?: boolean;
  /** Indicates whether the short suffix form ('e' instead of 'ème') should be used. */
  shortSuffix?: boolean;
}

/**
 * Normalizes input text by trimming, lowercasing, and stripping diacritics.
 * @param text - Raw input string.
 * @returns Cleaned and normalized string.
 */
const normalizeText = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Formats a number into a French ordinal string.
 * @param num - Numeric ordinal value.
 * @param isFem - Whether to apply feminine formatting.
 * @param short - Whether to apply shortened suffix.
 * @returns Formatted ordinal string.
 */
const formatOrdinal = (num: number, isFem: boolean, short: boolean): string => {
  if (num === 1) return isFem ? "1ère" : "1er";
  return `${num}${short ? "e" : "ème"}`;
};

/**
 * Parses a numeric value or text representation and returns its French ordinal prefix.
 * @param input - Numeric value or text string representing an ordinal.
 * @param options - Ordinal formatting options.
 * @returns Formatted ordinal string, or null if parsing fails.
 */
export const getFrenchOrdinalPrefix = (
  input: string | number,
  options: OrdinalOptions = {},
): string | null => {
  const { isFeminine = false, shortSuffix = false } = options;

  if (typeof input === "number")
    return formatOrdinal(input, isFeminine, shortSuffix);

  const normalizedInput = normalizeText(input);
  const mappedValue = ORDINAL_TEXT_MAP[normalizedInput];

  if (mappedValue !== undefined)
    return formatOrdinal(mappedValue, isFeminine, shortSuffix);

  const parsed = parseInt(normalizedInput, 10);
  return !isNaN(parsed) ? formatOrdinal(parsed, isFeminine, shortSuffix) : null;
};

/**
 * Constructs a base suggestion by prepending a prefix to name properties.
 * @param name - Primary display name.
 * @param shortName - Abbreviated display name.
 * @param prefix - Prefix to prepend.
 * @returns Formatted suggestion object.
 */
export function createSuggestion(
  name: string,
  shortName: string,
  prefix: string,
): TSuggestion {
  return {
    name: `${prefix} ${name}`.trim(),
    shortName: `${prefix} ${shortName}`.trim(),
  };
}

/**
 * Extracts a suggestion payload from an options list based on option identifier.
 * @param options - Array of available option records.
 * @param optionId - Target option identifier.
 * @returns Extracted suggestion or null if option is missing.
 */
export function getOptionSuggestion<T extends Option>(
  options: T[],
  optionId: string,
): TSuggestion | null {
  const selectedOption = options.find(
    (option) => String(option.optionId) === String(optionId),
  );

  if (!selectedOption) return null;

  return {
    name: selectedOption.optionName,
    shortName: selectedOption.optionShortName,
  };
}

/**
 * Resolves an identifier into an ordinal prefix or returns the raw identifier if invalid.
 * @param identifier - Raw identifier string.
 * @returns Formatted ordinal prefix or original identifier.
 */
export function getPrefixIdentifier(identifier: string): string {
  return getFrenchOrdinalPrefix(identifier) ?? identifier;
}

/**
 * Creates a classroom suggestion by enriching an option with an ordinal prefix.
 * @param options - Array of available option records.
 * @param optionId - Target option identifier.
 * @param identifier - Raw string used to generate ordinal prefix.
 * @returns Formatted classroom suggestion or null if option is missing.
 */
export function createClassroomSuggestion<T extends Option>(
  options: T[],
  optionId: string,
  identifier: string,
): TSuggestion | null {
  const optionSuggestion = getOptionSuggestion(options, optionId);
  if (!optionSuggestion) return null;

  const displayPrefix = getPrefixIdentifier(identifier);

  return createSuggestion(
    optionSuggestion.name,
    optionSuggestion.shortName,
    displayPrefix,
  );
}
