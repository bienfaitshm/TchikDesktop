import { eq, Table } from "drizzle-orm";
import { db } from "../config";
import { applyQueryOptions, mergeQueryOptions } from "./drizzle-builder";
import { getLogger } from "@/packages/logger";
import type { FindManyOptions } from "../schemas/types";

const logger = getLogger("Database-Repository");

export abstract class BaseRepository<
  TTable extends Table,
  TSelect,
  TInsert,
  TUpdate,
> {
  constructor(
    protected readonly table: TTable,
    protected readonly idColumn: any,
    protected readonly entityName: string,
    protected readonly defaultSort: FindManyOptions<TTable>,
  ) {}

  async findMany(filters?: FindManyOptions<TTable>): Promise<TSelect[]> {
    try {
      const query = db.select().from(this.table).$dynamic();
      const finalOptions = mergeQueryOptions(filters, this.defaultSort);
      return await applyQueryOptions(query, this.table, finalOptions);
    } catch (error) {
      this.logError("findMany", error, { filters });
      throw new Error(`Failed to fetch ${this.entityName} list.`);
    }
  }

  async findById(id: string): Promise<TSelect | null> {
    if (!id) return null;
    try {
      const [results] = await db
        .select()
        .from(this.table)
        .where(eq(this.idColumn, id));
      return (results as TSelect) ?? null;
    } catch (error) {
      this.logError("findById", error, { id });
      throw new Error(`Failed to fetch ${this.entityName}.`);
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
      throw error;
    }
  }

  async update(id: string, updates: TUpdate): Promise<TSelect | null> {
    if (!id) return null;
    try {
      const [updated] = await db
        .update(this.table)
        .set({ ...(updates as any), updatedAt: new Date() })
        .where(eq(this.idColumn, id))
        .returning();
      return (updated as TSelect) ?? null;
    } catch (error) {
      this.logError("update", error, { id, updates });
      throw new Error(`Update failed for ${this.entityName}.`);
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!id) return false;
    try {
      const result = await db
        .delete(this.table)
        .where(eq(this.idColumn, id))
        .returning({ id: this.idColumn });
      return result.length > 0;
    } catch (error) {
      this.logError("delete", error, { id });
      throw new Error(`Deletion failed for ${this.entityName}.`);
    }
  }

  protected logError(op: string, error: any, context: any) {
    logger.error(`${this.entityName}Query.${op} failed`, {
      error: error instanceof Error ? error.message : error,
      ...context,
    });
  }
}
