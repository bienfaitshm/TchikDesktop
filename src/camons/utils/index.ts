/**
 * Génère une chaîne aléatoire de 5 caractères.
 * @returns {string} Chaîne aléatoire.
 */
export function getRandomString(): string {
  return Math.random().toString(36).slice(2, 7);
}

/**
 * Transforme un enum en liste clé-valeur, avec traduction optionnelle.
 * @param enumObject Enum à transformer.
 * @param enumTranslation Table de traduction optionnelle.
 * @returns Tableau d'objets { key, value, label }.
 */
export function getEnumKeyValueList<T extends Record<string, unknown>>(
  enumObject: T,
  enumTranslation?: Record<string, string>
): { key: string; value: T[keyof T]; label: string }[] {
  return Object.entries(enumObject).map(([key, value]) => ({
    key,
    value: value as T[keyof T],
    label: enumTranslation?.[value as string] ?? (value as string),
  }));
}
