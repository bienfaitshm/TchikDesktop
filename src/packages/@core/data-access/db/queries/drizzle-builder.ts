import type { TableConfig, AnySQLiteSelect } from "drizzle-orm/sqlite-core";
import {
  and,
  or,
  eq,
  ilike,
  inArray,
  SQL,
  asc,
  desc,
  getTableColumns,
  Column,
  Table,
} from "drizzle-orm";

export const DEFAULT_MAX_LIMIT = 500;
export const DEFAULT_MAX_OFFSET = 50000;

type SQLiteTable = Table<TableConfig>;

export type InferSelect<T extends SQLiteTable> = T["$inferSelect"];
export type ColumnKeys<T extends SQLiteTable> = keyof InferSelect<T> & string;
export type TableColumns<T extends SQLiteTable> = ReturnType<
  typeof getTableColumns<T>
>;

export interface FindManyOptions<T extends SQLiteTable> {
  where?: Partial<InferSelect<T>>;
  whereIn?: Partial<Record<ColumnKeys<T>, InferSelect<T>[ColumnKeys<T>][]>>;
  search?: Partial<Record<ColumnKeys<T>, string>>;
  or?: Array<Partial<InferSelect<T>>>;
  limit?: number;
  offset?: number;
  orderBy?: {
    column: ColumnKeys<T>;
    order: "asc" | "desc";
  }[];
}

/**
 * Type guard sécurisé contre la pollution de prototype et validation de colonne
 */
