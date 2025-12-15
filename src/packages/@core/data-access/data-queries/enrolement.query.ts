import {
  ClassroomEnrolement,
  User,
  ClassRoom,
  StudyYear,
  pruneUndefined,
  TEnrolementInsert,
  TEnrolement,
  TUser,
  TClassroom,
  TStudyYear,
} from "@/packages/@core/data-access/db";

import { Sequelize, type Includeable, WhereOptions } from "sequelize";

import { UserQuery } from "./user.query";
import {
  QueryParams,
  TQuickEnrolementInsert,
  WithSchoolAndYearId,
} from "@/commons/types/services";

/**
 * DTO complet d'un enrôlement avec les relations User et ClassRoom chargées.
 */
export type TEnrolementDTO = TEnrolement & {
  User: TUser;
  ClassRoom: TClassroom & { StudyYear: TStudyYear };
};

// --- Logger Interface (Simulé pour l'observabilité) ---
const logger = {
  info: (msg: string, meta?: object) => console.info(`[INFO] ${msg}`, meta),
  error: (msg: string, error?: unknown) =>
    console.error(`[ERROR] ${msg}`, error),
  warn: (msg: string, meta?: object) => console.warn(`[WARN] ${msg}`, meta),
};

/**
 * Queryde gestion des Enrôlements (inscriptions de l'utilisateur à une classe).
 * Gère les opérations de recherche, création, et mutation des liens entre utilisateur et classe.
 */
export class EnrolementQuery {
  // =============================================================================
  //  FETCH OPERATIONS
  // =============================================================================

  /**
   * Récupère la liste des enrôlements actifs pour une école et une année donnée.
   *
   * @param queryArgs - Paramètres incluant schoolId, yearId et filtres d'enrôlement supplémentaires.
   * @returns Liste des enrôlements avec les données utilisateur et de classe.
   * @throws {Error} Erreur de Querysi la requête DB échoue.
   */
  static async getEnrolements({
    schoolId,
    yearId,
    params = {},
  }: QueryParams<WithSchoolAndYearId, Partial<TEnrolementInsert>>): Promise<
    TEnrolementDTO[]
  > {
    if (!schoolId || !yearId) {
      throw new Error("Validation Error: schoolId and yearId are required.");
    }

    const enrolementWhereClause = pruneUndefined({ schoolId, ...params });
    const classRoomWhereClause = pruneUndefined({ yearId });

    try {
      const enrolements = await ClassroomEnrolement.findAll({
        where: enrolementWhereClause as WhereOptions<TEnrolement>,
        include: [
          User, // Inclusion directe de l'utilisateur
          {
            model: ClassRoom,
            where: classRoomWhereClause, // Filtrage par yearId sur la classe
            include: [StudyYear],
            required: true, // INNER JOIN pour garantir que la classe correspond au yearId
          },
        ],
        // Tri professionnel par nom complet (insensible à la casse)
        order: [
          [Sequelize.literal('LOWER("User"."last_name")'), "ASC"],
          [Sequelize.literal('LOWER("User"."middle_name")'), "ASC"],
          [Sequelize.literal('LOWER("User"."first_name")'), "ASC"],
        ],
      });
      return enrolements.map((e) => e.toJSON()) as TEnrolementDTO[];
    } catch (error) {
      logger.error("EnrolementService.getEnrolements: DB query failed.", error);
      throw new Error("Queryunavailable: Unable to retrieve enrolements.");
    }
  }

  /**
   * Récupère l'historique des inscriptions en se basant sur une école, une année scolaire ou une classe.
   *
   * NOTE: Cette fonction est complexe car elle filtre sur les associations non directement
   * liées à ClassroomEnrolement (comme StudyYear via ClassRoom).
   *
   * @param params - Paramètres de la requête (`schoolId`, `yearId`, `classId`).
   * @returns Un tableau d'enrôlements correspondant aux critères.
   * @throws {Error} Erreur de Querysi la requête DB échoue.
   */
  static async getEnrolementHistory({
    schoolId,
    yearId,
    classId,
  }: WithSchoolAndYearId<{ classId?: string }>): Promise<TEnrolementDTO[]> {
    // Clause WHERE sur la table d'enrôlement (ClassroomEnrolement)
    const enrolementWhereClause = pruneUndefined({ schoolId, classId });

    // Configuration des inclusions pour le filtrage
    const includeConditions: Includeable[] = [];

    if (yearId) {
      includeConditions.push({
        model: ClassRoom,
        required: true, // Inner Join
        attributes: [], // N'a pas besoin de récupérer les attributs de ClassRoom
        include: [
          {
            model: StudyYear,
            attributes: [], // N'a pas besoin de récupérer les attributs de StudyYear
            required: true, // Inner Join
            where: { yearId }, // Filtre sur l'année
          },
        ],
      });
    } else {
      // Si pas de yearId, on inclut User et ClassRoom (sans filtre StudyYear)
      includeConditions.push(User, ClassRoom);
    }

    try {
      const results = await ClassroomEnrolement.findAll({
        where: enrolementWhereClause as WhereOptions<TEnrolement>,
        include: includeConditions.length > 0 ? includeConditions : undefined,
      });

      return results.map((r) => r.toJSON()) as TEnrolementDTO[];
    } catch (error) {
      logger.error(
        "EnrolementService.getEnrolementHistory: DB query failed.",
        error
      );
      throw new Error(
        "Queryunavailable: Impossible de récupérer l'historique des enrôlements."
      );
    }
  }

