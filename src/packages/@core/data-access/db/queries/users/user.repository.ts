import { getTableColumns, sql } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { db } from "@/packages/@core/data-access/db/config";
import {
  users,
  type TableUser,
  type InsertUser,
  type User,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { hashPassword } from "@/packages/@core/data-access/db/crypt";
import {
  applyQueryOptions,
  mergeQueryOptions,
} from "@/packages/@core/data-access/db/queries/drizzle-builder";
import type {
  OptionProvider,
  SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import { createSQLiteSearchFilter } from "../drizzle-utility";
import { BaseRepository, type LibSqlClient } from "../base-repository";

export type UserDTO = { fullName?: string } & Omit<User, "password">;
export type BaseUserFilters = Partial<FindManyOptions<TableUser>>;

const DEFAULT_LIMIT_VALUE = 50;

const USER_DEFAULT_SORT: FindManyOptions<TableUser> = {
  orderBy: [
    { column: "lastName", order: "asc" },
    { column: "middleName", order: "asc" },
    { column: "firstName", order: "asc" },
  ],
};

export class UserRepository
  extends BaseRepository<TableUser, LibSqlClient>
  implements OptionProvider<UserDTO>
{
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

  /**
   * Récupère les utilisateurs pour les composants Select / Combobox.
   * Alterne intelligemment entre recherche textuelle filtrée et données par défaut.
   */
  async fetchOptions({
    filters,
    search,
  }: SearchOptions<BaseUserFilters> = {}): Promise<UserDTO[]> {
    try {
      let query = this.getQuerySet();

      const searchFilter = createSQLiteSearchFilter(
        [this.table.lastName, this.table.middleName, this.table.firstName],
        search,
      );

      if (searchFilter) {
        const mergedOptions = mergeQueryOptions(filters, USER_DEFAULT_SORT);
        query = query.where(searchFilter);

        return (await applyQueryOptions(
          query,
          this.table,
          mergedOptions,
        )) as unknown as UserDTO[];
      }

      const defaultOptions = mergeQueryOptions(
        { limit: DEFAULT_LIMIT_VALUE, ...filters },
        USER_DEFAULT_SORT,
      );

      return (await applyQueryOptions(
        query,
        this.table,
        defaultOptions,
      )) as unknown as UserDTO[];
    } catch (error) {
      this.logError("fetchOptions", error, { filters, search });
      throw new Error(
        "Erreur lors de la récupération des options d'utilisateurs.",
      );
    }
  }

  /**
   * Crée un utilisateur en injectant un hash de mot de passe temporaire ou par défaut.
   */
  async createUser(value: Omit<InsertUser, "password">, tx?: LibSqlClient) {
    const passwordHash = await hashPassword("0000");
    return this.create({ ...value, password: passwordHash }, tx);
  }
}
