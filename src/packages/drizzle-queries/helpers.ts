import {
  and,
  or,
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  inArray,
  notInArray,
  like,
  asc,
  desc,
  getTableColumns,
  type Column,
  type Table,
  type SQL,
  type AnyColumn,
} from "drizzle-orm";

export const DEFAULT_MAX_LIMIT = 500;
export const DEFAULT_MAX_OFFSET = 50000;

const OPERATOR_MAP: Record<
  string,
  (column: Column, value: any) => SQL | undefined
> = {
  $eq: (col, val) => eq(col, val),
  $ne: (col, val) => ne(col, val),
  $gt: (col, val) => gt(col, val),
  $gte: (col, val) => gte(col, val),
  $lt: (col, val) => lt(col, val),
  $lte: (col, val) => lte(col, val),
  $in: (col, val) =>
    Array.isArray(val) && val.length > 0 ? inArray(col, val) : undefined,
  $notIn: (col, val) =>
    Array.isArray(val) && val.length > 0 ? notInArray(col, val) : undefined,
  $like: (col, val) =>
    typeof val === "string" && val.trim() !== ""
      ? like(col, val.trim())
      : undefined,
};

export type QueryOperators<TValue> = {
  $eq?: TValue;
  $ne?: TValue;
  $gt?: TValue;
  $gte?: TValue;
  $lt?: TValue;
  $lte?: TValue;
  $in?: TValue[];
  $notIn?: TValue[];
  $like?: TValue extends string ? string : never;
};

export type InferSelect<T extends Table> = T["$inferSelect"];
export type FilterValue<TValue> = TValue | QueryOperators<TValue>;
export type TableFilters<TTable extends Table> = {
  [K in keyof InferSelect<TTable>]?: FilterValue<InferSelect<TTable>[K]>;
};

export type AdvancedFilters<TTables extends Record<string, Table>> = {
  [K in keyof TTables]?: TableFilters<TTables[K]>;
};

export type OrderByOption<TTables extends Record<string, Table>> = {
  [K in keyof TTables]: {
    table: K;
    column: keyof InferSelect<TTables[K]> & string;
    order: "asc" | "desc";
  };
}[keyof TTables];

export interface FindManyOptions<TTables extends Record<string, Table>> {
  where?: AdvancedFilters<TTables>;
  or?: AdvancedFilters<TTables>[];
  orderBy?: OrderByOption<TTables>[];
  limit?: number;
  offset?: number;
}

export interface DynamicSelectQueryBuilder {
  where(condition: SQL | undefined): DynamicSelectQueryBuilder;
  orderBy(...columns: (SQL | AnyColumn)[]): DynamicSelectQueryBuilder;
  limit(n: number): DynamicSelectQueryBuilder;
  offset(n: number): DynamicSelectQueryBuilder;
  $dynamic(): DynamicSelectQueryBuilder;
  execute(): Promise<unknown[]>;
}

/**
 * Compile un bloc de filtres structuré par table en conditions SQL Drizzle
 */
export function buildWhereConditions<TTables extends Record<string, Table>>(
  tables: TTables,
  filters: AdvancedFilters<TTables> | undefined,
): SQL[] {
  if (!filters || typeof filters !== "object") return [];
  const conditions: SQL[] = [];

  for (const [tableName, tableFilters] of Object.entries(filters)) {
    const targetTable = tables[tableName];
    // Sécurité : On ignore proprement si la table n'est pas enregistrée dans la requête
    if (!targetTable) continue;

    const columns = getTableColumns(targetTable);

    for (const [columnName, filterPayload] of Object.entries(
      tableFilters || {},
    )) {
      if (filterPayload === undefined) continue;

      // Sécurité anti-pollution de prototype et validation de la colonne
      if (!Object.prototype.hasOwnProperty.call(columns, columnName)) continue;
      const column = columns[columnName] as Column;

      // Cas 1 : Valeur directe (Égalité par défaut) -> { age: 25 }
      if (
        filterPayload === null ||
        typeof filterPayload !== "object" ||
        Array.isArray(filterPayload)
      ) {
        conditions.push(eq(column, filterPayload));
        continue;
      }

      // Cas 2 : Utilisation d'opérateurs -> { age: { $gt: 18 } }
      for (const [op, val] of Object.entries(
        filterPayload as QueryOperators<unknown>,
      )) {
        if (val === undefined) continue;

        const clause = mapOperatorToQuery(column, op, val);
        if (clause) conditions.push(clause);
      }
    }
  }

  return conditions;
}

