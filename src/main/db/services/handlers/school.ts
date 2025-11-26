/**
 * @file school.repository.ts
 * @description Implémentation du pattern Repository pour les entités School et StudyYear.
 * Gère l'accès aux données, la gestion des erreurs (logging) et la transformation de base.
 */

import { School, StudyYear } from "@/main/db/models";
import type { TSchoolInsert, TStudyYearInsert } from "@/commons/types/services";
import { getDefinedAttributes } from "@/main/db/models/utils";
import { Sequelize } from "sequelize";
import { getLogger, CustomLogger } from "@/main/libs/logger"; // Import du logger professionnel

// ==========================================
// 1. School Repository
// ==========================================

export class SchoolRepository {
  private readonly logger: CustomLogger = getLogger("SchoolRepository");

  /**
   * 🔎 Récupère une liste d'écoles selon des critères de recherche.
   */
  public async findSchools(queryArgs?: {
    params?: Partial<TSchoolInsert & { schoolId?: string }>;
  }) {
    const schoolWhereClause = getDefinedAttributes({
      ...queryArgs?.params,
    });

    try {
      return School.findAll({
        where: schoolWhereClause,
        order: [[Sequelize.fn("LOWER", Sequelize.col("name")), "ASC"]],
      });
    } catch (error) {
      this.logger.error("Failed to retrieve schools.", String(error), {
        error,
      });
      // Lancer une erreur standardisée pour le service appelant
      throw new Error("DATA_ACCESS_ERROR: Could not retrieve schools.");
    }
  }

  /**
   * 🔎 Récupère une école unique par son ID.
   */
  public async findSchoolById(schoolId: string) {
    if (!schoolId) {
      this.logger.warn("Attempted to find school with empty ID.");
      return null;
    }
    try {
      return School.findByPk(schoolId);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve school ${schoolId}.`,
        String(error),
        { error }
      );
      throw new Error(
        `DATA_ACCESS_ERROR: Could not retrieve school ${schoolId}.`
      );
    }
  }

  /**
   * 🆕 Crée une nouvelle école.
   */
  public async createSchool(data: TSchoolInsert) {
    try {
      return School.create(data);
    } catch (error) {
      this.logger.error("Failed to create school.", String(error), {
        data,
        error,
      });
      // Propager l'erreur DB/Validation pour un traitement ultérieur
      throw error;
    }
  }

  /**
   * 🔄 Met à jour les données d'une école existante.
   */
  public async updateSchool(schoolId: string, data: Partial<TSchoolInsert>) {
    if (!schoolId) {
      this.logger.warn("Attempted to update school with empty ID.");
      return null;
    }

    try {
      // Utilisez la mise à jour directe (moins verbeux que findByPk + update)
      const [updatedRowCount] = await School.update(data, {
        where: { schoolId },
      });

      if (updatedRowCount === 0) {
        this.logger.warn(`School with ID ${schoolId} not found for update.`);
        return null;
      }

      // Récupérer et retourner l'instance mise à jour pour la cohérence
      return this.findSchoolById(schoolId);
    } catch (error) {
      this.logger.error(`Failed to update school ${schoolId}.`, String(error), {
        data,
        error,
      });
      throw new Error(
        `DATA_ACCESS_ERROR: Could not update school ${schoolId}.`
      );
    }
  }

  /**
   * 🗑️ Supprime une école par son ID.
   */
  public async deleteSchool(schoolId: string): Promise<boolean> {
    if (!schoolId) {
      this.logger.warn("Attempted to delete school with empty ID.");
      return false;
    }

    try {
      const deletedRowCount = await School.destroy({
        where: { schoolId },
      });
      return deletedRowCount > 0;
    } catch (error) {
      this.logger.error(`Failed to delete school ${schoolId}.`, String(error), {
        error,
      });
      throw new Error(
        `DATA_ACCESS_ERROR: Could not delete school ${schoolId}.`
      );
    }
  }
}

// ==========================================
// 2. StudyYear Repository
// ==========================================

export class StudyYearRepository {
  private readonly logger: CustomLogger = getLogger("StudyYearRepository");

  /**
   * 🔎 Récupère une liste d'années d'études pour une école spécifique.
   */
  public async findStudyYears(
    schoolId: string,
    params?: Partial<TStudyYearInsert>
  ) {
    if (!schoolId) {
      this.logger.warn(
        "Attempted to retrieve study years with empty school ID."
      );
      return [];
    }

    const whereClause = getDefinedAttributes({
      schoolId,
      ...params,
    });

    try {
      return StudyYear.findAll({
        where: whereClause,
        order: [
          [Sequelize.fn("LOWER", Sequelize.col("yearName")), "ASC"],
          ["startDate", "ASC"],
        ],
      });
    } catch (error) {
      this.logger.error(
        `Failed to retrieve study years for school ${schoolId}.`,
        String(error),
        { error }
      );
      throw new Error("DATA_ACCESS_ERROR: Could not retrieve study years.");
    }
  }

  /**
   * 🔎 Récupère une année d'étude unique par son ID.
   */
  public async findStudyYearById(yearId: string) {
    if (!yearId) {
      this.logger.warn("Attempted to find study year with empty ID.");
      return null;
    }
    try {
      return StudyYear.findByPk(yearId);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve study year ${yearId}.`,
        String(error),
        { error }
      );
      throw new Error(
        `DATA_ACCESS_ERROR: Could not retrieve study year ${yearId}.`
      );
    }
  }

  /**
   * 🆕 Crée une nouvelle année d'étude pour une école spécifique.
   */
  public async createStudyYear(data: TStudyYearInsert) {
    try {
      if (!data.schoolId) {
        throw new Error("Required field missing: schoolId.");
      }
      return StudyYear.create(data);
    } catch (error) {
      this.logger.error("Failed to create study year.", String(error), {
        data,
        error,
      });
      throw error;
    }
  }

  /**
   * 🔄 Met à jour les données d'une année d'étude existante.
   */
  public async updateStudyYear(
    yearId: string,
    data: Partial<TStudyYearInsert>
  ) {
    if (!yearId) {
      this.logger.warn("Attempted to update study year with empty ID.");
      return null;
    }

    try {
      const [updatedRowCount] = await StudyYear.update(data, {
        where: { yearId },
      });

      if (updatedRowCount === 0) {
        this.logger.warn(`Study year with ID ${yearId} not found for update.`);
        return null;
      }

      // Retourner l'instance mise à jour
      return this.findStudyYearById(yearId);
    } catch (error) {
      this.logger.error(
        `Failed to update study year ${yearId}.`,
        String(error),
        {
          data,
          error,
        }
      );
      throw new Error(
        `DATA_ACCESS_ERROR: Could not update study year ${yearId}.`
      );
    }
  }

  /**
   * 🗑️ Supprime une année d'étude par son ID.
   */
  public async deleteStudyYear(yearId: string): Promise<boolean> {
    if (!yearId) {
      this.logger.warn("Attempted to delete study year with empty ID.");
      return false;
    }

    try {
      const deletedRowCount = await StudyYear.destroy({
        where: { yearId }, // Assumer que l'ID est nommé 'id'
      });
      return deletedRowCount > 0;
    } catch (error) {
      this.logger.error(
        `Failed to delete study year ${yearId}.`,
        String(error),
        { error }
      );
      throw new Error(
        `DATA_ACCESS_ERROR: Could not delete study year ${yearId}.`
      );
    }
  }
}
