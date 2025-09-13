import { School, StudyYear } from "@/main/db/models";
import type { TSchoolInsert, TStudyYearInsert } from "@/commons/types/services";
import { getDefinedAttributes } from "@/main/db/models/utils";
import { Sequelize } from "sequelize";

/**
 * Récupère une liste d'écoles en fonction de critères de recherche.
 * Permet de filtrer les écoles par des paramètres spécifiques (ex: nom, identifiant).
 *
 * @param {object} [queryArgs] - Arguments optionnels pour filtrer les écoles.
 * @param {Partial<TSchoolInsert & { id?: string }>} [queryArgs.params] - Paramètres de filtre supplémentaires.
 * @returns {Promise<TSchool[]>} Une promesse qui résout en un tableau d'instances `School`.
 */
export async function getSchools(queryArgs?: {
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
    console.error("Erreur lors de la récupération des écoles:", error);
    throw new Error("Impossible de récupérer les écoles.");
  }
}

/**
 * Récupère une école unique par son ID.
 *
 * @param {string} schoolId L'ID unique de l'école.
 * @returns {Promise<TSchool | null>} Une promesse qui résout en l'instance `School` trouvée,
 * ou `null` si non trouvée.
 */
export async function getSchool(schoolId: string) {
  if (!schoolId) {
    console.error("getSchool: L'ID de l'école ne peut pas être vide.");
    return null;
  }
  try {
    return School.findByPk(schoolId, {});
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'école ${schoolId}:`,
      error
    );
    throw new Error(`Impossible de récupérer l'école ${schoolId}.`);
  }
}

/**
 * Crée une nouvelle école.
 *
 * @param {TSchoolInsert} data Les données pour la nouvelle école.
 * @returns {Promise<TSchool>} Une promesse qui résout en l'instance `School` nouvellement créée.
 */
export async function createSchool(data: TSchoolInsert) {
  try {
    return School.create(data);
  } catch (error) {
    console.error("Erreur lors de la création de l'école:", error);

    throw error;
  }
}

/**
 * Met à jour les données d'une école existante.
 *
 * @param {string} schoolId L'ID de l'école à mettre à jour.
 * @param {Partial<TSchoolInsert>} data Les données partielles à mettre à jour.
 * @returns {Promise<TSchool | null>} Une promesse qui résout en l'instance `School` mise à jour,
 * ou `null` si l'école n'a pas été trouvée.
 */
export async function updateSchool(
  schoolId: string,
  data: Partial<TSchoolInsert>
) {
  if (!schoolId) {
    console.error("updateSchool: L'ID de l'école ne peut pas être vide.");
    return null;
  }

  try {
    const school = await School.findByPk(schoolId);
    if (!school) {
      console.warn(`updateSchool: École avec l'ID ${schoolId} non trouvée.`);
      return null;
    }
    return school.update(data);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'école ${schoolId}:`,
      error
    );
    throw new Error(`Impossible de mettre à jour l'école ${schoolId}.`);
  }
}

/**
 * Supprime une école par son ID.
 *
 * @param {string} schoolId L'ID de l'école à supprimer.
 * @returns {Promise<boolean>} Une promesse qui résout en `true` si l'école a été supprimée,
 * `false` sinon (ex: école non trouvée).
 */
export async function deleteSchool(schoolId: string): Promise<boolean> {
  if (!schoolId) {
    console.error("deleteSchool: L'ID de l'école ne peut pas être vide.");
    return false;
  }

  try {
    const deletedRowCount = await School.destroy({
      where: { schoolId },
    });
    return deletedRowCount > 0;
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de l'école ${schoolId}:`,
      error
    );
    throw new Error(`Impossible de supprimer l'école ${schoolId}.`);
  }
}

// StudyYear

/**
 * Récupère une liste d'années d'études pour une école spécifique.
 *
 * @param {string} schoolId L'ID de l'école pour laquelle récupérer les années d'études.
 * @param {Partial<TStudyYearInsert>} [params] - Paramètres de filtre supplémentaires (ex: yearName).
 * @returns {Promise<TStudyYear[]>} Une promesse qui résout en un tableau d'instances `StudyYear`.
 */
