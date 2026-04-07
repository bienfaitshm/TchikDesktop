import { eq, Table, AnyColumn } from "drizzle-orm";
import { applyQueryOptions, mergeQueryOptions } from "./drizzle-builder";
import { getLogger } from "@/packages/logger";
import type { FindManyOptions } from "../schemas/types";

const logger = getLogger("Database-Repository");

type DatabaseOrTransaction = any;

export abstract class BaseRepository<
  TTable extends Table,
  TSelect,
  TInsert extends Record<string, unknown>,
  TUpdate extends Record<string, unknown>,
> {
  constructor(
    protected readonly table: TTable,
    protected readonly idColumn: AnyColumn,
    protected readonly entityName: string,
    protected readonly defaultSort: FindManyOptions<TTable>,
    protected readonly db: DatabaseOrTransaction,
  ) {}

  async findMany(filters?: FindManyOptions<TTable>): Promise<TSelect[]> {
    try {
      const query = this.db.select().from(this.table).$dynamic();
      const finalOptions = mergeQueryOptions(filters, this.defaultSort);

      return await applyQueryOptions(query, this.table, finalOptions);
    } catch (error) {
      this.logError("findMany", error, { filters });
      throw new Error(`Failed to fetch ${this.entityName} list.`, {
        cause: error,
      });
    }
  }

  async findById(id: string): Promise<TSelect | null> {
    if (!id) return null;

    try {
      const [result] = await this.db
        .select()
        .from(this.table)
        .where(eq(this.idColumn, id));

      return (result as TSelect) ?? null;
    } catch (error) {
      this.logError("findById", error, { id });
      throw new Error(`Failed to fetch ${this.entityName}.`, { cause: error });
    }
  }

  async create(payload: TInsert): Promise<TSelect> {
    try {
      const [newRecord] = await this.db
        .insert(this.table)
        .values(payload as any)
        .returning();

      return newRecord as TSelect;
    } catch (error) {
      this.logError("create", error, { payload });
      throw new Error(`Creation failed for ${this.entityName}.`, {
        cause: error,
      });
    }
  }

  async update(id: string, updates: TUpdate): Promise<TSelect | null> {
    if (!id) return null;

    try {
      const [updatedRecord] = await this.db
        .update(this.table)
        .set(updates as any)
        .where(eq(this.idColumn, id))
        .returning();

      return (updatedRecord as TSelect) ?? null;
    } catch (error) {
      this.logError("update", error, { id, updates });
      throw new Error(`Update failed for ${this.entityName}.`, {
        cause: error,
      });
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!id) return false;

    try {
      const [deletedRecord] = await this.db
        .delete(this.table)
        .where(eq(this.idColumn, id))
        .returning({ id: this.idColumn });

      return !!deletedRecord;
    } catch (error) {
      this.logError("delete", error, { id });
      throw new Error(`Deletion failed for ${this.entityName}.`, {
        cause: error,
      });
    }
  }

  protected logError(
    op: string,
    error: unknown,
    context: Record<string, unknown>,
  ) {
    logger.error(`${this.entityName}Query.${op} failed`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });
  }
}
