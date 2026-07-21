import { getLogger } from "@/packages/logger";
import { db, TDataBase } from "@/packages/@core/data-access/db/config";
import {
  studyYears,
  type TableStudyYear,
} from "@/packages/@core/data-access/db/schemas";
import { betterSqlite, helpers } from "@/packages/drizzle-queries";

const _yearJoinTables = {
  studyYears,
} as const;

export type BaseYEarStudyFilters = helpers.FindManyOptions<
  typeof _yearJoinTables
>;
const YEAR_DEFAULT_SORT: BaseYEarStudyFilters = {
  orderBy: [
    { table: "studyYears", column: "startDate", order: "desc" },
    { table: "studyYears", column: "yearName", order: "asc" },
  ],
};

export class StudyYearRepository extends betterSqlite.BaseRepository<
  TableStudyYear,
  TDataBase
> {
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: studyYears,
      idColumn: studyYears.yearId,
      baseTableName: "studyYears",
      logger: getLogger,
      defaultFilters: YEAR_DEFAULT_SORT,
      joinTables: _yearJoinTables,
    });
  }
}

export const studyYearRepository = new StudyYearRepository();
