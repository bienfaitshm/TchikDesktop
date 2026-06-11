import { getTableColumns, sql, or, ilike, eq } from "drizzle-orm";

import { getLogger } from "@/packages/logger";
import {
  users,
  type TableUser,
  type InsertUser,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { db } from "@/packages/@core/data-access/db/config";
import { BaseRepository, type LibSqlClient } from "../base-repository";

const LIMIT_SEARCH_VALUE = 10;

const USER_DEFAULT_SORT: FindManyOptions<TableUser> = {
  orderBy: [
    { column: "lastName", order: "asc" },
    { column: "middleName", order: "asc" },
    { column: "firstName", order: "asc" },
  ],
};

export class UserRepository extends BaseRepository<TableUser, LibSqlClient> {
  static readonly fullNameSql = sql<string>`
  concat_ws(' ', 
    nullif(trim(${users.lastName}), ''), 
    nullif(trim(${users.middleName}), ''), 
    nullif(trim(${users.firstName}), '')
  )
`.as("fullName");

  /**
   * Retourne les colonnes sélectionnables de l'utilisateur sans le mot de passe.
   * Changé en méthode classique static () pour une meilleure DX et évolutivité.
   */
  static getVisibleColumns() {
    const { password, ...userFields } = getTableColumns(users);
    return {
      ...userFields,
      fullName: UserRepository.fullNameSql,
    };
  }

  constructor(database: LibSqlClient = db) {
    super({
      db: database,
      table: users,
      idColumn: users.userId,
      entityName: "User",
      logger: getLogger,
      defaultSort: USER_DEFAULT_SORT,
    });
  }

  protected override getQuerySet(tx?: LibSqlClient): any {
    return this.getClient(tx)
      .select(UserRepository.getVisibleColumns())
      .from(this.table)
      .$dynamic();
  }

  async searchUser({ name, schoolId }: { name: string; schoolId: string }) {
    const searchPattern = `%${name}%`;
    return this.getQuerySet()
      .where(
        eq(this.table.schoolId, schoolId),
        or(
          ilike(this.table.firstName, searchPattern),
          ilike(this.table.middleName, searchPattern),
          ilike(this.table.lastName, searchPattern),
        ),
      )
      .limit(LIMIT_SEARCH_VALUE);
  }

  /**
   * Crée un utilisateur en injectant un hash de mot de passe temporaire ou par défaut.
   */
  async createUser(value: Omit<InsertUser, "password">, tx?: LibSqlClient) {
    // Dans un vrai flux de production, ce mot de passe devrait être hashé de manière asynchrone en amont
    const passwordHash = "DEFAULT_HASH_PASSWORD";

    return this.create({ ...value, password: passwordHash }, tx);
  }
}

export const userRepository = new UserRepository();
