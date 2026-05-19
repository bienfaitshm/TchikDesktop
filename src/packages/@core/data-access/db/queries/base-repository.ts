import { eq, Table } from "drizzle-orm";
import { applyQueryOptions, mergeQueryOptions } from "./drizzle-builder";
import type { FindManyOptions } from "../schemas/types";

type TableColumn<TTable extends Table> =
  TTable["_"]["columns"][keyof TTable["_"]["columns"]];

export interface ILogger {
  error(message: string, context?: Record<string, unknown>): void;
}

export interface IDrizzleConnection {
  select: any;
  insert: any;
  update: any;
  delete: any;
}

export interface IBaseRepositoryConfig<
  TTable extends Table,
  TDb extends IDrizzleConnection,
> {
  db: TDb;
  table: TTable;
  idColumn: TableColumn<TTable>;
  logger: (context: string) => ILogger;
  entityName: string;
  defaultSort?: FindManyOptions<TTable>;
}

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
  TDb extends IDrizzleConnection = IDrizzleConnection,
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

  protected getQuerySet() {
    return this.db.select().from(this.table).$dynamic();
  }

  protected getDetailQuerySet() {
    return this.getQuerySet();
  }

  async findMany(filters?: FindManyOptions<TTable>): Promise<TSelect[]> {
    try {
      const query = this.getQuerySet();
      const finalOptions = mergeQueryOptions(filters, this.defaultSort);
      return (await applyQueryOptions(
        query,
        this.table,
        finalOptions,
      )) as TSelect[];
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
      const [newRecord] = await this.db
        .insert(this.table)
        .values(payload)
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
      const [updated] = await this.db
        .update(this.table)
        .set(updates)
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
      const result = await this.db
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
    this.logger.error(`[${this.entityName}Repository] ${op} operation failed`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });
  }
}