function validateColumnKey<T extends SQLiteTable>(
  columns: TableColumns<T>,
  key: string,
): key is keyof TableColumns<T> & string {
  // Sécurité anti-pollution de prototype
  if (key === "__proto__" || key === "constructor" || key === "prototype") {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(columns, key);
}

/**
 * Récupère proprement les clés propres de l'objet (ignore le prototype)
 */
function getSafeEntries<V>(
  obj: Record<string, V> | undefined | null,
): [string, V][] {
  if (!obj) return [];
  return Object.entries(obj).filter(
    ([key]) =>
      key !== "__proto__" &&
      key !== "constructor" &&
      Object.prototype.hasOwnProperty.call(obj, key),
  );
}

export function buildWhereConditions<T extends SQLiteTable>(
  table: T,
  where: Partial<InferSelect<T>>,
): SQL[] {
  const columns = getTableColumns(table);
  const conditions: SQL[] = [];

  for (const [key, value] of getSafeEntries(where)) {
    if (value === undefined) continue;

    if (!validateColumnKey(columns, key)) {
      throw new Error(
        `Security Exception: Invalid column key in where clause: ${key}`,
      );
    }

    const column = columns[key] as Column;
    conditions.push(eq(column, value));
  }

  return conditions;
}

function buildWhereInConditions<T extends SQLiteTable>(
  table: T,
  whereIn: Partial<Record<ColumnKeys<T>, InferSelect<T>[ColumnKeys<T>][]>>,
): SQL[] {
  const columns = getTableColumns(table);
  const conditions: SQL[] = [];

  for (const [key, values] of getSafeEntries(whereIn)) {
    if (!Array.isArray(values) || values.length === 0) continue;

    if (!validateColumnKey(columns, key)) {
      throw new Error(
        `Security Exception: Invalid column key in whereIn clause: ${key}`,
      );
    }

    const column = columns[key] as Column;
    // Filtrage des valeurs undefined/null pour éviter des crashs de l'ORM
    const safeValues = values.filter((v) => v !== undefined);
    if (safeValues.length > 0) {
      conditions.push(inArray(column, safeValues));
    }
  }

  return conditions;
}

function buildSearchConditions<T extends SQLiteTable>(
  table: T,
  search: Partial<Record<ColumnKeys<T>, string>>,
): SQL[] {
  const columns = getTableColumns(table);
  const conditions: SQL[] = [];

  for (const [key, value] of getSafeEntries(search)) {
    if (typeof value !== "string" || value.trim() === "") continue;

    if (!validateColumnKey(columns, key)) {
      throw new Error(
        `Security Exception: Invalid column key in search clause: ${key}`,
      );
    }

    const column = columns[key] as Column;
    conditions.push(ilike(column, `%${value.trim()}%`));
  }

  return conditions;
}

function buildOrConditions<T extends SQLiteTable>(
  table: T,
  orGroups: Array<Partial<InferSelect<T>>>,
): SQL | undefined {
  const orBlocks: SQL[] = [];

  for (const orGroup of orGroups) {
    if (!orGroup || typeof orGroup !== "object") continue;
    const andClauses = buildWhereConditions(table, orGroup);

    if (andClauses.length === 1) {
      orBlocks.push(andClauses[0]);
    } else if (andClauses.length > 1) {
      const combined = and(...andClauses);
      if (combined) orBlocks.push(combined);
    }
  }

  if (orBlocks.length === 0) return undefined;
  if (orBlocks.length === 1) return orBlocks[0];

  return or(...orBlocks);
}

function combineWithAnd(conditions: SQL[]): SQL | undefined {
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return and(...conditions);
}

function buildOrderByClauses<T extends SQLiteTable>(
  table: T,
  orderBy: Array<{ column: ColumnKeys<T>; order: "asc" | "desc" }>,
): SQL[] {
  const columns = getTableColumns(table);
  const sortOrders: SQL[] = [];

  for (const sort of orderBy) {
    if (!sort || typeof sort !== "object" || !sort.column) continue;

    if (!validateColumnKey(columns, sort.column)) {
      throw new Error(
        `Security Exception: Invalid column key in orderBy: ${String(sort.column)}`,
      );
    }

    const column = columns[sort.column] as Column;
    sortOrders.push(sort.order === "desc" ? desc(column) : asc(column));
  }

  return sortOrders;
}

/**
 * Applique dynamiquement les filtres.
 * Note : Retourne le Query Builder. L'exécution (await) doit être gérée par l'appelant.
 */
export function applyQueryOptions<
  TQuery extends AnySQLiteSelect,
  T extends SQLiteTable,
>(query: TQuery, table: T, options: FindManyOptions<T>): TQuery {
  const conditions: SQL[] = [];

  if (options.where) {
    conditions.push(...buildWhereConditions(table, options.where));
  }

  if (options.whereIn) {
    conditions.push(...buildWhereInConditions(table, options.whereIn));
  }

  if (options.search) {
    conditions.push(...buildSearchConditions(table, options.search));
  }

  if (options.or && options.or.length > 0) {
    const orCondition = buildOrConditions(table, options.or);
    if (orCondition) conditions.push(orCondition);
  }

  const combinedCondition = combineWithAnd(conditions);
  if (combinedCondition) {
    query.where(combinedCondition);
  }

  if (options.orderBy && options.orderBy.length > 0) {
    const sortOrders = buildOrderByClauses(table, options.orderBy);
    if (sortOrders.length > 0) {
      query.orderBy(...sortOrders);
    }
  }

  // --- PAGINATION SÉCURISÉE (Anti-DoS) ---
  const limit = Math.max(
    1,
    Math.min(options.limit ?? DEFAULT_MAX_LIMIT, DEFAULT_MAX_LIMIT),
  );
  query.limit(limit);

  if (options.offset !== undefined) {
    const offset = Math.max(0, Math.min(options.offset, DEFAULT_MAX_OFFSET));
    query.offset(offset);
  }

  return query;
}

/**
 * Extrait et structure les options de requête de manière générique pour Drizzle .findMany()
 * @template T Le type de la table Drizzle
 * @template TFixedFilters Structure des filtres obligatoires (ex: { schoolId: string } ou { userId: string })
 */
export function extractQueryPayload<
  T extends SQLiteTable,
  TFixedFilters extends Record<string, any> = Record<string, never>,
>(table: T, options?: FindManyOptions<T>, fixedFilters?: TFixedFilters) {
  const columns = getTableColumns(table);
  const andConditions: SQL[] = [];

  if (fixedFilters) {
    for (const [key, value] of Object.entries(fixedFilters)) {
      if (value !== undefined && key in columns) {
        andConditions.push(eq(columns[key], value));
      }
    }
  }

  if (options?.where) {
    for (const [key, value] of Object.entries(options.where)) {
      if (value !== undefined && key in columns) {
        andConditions.push(eq(columns[key], value));
      }
    }
  }

  if (options?.whereIn) {
    for (const [key, values] of Object.entries(options.whereIn)) {
      if (Array.isArray(values) && values.length > 0 && key in columns) {
        andConditions.push(inArray(columns[key], values));
      }
    }
  }

  if (options?.search) {
    for (const [key, value] of Object.entries(options.search)) {
      if (typeof value === "string" && value.trim() !== "" && key in columns) {
        andConditions.push(ilike(columns[key], `%${value.trim()}%`));
      }
    }
  }

  if (options?.or && options.or.length > 0) {
    const orConditions: SQL[] = [];
    for (const orGroup of options.or) {
      const groupConditions: SQL[] = [];
      for (const [key, value] of Object.entries(orGroup)) {
        if (value !== undefined && key in columns) {
          groupConditions.push(eq(columns[key], value));
        }
      }
      if (groupConditions.length > 0) {
        orConditions.push(and(...groupConditions)!);
      }
    }
    if (orConditions.length > 0) {
      andConditions.push(or(...orConditions)!);
    }
  }

  let orderByPayload: SQL[] | undefined = undefined;
  if (options?.orderBy && options.orderBy.length > 0) {
    orderByPayload = options.orderBy
      .filter((sort) => sort.column in columns)
      .map((sort) => {
        const column = columns[sort.column];
        return sort.order === "desc" ? desc(column) : asc(column);
      });
  }

  const limit = Math.max(
    1,
    Math.min(options?.limit ?? DEFAULT_MAX_LIMIT, DEFAULT_MAX_LIMIT),
  );

  return {
    where: andConditions.length > 0 ? and(...andConditions) : undefined,
    limit: limit,
    offset: options?.offset ?? 0,
    orderBy: orderByPayload,
  };
}

/**
 * Fusionne proprement les options en bloquant la pollution de prototype
 */
export function mergeQueryOptions<T extends SQLiteTable>(
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
