import { eq, type AnyColumn, type Table } from "drizzle-orm";
import {
  applyQueryOptions,
  mergeQueryOptions,
  type DynamicSelectQueryBuilder,
} from "./builder";
import type { SearchOptions } from "./transformer";
import type { FindManyOptions } from "./types";
import { createSearchFilter } from "./utility";
import { DatabaseError, RecordNotFoundError } from "./error";

export interface DrizzleClient {
  select(): any;
  insert(table: Table): any;
  update(table: Table): any;
  delete(table: Table): any;
}

export interface ILogger {
  error(message: string, context?: Record<string, unknown>): void;
  info(message: string): void;
}

export interface IBaseRepositoryConfig<
  TTable extends Table,
  TDb extends DrizzleClient,
> {
  db: TDb;
  table: TTable;
  idColumn: AnyColumn;
  logger: (context: string) => ILogger;
  entityName: string;
  defaultSort?: FindManyOptions<TTable>;
}

export abstract class BaseRepository<
  TTable extends Table,
  TDb extends DrizzleClient = DrizzleClient,
  TSelect extends Record<string, any> = TTable["$inferSelect"],
  TInsert extends Record<string, any> = TTable["$inferInsert"],
  TUpdate extends Record<string, any> = Partial<TTable["$inferInsert"]>,
> {
  protected db: TDb;
  protected logger: ILogger;
  protected table: TTable;
  protected idColumn: AnyColumn;
  protected entityName: string;
  protected defaultSort: FindManyOptions<TTable> | undefined;
  protected searchFiltersColumns: AnyColumn[] = [];
  protected defaultLimit: number = 50;

  constructor(config: IBaseRepositoryConfig<TTable, TDb>) {
    this.db = config.db;
    this.table = config.table;
    this.idColumn = config.idColumn;
    this.entityName = config.entityName;
    this.defaultSort = config.defaultSort;
    this.logger = config.logger(`${config.entityName}Repository`);
  }

  public getClient(tx?: DrizzleClient): DrizzleClient {
    return tx ?? this.db;
  }

  protected getQuerySet(tx?: DrizzleClient): DynamicSelectQueryBuilder {
    return this.getClient(tx).select().from(this.table).$dynamic();
  }

  async findMany(
    filters?: FindManyOptions<TTable>,
    tx?: DrizzleClient,
  ): Promise<TSelect[]> {
    try {
      const query = this.getQuerySet(tx);
      const finalOptions = mergeQueryOptions(filters, this.defaultSort);
      const result = await applyQueryOptions(query, this.table, finalOptions);
      return result as unknown as TSelect[];
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to fetch ${this.entityName} list.`,
      );
      this.logError("findMany", dbError, { filters });
      throw dbError;
    }
  }

  async findById(
    id: string | number,
    tx?: DrizzleClient,
  ): Promise<TSelect | null> {
    if (id === undefined || id === null) return null;

    try {
      const [result] = await this.getQuerySet(tx)
        .where(eq(this.idColumn, id))
        .execute();

      if (!result) {
        this.logger.info(`Element ${this.entityName} with id ${id} not found.`);
      }
      return (result as TSelect) ?? null;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to fetch ${this.entityName} by ID.`,
      );
      this.logError("findById", dbError, { id });
      throw dbError;
    }
  }

  async create(payload: TInsert, tx?: DrizzleClient): Promise<TSelect> {
    try {
      const [newRecord] = await this.getClient(tx)
        .insert(this.table)
        .values(payload as any)
        .returning();
      return newRecord as TSelect;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Creation failed for ${this.entityName}.`,
      );
      this.logError("create", dbError, { payload });
      throw dbError;
    }
  }

  async update(
    id: string | number,
    updates: TUpdate,
    tx?: DrizzleClient,
  ): Promise<TSelect | null> {
    if (id === undefined || id === null) return null;

    try {
      const [updated] = await this.getClient(tx)
        .update(this.table)
        .set(updates as any)
        .where(eq(this.idColumn, id))
        .returning();

      if (!updated) {
        throw new RecordNotFoundError(this.entityName);
      }
      return updated as TSelect;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Update failed for ${this.entityName}.`,
      );
      this.logError("update", dbError, { id, updates });
      throw dbError;
    }
  }

  async delete(id: string | number, tx?: DrizzleClient): Promise<boolean> {
    if (id === undefined || id === null) return false;

    try {
      const result = await this.getClient(tx)
        .delete(this.table)
        .where(eq(this.idColumn, id))
        .returning();
      return Array.isArray(result) ? result.length > 0 : !!result;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Deletion failed for ${this.entityName}.`,
      );
      this.logError("delete", dbError, { id });
      throw dbError;
    }
  }

  async findForSelect({
    filters,
    search,
  }: SearchOptions<Partial<FindManyOptions<TTable>>> = {}): Promise<TSelect[]> {
    try {
      const searchFilter = createSearchFilter(
        this.searchFiltersColumns,
        search,
      );

      const effectiveFilters: Partial<FindManyOptions<TTable>> = { ...filters };
      if (!searchFilter) {
        effectiveFilters.limit = filters?.limit ?? this.defaultLimit;
      }

      const mergedOptions = mergeQueryOptions(
        effectiveFilters,
        this.defaultSort,
      );

      let query = this.getQuerySet();
      if (searchFilter) {
        query = query.where(searchFilter);
      }

      return (await applyQueryOptions(
        query,
        this.table,
        mergedOptions,
      )) as unknown as TSelect[];
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to fetch ${this.entityName} list search.`,
      );
      this.logError("findForSelect", dbError, { filters, search });
      throw dbError;
    }
  }

  protected logError(
    op: string,
    error: DatabaseError,
    context: Record<string, unknown>,
  ) {
    this.logger.error(`[${this.entityName}Repository] ${op} operation failed`, {
      errorType: error.name, // Ex: UniqueConstraintError, DataCorruptionError
      errorCode: error.code, // Ex: 23505, SQLITE_CONSTRAINT_UNIQUE
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }
}
