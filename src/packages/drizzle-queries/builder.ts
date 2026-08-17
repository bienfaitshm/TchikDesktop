import {
  and,
  or,
  eq,
  like,
  inArray,
  sql,
  asc,
  desc,
  getTableColumns,
  type Column,
  type Table,
  type SQL,
  AnyColumn,
} from "drizzle-orm";
import { FindManyOptions, ColumnKeys } from "./types";
export const DEFAULT_MAX_LIMIT = 500;
export const DEFAULT_MAX_OFFSET = 50000;

export type InferSelect<T extends Table> = T["$inferSelect"];

export interface DynamicSelectQueryBuilder {
  where(condition: SQL | undefined): DynamicSelectQueryBuilder;
  orderBy(...columns: (SQL | AnyColumn)[]): DynamicSelectQueryBuilder;
  limit(n: number): DynamicSelectQueryBuilder;
  offset(n: number): DynamicSelectQueryBuilder;
  $dynamic(): DynamicSelectQueryBuilder;
  execute(): Promise<unknown[]>;
}

/**
 * Récupère un Set sécurisé des clés de colonnes de la table
 * Imperméable à la pollution de prototype
 */
function getValidColumnKeys<T extends Table>(table: T): Set<string> {
  return new Set(Object.keys(getTableColumns(table)));
}

export function buildWhereConditions<T extends Table>(
  table: T,
  where: Partial<InferSelect<T>>,
): SQL[] {
  const columns = getTableColumns(table);
  const validKeys = getValidColumnKeys(table);
  const conditions: SQL[] = [];

  for (const [key, value] of Object.entries(where || {})) {
    if (value === undefined || !validKeys.has(key)) continue;
    conditions.push(eq(columns[key] as Column, value));
  }

  return conditions;
}

export function buildWhereInConditions<T extends Table>(
  table: T,
  whereIn: Partial<Record<ColumnKeys<InferSelect<T>>, unknown[]>>,
): SQL[] {
  const columns = getTableColumns(table);
  const validKeys = getValidColumnKeys(table);
  const conditions: SQL[] = [];

  for (const [key, values] of Object.entries(whereIn || {})) {
    if (!Array.isArray(values) || values.length === 0 || !validKeys.has(key))
      continue;
    const safeValues = values.filter((v) => v !== undefined);
    if (safeValues.length > 0) {
      conditions.push(inArray(columns[key] as Column, safeValues));
    }
  }

  return conditions;
}

export function buildSearchConditions<T extends Table>(
  table: T,
  search: Partial<Record<ColumnKeys<InferSelect<T>>, string>>,
): SQL[] {
  const columns = getTableColumns(table);
  const validKeys = getValidColumnKeys(table);
  const conditions: SQL[] = [];

  for (const [key, value] of Object.entries(search || {})) {
    if (typeof value !== "string" || value.trim() === "" || !validKeys.has(key))
      continue;
    const column = columns[key] as Column;
    // Drizzle s'occupe de la paramétrisation pour `like`
    conditions.push(
      like(sql`lower(${column})`, `%${value.trim().toLowerCase()}%`),
    );
  }

  return conditions;
}

export function buildOrConditions<T extends Table>(
  table: T,
  orGroups: Array<Partial<InferSelect<T>>>,
): SQL | undefined {
  if (!orGroups || !Array.isArray(orGroups)) return undefined;
  const orBlocks: SQL[] = [];

  for (const orGroup of orGroups) {
    if (!orGroup || typeof orGroup !== "object") continue;
    const andClauses = buildWhereConditions(table, orGroup);

    if (andClauses.length === 1) {
      orBlocks.push(andClauses[0]);
    } else if (andClauses.length > 1) {
      orBlocks.push(and(...andClauses)!);
    }
  }

  if (orBlocks.length === 0) return undefined;
  if (orBlocks.length === 1) return orBlocks[0];
  return or(...orBlocks);
}

export function buildOrderByClauses<T extends Table>(
  table: T,
  orderBy: Array<{ column: ColumnKeys<T>; order: "asc" | "desc" }>,
): SQL[] {
  const columns = getTableColumns(table);
  const validKeys = getValidColumnKeys(table);
  const sortOrders: SQL[] = [];

  for (const sort of orderBy || []) {
    if (
      !sort ||
      typeof sort !== "object" ||
      !validKeys.has(sort.column as string)
    )
      continue;
    const column = columns[sort.column as string] as Column;
    const colSql = sql`${column} COLLATE NOCASE`;

    sortOrders.push(sort.order === "desc" ? desc(colSql) : asc(colSql));
    // sortOrders.push(sort.order === "desc" ? desc(column) : asc(column));
  }

  return sortOrders;
}

