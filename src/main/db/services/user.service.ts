//user.service.ts
import { ClassroomEnrolement, User } from "../models/model";
import type {
  TUserInsert,
  TUser,
  TWithEnrolements,
} from "@/commons/types/models";
import type {
  QueryParams,
  WithSchoolAndYearId,
} from "@/commons/types/services";
import { getDefaultUsername, pruneUndefined } from "@/main/db/models/utils";
import { Sequelize, type WhereOptions, type Includeable } from "sequelize";

// --- Configuration ---

/** Mot de passe par défaut hashing/salté ou placeholder avant hachage réel (production). */
const DEFAULT_STUDENT_PASSWORD = "000000";

// --- Logger Interface (Simulé pour l'observabilité) ---
const logger = {
  info: (msg: string, meta?: object) => console.info(`[INFO] ${msg}`, meta),
  error: (msg: string, error?: unknown) =>
    console.error(`[ERROR] ${msg}`, error),
  warn: (msg: string, meta?: object) => console.warn(`[WARN] ${msg}`, meta),
};

/**
 * Service de gestion des Utilisateurs (étudiants, professeurs, administrateurs).
 * Ce service gère l'accès à la base de données pour l'entité User.
 */
export class UserService {
  // ===========================================================================
  //  FETCH OPERATIONS
  // ===========================================================================

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
  static async findUsers({
    schoolId,
    yearId,
    params,
  }: QueryParams<
    WithSchoolAndYearId,
    Partial<TUserInsert & { classroomId?: string }>
  >): Promise<TWithEnrolements<TUser>[]> {
    if (!schoolId || !yearId) {
      throw new Error(
        "Validation Error: schoolId and yearId are required for listing users."
      );
    }

    // 1. Clauses WHERE pour User (exclut classroomId car il est pour l'association)
    const { classroomId, ...userFilters } = params ?? {};
    const userWhereClause = pruneUndefined({ schoolId, ...userFilters });

    // 2. Clause WHERE pour l'association ClassroomEnrolement
    const enrollmentWhereClause = pruneUndefined({
      yearId,
      classroomId: classroomId,
    });

    const includeOptions: Includeable[] = [
      {
        model: ClassroomEnrolement,
        where: enrollmentWhereClause as WhereOptions<ClassroomEnrolement>,
        required: true, // IMPORTANT: Fait un INNER JOIN, ne retourne que les Users AYANT un enrôlement correspondant.
      },
    ];

    try {
      // Sequelize.col() et Sequelize.fn('LOWER') sont utilisés pour un tri insensible à la casse et robuste.
      const users = await User.findAll({
        where: userWhereClause as WhereOptions<TUser>,
        order: [
          [Sequelize.fn("LOWER", Sequelize.col("last_name")), "ASC"],
          [Sequelize.fn("LOWER", Sequelize.col("middle_name")), "ASC"],
          [Sequelize.fn("LOWER", Sequelize.col("first_name")), "ASC"],
        ],
        include: includeOptions,
      });

      // Mappage en DTO (Data Transfer Object) avec enrôlements
      return users.map((u) => u.toJSON()) as TWithEnrolements<TUser>[];
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
  static async getUserById(
    userId: string
  ): Promise<TWithEnrolements<TUser> | null> {
    if (!userId) {
      logger.warn("UserService.getUserById: Called with empty ID.");
      return null;
    }

    try {
      const user = await User.findByPk(userId, {
        include: [ClassroomEnrolement], // Récupère tous les enrôlements (pas filtré par année)
      });
      return user ? (user.toJSON() as TWithEnrolements<TUser>) : null;
    } catch (error) {
      logger.error(`UserService.getUserById: Error for ID ${userId}.`, error);
      throw new Error("Service unavailable: Unable to fetch user details.");
    }
  }

  // ===========================================================================
  //  MUTATION OPERATIONS
  // ===========================================================================

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
  static async createUser(payload: TUserInsert): Promise<TUser> {
    // 1. Logique métier d'initialisation
    const password = DEFAULT_STUDENT_PASSWORD; // Placez ici le hash réel si ce n'est pas fait dans un hook Sequelize
    const username = getDefaultUsername(); // Le modèle User ajoute le préfixe du rôle ici (ex: STUDENT_123456)

    try {
      const user = await User.create({ password, ...payload, username });
      logger.info(`User created: ${user.userId}`, { role: user.role });
      return user.toJSON();
    } catch (error) {
      logger.error("UserService.createUser: Creation failed.", error);
      throw error; // Laissez le contrôleur gérer les erreurs de validation/unicité (400)
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
  static async updateUser(
    userId: string,
    updates: Partial<TUserInsert>
  ): Promise<TUser | null> {
    if (!userId) return null;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(`UserService.updateUser: ID ${userId} not found.`);
        return null;
      }

      const updatedUser = await user.update(updates);
      return updatedUser.toJSON();
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
  static async deleteUser(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      // NOTE: Le modèle User devrait idéalement avoir un 'soft delete' (paranoid: true)
      // pour éviter la perte de l'historique lié aux enrôlements.
      const deletedRowCount = await User.destroy({
        where: { userId },
      });
      return deletedRowCount > 0;
    } catch (error) {
      logger.error(`UserService.deleteUser: Error deleting ${userId}.`, error);
      // Ceci pourrait échouer à cause des contraintes de clé étrangère (ex: inscriptions existantes)
      throw new Error(
        "Service error: Delete operation failed, check related data constraints."
      );
    }
  }
}
