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

/**
 * Représente une table de base de données.
 * Chaque clé est un nom de colonne, chaque valeur est le type de cette colonne.
 */
export type TableShape = Record<string, unknown>;

/**
 * Client de base de données générique et agnostique.
 * @template T - Un objet mappant les noms de tables vers la forme de leurs lignes (colonnes + types).
 */
export interface DatabaseClient<T extends Record<string, TableShape>> {
  // ── Requêtes de base chaînables avec query builder ──
  select<TTable extends keyof T>(
    columns?: (keyof T[TTable])[],
  ): QueryBuilder<T[TTable]>;

  insert<TTable extends keyof T>(table: TTable): QueryBuilder<T[TTable]>;

  update<TTable extends keyof T>(table: TTable): QueryBuilder<T[TTable]>;

  delete<TTable extends keyof T>(table: TTable): QueryBuilder<T[TTable]>;

  // ── Exécution de requêtes brutes ──
  /**
   * Exécute une requête SQL brute, de manière agnostique.
   * @param sql Chaîne SQL ou requête paramétrée.
   * @param params Paramètres à lier.
   * @returns Résultat sous forme de tableau de lignes génériques.
   */
  raw<R = Record<string, unknown>>(
    sql: string,
    ...params: unknown[]
  ): Promise<R[]>;

  // ── Transactions ──
  /**
   * Exécute une fonction au sein d'une transaction.
   * Si la promesse est rejetée, un rollback est effectué.
   * @param fn Fonction recevant un client transactionnel.
   */
  transaction<R>(fn: (trx: DatabaseClient<T>) => Promise<R>): Promise<R>;

  // ── Méthodes utilitaires avancées ──
  /**
   * Compte le nombre de lignes d’une table, avec filtres optionnels.
   */
  count<TTable extends keyof T>(
    table: TTable,
    where?: Partial<T[TTable]>,
  ): Promise<number>;

  /**
   * Insère plusieurs lignes en une seule opération (batch).
   */
  batchInsert<TTable extends keyof T>(
    table: TTable,
    rows: Partial<T[TTable]>[],
  ): Promise<T[TTable][]>;

  /**
   * Effectue un upsert : insère la ligne, ou la met à jour si elle existe (selon contrainte).
   */
  upsert<TTable extends keyof T>(
    table: TTable,
    values: Partial<T[TTable]>,
    conflictColumns: (keyof T[TTable])[],
  ): Promise<T[TTable]>;
}

/**
 * Interface d’un QueryBuilder typé, qui permet de construire des requêtes
 * puis de les exécuter. Elle est volontairement agnostique et couvre
 * les opérations SQL courantes sans dépendre d'un ORM spécifique.
 */
export interface QueryBuilder<TRow extends TableShape> {
  where(conditions: Partial<TRow>): this;
  orderBy(columns: (keyof TRow)[], direction?: "asc" | "desc"): this;
  limit(count: number): this;
  offset(count: number): this;
  returning(columns?: (keyof TRow)[]): this;

  // Exécute la requête SELECT et retourne les résultats
  execute(): Promise<TRow[]>;

  // Exécute une requête INSERT / UPDATE / DELETE
  executeAndReturn(): Promise<TRow[]>;
}
