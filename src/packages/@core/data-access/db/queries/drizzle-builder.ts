import {
  SQLiteTableWithColumns,
  SQLiteSelectDynamic,
} from "drizzle-orm/sqlite-core";
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
} from "drizzle-orm";

export const DEFAULT_MAX_LIMIT = 500;

/**
 * Utilisation de types utilitaires pour éviter la répétition de `T['$inferSelect']`
 */
type InferSelect<T extends SQLiteTableWithColumns<any>> = T["$inferSelect"];
type ColumnKeys<T extends SQLiteTableWithColumns<any>> = keyof InferSelect<T>;

export interface FindManyOptions<T extends SQLiteTableWithColumns<any>> {
  where?: Partial<InferSelect<T>>;
  whereIn?: Partial<Record<ColumnKeys<T>, any[]>>;
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
 * Applique dynamiquement des filtres, tris et pagination à une requête SQLite existante.
 */
export async function applyQueryOptions<T extends SQLiteTableWithColumns<any>>(
  query: SQLiteSelectDynamic<any>,
  table: T,
  options: FindManyOptions<T>,
) {
  const columns = getTableColumns(table);
  const conditions: SQL[] = [];

  // --- FILTRAGE AND ---
  if (options.where) {
    for (const [key, value] of Object.entries(options.where)) {
      if (value !== undefined && columns[key]) {
        conditions.push(eq(columns[key], value));
      }
    }
  }

  if (options.whereIn) {
    for (const [key, values] of Object.entries(options.whereIn)) {
      if (Array.isArray(values) && values.length > 0 && columns[key]) {
        conditions.push(inArray(columns[key], values));
      }
    }
  }

  if (options.search) {
    for (const [key, value] of Object.entries(options.search)) {
      if (typeof value === "string" && value.trim() !== "" && columns[key]) {
        // Note: En SQLite, assure-toi que ton driver supporte ilike ou utilise like
        conditions.push(ilike(columns[key], `%${value}%`));
      }
    }
  }

  // --- FILTRAGE OR (Correction du bug de tableau) ---
  if (options.or && options.or.length > 0) {
    const orBlocks: SQL[] = [];

    for (const orGroup of options.or) {
      const andClauses: SQL[] = [];
      for (const [key, value] of Object.entries(orGroup)) {
        if (value !== undefined && columns[key]) {
          andClauses.push(eq(columns[key], value));
        }
      }
      if (andClauses.length > 0) {
        orBlocks.push(
          andClauses.length === 1 ? andClauses[0] : and(...andClauses)!,
        );
      }
    }

    if (orBlocks.length > 0) {
      conditions.push(or(...orBlocks)!);
    }
  }

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  // --- TRI ---
  if (options.orderBy && options.orderBy.length > 0) {
    const sortOrders: SQL[] = options.orderBy
      .map((sort) => {
        const col = columns[sort.column as string];
        if (!col) return null;
        return sort.order === "desc" ? desc(col) : asc(col);
      })
      .filter((s): s is SQL => s !== null);

    if (sortOrders.length > 0) query.orderBy(...sortOrders);
  }

  // --- PAGINATION ---
  const limit = options.limit
    ? Math.min(options.limit, DEFAULT_MAX_LIMIT)
    : DEFAULT_MAX_LIMIT;
  query.limit(limit);

  if (options.offset !== undefined && options.offset >= 0) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Fusionne les options de requête utilisateur avec des valeurs par défaut.
 * Priorité : User Options > Default Options > Hardcoded Constants
 */
export function mergeQueryOptions<T extends SQLiteTableWithColumns<any>>(
  options: FindManyOptions<T> = {},
  defaultOptions: FindManyOptions<T> = {},
): FindManyOptions<T> {
  return {
    // 1. Pagination : Priorité utilisateur, sinon défaut, avec un cap de sécurité
    limit: Math.min(
      options.limit ?? defaultOptions.limit ?? DEFAULT_MAX_LIMIT,
      DEFAULT_MAX_LIMIT,
    ),
    offset: options.offset ?? defaultOptions.offset ?? 0,

    // 2. Filtrage exact (where) : Fusion des objets
    where: {
      ...defaultOptions.where,
      ...options.where,
    },

    // 3. Filtrage par liste (whereIn) : Fusion des objets
    whereIn: {
      ...defaultOptions.whereIn,
      ...options.whereIn,
    },

    // 4. Recherche (search) : Fusion des objets
    search: {
      ...defaultOptions.search,
      ...options.search,
    },

    // 5. Blocs OR : On concatène les tableaux pour additionner les conditions alternatives
    or: [...(defaultOptions.or ?? []), ...(options.or ?? [])],

    // 6. Tri (orderBy) : L'utilisateur remplace totalement le tri par défaut s'il en fournit un
    orderBy: options.orderBy?.length
      ? options.orderBy
      : (defaultOptions.orderBy ?? []),
  };
}
