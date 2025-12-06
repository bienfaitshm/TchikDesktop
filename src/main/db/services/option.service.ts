// option.service.ts

import { Option } from "@/main/db/models";
import type { TOption } from "@/commons/types/models";
import type {
  QueryParams,
  TOptionInsert,
  WithSchoolAndYearId,
} from "@/commons/types/services";
import { pruneUndefined } from "@/main/db/models/utils";
import { Sequelize, type WhereOptions } from "sequelize";

// --- Logger Interface (Simulé pour l'observabilité) ---
const logger = {
  info: (msg: string, meta?: object) => console.info(`[INFO] ${msg}`, meta),
  error: (msg: string, error?: unknown) =>
    console.error(`[ERROR] ${msg}`, error),
  warn: (msg: string, meta?: object) => console.warn(`[WARN] ${msg}`, meta),
};

/**
 * Service de gestion des Options Académiques.
 * Fournit les méthodes de requête et de mutation pour l'entité Option.
 */
export class OptionService {
  // =============================================================================
  //  FETCH OPERATIONS
  // =============================================================================

  /**
   * Récupère une liste d'options académiques basées sur des critères de filtrage.
   *
   * @param queryArgs - Arguments de la requête incluant les IDs de scope (`schoolId`, `yearId`) et les filtres d'options.
   * @returns Une promesse qui résout en un tableau de DTOs d'options.
   * @throws {Error} Erreur de service si la requête DB échoue.
   */
  static async getOptions({
    schoolId,
    yearId,
    params,
  }: QueryParams<WithSchoolAndYearId, Partial<TOptionInsert>>): Promise<
    TOption[]
  > {
    if (!schoolId || !yearId) {
      throw new Error(
        "Validation Error: schoolId and yearId are required for listing options."
      );
    }

    // La clause WHERE inclut les IDs de scope (schoolId, yearId) et les autres filtres.
    const optionWhereClause = pruneUndefined({
      schoolId,
      yearId,
      ...params,
    }) as WhereOptions<TOption>;

    try {
      const options = await Option.findAll({
        where: optionWhereClause,
        // Tri professionnel par nom d'option (insensible à la casse)
        order: [[Sequelize.fn("LOWER", Sequelize.col("option_name")), "ASC"]],
      });

      return options.map((opt) => opt.toJSON());
    } catch (error) {
      logger.error("OptionService.getOptions: DB query failed.", error);
      throw new Error(
        "Service unavailable: Unable to retrieve academic options."
      );
    }
  }

  /**
   * Récupère une option académique unique par son ID.
   *
   * @param optionId - L'ID unique de l'option.
   * @returns L'option DTO trouvée, ou `null` si non trouvée.
   * @throws {Error} Erreur de service si la requête DB échoue.
   */
  static async getOptionById(optionId: string): Promise<TOption | null> {
    if (!optionId) {
      logger.warn("OptionService.getOptionById: Called with empty ID.");
      return null;
    }
    try {
      const option = await Option.findByPk(optionId);
      return option ? option.toJSON() : null;
    } catch (error) {
      logger.error(
        `OptionService.getOptionById: Error for ID ${optionId}.`,
        error
      );
      throw new Error("Service unavailable: Unable to fetch option details.");
    }
  }

  // =============================================================================
  //  MUTATION OPERATIONS
  // =============================================================================

  /**
   * Crée une nouvelle option académique.
   *
   * @param data - Les données d'insertion pour la nouvelle option.
   * @returns Le DTO de l'option nouvellement créée.
   * @throws {Error} Erreur DB si l'insertion échoue.
   */
  static async createOption(data: TOptionInsert): Promise<TOption> {
    try {
      const option = await Option.create(data);
      logger.info(`Option created: ${option.optionId}`, {
        name: data.optionName,
      });
      return option.toJSON();
    } catch (error) {
      logger.error("OptionService.createOption: Creation failed.", error);
      throw error; // Laisse le contrôleur gérer les erreurs de validation/unicité
    }
  }

  /**
   * Met à jour les données d'une option académique existante.
   *
   * @param optionId - L'ID de l'option à mettre à jour.
   * @param updates - Les données partielles à appliquer.
   * @returns Le DTO de l'option mise à jour, ou `null` si l'option n'a pas été trouvée.
   * @throws {Error} Erreur de service si l'opération DB échoue.
   */
  static async updateOption(
    optionId: string,
    updates: Partial<TOptionInsert>
  ): Promise<TOption | null> {
    if (!optionId) return null;

    try {
      const option = await Option.findByPk(optionId);

      if (!option) {
        logger.warn(`OptionService.updateOption: ID ${optionId} not found.`);
        return null;
      }

      const updatedOption = await option.update(updates);
      return updatedOption.toJSON();
    } catch (error) {
      logger.error(
        `OptionService.updateOption: Error updating ${optionId}.`,
        error
      );
      throw new Error("Service unavailable: Update operation failed.");
    }
  }

  /**
   * Supprime une option académique par son ID.
   *
   * @param optionId - L'ID de l'option à supprimer.
   * @returns `true` si l'option a été supprimée, `false` sinon.
   * @throws {Error} Erreur de service si l'opération DB échoue (ex: contrainte de clé étrangère).
   */
  static async deleteOption(optionId: string): Promise<boolean> {
    if (!optionId) return false;

    try {
      const deletedRowCount = await Option.destroy({
        where: { optionId },
      });
      return deletedRowCount > 0;
    } catch (error) {
      logger.error(
        `OptionService.deleteOption: Error deleting ${optionId}.`,
        error
      );
      // Ceci peut échouer à cause des classes toujours liées à cette option.
      throw new Error(
        "Service error: Delete operation failed, check related data constraints."
      );
    }
  }
}
