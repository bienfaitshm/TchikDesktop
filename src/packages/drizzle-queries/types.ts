import type { InferSelectModel } from "drizzle-orm";
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";

/**
 * Extrait les noms des colonnes d'une table pour le typage du tri et des filtres
 */
export type ColumnKeys<T extends SQLiteTableWithColumns<any>> =
  keyof InferSelectModel<T>;

/**
 * Structure de tri multiple conforme à la fonction applyQueryOptions
 */
export interface SortStep<T extends SQLiteTableWithColumns<any>> {
  column: ColumnKeys<T>;
  order: "asc" | "desc";
}

/**
 * Le nouveau standard pour tes options de requête
 */
export interface FindManyOptions<T extends SQLiteTableWithColumns<any>> {
  where?: Partial<InferSelectModel<T>>;
  whereIn?: Partial<Record<ColumnKeys<T>, any[]>>;
  search?: Partial<Record<ColumnKeys<T>, string>>;
  or?: Array<Partial<InferSelectModel<T>>>;
  limit?: number;
  offset?: number;
  orderBy?: SortStep<T>[];
}

export type PaginationAndSort<T extends SQLiteTableWithColumns<any>> = Pick<
  FindManyOptions<T>,
  "limit" | "offset" | "orderBy"
>;
