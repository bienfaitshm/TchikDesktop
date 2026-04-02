import {
  AnySQLiteSelect,
  SQLiteTable,
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
  like,
} from "drizzle-orm";

// Typage strict pour les filtres de base provenant de la requête HTTP
export interface BaseFilters {
  limit?: number | string;
  offset?: number | string;
  orderBy?: string;
  order?: "asc" | "desc" | "ASC" | "DESC";
  [key: string]: unknown; // Accepte n'importe quel autre filtre dynamique
}

/**
 * Adapte une requête Drizzle avec la pagination, le tri et les filtres dynamiques.
 * * @param query - L'instance de la requête Drizzle (ex: db.select().from(users).$dynamic())
 * @param table - L'objet table Drizzle (ex: users)
 * @param filters - Les paramètres de requête (ex: req.query)
 * @param defaultOrder - Tri par défaut, accepte un ou plusieurs critères
 */
export function applyFilters<
  TQuery extends AnySQLiteSelect,
  TTable extends SQLiteTable,
>(
  query: TQuery,
  table: TTable,
  filters: BaseFilters,
  defaultOrder?: SQL | SQL[],
): TQuery {
  const { limit, offset, orderBy, order, ...criteria } = filters;

  // 1. Gestion des critères (WHERE)
  const whereClauses: SQL[] = [];

  for (const [key, value] of Object.entries(criteria)) {
    // Ignorer les valeurs nulles ou non définies
    if (value === undefined || value === null || value === "") continue;

    // Vérifier de manière sécurisée si la colonne existe dans le schéma
    const column = (table as any)[key];
    if (!column) continue;

    // Utilisation native de like() au lieu de sql`...`
    if (typeof value === "string" && value.includes("%")) {
      whereClauses.push(like(column, value));
    } else {
      whereClauses.push(eq(column, value));
    }
  }

  if (whereClauses.length > 0) {
    query.where(and(...whereClauses));
  }

  // 2. Gestion du Tri (ORDER BY)
  if (orderBy && (table as any)[orderBy]) {
    const column = (table as any)[orderBy];
    const orderFn = order?.toUpperCase() === "DESC" ? desc : asc;
    query.orderBy(orderFn(column));
  } else if (defaultOrder) {
    // Le spread operator décompose correctement le tableau pour Drizzle
    if (Array.isArray(defaultOrder)) {
      query.orderBy(...defaultOrder);
    } else {
      query.orderBy(defaultOrder);
    }
  }

  // 3. Pagination sécurisée
  const parsedLimit = Number(limit);
  if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
    query.limit(parsedLimit);
  }

  const parsedOffset = Number(offset);
  if (!Number.isNaN(parsedOffset) && parsedOffset >= 0) {
    query.offset(parsedOffset);
  }

  return query;
}

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
