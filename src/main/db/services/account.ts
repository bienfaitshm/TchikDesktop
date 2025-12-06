import { ClassroomEnrolement, User } from "../models";
import { TUserInsert, TUser, TWithEnrolements } from "@/commons/types/models";
import type {
  QueryParams,
  WithSchoolAndYearId,
} from "@/commons/types/services";
import { getDefaultUsername, pruneUndefined } from "@/main/db/models/utils";
import { Sequelize } from "sequelize";

/**
 * Mot de passe par défaut attribué aux nouveaux élèves.
 */
const DEFAULT_STUDENT_PASSWORD = "000000";

/**
 * Récupère une liste d'utilisateurs en fonction de critères de recherche.
 * Permet de filtrer par ID d'école, ID d'année scolaire et, optionnellement, ID de classe
 * via l'association `ClassroomEnrolement`.
 *
 * @param {QueryParams<WithSchoolAndYearId, Partial<TUserInsert & { classroomId?: string }>>} queryArgs
 * Arguments de la requête incluant `schoolId`, `yearId` et des paramètres optionnels.
 * @returns {Promise<TWithEnrolements<TUser>[]>} Une promesse qui résout en un tableau d'instances `User`
 * avec leurs enrôlements associés.
 */
export async function getUsers({
  schoolId,
  yearId,
  params,
}: QueryParams<
  WithSchoolAndYearId,
  Partial<TUserInsert & { classroomId?: string }>
>) {
  const userWhereClause = pruneUndefined({
    schoolId,
    ...params,
    classroomId: undefined,
  });

  const enrollmentWhereClause = pruneUndefined({
    yearId,
    classroomId: params?.classroomId,
  });

  try {
    return User.findAll({
      where: userWhereClause,
      order: [
        [Sequelize.fn("LOWER", Sequelize.col("last_name")), "ASC"],
        [Sequelize.fn("LOWER", Sequelize.col("middle_name")), "ASC"],
        [Sequelize.fn("LOWER", Sequelize.col("first_name")), "ASC"],
      ],
      include: [
        {
          model: ClassroomEnrolement,
          where: enrollmentWhereClause,
          required: true,
        },
      ],
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw new Error("Impossible de récupérer les utilisateurs.");
  }
}

/**
 * Récupère un utilisateur unique par son ID.
 *
 * @param {string} userId L'ID unique de l'utilisateur.
 * @returns {Promise<TWithEnrolements<TUser> | null>} Une promesse qui résout en l'instance `User`
 * avec ses enrôlements, ou `null` si non trouvé.
 */
export async function getUser(userId: string) {
  if (!userId) {
    console.error("getUser: L'ID utilisateur ne peut pas être vide.");
    return null;
  }
  try {
    return User.findByPk(userId, {
      include: [ClassroomEnrolement],
    }) as Promise<TWithEnrolements<TUser> | null>;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'utilisateur ${userId}:`,
      error
    );
    throw new Error(`Impossible de récupérer l'utilisateur ${userId}.`);
  }
}

/**
 * Crée un nouvel utilisateur avec un mot de passe par défaut et un nom d'utilisateur généré.
 *
 * @param {TUserInsert} data Les données pour le nouvel utilisateur.
 * @returns {Promise<User>} Une promesse qui résout en l'instance `User` nouvellement créée.
 */
export async function createUser(data: TUserInsert) {
  const password = DEFAULT_STUDENT_PASSWORD;
  const username = getDefaultUsername();

  try {
    return User.create({ password, ...data, username });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);

    throw error;
  }
}

/**
 * Met à jour les données d'un utilisateur existant.
 *
 * @param {string} userId L'ID de l'utilisateur à mettre à jour.
 * @param {Partial<TUserInsert>} data Les données partielles à mettre à jour.
 * @returns {Promise<User | null>} Une promesse qui résout en l'instance `User` mise à jour,
 * ou `null` si l'utilisateur n'a pas été trouvé.
 */
export async function updateUser(userId: string, data: Partial<TUserInsert>) {
  if (!userId) {
    console.error("updateUser: L'ID utilisateur ne peut pas être vide.");
    return null;
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      console.warn(`updateUser: Utilisateur avec l'ID ${userId} non trouvé.`);
      return null;
    }
    return user.update(data);
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'utilisateur ${userId}:`,
      error
    );
    throw new Error(`Impossible de mettre à jour l'utilisateur ${userId}.`);
  }
}

/**
 * Supprime un utilisateur par son ID.
 *
 * @param {string} userId L'ID de l'utilisateur à supprimer.
 * @returns {Promise<boolean>} Une promesse qui résout en `true` si l'utilisateur a été supprimé,
 * `false` sinon (ex: utilisateur non trouvé).
 */
export async function deleteUser(userId: string) {
  if (!userId) {
    console.error("deleteUser: L'ID utilisateur ne peut pas être vide.");
    return false;
  }

  try {
    const deletedRowCount = await User.destroy({
      where: { userId },
    });
    return deletedRowCount > 0;
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de l'utilisateur ${userId}:`,
      error
    );
    throw new Error(`Impossible de supprimer l'utilisateur ${userId}.`);
  }
}
