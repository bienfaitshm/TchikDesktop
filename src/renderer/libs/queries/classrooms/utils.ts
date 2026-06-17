import type { Option } from "@/packages/@core/data-access/schema-validations";
export type TSuggestion = { name: string; shortName: string };

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

const normalizeText = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

interface OrdinalOptions {
  isFeminine?: boolean;
  shortSuffix?: boolean;
}

const formatOrdinal = (num: number, isFem: boolean, short: boolean): string => {
  if (num === 1) return isFem ? "1ère" : "1er";
  return `${num}${short ? "e" : "ème"}`;
};

export const getFrenchOrdinalPrefix = (
  input: string | number,
  options: OrdinalOptions = {},
): string => {
  const { isFeminine = false, shortSuffix = false } = options;

  if (typeof input === "number")
    return formatOrdinal(input, isFeminine, shortSuffix);

  const normalizedInput = normalizeText(input);
  const mappedValue = ORDINAL_TEXT_MAP[normalizedInput];

  if (mappedValue !== undefined)
    return formatOrdinal(mappedValue, isFeminine, shortSuffix);

  const parsed = parseInt(normalizedInput, 10);
  return !isNaN(parsed)
    ? formatOrdinal(parsed, isFeminine, shortSuffix)
    : "Inconnu";
};

export function createClassroomSuggestion<T extends Option>(
  options: T[],
  optionId: string,
  identifier: string,
): TSuggestion | null {
  const selectedOption = options.find(
    (o) => String(o.optionId) === String(optionId),
  );
  if (!selectedOption) return null;

  const prefix = getFrenchOrdinalPrefix(identifier);
  const resolvedPrefix = prefix === "Inconnu" ? identifier : prefix;

  return {
    name: `${resolvedPrefix} ${selectedOption.optionName}`.trim(),
    shortName: `${resolvedPrefix} ${selectedOption.optionShortName}`.trim(),
  };
}
