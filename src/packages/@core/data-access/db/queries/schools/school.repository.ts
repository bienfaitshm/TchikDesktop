import { getLogger } from "@/packages/logger";
import { db, TDataBase } from "@/packages/@core/data-access/db/config";
import {
  schools,
  type TableSchool,
} from "@/packages/@core/data-access/db/schemas";
import { betterSqlite, helpers } from "@/packages/drizzle-queries";

const _schoolJoinTables = {
  schools,
} as const;
export type BaseSchoolFilters = helpers.FindManyOptions<
  typeof _schoolJoinTables
>;

const SCHOOL_DEFAULT_SORT: BaseSchoolFilters = {
  orderBy: [{ table: "schools", column: "name", order: "asc" }],
};

export class SchoolRepository extends betterSqlite.BaseRepository<
  TableSchool,
  TDataBase,
  BaseSchoolFilters
> {
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: schools,
      idColumn: schools.schoolId,
      baseTableName: "schools",
      logger: getLogger,
      defaultFilters: SCHOOL_DEFAULT_SORT,
      joinTables: _schoolJoinTables,
    });
  }
}

export const schoolRepository = new SchoolRepository();