/**
 * Applique les options sur un builder existant
 */
export function applyQueryOptions<
  TQuery extends DynamicSelectQueryBuilder,
  T extends Table,
>(
  query: TQuery,
  table: T,
  options?: Partial<FindManyOptions<InferSelect<T>>>,
  querySql: SQL[] = [],
): TQuery {
  const conditions: SQL[] = [...querySql];

  if (options?.where)
    conditions.push(...buildWhereConditions(table, options.where));
  if (options?.whereIn)
    conditions.push(...buildWhereInConditions(table, options.whereIn));
  if (options?.search)
    conditions.push(...buildSearchConditions(table, options.search));

  if (options?.or && options.or.length > 0) {
    const orCondition = buildOrConditions(table, options.or);
    if (orCondition) conditions.push(orCondition);
  }

  if (conditions.length > 0) {
    query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
  }

  if (options?.orderBy && options.orderBy.length > 0) {
    const sortOrders = buildOrderByClauses(table, options.orderBy);
    if (sortOrders.length > 0) query.orderBy(...sortOrders);
  }

  const limit = Math.max(
    1,
    Math.min(options?.limit ?? DEFAULT_MAX_LIMIT, DEFAULT_MAX_LIMIT),
  );
  query.limit(limit);

  if (options?.offset !== undefined) {
    const offset = Math.max(0, Math.min(options.offset, DEFAULT_MAX_OFFSET));
    query.offset(offset);
  }

  return query;
}

/**
 * Réutilisons nos constructeurs pour extractQueryPayload au lieu de dupliquer la logique
 */
export function extractQueryPayload<
  T extends Table,
  TFixedFilters extends Record<string, any> = Record<string, never>,
>(table: T, options?: FindManyOptions<T>, fixedFilters?: TFixedFilters) {
  const conditions: SQL[] = [];

  if (fixedFilters)
    conditions.push(
      ...buildWhereConditions(table, fixedFilters as Partial<InferSelect<T>>),
    );
  if (options?.where)
    conditions.push(...buildWhereConditions(table, options.where));
  if (options?.whereIn)
    conditions.push(...buildWhereInConditions(table, options.whereIn));
  if (options?.search)
    conditions.push(...buildSearchConditions(table, options.search));

  if (options?.or && options.or.length > 0) {
    const orCondition = buildOrConditions(table, options.or);
    if (orCondition) conditions.push(orCondition);
  }

  const orderByPayload = options?.orderBy
    ? buildOrderByClauses(table, options.orderBy)
    : undefined;
  const limit = Math.max(
    1,
    Math.min(options?.limit ?? DEFAULT_MAX_LIMIT, DEFAULT_MAX_LIMIT),
  );

  return {
    where:
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : and(...conditions)
        : undefined,
    limit,
    offset: options?.offset ?? 0,
    orderBy:
      orderByPayload && orderByPayload.length > 0 ? orderByPayload : undefined,
  };
}

export function mergeQueryOptions<T extends {}>(
  options: FindManyOptions<T> = {},
  defaultOptions: FindManyOptions<T> = {},
): FindManyOptions<T> {
  const safeWhere = Object.assign(
    Object.create(null),
    defaultOptions.where,
    options.where,
  );
  const safeWhereIn = Object.assign(
    Object.create(null),
    defaultOptions.whereIn,
    options.whereIn,
  );
  const safeSearch = Object.assign(
    Object.create(null),
    defaultOptions.search,
    options.search,
  );

  return {
    limit: Math.min(
      options.limit ?? defaultOptions.limit ?? DEFAULT_MAX_LIMIT,
      DEFAULT_MAX_LIMIT,
    ),
    offset: Math.max(0, options.offset ?? defaultOptions.offset ?? 0),
    where: safeWhere,
    whereIn: safeWhereIn,
    search: safeSearch,
    or: [...(defaultOptions.or ?? []), ...(options.or ?? [])].filter(Boolean),
    orderBy: options.orderBy?.length
      ? options.orderBy
      : (defaultOptions.orderBy ?? []),
  };
}
