import { eq, sql, type AnyColumn, type Table } from "drizzle-orm";
import {
  applyQueryOptions,
  type DynamicSelectQueryBuilder,
  type FindManyOptions,
} from "./helpers";
import { DatabaseError, RecordNotFoundError } from "./error";

export interface DrizzleClient {
  select(field?: Record<string, unknown>): any;
  insert(table: Table): any;
  update(table: Table): any;
  delete(table: Table): any;
  query: Record<string, unknown>;
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
  baseTableName: string;
  fixedFilters?: FindManyOptions<Record<string, Table>>;
}

/**
 * Abstract Base Repository providing standardized CRUD operations and lifecycle observability.
 */
export abstract class BaseRepository<
  TTable extends Table,
  TDb extends DrizzleClient = DrizzleClient,
  TSelect = TTable["$inferSelect"],
  TInsert = TTable["$inferInsert"],
  TUpdate = Partial<TTable["$inferInsert"]>,
> {
  protected db: TDb;
  protected logger: ILogger;
  protected table: TTable;
  protected idColumn: AnyColumn;
  protected baseTableName: string;
  protected fixedFilters: FindManyOptions<Record<string, Table>> | undefined;

  constructor(config: IBaseRepositoryConfig<TTable, TDb>) {
    this.db = config.db;
    this.table = config.table;
    this.idColumn = config.idColumn;
    this.baseTableName = config.baseTableName;
    this.fixedFilters = config.fixedFilters;
    this.logger = config.logger(`${config.baseTableName}Repository`);
  }

  /**
   * Retrieves the active database client context, opting into an active transaction if supplied.
   * @param tx - Optional transactional client context.
   * @returns The active Drizzle client instance.
   */
  public getClient(tx?: TDb): TDb {
    return tx ?? this.db;
  }

  /**
   * Generates the tabular structural reference tracking dictionary.
   * @returns Key-value mapping of tables indexed under the base table name identifier.
   */
  protected getJoinTable(): Record<string, Table> {
    return {
      [this.baseTableName]: this.table,
    };
  }

  /**
   * Generates a base dynamic select query configuration set for the target repository database table.
   * @param tx - Optional transactional client context.
   * @returns A dynamic select query builder instance.
   */
  protected getQuerySet(tx?: TDb): DynamicSelectQueryBuilder {
    return this.getClient(tx).select().from(this.table).$dynamic();
  }

  /**
   * Wraps operation blocks to measure, log, and calculate execution durations.
   * @param opName - Name of the operational database metric tracker tag.
   * @param action - Async execution context payload callback block.
   * @param context - Structural operational metadata block properties.
   * @returns The resolution value from the passed action callback execution.
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
        `[${this.baseTableName}Repository] [${opName}] Success - ${duration}ms`,
        {
          durationMs: parseFloat(duration),
          ...context,
        },
      );

      return result;
    } catch (error) {
      const duration = (performance.now() - startTime).toFixed(2);
      const logContext = { ...context, durationMs: parseFloat(duration) };
      const dbError =
        error instanceof DatabaseError
          ? error
          : DatabaseError.from(error, `Operational failure during ${opName}.`);

      this.logError(opName, dbError, logContext);
      throw dbError;
    }
  }

  /**
   * Searches and parses multiple matching records from the target repository space using parameters.
   * @param filters - Search query configuration parameter flags.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Array matching specified entity properties structures.
   */
  public async findMany(
    filters?: FindManyOptions<Record<string, Table>>,
    tx?: TDb,
  ): Promise<TSelect[]> {
    return this.executeWithTiming(
      "findMany",
      async () => {
        const query = this.getQuerySet(tx);
        const joinTables = this.getJoinTable();
        const result = await applyQueryOptions(
          query,
          joinTables,
          filters,
          this.fixedFilters,
        );
        return result as unknown as TSelect[];
      },
      { filters },
    );
  }

  /**
   * Identifies single row targets tracking specific individual table identities.
   * @param id - Unique database context row index parameters.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Explicit data model properties blueprint structure or null.
   */
  public async findById(
    id: string | number,
    tx?: TDb,
  ): Promise<TSelect | null> {
    if (id === undefined || id === null) return null;

    return this.executeWithTiming(
      "findById",
      async () => {
        const [result] = await this.getQuerySet(tx)
          .where(eq(this.idColumn, id))
          .execute();

        if (!result) {
          this.logger.info(
            `Element ${this.baseTableName} with id ${id} not found.`,
          );
        }
        return (result as TSelect) ?? null;
      },
      { id },
    );
  }

  /**
   * Internal proxy layout handler managing explicit low-level array insert updates.
   * @param payloads - Typed configuration maps matching insertion criteria profiles.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Unified structural data arrays indicating modification confirmations.
   */
  private async executeInsert(
    payloads: TInsert[],
    tx?: TDb,
  ): Promise<TSelect[]> {
    return this.getClient(tx)
      .insert(this.table)
      .values(payloads)
      .returning() as unknown as Promise<TSelect[]>;
  }

  /**
   * Inserts single row items cleanly inside structural data contexts.
   * @param payload - Properties following structural mapping requirements configurations.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Explicit fresh structural details data object map.
   */
  public async create(payload: TInsert, tx?: TDb): Promise<TSelect> {
    return this.executeWithTiming(
      "create",
      async () => {
        const [newRecord] = await this.executeInsert([payload], tx);
        return newRecord;
      },
      { payload },
    );
  }

  /**
   * Persists multi-record vector frames concurrently within a singular target operational step.
   * @param payload - Arrays tracking appropriate typed insertion layouts schemas.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Aggregated structural configuration mappings array.
   */
  public async bulkCreate(payload: TInsert[], tx?: TDb): Promise<TSelect[]> {
    return this.executeWithTiming(
      "bulkCreate",
      async () => {
        return this.executeInsert(payload, tx);
      },
      { count: payload.length },
    );
  }

  /**
   * Modifies targeted active model instance variables matched against entity identification keys.
   * @param payload - Property updates payload mapped to insertion updates.
   * @param filters - Target query filter criteria configuration parameter settings flags.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Model details map reflecting final operational changes updates or null.
   */
  public async update(
    payload: TUpdate,
    filters?: FindManyOptions<Record<string, Table>>,
    tx?: TDb,
  ): Promise<TSelect | null> {
    if (!filters) return null;

    return this.executeWithTiming(
      "update",
      async () => {
        const joinTables = this.getJoinTable();
        const baseQuery = this.getClient(tx)
          .update(this.table)
          .set({ ...payload, updatedAt: sql`CURRENT_TIMESTAMP` })
          .$dynamic();

        const updateBuilder = await applyQueryOptions(
          baseQuery,
          joinTables,
          filters,
        );

        const [updated] = await updateBuilder.returning();

        if (!updated) {
          throw new RecordNotFoundError(this.baseTableName);
        }
        return updated as TSelect;
      },
      { payload, filters },
    );
  }

  /**
   * Removes targeted entries matching identifier properties securely from data tables.
   * @param id - Structural key variable matching specific record locations rules.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Boolean affirmation declaring operational deletion status indicators.
   */
  public async delete(id: string | number, tx?: TDb): Promise<boolean> {
    if (id === undefined || id === null) return false;

    return this.executeWithTiming(
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
  }

  /**
   * Dispatches and formats telemetry errors safely to connected telemetry endpoints.
   * @param op - Trace context indicator identifying database methods roots.
   * @param error - Structural tracking DatabaseError metrics class instance.
   * @param context - Additional tracking context variable scopes mapping.
   */
  protected logError(
    op: string,
    error: DatabaseError,
    context: Record<string, unknown>,
  ): void {
    this.logger.error(
      `[${this.baseTableName}Repository] ${op} operation failed`,
      {
        errorType: error.name,
        errorCode: error.code,
        message: error.message,
        stack: error.stack,
        ...context,
      },
    );
  }
}
