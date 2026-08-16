import { getLogger } from "@/packages/logger";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  tutors,
  type TableTutor,
  type Tutor,
} from "@/packages/@core/data-access/db/schemas";
import {
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";
import { eq, getTableColumns, Table } from "drizzle-orm";
import { type UserDTO, UserRepository } from "../users";

export type TutorDTO = Tutor & UserDTO;

const tutorJoinTables = {
  tutors,
  tutorUsers: UserRepository.tutorUsers,
} as const;

export type BaseTutorFilters = helpers.FindManyOptions<typeof tutorJoinTables>;

const TUTORS_DEFAULT_SORT: BaseTutorFilters = {
  orderBy: [
    { table: "tutorUsers", column: "lastName", order: "asc" },
    { table: "tutorUsers", column: "middleName", order: "asc" },
    { table: "tutorUsers", column: "firstName", order: "asc" },
  ],
};

/**
 * Repository handling tutor database operations and option queries.
 */
export class TutorRepository
  extends betterSqlite.BaseRepository<
    TableTutor,
    TDataBase,
    TutorDTO,
    BaseTutorFilters
  >
  implements OptionProvider<TutorDTO>
{
  /**
   * Initializes a new instance of tutorRepository.
   * @param database - Optional database connection client instance.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: tutors,
      idColumn: tutors.tutorId,
      baseTableName: "tutors",
      logger: getLogger,
      joinTables: tutorJoinTables,
      defaultFilters: TUTORS_DEFAULT_SORT,
    });
  }

  /**
   * getTutorDTOFields
   */
  static getDTOColumns(table: Table = tutors) {
    return {
      ...UserRepository.getVisibleColumns(UserRepository.tutorUsers),
      ...getTableColumns(table),
    };
  }

  /**
   * Builds the base dynamic query set selecting non-sensitive tutor attributes.
   * @param tx - Optional database transaction instance.
   * @returns Dynamic query builder targeting the tutors table.
   */
  protected override getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select(TutorRepository.getDTOColumns(this.table))
      .from(this.table)
      .leftJoin(
        UserRepository.tutorUsers,
        eq(this.table.userId, UserRepository.tutorUsers.userId),
      )
      .$dynamic();
  }

  /**
   * Retrieves tutor records filtered for selection components like drop-downs and comboboxes.
   * @param filters - Filter options to apply when fetching records.
   * @returns Array of matching tutor DTO objects.
   */
  fetchOptions(filters: BaseTutorFilters): TutorDTO[] {
    return this.findMany(filters);
  }
}
