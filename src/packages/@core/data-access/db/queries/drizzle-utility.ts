import { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { like, or, sql, type SQL } from "drizzle-orm";

/**
 * Génère une clause WHERE "case-insensitive" compatible SQLite pour plusieurs colonnes.
 * @param columns Tableau de colonnes Drizzle (ex: [classrooms.identifier, classrooms.shortIdentifier])
 * @param search Le terme de recherche extrait de SearchOptions
 */
export function createSQLiteSearchFilter(
  columns: SQLiteColumn[],
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
