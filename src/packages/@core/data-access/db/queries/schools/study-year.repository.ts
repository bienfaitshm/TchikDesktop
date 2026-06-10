import { getLogger } from "@/packages/logger";
import { db } from "@/packages/@core/data-access/db/config";
import { BaseRepository, type LibSqlClient } from "../base-repository";
import {
  studyYears,
  type TableStudyYear,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";

const YEAR_DEFAULT_SORT: FindManyOptions<TableStudyYear> = {
  orderBy: [
    { column: "startDate", order: "desc" },
    { column: "yearName", order: "asc" },
  ],
};

export class StudyYearRepository extends BaseRepository<
  TableStudyYear,
  LibSqlClient
> {
  constructor(database: LibSqlClient = db) {
    super({
      db: database,
      table: studyYears,
      idColumn: studyYears.yearId,
      entityName: "StudyYear",
      logger: getLogger,
      defaultSort: YEAR_DEFAULT_SORT,
    });
  }
}

export const studyYearRepository = new StudyYearRepository();
