import { SQL, and, eq, asc, desc, sql } from "drizzle-orm";
import { SQLiteSelect, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * Type utilitaire pour capturer n'importe quel constructeur de requête Drizzle Select
 */
type AnySQLiteSelect = SQLiteSelect<any, any, any, any>;

export interface BaseFilter {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
  [key: string]: any;
}

/**
 * Adapte une requête Drizzle avec la pagination, le tri et les filtres.
 * * @param query - La requête Drizzle (ex: db.select().from(users))
 * @param table - La table concernée pour le mapping des colonnes
 * @param filters - Les filtres provenant de req.query
 * @param defaultOrder - Tri par défaut (facultatif)
 */
export function applyFilters<
  T extends AnySQLiteSelect,
  TTable extends ReturnType<typeof sqliteTable>,
>(query: T, table: TTable, filters: BaseFilter, defaultOrder?: SQL): T {
  const { limit, offset, orderBy, order, ...criteria } = filters;

  // 1. Gestion des critères (WHERE)
  const whereClauses: SQL[] = [];

  Object.entries(criteria).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key in table) {
      const column = (table as any)[key];

      // Logique intelligente : si c'est une string, on peut faire un LIKE, sinon un EQ
      if (typeof value === "string" && value.includes("%")) {
        whereClauses.push(sql`lower(${column}) LIKE lower(${value})`);
      } else {
        whereClauses.push(eq(column, value));
      }
    }
  });

  if (whereClauses.length > 0) {
    query.where(and(...whereClauses));
  }

  // 2. Gestion du Tri (ORDER BY)
  if (orderBy && orderBy in table) {
    const column = (table as any)[orderBy];
    const orderFn = order?.toUpperCase() === "DESC" ? desc : asc;
    query.orderBy(orderFn(column));
  } else if (defaultOrder) {
    query.orderBy(defaultOrder);
  }

  // 3. Pagination (LIMIT / OFFSET)
  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);

  return query;
}
