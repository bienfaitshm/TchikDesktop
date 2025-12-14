//school.query.ts
import {
  School,
  StudyYear,
  StudyYearAttributesInsert,
  StudyYearAttributes,
  SchoolAttributes,
  SchoolAttributesInsert,
  pruneUndefined,
} from "@/packages/@core/data-access/db";

import { Sequelize, type WhereOptions } from "sequelize";

const logger = {
  info: (msg: string, meta?: object) => console.info(`[INFO] ${msg}`, meta),
  error: (msg: string, error?: unknown) =>
    console.error(`[ERROR] ${msg}`, error),
  warn: (msg: string, meta?: object) => console.warn(`[WARN] ${msg}`, meta),
};

/**
 * Query gérant la logique métier pour les Écoles et les Années Scolaires.
 * Conçu pour être stateless et hautement testable.
 */
export class SchoolQuery {
  // ===========================================================================
  //  SCHOOL OPERATIONS
  // ===========================================================================

  /**
   * Récupère une liste d'écoles filtrée.
   *
   * @param params - Critères de filtrage (ex: schoolId, name). Les valeurs undefined sont ignorées.
   * @returns Liste des écoles correspondant aux critères.
   * @throws {Error} Si la base de données est inaccessible.
   */
  static async getSchools(
    params: Partial<SchoolAttributesInsert & { schoolId: string }> = {}
  ): Promise<SchoolAttributes[]> {
    const whereClause = pruneUndefined(
      params
    ) as WhereOptions<SchoolAttributes>;

    try {
      const schools = await School.findAll({
        where: whereClause,
        order: [[Sequelize.fn("LOWER", Sequelize.col("name")), "ASC"]],
      });
      return schools.map((s) => s.toJSON());
    } catch (error) {
      logger.error("SchoolQuery.findSchools: DB Error", error);
      throw new Error("Query unavailable: Unable to retrieve schools.");
    }
  }

  /**
   * Récupère une école par son ID.
   *
   * @param schoolId - UUID de l'école.
   * @returns L'objet école ou null si introuvable.
   */
  static async getSchoolById(
    schoolId: string
  ): Promise<SchoolAttributes | null> {
    if (!schoolId) {
      logger.warn("SchoolQuery.getSchoolById: Called with empty ID");
      return null;
    }

    try {
      const school = await School.findByPk(schoolId);
      return school ? school.toJSON() : null;
    } catch (error) {
      logger.error(
        `SchoolQuery.getSchoolById: Error for ID ${schoolId}`,
        error
      );
      throw new Error("Query unavailable: Unable to fetch school details.");
    }
  }

  /**
   * Crée une nouvelle école.
   *
   * @param payload - Données de création.
   * @returns L'école créée.
   */
  static async createSchool(
    payload: SchoolAttributesInsert
  ): Promise<SchoolAttributes> {
    try {
      const school = await School.create(payload);
      logger.info(`School created: ${school.schoolId}`);
      return school.toJSON();
    } catch (error) {
      logger.error("SchoolQuery.createSchool: Creation failed", error);
      throw error; // On relance l'erreur pour que le contrôleur gère les erreurs de validation (400) vs serveur (500)
    }
  }

  /**
   * Met à jour une école existante.
   *
   * @param schoolId - ID de l'école cible.
   * @param updates - Champs à modifier.
   * @returns L'école mise à jour ou null si l'ID n'existe pas.
   */
  static async updateSchool(
    schoolId: string,
    updates: Partial<SchoolAttributesInsert>
  ): Promise<SchoolAttributes | null> {
    if (!schoolId) return null;

    try {
      const school = await School.findByPk(schoolId);
      if (!school) {
        logger.warn(`SchoolQuery.updateSchool: ID ${schoolId} not found`);
        return null;
      }

      const updatedSchool = await school.update(updates);
      return updatedSchool.toJSON();
    } catch (error) {
      logger.error(
        `SchoolQuery.updateSchool: Error updating ${schoolId}`,
        error
      );
      throw new Error("Query unavailable: Update failed.");
    }
  }

  /**
   * Supprime une école (Soft ou Hard delete selon la config modèle, ici Hard).
   */
  static async deleteSchool(schoolId: string): Promise<boolean> {
    if (!schoolId) return false;

    try {
      const count = await School.destroy({ where: { schoolId } });
      return count > 0;
    } catch (error) {
      logger.error(
        `SchoolQuery.deleteSchool: Error deleting ${schoolId}`,
        error
      );
      throw new Error("Query error: Delete operation failed.");
    }
  }

  // ===========================================================================
  //  STUDY YEAR OPERATIONS
  // ===========================================================================

  /**
   * Liste les années scolaires pour une école donnée.
   */
  static async getStudyYears(
    schoolId: string,
    filters: Partial<StudyYearAttributesInsert> = {}
  ): Promise<StudyYearAttributes[]> {
    if (!schoolId) {
      throw new Error(
        "Validation Error: schoolId is required to fetch study years."
      );
    }

    const whereClause = pruneUndefined({
      schoolId,
      ...filters,
    }) as WhereOptions<StudyYearAttributes>;

    try {
      const years = await StudyYear.findAll({
        where: whereClause,
        order: [
          [Sequelize.fn("LOWER", Sequelize.col("year_name")), "ASC"],
          ["startDate", "ASC"],
        ],
      });
      return years.map((y) => y.toJSON());
    } catch (error) {
      logger.error(
        `SchoolQuery.getStudyYears: Error for school ${schoolId}`,
        error
      );
      throw new Error("Unable to retrieve study years.");
    }
  }

  static async getStudyYearById(
    yearId: string
  ): Promise<StudyYearAttributes | null> {
    if (!yearId) return null;

    try {
      const year = await StudyYear.findByPk(yearId);
      return year ? year.toJSON() : null;
    } catch (error) {
      logger.error(`SchoolQuery.getStudyYearById: Error ${yearId}`, error);
      throw new Error("Unable to fetch study year.");
    }
  }

  static async createStudyYear(
    payload: StudyYearAttributesInsert
  ): Promise<StudyYearAttributes> {
    if (!payload.schoolId) {
      throw new Error("Validation Error: schoolId is mandatory.");
    }

    try {
      const year = await StudyYear.create(payload);
      return year.toJSON();
    } catch (error) {
      logger.error("SchoolQuery.createStudyYear: Failed", error);
      throw error;
    }
  }

  static async updateStudyYear(
    yearId: string,
    updates: Partial<StudyYearAttributesInsert>
  ): Promise<StudyYearAttributes | null> {
    if (!yearId) return null;

    try {
      const year = await StudyYear.findByPk(yearId);
      if (!year) return null;

      const updatedYear = await year.update(updates);
      return updatedYear.toJSON();
    } catch (error) {
      logger.error(`SchoolQuery.updateStudyYear: Error ${yearId}`, error);
      throw new Error("Update failed.");
    }
  }

  static async deleteStudyYear(yearId: string): Promise<boolean> {
    if (!yearId) return false;

    try {
      const count = await StudyYear.destroy({ where: { yearId } });
      return count > 0;
    } catch (error) {
      logger.error(`SchoolQuery.deleteStudyYear: Error ${yearId}`, error);
      throw new Error("Delete failed.");
    }
  }
}
