import { eq, Table, AnyColumn } from "drizzle-orm";
import { db } from "../config";
import { applyQueryOptions, mergeQueryOptions } from "./drizzle-builder";
import { getLogger } from "@/packages/logger";
import type { FindManyOptions } from "../schemas/types";

const logger = getLogger("Database-Repository");

/**
 * Erreur spécifique à la couche d'accès aux données.
 * Permet un filtrage ciblé dans les middlewares de gestion d'erreurs (Sentry, Datadog, etc.).
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export abstract class BaseRepository<
  TTable extends Table,
  TSelect,
  TInsert,
  TUpdate,
> {
  constructor(
    protected readonly table: TTable,
    protected readonly idColumn: AnyColumn,
    protected readonly entityName: string,
    protected readonly defaultSort: FindManyOptions<TTable>,
  ) {}

  /**
   * Construit la requête de base pour les listes.
   * Protégée pour permettre aux classes enfants d'ajouter des JOINs par défaut (ex: with relations).
   */
  protected getQuerySet() {
    return db.select().from(this.table).$dynamic();
  }

  /**
   * Construit la requête de base pour les détails (findById).
   */
  protected getDetailQuerySet() {
    return db.select().from(this.table).$dynamic();
  }

  async findMany(filters?: FindManyOptions<TTable>): Promise<TSelect[]> {
    try {
      const query = this.getQuerySet();
      const finalOptions = mergeQueryOptions(filters, this.defaultSort);

      return await applyQueryOptions(query, this.table, finalOptions);
    } catch (error) {
      this.logError("findMany", error, { filters });
      throw new RepositoryError(
        `Failed to fetch ${this.entityName} list.`,
        error,
      );
    }
  }

  async findById(id: string | number): Promise<TSelect | null> {
    if (id === undefined || id === null) return null;

    try {
      const [result] = await this.getDetailQuerySet().where(
        eq(this.idColumn, id),
      );

      return (result as TSelect) ?? null;
    } catch (error) {
      this.logError("findById", error, { id });
      throw new RepositoryError(
        `Failed to fetch ${this.entityName} by ID.`,
        error,
      );
    }
  }

  async create(payload: TInsert): Promise<TSelect> {
    try {
      const [newRecord] = await db
        .insert(this.table)
        .values(payload as any)
        .returning();

      return newRecord as TSelect;
    } catch (error) {
      this.logError("create", error, { payload });
      throw new RepositoryError(
        `Creation failed for ${this.entityName}.`,
        error,
      );
    }
  }

  async update(id: string | number, updates: TUpdate): Promise<TSelect | null> {
    if (id === undefined || id === null) return null;

    try {
      const [updated] = await db
        .update(this.table)
        .set(updates as any)
        .where(eq(this.idColumn, id))
        .returning();

      return (updated as TSelect) ?? null;
    } catch (error) {
      this.logError("update", error, { id, updates });
      throw new RepositoryError(`Update failed for ${this.entityName}.`, error);
    }
  }

  async delete(id: string | number): Promise<boolean> {
    if (id === undefined || id === null) return false;

    try {
      const result = await db
        .delete(this.table)
        .where(eq(this.idColumn, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      this.logError("delete", error, { id });
      throw new RepositoryError(
        `Deletion failed for ${this.entityName}.`,
        error,
      );
    }
  }

  protected logError(
    op: string,
    error: unknown,
    context: Record<string, unknown>,
  ) {
    logger.error(`[${this.entityName}Repository] ${op} operation failed`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });
  }
}
