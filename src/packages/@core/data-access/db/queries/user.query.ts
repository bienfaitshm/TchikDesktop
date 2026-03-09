import {
  ClassroomEnrolement,
  User,
  buildFindOptions,
  TUser,
  TUserCreate,
  getDefaultUsername,
  TUserUpdate,
} from "@/packages/@core/data-access/db";
import { TUserFilter } from "@/packages/@core/data-access/schema-validations";
import {
  Sequelize,
  type Includeable,
  FindOptions,
  CreateOptions,
} from "sequelize";

import { getLogger } from "@/packages/logger";

const DEFAULT_STUDENT_PASSWORD = "000000";

const DEFAULT_SORT_ORDER: FindOptions["order"] = [
  [Sequelize.fn("LOWER", Sequelize.col("last_name")), "ASC"],
  [Sequelize.fn("LOWER", Sequelize.col("middle_name")), "ASC"],
  [Sequelize.fn("LOWER", Sequelize.col("first_name")), "ASC"],
];

const logger = getLogger("User Query");

/**
 * Service de gestion des Utilisateurs (étudiants, professeurs, administrateurs).
 * Ce service gère l'accès à la base de données pour l'entité User.
 */
export class UserQuery {
  /**
   * Récupère une liste d'utilisateurs basée sur l'école, l'année scolaire, et optionnellement la classe.
   *
   * Utilise une clause `JOIN` requise (`required: true`) sur `ClassroomEnrolement` pour
   * filtrer les utilisateurs actifs dans la période spécifiée.
   *
   * @param {QueryParams<WithSchoolAndYearId, Partial<TUserInsert & { classroomId?: string }>>} queryArgs
   * Arguments de la requête incluant les IDs de scope (`schoolId`, `yearId`) et les filtres utilisateur/classe.
   * @returns {Promise<TWithEnrolements<TUser>[]>} Liste des instances `User` avec leurs `ClassroomEnrolements`.
   * @throws {Error} Erreur de service si la requête DB échoue.
   */
  static async findMany({
    yearId,
    classroomId,
    ...filters
  }: TUserFilter & {
    yearId?: string | string[];
    classroomId?: string | string[];
  }): Promise<TUser[]> {
    if (!filters.schoolId) {
      throw new Error(
        "Validation Error: schoolId are required for listing users.",
      );
    }

    const userOptions = buildFindOptions(filters, DEFAULT_SORT_ORDER);
    const enrollmentOptions = buildFindOptions({
      yearId,
      classroomId,
      schoolId: filters.schoolId,
    });

    const includeOptions: Includeable[] = [];
    if (yearId && classroomId) {
      includeOptions.push({
        model: ClassroomEnrolement,
        required: true,
        ...enrollmentOptions,
      } as unknown as Includeable);
    }

    try {
      const users = await User.findAll({
        include: includeOptions,
        ...userOptions,
        raw: true,
      });

      return users as TUser[];
    } catch (error) {
      logger.error("UserService.findUsers: DB query failed.", error);
      throw new Error("Service unavailable: Unable to retrieve users.");
    }
  }

  /**
   * Récupère un utilisateur unique par son ID, y compris tous ses enrôlements historiques.
   *
   * @param userId - L'ID unique de l'utilisateur.
   * @returns L'utilisateur trouvé avec ses enrôlements, ou `null`.
   * @throws {Error} Erreur de service si la requête DB échoue.
   */
  static async findById(userId: string): Promise<TUser | null> {
    if (!userId) {
      logger.warn("UserService.getUserById: Called with empty ID.");
      return null;
    }

    try {
      const user = await User.findByPk(userId, { raw: true });
      return user as TUser | null;
    } catch (error) {
      logger.error(`UserService.getUserById: Error for ID ${userId}.`, error);
      throw new Error("Service unavailable: Unable to fetch user details.");
    }
  }

  /**
   * Crée un nouvel utilisateur.
   *
   * Le nom d'utilisateur est généré de manière provisoire et un mot de passe par défaut est attribué.
   * NOTE: Dans un système professionnel, le mot de passe devrait être HASHÉ ici avant l'insertion.
   *
   * @param payload - Les données de création de l'utilisateur (doit inclure le rôle et schoolId).
   * @returns L'utilisateur créé (DTO).
   * @throws {Error} Si la validation ou l'insertion DB échoue.
   */
  static async create(
    payload: TUserCreate,
    options?: CreateOptions<Required<TUser>>,
  ): Promise<TUser> {
    const password = DEFAULT_STUDENT_PASSWORD;
    const username = getDefaultUsername();

    try {
      const user = await User.create(
        { password, ...payload, username },
        options,
      );
      logger.info(`User created: ${user.userId}`, { role: user.role });
      return user.toJSON();
    } catch (error) {
      logger.error("UserService.createUser: Creation failed.", error);
      throw error;
    }
  }

  /**
   * Met à jour les données d'un utilisateur existant.
   *
   * @param userId - ID de l'utilisateur cible.
   * @param updates - Champs à modifier.
   * @returns L'utilisateur mis à jour (DTO) ou `null` si introuvable.
   * @throws {Error} Erreur de service si l'opération DB échoue.
   */
  static async update(
    userId: string,
    updates: TUserUpdate,
  ): Promise<TUser | null> {
    if (!userId) return null;

    try {
      const user = await User.findByPk(userId, { raw: true });
      if (!user) {
        logger.warn(`UserService.updateUser: ID ${userId} not found.`);
        return null;
      }

      const updatedUser = await user.update(updates);
      return updatedUser as TUser | null;
    } catch (error) {
      logger.error(`UserService.updateUser: Error updating ${userId}.`, error);
      throw new Error("Service unavailable: Update operation failed.");
    }
  }

  /**
   * Supprime un utilisateur par son ID.
   *
   * @param userId - L'ID de l'utilisateur à supprimer.
   * @returns `true` si l'utilisateur a été supprimé, `false` sinon.
   * @throws {Error} Erreur de service si l'opération DB échoue.
   */
  static async delete(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      const deletedRowCount = await User.destroy({
        where: { userId },
      });
      return deletedRowCount > 0;
    } catch (error) {
      logger.error(`UserService.deleteUser: Error deleting ${userId}.`, error);
      throw new Error(
        "Service error: Delete operation failed, check related data constraints.",
      );
    }
  }
}
