import { eq, sql, type AnyColumn, type Table } from "drizzle-orm";
import {
  applyQueryOptions,
  extractQueryPayload,
  type DynamicSelectQueryBuilder,
  type FindManyOptions,
  mergeFindManyOptions,
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
  TFilter extends FindManyOptions<Record<string, Table>> = FindManyOptions<
    Record<string, Table>
  >,
> {
  db: TDb;
  table: TTable;
  idColumn: AnyColumn;
  logger: (context: string) => ILogger;
  baseTableName: string;
  defaultFilters?: TFilter;
  joinTables?: Record<string, Table>;
}

/**
 * Abstract Base Repository providing standardized CRUD operations and lifecycle observability for SQLite.
 */
export abstract class BaseRepository<
  TTable extends Table,
  TDb extends DrizzleClient = DrizzleClient,
  TSelect = TTable["$inferSelect"],
  TFilter extends FindManyOptions<Record<string, Table>> = FindManyOptions<
    Record<string, Table>
  >,
  TInsert = TTable["$inferInsert"],
  TUpdate = Partial<TTable["$inferInsert"]>,
> {
  protected db: TDb;
  protected logger: ILogger;
  protected table: TTable;
  protected idColumn: AnyColumn;
  protected baseTableName: string;
  protected defaultFilters: TFilter | undefined;
  protected readonly joinTables: Record<string, Table>;
  /**
   * Initializes the repository with database client, schema references, and logging utilities.
   * @param config - Configuration object containing structural dependencies and static filters.
   */
  constructor(config: IBaseRepositoryConfig<TTable, TDb, TFilter>) {
    this.db = config.db;
    this.table = config.table;
    this.idColumn = config.idColumn;
    this.baseTableName = config.baseTableName;
    this.joinTables = config.joinTables ?? { [this.baseTableName]: this.table };
    this.defaultFilters = config.defaultFilters;
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
  protected getJoinTable() {
    return this.joinTables;
  }

  /**
   * Generates a base dynamic select query configuration set for the target repository database table.
   * @param tx - Optional transactional client context.
   * @returns A dynamic select query builder instance.
   */
  protected getQuerySet<Fields extends Record<string, unknown>>(
    tx?: TDb,
    field?: Fields | undefined,
  ): DynamicSelectQueryBuilder {
    return this.getClient(tx).select(field).from(this.table).$dynamic();
  }

  /**
   * Wraps operation blocks to measure, log, and calculate execution durations.
   * @param opName - Name of the operational database metric tracker tag.
   * @param action - Execution context payload callback block.
   * @param context - Structural operational metadata block properties.
   * @returns The resolution value from the passed action callback execution.
   */
  private executeWithTiming<T>(
    opName: string,
    action: () => T,
    context?: Record<string, unknown>,
  ): T {
    const startTime = performance.now();
    try {
      const result = action();
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
  public findMany<Fields extends Record<string, unknown>>(
    filters?: TFilter,
    tx?: TDb,
    field?: Fields | undefined,
  ): TSelect[] {
    return this.executeWithTiming(
      "findMany",
      () => {
        const query = this.getQuerySet(tx, field);
        const joinTables = this.getJoinTable();
        const queryBuilder = applyQueryOptions(
          query,
          joinTables,
          mergeFindManyOptions(filters, this.defaultFilters),
        );
        return queryBuilder.all() as TSelect[];
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
  public findById<Fields extends Record<string, unknown>>(
    id: string | number,
    tx?: TDb,
    field?: Fields | undefined,
  ): TSelect | null {
    if (id === undefined || id === null) return null;

    return this.executeWithTiming(
      "findById",
      () => {
        const result = this.getQuerySet(tx, field)
          .where(eq(this.idColumn, id))
          .get();

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
   * Internal proxy layout handler managing explicit low-level array insert updates modified for SQLite.
   * @param payloads - Typed configuration maps matching insertion criteria profiles.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Unified structural data arrays indicating modification confirmations.
   */
  private executeInsert(payloads: TInsert[], tx?: TDb): TSelect[] {
    return this.getClient(tx)
      .insert(this.table)
      .values(payloads)
      .returning()
      .all() as TSelect[];
  }

  /**
   * Inserts single row items cleanly inside structural data contexts.
   * @param payload - Properties following structural mapping requirements configurations.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Explicit fresh structural details data object map.
   */
  public create(payload: TInsert, tx?: TDb): TSelect {
    return this.executeWithTiming(
      "create",
      () => {
        const [newRecord] = this.executeInsert([payload], tx);
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
  public bulkCreate(payload: TInsert[], tx?: TDb): TSelect[] {
    return this.executeWithTiming(
      "bulkCreate",
      () => {
        return this.executeInsert(payload, tx);
      },
      { count: payload.length },
    );
  }

  /**
   * Updates a record by its unique identifier within an optional transaction.
   * @param id - The unique identifier of the record to update.
   * @param payload - The data payload containing the fields to update.
   * @param tx - Optional database transaction context.
   * @returns The updated record or null if not found.
   */
  public updateById(id: string | number, payload: TUpdate, tx?: TDb) {
    if (id === undefined || id === null) return null;

    return this.executeWithTiming(
      "updateById",
      () => {
        const result = this.getClient(tx)
          .update(this.table)
          .set({
            ...payload,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(this.idColumn, id))
          .returning()
          .get();
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
   * Modifies targeted active model instance variables matched against entity identification keys adapted for SQLite.
   * @param payload - Property updates payload mapped to insertion updates.
   * @param filters - Target query filter criteria configuration parameter settings flags.
   * @param tx - Optional database transaction orchestration reference.
   * @returns Model details map reflecting final operational changes updates or null.
   */
  public update(payload: TUpdate, filters?: TFilter, tx?: TDb): TSelect | null {
    if (!filters) return null;

    return this.executeWithTiming(
      "update",
      () => {
        const joinTables = this.getJoinTable();
        const queryPayload = extractQueryPayload(
          joinTables,
          filters,
          this.defaultFilters?.where,
        );

        const baseQuery = this.getClient(tx)
          .update(this.table)
          .set({
            ...payload,
            updatedAt: new Date(),
          })
          .$dynamic();

        if (queryPayload.where) {
          baseQuery.where(queryPayload.where);
        }

        const updated = baseQuery.returning().all();

        if (!updated || updated.length === 0) {
          throw new RecordNotFoundError(this.baseTableName);
        }
        return updated[0] as TSelect;
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
  public delete(id: string | number, tx?: TDb): boolean {
    if (id === undefined || id === null) return false;

    return this.executeWithTiming(
      "delete",
      () => {
        const result = this.getClient(tx)
          .delete(this.table)
          .where(eq(this.idColumn, id))
          .returning()
          .get();

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