/**
 * Mapping des opérateurs vers les fonctions natives de Drizzle
 */
function mapOperatorToQuery(
  column: Column,
  op: string,
  val: any,
): SQL | undefined {
  const executeOperator = OPERATOR_MAP[op];
  return executeOperator ? executeOperator(column, val) : undefined;
}

/**
 * Construit les clauses d'ordonnancement multi-tables
 */
export function buildOrderByClauses<TTables extends Record<string, Table>>(
  tables: TTables,
  orderBy: OrderByOption<TTables>[] | undefined,
): SQL[] {
  if (!orderBy || !Array.isArray(orderBy)) return [];
  const sortOrders: SQL[] = [];

  for (const sort of orderBy) {
    if (!sort?.table || !sort?.column) continue;
    const targetTable = tables[sort.table];
    if (!targetTable) continue;

    const columns = getTableColumns(targetTable);
    if (!Object.prototype.hasOwnProperty.call(columns, sort.column)) continue;

    const column = columns[sort.column] as Column;
    sortOrders.push(sort.order === "desc" ? desc(column) : asc(column));
  }

  return sortOrders;
}

/**
 * Extrait le payload SQL nettoyé et sécurisé. Unique source de vérité.
 */
export function extractQueryPayload<TTables extends Record<string, Table>>(
  tables: TTables,
  options?: FindManyOptions<TTables>,
  fixedFilters?: AdvancedFilters<TTables>,
) {
  const conditions: SQL[] = [];

  // 1. Filtres imposés par le code (ex: Hard delete security `is_deleted: 0`)
  if (fixedFilters) {
    conditions.push(...buildWhereConditions(tables, fixedFilters));
  }

  // 2. Filtres dynamiques du client
  if (options?.where) {
    conditions.push(...buildWhereConditions(tables, options.where));
  }

  // 3. Gestion des blocs OR complexes
  if (options?.or && Array.isArray(options.or) && options.or.length > 0) {
    const orBlocks: SQL[] = [];
    for (const orGroup of options.or) {
      const groupConditions = buildWhereConditions(tables, orGroup);
      if (groupConditions.length === 1) orBlocks.push(groupConditions[0]);
      if (groupConditions.length > 1) orBlocks.push(and(...groupConditions)!);
    }
    if (orBlocks.length === 1) conditions.push(orBlocks[0]);
    if (orBlocks.length > 1) conditions.push(or(...orBlocks)!);
  }

  // 4. Pagination & Tri
  const limit = Math.max(
    1,
    Math.min(options?.limit ?? DEFAULT_MAX_LIMIT, DEFAULT_MAX_LIMIT),
  );

  const offset =
    options?.offset !== undefined
      ? Math.max(0, Math.min(options.offset, DEFAULT_MAX_OFFSET))
      : 0;

  const orderByPayload = buildOrderByClauses(tables, options?.orderBy);

  return {
    where:
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : and(...conditions)
        : undefined,
    orderBy: orderByPayload.length > 0 ? orderByPayload : undefined,
    limit,
    offset,
  };
}

/**
 * Applique directement le payload extrait sur le Query Builder Drizzle
 */
export function applyQueryOptions<
  TQuery extends DynamicSelectQueryBuilder,
  TTables extends Record<string, Table>,
>(
  query: TQuery,
  tables: TTables,
  options?: FindManyOptions<TTables>,
  fixedFilters?: AdvancedFilters<TTables>,
): TQuery {
  const payload = extractQueryPayload(tables, options, fixedFilters);

  if (payload.where) query.where(payload.where);
  if (payload.orderBy) query.orderBy(...payload.orderBy);

  query.limit(payload.limit);
  query.offset(payload.offset);

  return query;
}
