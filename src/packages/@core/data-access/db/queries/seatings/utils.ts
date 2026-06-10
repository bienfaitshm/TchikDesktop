/**
 * Convertit une entrée numérique ou textuelle de pourcentage en un ratio flottant (0.5 pour 50%).
 */
export const parsePercentage = (
  input: string | number | null | undefined,
): number => {
  if (input === null || input === undefined || input === "") {
    return 0;
  }

  if (typeof input === "number") {
    return input > 1 ? input / 100 : input;
  }

  const normalized = input.trim().replace("%", "").replace(",", ".");
  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) {
    console.warn(`[parsePercentage] Invalid value received: ${input}`);
    return 0;
  }

  return parsed > 1 ? parsed / 100 : parsed;
};
