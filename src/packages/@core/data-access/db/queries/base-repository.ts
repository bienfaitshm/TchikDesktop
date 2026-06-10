import { eq, Table, type InferInsertModel } from "drizzle-orm";
import type { LibSQLDatabase, LibSQLTransaction } from "drizzle-orm/libsql";
import { applyQueryOptions, mergeQueryOptions } from "./drizzle-builder";
import type { FindManyOptions } from "../schemas/types";

type TableColumn<TTable extends Table> =
  TTable["_"]["columns"][keyof TTable["_"]["columns"]];

export interface ILogger {
  error(message: string, context?: Record<string, unknown>): void;
}

/**
 * Type d'infrastructure unifié.
 * Représente soit le client de base, soit la transaction active pour LibSQL.
 */
export type LibSqlClient =
  | LibSQLDatabase<Record<string, unknown>>
  | LibSQLTransaction<any, any>;

export interface IBaseRepositoryConfig<
  TTable extends Table,
  TDb extends LibSqlClient,
> {
  db: TDb;
  table: TTable;
  idColumn: TableColumn<TTable>;
  logger: (context: string) => ILogger;
  entityName: string;
  defaultSort?: FindManyOptions<TTable>;
}

export class RepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "RepositoryError";
  }
}

export abstract class BaseRepository<
  TTable extends Table,
  TDb extends LibSqlClient = LibSqlClient,
  TSelect = TTable["$inferSelect"],
  TInsert = TTable["$inferInsert"],
  TUpdate = Partial<TTable["$inferInsert"]>,
> {
  protected db: TDb;
  protected logger: ILogger;
  protected table: TTable;
  protected idColumn: TableColumn<TTable>;
  protected entityName: string;
  protected defaultSort: FindManyOptions<TTable> | undefined;

  constructor(config: IBaseRepositoryConfig<TTable, TDb>) {
    this.db = config.db;
    this.table = config.table;
    this.idColumn = config.idColumn;
    this.entityName = config.entityName;
    this.defaultSort = config.defaultSort;
    this.logger = config.logger(`${config.entityName}Repository`);
  }

  /**
   * Extrait le client d'exécution correct (priorité à la transaction en cours).
   */
  protected getClient(tx?: LibSqlClient): LibSqlClient {
    return tx ?? this.db;
  }

  /**
   * Génère le QuerySet de base pour les sélections.
   */
  protected getQuerySet(tx?: LibSqlClient) {
    return this.getClient(tx).select().from(this.table).$dynamic();
  }

  protected getDetailQuerySet(tx?: LibSqlClient) {
    return this.getQuerySet(tx);
  }

  async findMany(
    filters?: FindManyOptions<TTable>,
    tx?: LibSqlClient,
  ): Promise<TSelect[]> {
    try {
      const query = this.getQuerySet(tx);
      const finalOptions = mergeQueryOptions(filters, this.defaultSort);
      return (await applyQueryOptions(
        query,
        this.table,
        finalOptions,
      )) as TSelect[];
    } catch (error) {
      this.logError("findMany", error, { filters });
      throw new RepositoryError(`Failed to fetch ${this.entityName} list.`, {
        cause: error,
      });
    }
  }

  async findById(
    id: string | number,
    tx?: LibSqlClient,
  ): Promise<TSelect | null> {
    if (id === undefined || id === null) return null;

    try {
      const [result] = await this.getDetailQuerySet(tx).where(
        eq(this.idColumn, id),
      );
      return (result as TSelect) ?? null;
    } catch (error) {
      this.logError("findById", error, { id });
      throw new RepositoryError(`Failed to fetch ${this.entityName} by ID.`, {
        cause: error,
      });
    }
  }

  async create(payload: TInsert, tx?: LibSqlClient): Promise<TSelect> {
    try {
      const [newRecord] = await this.getClient(tx)
        .insert(this.table)
        .values(payload as InferInsertModel<typeof this.table>)
        .returning();
      return newRecord as TSelect;
    } catch (error) {
      this.logError("create", error, { payload });
      throw new RepositoryError(`Creation failed for ${this.entityName}.`, {
        cause: error,
      });
    }
  }

  async update(
    id: string | number,
    updates: TUpdate,
    tx?: LibSqlClient,
  ): Promise<TSelect | null> {
    if (id === undefined || id === null) return null;

    try {
      const [updated] = await this.getClient(tx)
        .update(this.table)
        .set(updates as Record<string, unknown>)
        .where(eq(this.idColumn, id))
        .returning();
      return (updated as TSelect) ?? null;
    } catch (error) {
      this.logError("update", error, { id, updates });
      throw new RepositoryError(`Update failed for ${this.entityName}.`, {
        cause: error,
      });
    }
  }

  async delete(id: string | number, tx?: LibSqlClient): Promise<boolean> {
    if (id === undefined || id === null) return false;

    try {
      const result = await this.getClient(tx)
        .delete(this.table)
        .where(eq(this.idColumn, id))
        .returning();

      return Array.isArray(result) ? result.length > 0 : !!result;
    } catch (error) {
      this.logError("delete", error, { id });
      throw new RepositoryError(`Deletion failed for ${this.entityName}.`, {
        cause: error,
      });
    }
  }

  protected logError(
    op: string,
    error: unknown,
    context: Record<string, unknown>,
  ) {
    this.logger.error(`[${this.entityName}Repository] ${op} operation failed`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });
  }
}
