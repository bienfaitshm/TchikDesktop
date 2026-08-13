import { getLogger } from "@/packages/logger";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  tutors,
  users,
  type TableTutor,
  type Tutor,
} from "@/packages/@core/data-access/db/schemas";
import {
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";
import { eq, getTableColumns } from "drizzle-orm";
import { type UserDTO, UserRepository } from "../users";

export type TutorDTO = Tutor & { user: UserDTO };

const tutorJoinTables = {
  tutors,
  users,
} as const;

export type BaseTutorFilters = helpers.FindManyOptions<typeof tutorJoinTables>;

const TUTORS_DEFAULT_SORT: BaseTutorFilters = {
  orderBy: [
    { table: "users", column: "lastName", order: "asc" },
    { table: "users", column: "middleName", order: "asc" },
    { table: "users", column: "firstName", order: "asc" },
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
      baseTableName: "tutor",
      logger: getLogger,
      joinTables: tutorJoinTables,
      defaultFilters: TUTORS_DEFAULT_SORT,
    });
  }

  /**
   * Builds the base dynamic query set selecting non-sensitive tutor attributes.
   * @param tx - Optional database transaction instance.
   * @returns Dynamic query builder targeting the tutors table.
   */
  protected override getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select({
        ...getTableColumns(this.table),
        user: UserRepository.getVisibleColumns(),
      })
      .from(this.table)
      .leftJoin(users, eq(this.table.userId, users.userId))
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
