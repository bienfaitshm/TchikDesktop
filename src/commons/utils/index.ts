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

/**
 * Groupe une liste d'objets par une clé donnée.
 * * @param list - Le tableau d'objets à grouper.
 * @param key - La clé par laquelle grouper les objets.
 * @returns Un objet où les clés sont les valeurs de la clé de groupement
 * et les valeurs sont des tableaux des objets correspondants.
 */
export function groupBy<T extends Record<string, any>, K extends keyof T>(
  list: T[],
  key: K
): Record<T[K] extends string | number | symbol ? T[K] : never, T[]> {
  if (!Array.isArray(list)) {
    console.error("The first argument must be an array.");
    return {} as any;
  }

  return list.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      acc[groupKey] = acc[groupKey] ?? [];
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

interface Section<TKey, TValue> {
  section: TKey;
  data: TValue[];
}

/**
 * Convertit un objet groupé en un tableau de sections, ce qui est utile pour l'affichage
 * dans des listes ou des interfaces utilisateur structurées.
 *
 * @template TKey Le type des clés de l'objet groupé (ex: 'string' pour les noms de ville).
 * @template TValue Le type des objets contenus dans les tableaux (ex: 'User').
 * @param groupedData L'objet dont les clés sont les sections et les valeurs sont des tableaux d'éléments.
 * @returns Un tableau d'objets `Section`, où chaque objet contient une clé et son tableau de données.
 */
export function convertGroupedObjectToArray<TKey extends PropertyKey, TValue>(
  groupedData: Record<TKey, TValue[]>
): Section<TKey, TValue>[] {
  if (!groupedData || Object.keys(groupedData).length === 0) {
    return [];
  }

  return (Object.entries(groupedData) as [TKey, TValue[]][]).map(
    ([section, data]) => ({
      section,
      data,
    })
  );
}
