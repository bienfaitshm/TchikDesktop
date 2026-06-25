import { format, formatDistanceToNow, Locale } from "date-fns";
import { fr } from "date-fns/locale";

type DateInput = Date | string | number;

/**
 * Convertit une entrée en Date valide, ou retourne null.
 */
function toValidDate(date: DateInput): Date | null {
  if (date == null || date === "") return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formate une date en chaîne de caractères selon le format "dd/MM/yyyy".
 */
export function formatDate(
  date: DateInput,
  formatStr: string = "dd/MM/yyyy",
  locale: Locale = fr,
): string {
  const d = toValidDate(date);
  if (!d) {
    console.error("Erreur: La date fournie est invalide.", date);
    return "";
  }
  return format(d, formatStr, { locale });
}

/**
 * Affiche la durée écoulée depuis la date, en français, avec le suffixe "il y a".
 * Exemples : "il y a 2 minutes", "il y a 4 jours"
 */
export function formatRelativeTime(date: DateInput): string {
  const d = toValidDate(date);
  if (!d) {
    console.error(
      "Erreur: La date fournie est invalide pour le temps relatif.",
      date,
    );
    return "";
  }
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}
