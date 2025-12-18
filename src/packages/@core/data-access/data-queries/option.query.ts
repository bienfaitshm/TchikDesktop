// option.query.ts
import { Sequelize } from "sequelize";

import {
  Option,
  OptionAttributes,
  TOptionCreate,
  TOptionUpdate,
  pruneUndefined,
} from "@/packages/@core/data-access/db";

import { CustomLogger, getLogger } from "@/packages/logger";
import { TOptionFilter } from "@/packages/@core/data-access/schema-validations";

const logger: CustomLogger = getLogger("Option query");

/**
 * Service de gestion des Options Académiques.
 * Fournit les méthodes de requête et de mutation pour l'entité Option.
 */
export class OptionQuery {
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
  static async getOptions(params?: TOptionFilter): Promise<OptionAttributes[]> {
    if (params && !params?.schoolId) {
      logger.error(
        "Validation Error: schoolId are required for listing options."
      );
      throw new Error(
        "Validation Error: schoolId are required for listing options."
      );
    }

    // La clause WHERE inclut les IDs de scope (schoolId, yearId) et les autres filtres.
    const optionWhereClause = pruneUndefined(params);

    try {
      const options = await Option.findAll({
        where: optionWhereClause,
        // Tri professionnel par nom d'option (insensible à la casse)
        order: [[Sequelize.fn("LOWER", Sequelize.col("optionName")), "ASC"]],
      });

      return options.map((opt) => opt.toJSON());
    } catch (error) {
      logger.error("OptionQuery.getOptions: DB query failed.", error as Error);
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
  static async getOptionById(
    optionId: string
  ): Promise<OptionAttributes | null> {
    if (!optionId) {
      logger.warn("OptionQuery.getOptionById: Called with empty ID.");
      return null;
    }
    try {
      const option = await Option.findByPk(optionId);
      return option ? option.toJSON() : null;
    } catch (error) {
      logger.error(
        `OptionQuery.getOptionById: Error for ID ${optionId}.`,
        error as Error
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
  static async createOption(data: TOptionCreate): Promise<OptionAttributes> {
    try {
      const option = await Option.create(data);
      logger.info(`Option created: ${option.optionId}`, {
        name: data.optionName,
      });
      return option.toJSON();
    } catch (error) {
      logger.error(
        "OptionQuery.createOption: Creation failed.",
        error as Error
      );
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
    updates: TOptionUpdate
  ): Promise<OptionAttributes | null> {
    if (!optionId) return null;

    try {
      const option = await Option.findByPk(optionId);

      if (!option) {
        logger.warn(`OptionQuery.updateOption: ID ${optionId} not found.`);
        return null;
      }

      const updatedOption = await option.update(updates);
      return updatedOption.toJSON();
    } catch (error) {
      logger.error(
        `OptionQuery.updateOption: Error updating ${optionId}.`,
        error as Error
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
        `OptionQuery.deleteOption: Error deleting ${optionId}.`,
        error as Error
      );
      // Ceci peut échouer à cause des classes toujours liées à cette option.
      throw new Error(
        "Service error: Delete operation failed, check related data constraints."
      );
    }
  }
}
