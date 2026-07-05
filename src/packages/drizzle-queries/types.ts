export type ColumnKeys<T extends {}> = keyof T;

export interface SortStep<T extends {}> {
  column: ColumnKeys<T>;
  order: "asc" | "desc";
}

export interface FindManyOptions<T extends {}> {
  where?: Partial<T>;
  whereIn?: Partial<Record<ColumnKeys<T>, any[]>>;
  search?: Partial<Record<ColumnKeys<T>, string>>;
  or?: Array<Partial<T>>;
  limit?: number;
  offset?: number;
  orderBy?: SortStep<T>[];
}

export type PaginationAndSort<T extends {}> = Pick<
  FindManyOptions<T>,
  "limit" | "offset" | "orderBy"
>;

export type TableShape = Record<string, unknown>;

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
