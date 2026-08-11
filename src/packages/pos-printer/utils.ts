import { formatCurrency } from "@/packages/currency";

export function sanitizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents (ex: È -> E, é -> e)
    .replace(/[’‘`]/g, "'"); // Remplace les apostrophes spéciales
}

/**
 * Formate un montant et remplace les espaces insécables (NBSP) par des espaces ASCII ordinaires
 * pour éviter l'affichage de '?' sur l'imprimante thermique.
 */
export function formatPrinterCurrency(
  amount: number,
  currency: string,
): string {
  const formatted = formatCurrency(amount, currency);

  // \u00A0 = Espace insécable classique (NBSP)
  // \u202F = Espace insécable étroit (Narrow NBSP)
  return formatted.replace(/[\u00A0\u202F]/g, " ");
}
