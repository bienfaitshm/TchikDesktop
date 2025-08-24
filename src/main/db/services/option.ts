import { Option } from "@/main/db/models";
import type {
  QueryParams,
  TOptionInsert,
  WithSchoolAndYearId,
} from "@/commons/types/services";
import { getDefinedAttributes } from "@/main/db/models/utils";
import { Sequelize } from "sequelize";

/**
 * Récupère une liste d'options académiques en fonction de critères de recherche.
 * Permet de filtrer par ID d'école, ID d'année scolaire et d'autres paramètres spécifiques aux options.
 *
 * @param {QueryParams<WithSchoolAndYearId, Partial<TOptionInsert>>} queryArgs
 * Arguments de la requête incluant `schoolId`, `yearId` et des paramètres optionnels de l'option.
 * @returns {Promise<TOption[]>} Une promesse qui résout en un tableau d'instances `Option`.
 */
export async function getOptions({
  schoolId,
  yearId,
  params,
}: QueryParams<WithSchoolAndYearId, Partial<TOptionInsert>>) {
  const optionWhereClause = getDefinedAttributes({
    schoolId,
    yearId,
    ...params,
  });

  try {
    return Option.findAll({
      where: optionWhereClause,
      order: [[Sequelize.fn("LOWER", Sequelize.col("option_name")), "ASC"]],
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des options:", error);
    throw new Error("Impossible de récupérer les options.");
  }
}

/**
 * Récupère une option académique unique par son ID.
 *
 * @param {string} optionId L'ID unique de l'option.
 * @returns {Promise<TOption | null>} Une promesse qui résout en l'instance `Option` trouvée,
 * ou `null` si non trouvée.
 */
export async function getOption(optionId: string) {
  if (!optionId) {
    console.error("getOption: L'ID de l'option ne peut pas être vide.");
    return null;
  }
  try {
    return Option.findByPk(optionId);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'option ${optionId}:`,
      error
    );
    throw new Error(`Impossible de récupérer l'option ${optionId}.`);
  }
}

/**
 * Crée une nouvelle option académique.
 *
 * @param {TOptionInsert} data Les données pour la nouvelle option.
 * @returns {Promise<TOption>} Une promesse qui résout en l'instance `Option` nouvellement créée.
 */
export async function createOption(data: TOptionInsert) {
  try {
    return Option.create(data);
  } catch (error) {
    console.error("Erreur lors de la création de l'option:", error);
    throw error;
  }
}

/**
 * Met à jour les données d'une option académique existante.
 *
 * @param {string} optionId L'ID de l'option à mettre à jour.
 * @param {Partial<TOptionInsert>} data Les données partielles à mettre à jour.
 * @returns {Promise<TOption | null>} Une promesse qui résout en l'instance `Option` mise à jour,
 * ou `null` si l'option n'a pas été trouvée.
 */
export async function updateOption(
  optionId: string,
  data: Partial<TOptionInsert>
) {
  if (!optionId) {
    console.error("updateOption: L'ID de l'option ne peut pas être vide.");
    return null;
  }

  try {
    const option = await Option.findByPk(optionId);
    if (!option) {
      console.warn(`updateOption: Option avec l'ID ${optionId} non trouvée.`);
      return null;
    }
    return option.update(data);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'option ${optionId}:`,
      error
    );
    throw new Error(`Impossible de mettre à jour l'option ${optionId}.`);
  }
}

/**
 * Supprime une option académique par son ID.
 *
 * @param {string} optionId L'ID de l'option à supprimer.
 * @returns {Promise<boolean>} Une promesse qui résout en `true` si l'option a été supprimée,
 * `false` sinon (ex: option non trouvée).
 */
export async function deleteOption(optionId: string): Promise<boolean> {
  if (!optionId) {
    console.error("deleteOption: L'ID de l'option ne peut pas être vide.");
    return false;
  }

  try {
    const deletedRowCount = await Option.destroy({
      where: { optionId },
    });
    return deletedRowCount > 0;
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de l'option ${optionId}:`,
      error
    );
    throw new Error(`Impossible de supprimer l'option ${optionId}.`);
  }
}
