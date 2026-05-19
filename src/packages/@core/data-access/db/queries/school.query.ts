import { db, type TDataBase } from "../config";
import { getLogger } from "@/packages/logger";
import { BaseRepository } from "./base-repository";
import { schools, studyYears } from "../schemas/schema";
import { and, eq, getTableColumns } from "drizzle-orm";

/**
 * Gestion des Écoles
 */
export class SchoolQuery extends BaseRepository<typeof schools, TDataBase> {
  constructor() {
    super({
      db,
      table: schools,
      idColumn: schools.schoolId,
      entityName: "School",
      logger: getLogger,
      defaultSort: [{ column: "name", order: "asc" }] as any,
    });
  }

  /**
   * Récupère les informations détaillées d'une école pour une année donnée.
   * @param schoolId - Identifiant unique de l'école
   * @param yearId - Identifiant de l'année scolaire
   * @returns Promesse contenant les données jointes ou null
   */
  async fetchSchoolInfo(schoolId: string, yearId: string): Promise<any | null> {
    try {
      const [result] = await this.db
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
      this.logError(
        `Erreur lors de la récupération des infos pour l'école ${schoolId}:`,
        error,
        { schoolId, yearId },
      );
      throw new Error("Impossible de récupérer les informations de l'école.");
    }
  }

  static instance = new SchoolQuery();
}

/**
 * Gestion des Années Scolaires
 */
export class StudyYearQuery extends BaseRepository<
  typeof studyYears,
  TDataBase
> {
  constructor() {
    super({
      db,
      table: studyYears,
      idColumn: studyYears.yearId,
      entityName: "StudyYear",
      logger: getLogger,
      defaultSort: [
        { column: "yearName", order: "desc" },
        { column: "startDate", order: "desc" },
      ] as any,
    });
  }

  static instance = new StudyYearQuery();
}

// Export pour utilisation directe (Pattern Singleton)
export const schoolService = SchoolQuery.instance;
export const studyYearService = StudyYearQuery.instance;
