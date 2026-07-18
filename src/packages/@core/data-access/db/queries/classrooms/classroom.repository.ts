import { eq, getTableColumns, type Table } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  classrooms,
  options,
  classroomEnrollments,
  seatingAssignments,
  type TableClassroom,
  type Classroom,
  type Option,
} from "@/packages/@core/data-access/db/schemas";
import {
  DatabaseError,
  helpers,
  betterSqlite,
} from "@/packages/drizzle-queries";
import type { OptionProvider } from "@/packages/@core/data-access/db/queries/select-option.transformer";

/**
 * Data Transfer Object representing a Classroom and its associated Option.
 */
export type ClassroomDTO = Classroom & {
  option: Option | null;
};

/**
 * Standard table dictionary used for basic classroom queries.
 */
export const JOINED_TABLES = {
  classrooms,
  options,
} as const;

/**
 * Extended table dictionary used for detailed classroom hierarchy queries.
 */
export const JOINED_TABLES_DETAIL = {
  classrooms,
  classroomEnrollments,
  seatingAssignments,
} as const;

/**
 * Filter configuration type for standard classroom lists.
 */
export type BaseClassroomFilters = helpers.FindManyOptions<
  typeof JOINED_TABLES
>;

/**
 * Filter configuration type for complex classroom relational queries.
 */
export type GetClassroomsOptions = helpers.FindManyOptions<
  typeof JOINED_TABLES_DETAIL
>;

const CLASSROOM_DEFAULT_SORT: helpers.AdvancedFilters<typeof JOINED_TABLES> =
  {};

/**
 * Repository handling database operations for Classroom entities.
 * Extends the BaseRepository tailored for SQLite and implements OptionProvider.
 */
export class ClassroomRepository
  extends betterSqlite.BaseRepository<TableClassroom, TDataBase, ClassroomDTO>
  implements OptionProvider<ClassroomDTO>
{
  /**
   * Initializes the repository with schema mappings, database client, and loggers.
   */
  constructor() {
    super({
      db,
      table: classrooms,
      idColumn: classrooms.classId,
      baseTableName: "Classroom",
      logger: getLogger,
      fixedFilters: CLASSROOM_DEFAULT_SORT,
    });
  }

  /**
   * Returns the schema mapping dictionary used by dynamic query builders.
   * @returns A record of Drizzle tables.
   */
  protected getJoinTable(): Record<string, Table> {
    return JOINED_TABLES;
  }

  /**
   * Constructs the foundational dynamic query builder with a predefined join to options.
   * @param tx - Optional database transaction client.
   * @returns The dynamic select query builder instance.
   */
  protected override getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select({
        ...getTableColumns(this.table),
        option: getTableColumns(options),
      })
      .from(this.table)
      .leftJoin(options, eq(classrooms.optionId, options.optionId))
      .$dynamic();
  }

  /**
   * Retrieves a filtered collection of classrooms formatted as DTOs.
   * @param filters - Dynamic parameters to filter the result set.
   * @param tx - Optional database transaction client.
   * @returns A promise resolving to an array of ClassroomDTO.
   */
  public async fetchOptions(
    filters: BaseClassroomFilters,
    tx: TDataBase = this.db,
  ): Promise<ClassroomDTO[]> {
    return this.findMany(filters, tx);
  }

  /**
   * Fetches classrooms along with their enrolled students via Drizzle's Relational API.
   * @param filters - Query parameters applied to the root classroom table.
   * @param tx - Optional database transaction client.
   * @returns A promise resolving to classrooms and their associated students.
   */
  public async findClassroomsWithStudents(
    filters: GetClassroomsOptions = {},
    tx: TDataBase = this.db,
  ) {
    try {
      const client = this.getClient(tx);

      return await client.query.classrooms.findMany({
        ...helpers.extractQueryPayload(JOINED_TABLES_DETAIL, filters),
        with: {
          enrollments: {
            with: { student: true },
          },
        },
      });
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Error retrieving classrooms and their associated students.",
      );
      this.logError("findClassroomsWithStudents", dbError, {
        filters,
      });
      throw dbError;
    }
  }

  /**
   * Fetches the complete classroom structural hierarchy, including students and seating assignments.
   * @param filters - Query parameters applied to the root classroom table.
   * @param tx - Optional database transaction client.
   * @returns A promise resolving to classrooms containing their enrollments and seating assignments.
   */
  public async findClassroomsWithStudentAndAssignments(
    filters: GetClassroomsOptions = {},
    tx: TDataBase = this.db,
  ) {
    try {
      const client = this.getClient(tx);

      return await client.query.classrooms.findMany({
        ...helpers.extractQueryPayload(JOINED_TABLES_DETAIL, filters),
        with: {
          enrollments: {
            with: {
              student: true,
              seatingAssignments: {
                with: { localroom: true },
              },
            },
          },
        },
      });
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Error retrieving the complete seating assignment hierarchy.",
      );
      this.logError("findClassroomsWithStudentAndAssignments", dbError, {
        filters,
      });
      throw dbError;
    }
  }
}