  /**
   * Récupère un enrôlement unique par son ID.
   *
   * @param enrolementId - L'ID unique de l'enrôlement.
   * @returns L'enrôlement DTO ou `null` si non trouvé.
   */
  static async getEnrolementById(
    enrolementId: string
  ): Promise<TEnrolementDTO | null> {
    if (!enrolementId) return null;

    try {
      const enrolement = await ClassroomEnrolement.findByPk(enrolementId, {
        include: [User, ClassRoom],
      });
      return enrolement ? (enrolement.toJSON() as TEnrolementDTO) : null;
    } catch (error) {
      logger.error(
        `EnrolementService.getEnrolementById: Error for ID ${enrolementId}.`,
        error
      );
      throw new Error(
        "Queryunavailable: Impossible de récupérer l'enrôlement."
      );
    }
  }

  // =============================================================================
  //  MUTATION OPERATIONS
  // =============================================================================

  /**
   * Crée un nouvel enrôlement pour un utilisateur existant.
   *
   * @param data - Les données d'insertion de l'enrôlement.
   * @returns Le DTO de l'enrôlement créé.
   * @throws {Error} Erreur DB si l'insertion échoue.
   */
  static async createEnrolement(data: TEnrolementInsert): Promise<TEnrolement> {
    try {
      const enrolement = await ClassroomEnrolement.create(data);
      logger.info(`Enrolement created: ${enrolement.enrolementId}`, {
        studentId: data.studentId,
        classId: enrolement.classroomId,
      });
      return enrolement.toJSON();
    } catch (error) {
      logger.error(
        "EnrolementService.createEnrolement: Creation failed.",
        error
      );
      throw error;
    }
  }

  /**
   * Crée un nouvel utilisateur (étudiant) et l'inscrit immédiatement à une classe.
   *
   * @param data - Données de l'enrôlement rapide incluant les données du nouvel étudiant.
   * @returns Le DTO de l'enrôlement créé.
   * @throws {Error} Erreur si la création de l'utilisateur ou de l'enrôlement échoue.
   */
  static async createQuickEnrolement({
    student: studentValue,
    ...enrolementData
  }: TQuickEnrolementInsert): Promise<TEnrolement> {
    try {
      // 1. Création du nouvel utilisateur (via le QueryUser/Account)
      const student = await UserQuery.createUser({
        ...studentValue,
        schoolId: enrolementData.schoolId, // S'assurer que le schoolId est propagé
      });

      // 2. Création de l'enrôlement avec l'ID du nouvel utilisateur
      const enrolement = await ClassroomEnrolement.create({
        ...enrolementData,
        studentId: student.userId,
      });

      logger.info(`Quick Enrolement created: ${enrolement.enrolementId}`, {
        studentId: student.userId,
      });
      return enrolement.toJSON();
    } catch (error) {
      logger.error("EnrolementService.createQuickEnrolement: Failed.", error);
      throw error;
    }
  }

  /**
   * Met à jour les données d'un enrôlement existant.
   *
   * @param enrolementId - ID de l'enrôlement à mettre à jour.
   * @param data - Données partielles à appliquer.
   * @returns Le DTO de l'enrôlement mis à jour ou `null` si non trouvé.
   */
  static async updateEnrolement(
    enrolementId: string,
    data: Partial<TEnrolementInsert>
  ): Promise<TEnrolement | null> {
    if (!enrolementId) return null;

    try {
      const enrolement = await ClassroomEnrolement.findByPk(enrolementId);

      if (!enrolement) {
        logger.warn(
          `EnrolementService.updateEnrolement: ID ${enrolementId} not found.`
        );
        return null;
      }
      const updatedEnrolement = await enrolement.update(data);
      return updatedEnrolement.toJSON();
    } catch (error) {
      logger.error(
        `EnrolementService.updateEnrolement: Error updating ${enrolementId}.`,
        error
      );
      throw new Error("Queryunavailable: Update operation failed.");
    }
  }

  /**
   * Supprime un enrôlement (désinscription).
   *
   * @param enrolementId - ID de l'enrôlement à supprimer.
   * @returns `true` si supprimé, `false` sinon.
   */
  static async deleteEnrolement(enrolementId: string): Promise<boolean> {
    if (!enrolementId) return false;

    try {
      const deletedRowCount = await ClassroomEnrolement.destroy({
        where: { enrolementId },
      });
      return deletedRowCount > 0;
    } catch (error) {
      logger.error(
        `EnrolementService.deleteEnrolement: Error deleting ${enrolementId}.`,
        error
      );
      throw new Error("Queryerror: Delete operation failed.");
    }
  }
}
