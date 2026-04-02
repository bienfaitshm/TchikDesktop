import { SQL, and, asc, desc, eq, like } from "drizzle-orm";
import { AnySQLiteSelect, SQLiteTable } from "drizzle-orm/sqlite-core";

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
