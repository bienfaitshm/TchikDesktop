import { getTableColumns, sql } from "drizzle-orm";
import { users } from "../schemas/schema";
import { db, type TDataBase } from "../config";
import { getLogger } from "@/packages/logger";
import { BaseRepository } from "./base-repository";
import type { FindManyOptions } from "../schemas/types";

/**
 * Fragment SQL réutilisable pour le nom complet.
 * Gère le cas où middleName est NULL pour éviter les doubles espaces ou les valeurs NULL.
 */
export const fullNameSql = sql<string>`
  trim(${users.lastName} || ' ' || COALESCE(${users.middleName} || ' ', '') || ${users.firstName})
`.as("fullName");

export const getVisibleUserColumns = () => {
  const { password, ...userFields } = getTableColumns(users);
  return { ...userFields, fullName: fullNameSql };
};

const USER_DEFAULT_SORT = {
  orderBy: [
    { column: sql`lower(${users.lastName})`, order: "asc" },

    { column: sql`lower(${users.middleName})`, order: "asc" },

    { column: sql`lower(${users.firstName})`, order: "asc" },
  ],
} as unknown as FindManyOptions<typeof users>;

export class UserQuery extends BaseRepository<typeof users, TDataBase> {
  constructor() {
    super({
      db,
      table: users,
      idColumn: users.userId,
      entityName: "User",
      logger: getLogger,
      defaultSort: USER_DEFAULT_SORT,
    });
  }

  protected override getQuerySet(): any {
    return db.select(getVisibleUserColumns()).from(this.table).$dynamic();
  }

  static readonly instance = new UserQuery();
}

export const userService = UserQuery.instance;
