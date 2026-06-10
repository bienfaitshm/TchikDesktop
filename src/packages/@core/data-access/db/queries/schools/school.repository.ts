import { and, eq, getTableColumns } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { db } from "@/packages/@core/data-access/db/config";
import {
  schools,
  studyYears,
  type TableSchool,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import { BaseRepository, type LibSqlClient } from "../base-repository";

const SCHOOL_DEFAULT_SORT: FindManyOptions<TableSchool> = {
  orderBy: [{ column: "name", order: "asc" }],
};

export class SchoolRepository extends BaseRepository<
  TableSchool,
  LibSqlClient
> {
  constructor(database: LibSqlClient = db) {
    super({
      db: database,
      table: schools,
      idColumn: schools.schoolId,
      entityName: "School",
      logger: getLogger,
      defaultSort: SCHOOL_DEFAULT_SORT,
    });
  }

  /**
   * Récupère les informations détaillées d'une école pour une année donnée.
   * Supporte désormais nativement le contexte de transaction 'tx'.
   */
  async fetchSchoolInfo(
    schoolId: string,
    yearId: string,
    tx?: LibSqlClient,
  ): Promise<any | null> {
    try {
      const client = this.getClient(tx);

      const [result] = await client
        .select({
          ...getTableColumns(this.table),
          studyYear: getTableColumns(studyYears),
        })
        .from(this.table)
        .innerJoin(studyYears, eq(this.table.schoolId, studyYears.schoolId))
        .where(
          and(eq(this.table.schoolId, schoolId), eq(studyYears.yearId, yearId)),
        )
        .limit(1);

      return result || null;
    } catch (error) {
      this.logError(`fetchSchoolInfo failed for school ${schoolId}`, error, {
        schoolId,
        yearId,
      });
      throw new Error(
        "Impossible de récupérer les informations de l'école spécifiée.",
      );
    }
  }
}

export const schoolRepository = new SchoolRepository();
