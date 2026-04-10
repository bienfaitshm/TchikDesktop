import { getTableColumns, sql } from "drizzle-orm";
import { users } from "../schemas/schema";
import { db } from "../config";
import { BaseRepository } from "./base-repository";
import type {
  TUser,
  TUserInsert,
  TUserUpdate,
  FindManyOptions,
} from "../schemas/types";

/**
 * Fragment SQL réutilisable pour le nom complet.
 * Gère le cas où middleName est NULL pour éviter les doubles espaces ou les valeurs NULL.
 */
const fullNameSql = sql<string>`
  trim(${users.firstName} || ' ' || COALESCE(${users.middleName} || ' ', '') || ${users.lastName})
`.as("fullName");

/**
 * Tri standard : Nom, Post-nom, Prénom (Case-Insensitive)
 */
// const USER_DEFAULT_SORT: FindManyOptions<typeof users> = {
//   orderBy: [
//     { column: sql`lower(${users.lastName})`, order: "asc" },
//     { column: sql`lower(${users.middleName})`, order: "asc" },
//     { column: sql`lower(${users.firstName})`, order: "asc" },
//   ],
// };

const USER_DEFAULT_SORT = {
  orderBy: [
    { column: sql`lower(${users.lastName})`, order: "asc" },

    { column: sql`lower(${users.middleName})`, order: "asc" },

    { column: sql`lower(${users.firstName})`, order: "asc" },
  ],
} as unknown as FindManyOptions<typeof users>;

export class UserQuery extends BaseRepository<
  typeof users,
  TUser,
  TUserInsert,
  TUserUpdate
> {
  constructor() {
    // On passe l'entité "User" pour les logs et les erreurs
    super(users, users.userId, "User", USER_DEFAULT_SORT);
  }

  protected override getQuerySet(): any {
    return db
      .select({
        ...getTableColumns(this.table),
        fullName: fullNameSql,
      })
      .from(this.table)
      .$dynamic();
  }

  protected override getDetailQuerySet() {
    return this.getQuerySet();
  }

  static readonly instance = new UserQuery();
}

export const userService = UserQuery.instance;
