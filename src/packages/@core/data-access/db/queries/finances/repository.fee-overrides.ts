import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  feeOverrides,
  feeTypes,
  classrooms,
  classroomEnrollments,
  users,
  type TableFeeOverride,
  type FeeOverride,
  type FeeType,
  type Classroom,
  type ClassroomEnrollment,
} from "@/packages/@core/data-access/db/schemas";
import {
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";
import { eq, getTableColumns } from "drizzle-orm";
import { UserDTO, UserRepository } from "../users";

const TABLES = {
  feeOverrides,
  feeTypes,
  classrooms,
  classroomEnrollments,
  users,
} as const;

export type BaseFeeOverrideFilters = helpers.FindManyOptions<typeof TABLES>;

export type FeeOverrideDTO = FeeOverride & {
  feeType: FeeType;
  classroom: Classroom | null;
  enrollment: ClassroomEnrollment | null;
  student: UserDTO | null;
};

const DEFAULT_SORT: BaseFeeOverrideFilters = {
  orderBy: [{ table: "feeOverrides", column: "createdAt", order: "desc" }],
};

/**
 * Data access repository for managing fee override entities and their relations.
 */
export class FeeOverrideRepository
  extends betterSqlite.BaseRepository<
    TableFeeOverride,
    TDataBase,
    FeeOverrideDTO,
    BaseFeeOverrideFilters
  >
  implements OptionProvider<FeeOverrideDTO, BaseFeeOverrideFilters>
{
  /**
   * Initializes a new instance of the FeeOverrideRepository class.
   * @param database - Optional database connection or transaction instance.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: feeOverrides,
      idColumn: feeOverrides.feeOverrideId,
      baseTableName: "feeOverrides",
      logger: getLogger,
      defaultFilters: DEFAULT_SORT,
      joinTables: TABLES,
    });
  }

  fetchOptions(filters?: BaseFeeOverrideFilters) {
    this.logger.info(
      "[FeeConfigurationRepository] Fetching fee configuration options.",
    );
    return this.findMany(filters);
  }

  /**
   * Constructs the selection columns mapping required for building the FeeOverrideDTO.
   * @param table - The primary fee overrides table schema.
   * @returns An object containing table column definitions for primary and joined entities.
   */
  static getDTOColumns(table: TableFeeOverride) {
    return {
      ...getTableColumns(table),
      feeType: getTableColumns(feeTypes),
      classroom: getTableColumns(classrooms),
      enrollment: getTableColumns(classroomEnrollments),
      student: UserRepository.getVisibleColumns(),
    };
  }

  /**
   * Constructs the base query set with necessary joins for fetching fee overrides.
   * @param tx - Optional database transaction instance.
   * @returns Dynamic query builder populated with required inner and left joins.
   */
  protected getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select(FeeOverrideRepository.getDTOColumns(this.table))
      .from(this.table)
      .innerJoin(feeTypes, eq(this.table.feeTypeId, feeTypes.feeTypeId))
      .leftJoin(classrooms, eq(this.table.classId, classrooms.classId))
      .leftJoin(
        classroomEnrollments,
        eq(this.table.enrollmentId, classroomEnrollments.enrollmentId),
      )
      .leftJoin(users, eq(classroomEnrollments.studentId, users.userId))
      .$dynamic();
  }
}

export const feeOverrideRepository = new FeeOverrideRepository(db);
