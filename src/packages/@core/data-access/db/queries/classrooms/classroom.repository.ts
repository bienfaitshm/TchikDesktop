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
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";

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

const CLASSROOM_DEFAULT_SORT: BaseClassroomFilters = {
  orderBy: [{ table: "classrooms", column: "identifier", order: "asc" }],
};

export function extractClassroomFiltersQueryPayload(
  filters: BaseClassroomFilters,
) {
  return helpers.extractQueryPayload(JOINED_TABLES, filters);
}

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
      defaultFilters: CLASSROOM_DEFAULT_SORT,
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
}
