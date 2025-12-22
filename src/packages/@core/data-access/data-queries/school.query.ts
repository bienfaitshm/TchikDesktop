//school.query.ts
import { FindOptions, Sequelize } from "sequelize";
import { getLogger } from "@/packages/logger";
import {
  School,
  StudyYear,
  buildFindOptions,
  type TSchool,
  type TStudyYear,
} from "@/packages/@core/data-access/db";

import {
  type TSchoolCreate,
  type TSchoolUpdate,
  type TSchoolFilter,
  type TStudyYearCreate,
  type TStudyYearUpdate,
  type TStudyYearFilter,
} from "@/packages/@core/data-access/schema-validations";

const logger = getLogger("School-StudyYear");
/**
 * Query gérant la logique métier pour les Écoles et les Années Scolaires.
 * Conçu pour être stateless et hautement testable.
 */

const SCHOOL_DEFAULT_SORT_ORDER: FindOptions["order"] = [
  [Sequelize.fn("LOWER", Sequelize.col("name")), "ASC"],
];

const YEAR_DEFAULT_SORT_ORDER: FindOptions["order"] = [
  [Sequelize.fn("LOWER", Sequelize.col("year_name")), "ASC"],
  ["startDate", "ASC"],
];

export class SchoolQuery {
  // ===========================================================================
  //  SCHOOL OPERATIONS
  // ===========================================================================

  /**
   * Récupère une liste d'écoles filtrée.
   *
   * @param filters - Critères de filtrage (ex: schoolId, name). Les valeurs undefined sont ignorées.
   * @returns Liste des écoles correspondant aux critères.
   * @throws {Error} Si la base de données est inaccessible.
   */
  static async findMany(filters?: TSchoolFilter): Promise<TSchool[]> {
    const optionsFilters = buildFindOptions(
      filters || {},
      SCHOOL_DEFAULT_SORT_ORDER
    );
    try {
      const schools = await School.findAll(optionsFilters);
      return schools.map((s) => s.toJSON());
    } catch (error) {
      logger.error("SchoolQuery.findSchools: DB Error", error as Error);
      throw new Error("Query unavailable: Unable to retrieve schools.");
    }
  }

  /**
   * Récupère une école par son ID.
   *
   * @param schoolId - UUID de l'école.
   * @returns L'objet école ou null si introuvable.
   */
  static async findById(schoolId: string): Promise<TSchool | null> {
    if (!schoolId) {
      logger.warn("SchoolQuery.findById: Called with empty ID");
      return null;
    }

    try {
      const school = await School.findByPk(schoolId);
      return school ? school.toJSON() : null;
    } catch (error) {
      logger.error(
        `SchoolQuery.findById: Error for ID ${schoolId}`,
        error as Error
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
  static async create(payload: TSchoolCreate): Promise<TSchool> {
    try {
      const school = await School.create(payload);
      logger.info(`School created: ${school.schoolId}`);
      return school.toJSON();
    } catch (error) {
      logger.error("SchoolQuery.create: Creation failed", error as Error);
      throw error;
    }
  }

  /**
   * Met à jour une école existante.
   *
   * @param schoolId - ID de l'école cible.
   * @param updates - Champs à modifier.
   * @returns L'école mise à jour ou null si l'ID n'existe pas.
   */
  static async update(
    schoolId: string,
    updates: TSchoolUpdate
  ): Promise<TSchool | null> {
    if (!schoolId) return null;

    try {
      const school = await School.findByPk(schoolId);
      if (!school) {
        logger.warn(`SchoolQuery.update: ID ${schoolId} not found`);
        return null;
      }

      const updatedSchool = await school.update(updates);
      return updatedSchool.toJSON();
    } catch (error) {
      logger.error(
        `SchoolQuery.update: Error updating ${schoolId}`,
        error as Error
      );
      throw new Error("Query unavailable: Update failed.");
    }
  }

  /**
   * Supprime une école (Soft ou Hard delete selon la config modèle, ici Hard).
   */
  static async delete(schoolId: string): Promise<boolean> {
    if (!schoolId) return false;

    try {
      const count = await School.destroy({ where: { schoolId } });
      return count > 0;
    } catch (error) {
      logger.error(
        `SchoolQuery.delete: Error deleting ${schoolId}`,
        error as Error
      );
      throw new Error("Query error: Delete operation failed.");
    }
  }
}

export class StudyYearQuery {
  // ===========================================================================
  //  STUDY YEAR OPERATIONS
  // ===========================================================================

  /**
   * Liste les années scolaires pour une école donnée.
   */
  static async findMany(filters?: TStudyYearFilter): Promise<TStudyYear[]> {
    if (!filters?.schoolId) {
      logger.error(
        "Validation Error: schoolId is required to fetch study years."
      );
      throw new Error(
        "Validation Error: schoolId is required to fetch study years."
      );
    }

    const optionsFilters = buildFindOptions(filters, YEAR_DEFAULT_SORT_ORDER);

    try {
      const years = await StudyYear.findAll(optionsFilters);
      return years.map((y) => y.toJSON());
    } catch (error) {
      logger.error(
        `SchoolQuery.finMany: Error for school ${filters.schoolId}`,
        error as Error
      );
      throw new Error("Unable to retrieve study years.");
    }
  }

  static async findById(yearId: string): Promise<TStudyYear | null> {
    if (!yearId) return null;

    try {
      const year = await StudyYear.findByPk(yearId);
      return year ? year.toJSON() : null;
    } catch (error) {
      logger.error(`SchoolQuery.findById: Error ${yearId}`, error as Error);
      throw new Error("Unable to fetch study year.");
    }
  }

  static async create(payload: TStudyYearCreate): Promise<TStudyYearCreate> {
    if (!payload.schoolId) {
      logger.error("Validation Error: schoolId is mandatory.");
      throw new Error("Validation Error: schoolId is mandatory.");
    }

    try {
      const year = await StudyYear.create(payload);
      return year.toJSON();
    } catch (error) {
      logger.error("SchoolQuery.create: Failed", error as Error);
      throw error;
    }
  }

  static async update(
    yearId: string,
    updates: TStudyYearUpdate
  ): Promise<TStudyYear | null> {
    if (!yearId) return null;

    try {
      const year = await StudyYear.findByPk(yearId);
      if (!year) return null;

      const updatedYear = await year.update(updates);
      return updatedYear.toJSON();
    } catch (error) {
      logger.error(`SchoolQuery.update: Error ${yearId}`, error as Error);
      throw new Error("Update failed.");
    }
  }

  static async delete(yearId: string): Promise<boolean> {
    if (!yearId) return false;

    try {
      const count = await StudyYear.destroy({ where: { yearId } });
      return count > 0;
    } catch (error) {
      logger.error(`SchoolQuery.delete: Error ${yearId}`, error as Error);
      throw new Error("Delete failed.");
    }
  }
}
