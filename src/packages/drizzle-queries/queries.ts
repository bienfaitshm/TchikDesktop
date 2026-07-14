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
  select(field?: any): any;
  insert(table: Table): any;
  update(table: Table): any;
  delete(table: Table): any;
  query: any;
}

export interface ILogger {
  error(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
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
  defaultSort?: FindManyOptions<TTable["$inferSelect"]>;
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
  protected defaultSort: FindManyOptions<TTable["$inferSelect"]> | undefined;
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

  public getClient(tx?: TDb): TDb {
    return tx ?? this.db;
  }

  protected getQuerySet(tx?: TDb): DynamicSelectQueryBuilder {
    return this.getClient(tx).select().from(this.table).$dynamic();
  }

  /**
   * Helper d'exécution pour mesurer précisément le temps de traitement de chaque requête.
   */
  private async executeWithTiming<T>(
    opName: string,
    action: () => Promise<T>,
    context?: Record<string, unknown>,
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await action();
      const duration = (performance.now() - startTime).toFixed(2);

      this.logger.info(
        `[${this.entityName}Repository] [${opName}] Success - ${duration}ms`,
        {
          durationMs: parseFloat(duration),
          ...context,
        },
      );

      return result;
    } catch (error) {
      const duration = (performance.now() - startTime).toFixed(2);
      if (context) {
        context.durationMs = parseFloat(duration);
      }
      throw error;
    }
  }

  async findMany(
    filters?: FindManyOptions<TTable["$inferSelect"]>,
    tx?: TDb,
  ): Promise<TSelect[]> {
    try {
      return await this.executeWithTiming(
        "findMany",
        async () => {
          const query = this.getQuerySet(tx);
          const finalOptions = mergeQueryOptions(filters, this.defaultSort);
          const result = await applyQueryOptions(
            query,
            this.table,
            finalOptions,
          );
          return result as unknown as TSelect[];
        },
        { filters },
      );
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to fetch ${this.entityName} list.`,
      );
      this.logError("findMany", dbError, {
        filters,
        ...(error as any).context,
      });
      throw dbError;
    }
  }

  async findById(id: string | number, tx?: TDb): Promise<TSelect | null> {
    if (id === undefined || id === null) return null;

    try {
      return await this.executeWithTiming(
        "findById",
        async () => {
          const [result] = await this.getQuerySet(tx)
            .where(eq(this.idColumn, id))
            .execute();

          if (!result) {
            this.logger.info(
              `Element ${this.entityName} with id ${id} not found.`,
            );
          }
          return (result as TSelect) ?? null;
        },
        { id },
      );
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to fetch ${this.entityName} by ID.`,
      );
      this.logError("findById", dbError, { id, ...(error as any).context });
      throw dbError;
    }
  }

  private async executeInsert(
    payloads: TTable["$inferInsert"][],
    tx?: TDb,
  ): Promise<TSelect[]> {
    return this.getClient(tx)
      .insert(this.table)
      .values(payloads)
      .returning() as unknown as Promise<TSelect[]>;
  }

  async create(payload: TInsert, tx?: TDb): Promise<TSelect> {
    try {
      return await this.executeWithTiming(
        "create",
        async () => {
          const [newRecord] = await this.executeInsert(
            [payload as TTable["$inferInsert"]],
            tx,
          );
          return newRecord;
        },
        { payload },
      );
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Creation failed for ${this.entityName}.`,
      );
      this.logError("create", dbError, { payload, ...(error as any).context });
      throw dbError;
    }
  }

  async bulkCreate(payload: TInsert[], tx?: TDb): Promise<TSelect[]> {
    try {
      return await this.executeWithTiming(
        "bulkCreate",
        async () => {
          return await this.executeInsert(
            payload as TTable["$inferInsert"][],
            tx,
          );
        },
        { count: payload.length },
      );
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Bulk Creation failed for ${this.entityName}.`,
      );
      this.logError("bulkCreate", dbError, {
        payload,
        ...(error as any).context,
      });
      throw dbError;
    }
  }

  async update(
    id: string | number,
    updates: TUpdate,
    tx?: TDb,
  ): Promise<TSelect | null> {
    if (id === undefined || id === null) return null;

    try {
      return await this.executeWithTiming(
        "update",
        async () => {
          const [updated] = await this.getClient(tx)
            .update(this.table)
            .set(updates as any)
            .where(eq(this.idColumn, id))
            .returning();

          if (!updated) {
            throw new RecordNotFoundError(this.entityName);
          }
          return updated as TSelect;
        },
        { id },
      );
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Update failed for ${this.entityName}.`,
      );
      this.logError("update", dbError, {
        id,
        updates,
        ...(error as any).context,
      });
      throw dbError;
    }
  }

  async delete(id: string | number, tx?: TDb): Promise<boolean> {
    if (id === undefined || id === null) return false;

    try {
      return await this.executeWithTiming(
        "delete",
        async () => {
          const result = await this.getClient(tx)
            .delete(this.table)
            .where(eq(this.idColumn, id))
            .returning();
          return Array.isArray(result) ? result.length > 0 : !!result;
        },
        { id },
      );
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Deletion failed for ${this.entityName}.`,
      );
      this.logError("delete", dbError, { id, ...(error as any).context });
      throw dbError;
    }
  }

  async findForSelect({
    filters,
    search,
  }: SearchOptions<
    Partial<FindManyOptions<TTable["$inferSelect"]>>
  > = {}): Promise<TSelect[]> {
    try {
      return await this.executeWithTiming(
        "findForSelect",
        async () => {
          const searchFilter = createSearchFilter(
            this.searchFiltersColumns,
            search,
          );

          const effectiveFilters: Partial<
            FindManyOptions<TTable["$inferSelect"]>
          > = { ...filters };
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
        },
        { filters, search },
      );
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to fetch ${this.entityName} list search.`,
      );
      this.logError("findForSelect", dbError, {
        filters,
        search,
        ...(error as any).context,
      });
      throw dbError;
    }
  }

  protected logError(
    op: string,
    error: DatabaseError,
    context: Record<string, unknown>,
  ) {
    this.logger.error(`[${this.entityName}Repository] ${op} operation failed`, {
      errorType: error.name,
      errorCode: error.code,
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }
}
