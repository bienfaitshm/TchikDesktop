import { formatDate } from "@/packages/times";

/**
 * @fileoverview Contexte JavaScript étendu pour le rendu des templates.
 * Fournit une API typée pour transformer, formater et sécuriser les données
 * avant leur injection dans les vues.
 */

/** Normalise les entrées de type Date ou chaîne en objet Date. */
const toDate = (value: Date | string | number): Date =>
  value instanceof Date ? value : new Date(value);

/** Cache des formateurs Intl pour optimiser les performances de rendu. */
const FORMATTERS = {
  currency: (currency: string) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency }),
  number: (decimals: number) =>
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
};

export const additionalJsContext = {
  // --- String Transformers ---

  /** Convertit une chaîne en majuscules (sécurisé contre les valeurs nulles). */
  toUpperCase: (value: string): string => value?.toUpperCase() ?? "",

  /** Convertit une chaîne en minuscules (sécurisé contre les valeurs nulles). */
  toLowerCase: (value: string): string => value?.toLowerCase() ?? "",

  /** Met la première lettre en majuscule, le reste en minuscule. */
  capitalize: (value: string): string =>
    value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",

  /** Tronque une chaîne et ajoute des points de suspension si nécessaire. */
  truncate: (value: string, maxLength: number = 50): string =>
    value?.length > maxLength ? `${value.substring(0, maxLength)}...` : value,

  // --- Date Formatters ---

  /** Formate une date en chaîne lisible via le moteur de formatage global. */
  formatDate: (value: Date | string | number): string =>
    formatDate(toDate(value)),

  /** Alias pour la cohérence des templates. */
  formatDateTime: (value: Date | string): string => formatDate(toDate(value)),

  /** * Retourne une valeur relative (ex: "Il y a 5 min", "Il y a 2j").
   * Bascule sur le format complet si la date est supérieure à 7 jours.
   */
  timeAgo: (value: Date | string): string => {
    const date = toDate(value);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return formatDate(date);
  },

  // --- Boolean & Status ---

  /** Formate un booléen avec des labels personnalisables (Défaut: "Oui"/"Non"). */
  formatBoolean: (
    value: boolean,
    labels = { true: "Oui", false: "Non" },
  ): string => (value ? labels.true : labels.false),

  /** Retourne une icône visuelle pour un état booléen. */
  formatBooleanAsIcon: (value: boolean): string => (value ? "✅" : "❌"),

  /** Retourne un label dynamique basé sur un état booléen. */
  formatStatusBadge: (
    value: boolean,
    active = "Actif",
    inactive = "Inactif",
  ): string => (value ? active : inactive),

  // --- Number & Currency ---

  /** Formate un nombre selon la locale fr-FR avec un contrôle strict des décimales. */
  formatNumber: (value: number, decimals: number = 0): string =>
    FORMATTERS.number(decimals).format(value),

  /** Formate un montant en devise (Défaut: EUR). */
  formatCurrency: (value: number, currency: string = "CDF"): string =>
    FORMATTERS.currency(currency).format(value),

  /** Multiplie par 100 et ajoute le suffixe %. */
  formatPercentage: (value: number, decimals: number = 1): string =>
    `${(value * 100).toFixed(decimals)}%`,

  // --- Logic Helpers ---

  /** Retourne la valeur ou un placeholder si la valeur est absente. */
  fallback: <T>(
    value: T | null | undefined,
    fallbackValue: string = "—",
  ): string | T => value ?? fallbackValue,

  /** Type Guard utilitaire pour le filtrage de données. */
  isDefined: <T>(value: T | null | undefined): value is T =>
    value !== null && value !== undefined,

  /** Joint un tableau de chaînes avec un séparateur. */
  join: (array: string[] = [], separator: string = ", "): string =>
    array.join(separator),

  /** Compte les éléments d'un tableau en toute sécurité (évite les erreurs sur null). */
  count: <T>(array: T[] | null | undefined): number => array?.length ?? 0,

  /** Opérateur conditionnel pour simplifier les ternaires complexes dans les vues. */
  conditionalFormat: <T>(condition: boolean, trueValue: T, falseValue: T): T =>
    condition ? trueValue : falseValue,
};

export type AdditionalJsContext = typeof additionalJsContext;
