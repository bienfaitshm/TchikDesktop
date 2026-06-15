import { getTableColumns, sql, or, like, eq, and } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import {
  users,
  type TableUser,
  type InsertUser,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { db } from "@/packages/@core/data-access/db/config";
import { hashPassword } from "@/packages/@core/data-access/db/crypt";
import { applyQueryOptions } from "@/packages/@core/data-access/db/queries/drizzle-builder";
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
    trim(
      coalesce(nullif(trim(${users.lastName}), ''), '') || ' ' ||
      coalesce(nullif(trim(${users.middleName}), ''), '') || ' ' ||
      coalesce(nullif(trim(${users.firstName}), ''), '')
    )
  `.as("fullName");

  /**
   * Retourne les colonnes sélectionnables de l'utilisateur sans le mot de passe.
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
    const cleanName = name.trim();
    if (!cleanName) return [];

    const searchPattern = `%${cleanName.toLowerCase()}%`;
    const queryset = this.getQuerySet()
      .where(
        and(
          eq(this.table.schoolId, schoolId),
          or(
            like(sql`lower(${this.table.lastName})`, searchPattern),
            like(sql`lower(${this.table.middleName})`, searchPattern),
            like(sql`lower(${this.table.firstName})`, searchPattern),
          ),
        ),
      )
      .limit(LIMIT_SEARCH_VALUE)
      .$dynamic();
    return applyQueryOptions(queryset, this.table, USER_DEFAULT_SORT);
  }

  /**
   * Crée un utilisateur en injectant un hash de mot de passe temporaire ou par défaut.
   */
  async createUser(value: Omit<InsertUser, "password">, tx?: LibSqlClient) {
    const passwordHash = await hashPassword("0000");
    return this.create({ ...value, password: passwordHash }, tx);
  }
}

export const userRepository = new UserRepository();