export async function getStudyYears(
  schoolId: string,
  params?: Partial<TStudyYearInsert>
) {
  if (!schoolId) {
    console.error("getStudyYears: L'ID de l'école ne peut pas être vide.");
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
        [Sequelize.fn("LOWER", Sequelize.col("year_name")), "ASC"],
        ["startDate", "ASC"],
      ],
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des années d'étude pour l'école ${schoolId}:`,
      error
    );
    throw new Error(
      `Impossible de récupérer les années d'étude pour l'école ${schoolId}.`
    );
  }
}

/**
 * Récupère une année d'étude unique par son ID.
 *
 * @param {string} yearId L'ID unique de l'année d'étude.
 * @returns {Promise<TStudyYear | null>} Une promesse qui résout en l'instance `StudyYear` trouvée,
 * ou `null` si non trouvée.
 */
export async function getStudyYear(yearId: string) {
  if (!yearId) {
    console.error(
      "getStudyYear: L'ID de l'année d'étude ne peut pas être vide."
    );
    return null;
  }
  try {
    return StudyYear.findByPk(yearId);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'année d'étude ${yearId}:`,
      error
    );
    throw new Error(`Impossible de récupérer l'année d'étude ${yearId}.`);
  }
}

/**
 * Crée une nouvelle année d'étude pour une école spécifique.
 *
 * @param {TStudyYearInsert} data Les données pour la nouvelle année d'étude.
 * @returns {Promise<TStudyYear>} Une promesse qui résout en l'instance `StudyYear` nouvellement créée.
 */
export async function createStudyYear(data: TStudyYearInsert) {
  try {
    if (!data.schoolId) {
      throw new Error(
        "createStudyYear: L'ID de l'école est requis pour créer une année d'étude."
      );
    }
    return StudyYear.create(data);
  } catch (error) {
    console.error("Erreur lors de la création de l'année d'étude:", error);
    throw error;
  }
}

/**
 * Met à jour les données d'une année d'étude existante.
 *
 * @param {string} yearId L'ID de l'année d'étude à mettre à jour.
 * @param {Partial<TStudyYearInsert>} data Les données partielles à mettre à jour.
 * @returns {Promise<TStudyYear | null>} Une promesse qui résout en l'instance `StudyYear` mise à jour,
 * ou `null` si l'année d'étude n'a pas été trouvée.
 */
export async function updateStudyYear(
  yearId: string,
  data: Partial<TStudyYearInsert>
) {
  if (!yearId) {
    console.error(
      "updateStudyYear: L'ID de l'année d'étude ne peut pas être vide."
    );
    return null;
  }

  try {
    const studyYear = await StudyYear.findByPk(yearId);
    if (!studyYear) {
      console.warn(
        `updateStudyYear: Année d'étude avec l'ID ${yearId} non trouvée.`
      );
      return null;
    }
    return studyYear.update(data);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'année d'étude ${yearId}:`,
      error
    );
    throw new Error(`Impossible de mettre à jour l'année d'étude ${yearId}.`);
  }
}

/**
 * Supprime une année d'étude par son ID.
 *
 * @param {string} yearId L'ID de l'année d'étude à supprimer.
 * @returns {Promise<boolean>} Une promesse qui résout en `true` si l'année d'étude a été supprimée,
 * `false` sinon (ex: année d'étude non trouvée).
 */
export async function deleteStudyYear(yearId: string): Promise<boolean> {
  if (!yearId) {
    console.error(
      "deleteStudyYear: L'ID de l'année d'étude ne peut pas être vide."
    );
    return false;
  }

  try {
    const deletedRowCount = await StudyYear.destroy({
      where: { yearId },
    });
    return deletedRowCount > 0;
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de l'année d'étude ${yearId}:`,
      error
    );
    throw new Error(`Impossible de supprimer l'année d'étude ${yearId}.`);
  }
}
