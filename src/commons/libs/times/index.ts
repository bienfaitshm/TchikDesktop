import { format, Locale } from "date-fns";
import { fr } from "date-fns/locale";

// Définition de types pour rendre la fonction plus robuste
type DateInput = Date | string | number;

/**
 * Formate une date en chaîne de caractères selon le format "dd/MM/yyyy".
 * @param date La date à formater. Peut être un objet Date, une chaîne de caractères ou un timestamp.
 * @param formatStr Le format de sortie optionnel (par défaut "dd/MM/yyyy").
 * @param locale La locale à utiliser (par défaut fr).
 * @returns La date formatée ou une chaîne vide si l'entrée est invalide.
 */
export function formatDate(
  date: DateInput,
  formatStr: string = "dd/MM/yyyy",
  locale: Locale = fr
): string {
  if (!date) {
    return "";
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.error("Erreur: La date fournie est invalide.");
    return "";
  }

  return format(d, formatStr, { locale });
}
