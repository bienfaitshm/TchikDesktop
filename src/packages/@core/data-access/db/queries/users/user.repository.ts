import { getTableColumns, sql } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  users,
  type TableUser,
  type InsertUser,
  type User,
} from "@/packages/@core/data-access/db/schemas";
import { hashPassword } from "@/packages/@core/data-access/db/crypt";
import {
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";
import { USER_ROLE_ENUM } from "@/packages/@core/data-access/db/options";
import { alias } from "drizzle-orm/sqlite-core/alias";

export type UserDTO = { fullName: string } & Omit<User, "password">;
const DEFAULT_TEMPORARY_PASSWORD = process.env.DEFAULT_TEMP_PASSWORD || "0000";

const userJoinTables = {
  users,
} as const;

export type BaseUserFilters = helpers.FindManyOptions<typeof userJoinTables>;

const USER_DEFAULT_SORT: BaseUserFilters = {
  orderBy: [
    { table: "users", column: "lastName", order: "asc" },
    { table: "users", column: "middleName", order: "asc" },
    { table: "users", column: "firstName", order: "asc" },
  ],
};

/**
 * Repository handling user database operations and option queries.
 */
export class UserRepository
  extends betterSqlite.BaseRepository<
    TableUser,
    TDataBase,
    UserDTO,
    BaseUserFilters
  >
  implements OptionProvider<UserDTO>
{
  static readonly tutorUsers: TableUser = alias(users, "tutor_users");
  static readonly studentUsers: TableUser = alias(users, "student_users");

  static getFullNameColumn(table: TableUser = users) {
    return sql<string>`
    trim(
      coalesce(nullif(trim(${table.lastName}), ''), '') || ' ' ||
      coalesce(nullif(trim(${table.middleName}), ''), '') || ' ' ||
      coalesce(nullif(trim(${table.firstName}), ''), '')
    )
  `.as("fullName");
  }

  /**
   * Returns selectable user table columns excluding the password field with a concatenated fullName alias.
   * @returns An object representing mapped visible columns for SQL selection.
   */
  static getVisibleColumns(table: TableUser = users) {
    const { password, ...userFields } = getTableColumns(table);
    return {
      ...userFields,
      fullName: UserRepository.getFullNameColumn(table),
    };
  }

  /**
   * Initializes a new instance of UserRepository.
   * @param database - Optional database connection client instance.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: users,
      idColumn: users.userId,
      baseTableName: "User",
      logger: getLogger,
      joinTables: userJoinTables,
      defaultFilters: USER_DEFAULT_SORT,
    });
  }

  /**
   * Builds the base dynamic query set selecting non-sensitive user attributes.
   * @param tx - Optional database transaction instance.
   * @returns Dynamic query builder targeting the users table.
   */
  protected override getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select(UserRepository.getVisibleColumns())
      .from(this.table)
      .$dynamic();
  }

  /**
   * Retrieves user records filtered for selection components like drop-downs and comboboxes.
   * @param filters - Filter options to apply when fetching records.
   * @returns Array of matching user DTO objects.
   */
  fetchOptions(filters: BaseUserFilters): UserDTO[] {
    return this.findMany(filters);
  }

  /**
   * Creates a new user record with a hashed default temporary password.
   * @param value - User insertion payload excluding the password field.
   * @param tx - Optional database transaction instance.
   * @returns A promise resolving to the created user entity.
   */
  createUser(value: Omit<InsertUser, "password">, tx?: TDataBase): UserDTO {
    const passwordHash = hashPassword(DEFAULT_TEMPORARY_PASSWORD);
    return this.create({ ...value, password: passwordHash }, tx);
  }

  /**
   * Creates a user entity assigned to a specific system role.
   * @param value - User insertion payload excluding password and role fields.
   * @param role - Target user role from USER_ROLE_ENUM.
   * @param tx - Optional database transaction instance.
   * @returns A promise resolving to the created user entity.
   */
  createUserWithRole(
    value: Omit<InsertUser, "password" | "role">,
    role: USER_ROLE_ENUM,
    tx?: TDataBase,
  ): UserDTO {
    return this.createUser({ ...value, role }, tx);
  }

  /**
   * Creates a user entity assigned to the STAFF role.
   * @param value - User insertion payload excluding password and role fields.
   * @param tx - Optional database transaction instance.
   * @returns A promise resolving to the created staff user entity.
   */
  createStaff(
    value: Omit<InsertUser, "password" | "role">,
    tx?: TDataBase,
  ): UserDTO {
    return this.createUserWithRole(value, USER_ROLE_ENUM.STAFF, tx);
  }

  /**
   * Creates a user entity assigned to the PROMOTER role.
   * @param value - User insertion payload excluding password and role fields.
   * @param tx - Optional database transaction instance.
   * @returns A promise resolving to the created promoter user entity.
   */
  createPromoter(
    value: Omit<InsertUser, "password" | "role">,
    tx?: TDataBase,
  ): UserDTO {
    return this.createUserWithRole(value, USER_ROLE_ENUM.PROMOTER, tx);
  }

  /**
   * Creates a user entity assigned to the ADMIN role.
   * @param value - User insertion payload excluding password and role fields.
   * @param tx - Optional database transaction instance.
   * @returns A promise resolving to the created admin user entity.
   */
  createAdmin(
    value: Omit<InsertUser, "password" | "role">,
    tx?: TDataBase,
  ): UserDTO {
    return this.createUserWithRole(value, USER_ROLE_ENUM.ADMIN, tx);
  }

  /**
   * Creates a user entity assigned to the STUDENT role.
   * @param value - User insertion payload excluding password and role fields.
   * @param tx - Optional database transaction instance.
   * @returns A promise resolving to the created student user entity.
   */
  createStudent(
    value: Omit<InsertUser, "password" | "role">,
    tx?: TDataBase,
  ): UserDTO {
    return this.createUserWithRole(value, USER_ROLE_ENUM.STUDENT, tx);
  }

  /**
   * Creates a user entity assigned to the TUTOR role.
   * @param value - User insertion payload excluding password and role fields.
   * @param tx - Optional database transaction instance.
   * @returns A promise resolving to the created tutor user entity.
   */
  createTutor(
    value: Omit<InsertUser, "password" | "role">,
    tx?: TDataBase,
  ): UserDTO {
    return this.createUserWithRole(value, USER_ROLE_ENUM.TUTOR, tx);
  }
}
