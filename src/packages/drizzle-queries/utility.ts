import { like, or, sql, type SQL, type AnyColumn } from "drizzle-orm";

/**
 * Génère une clause WHERE "case-insensitive" compatible avec tous les dialectes Drizzle.
 * @param columns Tableau de colonnes Drizzle (AnyColumn)
 * @param search Le terme de recherche
 * @returns Une condition SQL à utiliser dans `.where()` ou `undefined` si pas de recherche
 */
export function createSearchFilter(
  columns: AnyColumn[],
  search?: string,
): SQL | undefined {
  if (!search || search.trim() === "") {
    return undefined;
  }

  const searchTerm = `%${search.trim().toLowerCase()}%`;

  const matchExpressions = columns.map((col) =>
    like(sql`lower(${col})`, searchTerm),
  );

  return or(...matchExpressions);
}
