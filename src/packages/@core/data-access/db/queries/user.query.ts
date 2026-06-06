import { getTableColumns, sql } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { users } from "../schemas/schema";
import { db, type TDataBase } from "../config";
import { BaseRepository } from "./base-repository";
import type { FindManyOptions } from "../schemas/types";

type TUser = typeof users;

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

const USER_DEFAULT_SORT: FindManyOptions<TUser> = {
  orderBy: [
    { column: "lastName", order: "asc" },

    { column: "middleName", order: "asc" },

    { column: "firstName", order: "asc" },
  ],
};

export class UserQuery extends BaseRepository<TUser, TDataBase> {
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
