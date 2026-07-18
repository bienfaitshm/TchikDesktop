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
  (column: Column, value: unknown) => SQL | undefined
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
  all(): unknown[];
  get(): unknown;
}

/**
 * Compiles a structured multi-table filter object into Drizzle SQL conditions.
 * @param tables - Dictionary of active Drizzle tables.
 * @param filters - Advanced filters specifying values or operations per column.
 * @returns Array of compiled SQL conditions.
 */
export function buildWhereConditions<TTables extends Record<string, Table>>(
  tables: TTables,
  filters: AdvancedFilters<TTables> | undefined,
): SQL[] {
  if (!filters || typeof filters !== "object") return [];
  const conditions: SQL[] = [];

  for (const [tableName, tableFilters] of Object.entries(filters)) {
    const targetTable = tables[tableName];
    if (!targetTable) continue;

    const columns = getTableColumns(targetTable);

    for (const [columnName, filterPayload] of Object.entries(
      tableFilters || {},
    )) {
      if (filterPayload === undefined) continue;

      if (!Object.prototype.hasOwnProperty.call(columns, columnName)) continue;
      const column = columns[columnName] as Column;

      if (
        filterPayload === null ||
        typeof filterPayload !== "object" ||
        Array.isArray(filterPayload)
      ) {
        conditions.push(eq(column, filterPayload));
        continue;
      }

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
 * Maps a string operator to its native Drizzle ORM equivalent.
 * @param column - Target Drizzle table column.
 * @param op - String representation of the SQL operator.
 * @param val - Extracted value to match against.
 * @returns Executable SQL conditional clause or undefined.
 */
function mapOperatorToQuery(
  column: Column,
  op: string,
  val: unknown,
): SQL | undefined {
  const executeOperator = OPERATOR_MAP[op];
  return executeOperator ? executeOperator(column, val) : undefined;
}

/**
 * Constructs multi-table ordering clauses based on query options.
 * @param tables - Dictionary of active Drizzle tables.
 * @param orderBy - Array of ordering configurations.
 * @returns Array of Drizzle SQL ordering clauses.
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
 * Extracts and unifies all SQL constraints, securely merging dynamic inputs with global static filters.
 * @param tables - Dictionary of active Drizzle tables.
 * @param options - Dynamic query options (where, or, orderBy, limit, offset).
 * @param staticFilters - Fixed system-level rules enforced across the query layer.
 * @returns Finalized payload mapping rules into executable query constraints.
 */
export function extractQueryPayload<TTables extends Record<string, Table>>(
  tables: TTables,
  options?: FindManyOptions<TTables>,
  staticFilters?: AdvancedFilters<TTables>,
) {
  const rootConditions: SQL[] = [];
  const dynamicConditions: SQL[] = [];

  if (staticFilters) {
    rootConditions.push(...buildWhereConditions(tables, staticFilters));
  }

  if (options?.where) {
    dynamicConditions.push(...buildWhereConditions(tables, options.where));
  }

  if (options?.or && Array.isArray(options.or) && options.or.length > 0) {
    const orBlocks: SQL[] = [];
    for (const orGroup of options.or) {
      const groupConditions = buildWhereConditions(tables, orGroup);
      if (groupConditions.length === 1) orBlocks.push(groupConditions[0]);
      if (groupConditions.length > 1) orBlocks.push(and(...groupConditions)!);
    }
    if (orBlocks.length === 1) dynamicConditions.push(orBlocks[0]);
    if (orBlocks.length > 1) dynamicConditions.push(or(...orBlocks)!);
  }

  if (dynamicConditions.length > 0) {
    rootConditions.push(and(...dynamicConditions)!);
  }

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
      rootConditions.length > 0
        ? rootConditions.length === 1
          ? rootConditions[0]
          : and(...rootConditions)
        : undefined,
    orderBy: orderByPayload.length > 0 ? orderByPayload : undefined,
    limit,
    offset,
  };
}

/**
 * Directly applies extracted query parameters to the Drizzle query builder instance.
 * @param query - Instantiated dynamic select query builder.
 * @param tables - Dictionary of active Drizzle tables.
 * @param options - Dynamic client query options parameters.
 * @param staticFilters - Fixed system-level filter conditions block.
 * @returns Mutated query builder ready for synchronous execution.
 */
export function applyQueryOptions<
  TQuery extends DynamicSelectQueryBuilder,
  TTables extends Record<string, Table>,
>(
  query: TQuery,
  tables: TTables,
  options?: FindManyOptions<TTables>,
  staticFilters?: AdvancedFilters<TTables>,
): TQuery {
  const payload = extractQueryPayload(tables, options, staticFilters);

  if (payload.where) query.where(payload.where);
  if (payload.orderBy) query.orderBy(...payload.orderBy);

  query.limit(payload.limit);
  query.offset(payload.offset);

  return query;
}
