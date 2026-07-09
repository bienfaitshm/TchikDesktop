/**
 * Formate un montant numérique en devise locale ou internationale.
 * @param amount - Le montant à formater (string ou number).
 * @param currency - Le code ISO de la devise (par défaut "CDF").
 * @returns La chaîne de caractères formatée, ou un fallback sécurisé en cas d'erreur.
 */
export function formatCurrency(
  amount: string | number,
  currency: string = "CDF",
): string {
  const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (Number.isNaN(parsedAmount) || !Number.isFinite(parsedAmount)) {
    return new Intl.NumberFormat("fr-CD", {
      style: "currency",
      currency,
    }).format(0);
  }

  try {
    return new Intl.NumberFormat("fr-CD", {
      style: "currency",
      currency,
    }).format(parsedAmount);
  } catch (error) {
    console.error(
      `[formatCurrency] Failed to format with currency: ${currency}`,
      error,
    );
    return new Intl.NumberFormat("fr-CD", {
      style: "currency",
      currency: "CDF",
    }).format(parsedAmount);
  }
}
