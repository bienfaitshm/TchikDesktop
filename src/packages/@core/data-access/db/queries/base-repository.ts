import { eq, type Table } from "drizzle-orm";
import type { LibSQLDatabase, LibSQLTransaction } from "drizzle-orm/libsql";
import { applyQueryOptions, mergeQueryOptions } from "./drizzle-builder";
import type { FindManyOptions } from "../schemas/types";
import type {
  AnySQLiteSelectQueryBuilder,
  SQLiteColumn,
  SQLiteSelectDynamic,
} from "drizzle-orm/sqlite-core";
import type { SearchOptions } from "./select-option.transformer";
import { createSQLiteSearchFilter } from "./drizzle-utility";

type TableColumn<TTable extends Table> =
  TTable["_"]["columns"][keyof TTable["_"]["columns"]];

export interface ILogger {
  error(message: string, context?: Record<string, unknown>): void;
  info(messahe: string): void;
}

/**
 * Type d'infrastructure unifié.
 * Représente soit le client de base, soit la transaction active pour LibSQL.
 */
export type LibSqlClient<
  TSchema extends Record<string, unknown> = Record<string, unknown>,
> = LibSQLDatabase<TSchema> | LibSQLTransaction<any, any>;

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
  protected searchFiltersColumns: SQLiteColumn[] = [];
  protected defaultLimit: number = 50;

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
  protected getQuerySet<T extends AnySQLiteSelectQueryBuilder>(
    tx?: LibSqlClient,
  ): SQLiteSelectDynamic<T> {
    return this.getClient(tx).select().from(this.table).$dynamic();
  }

  protected getDetailQuerySet<T extends AnySQLiteSelectQueryBuilder>(
    tx?: LibSqlClient,
  ) {
    return this.getQuerySet<T>(tx);
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
      if (!result) {
        this.logger.info(`Not found element with Id ${id}`);
      }
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
        .values(payload as TTable["$inferInsert"])
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

  /**
   * Récupère les utilisateurs pour les composants Select / Combobox.
   * Alterne intelligemment entre recherche textuelle filtrée et données par défaut.
   */
  async fetchOptions({
    filters,
    search,
  }: SearchOptions<Partial<FindManyOptions<TTable>>> = {}): Promise<TSelect[]> {
    try {
      let query = this.getQuerySet();

      const searchFilter = createSQLiteSearchFilter(
        this.searchFiltersColumns,
        search,
      );

      if (searchFilter) {
        const mergedOptions = mergeQueryOptions(filters, this.defaultSort);
        query = query.where(searchFilter);

        return (await applyQueryOptions(
          query,
          this.table,
          mergedOptions,
        )) as unknown as TSelect[];
      }

      const defaultOptions = mergeQueryOptions(
        { limit: this.defaultLimit, ...filters },
        this.defaultSort,
      );

      return (await applyQueryOptions(
        query,
        this.table,
        defaultOptions,
      )) as unknown as TSelect[];
    } catch (error) {
      this.logError("fetchOptions", error, { filters, search });
      throw new Error(
        "Erreur lors de la récupération des options d'utilisateurs.",
      );
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
