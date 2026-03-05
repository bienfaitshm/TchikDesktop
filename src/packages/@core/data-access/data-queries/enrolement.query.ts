import {
  ClassroomEnrolement,
  User,
  ClassRoom,
  StudyYear,
  Option,
  buildFindOptions,
  STUDENT_STATUS,
  type TEnrolement,
  type TUser,
  type TClassroom,
  type TStudyYear,
} from "@/packages/@core/data-access/db";
import { getLogger } from "@/packages/logger";
import type {
  TEnrolementFilter,
  TEnrolementQuickCreate,
  TEnrolementCreate,
  TEnrolementUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { Sequelize, FindOptions } from "sequelize";

import { UserQuery } from "./user.query";

const DEFAULT_SORT_ORDER: FindOptions["order"] = [
  [Sequelize.literal('LOWER("User"."last_name")'), "ASC"],
  [Sequelize.literal('LOWER("User"."middle_name")'), "ASC"],
  [Sequelize.literal('LOWER("User"."first_name")'), "ASC"],
];

/**
 * DTO complet d'un enrôlement avec les relations User et ClassRoom chargées.
 */
export type TEnrolementDTO = TEnrolement & {
  User: TUser;
  ClassRoom: TClassroom & { StudyYear: TStudyYear };
};

const logger = getLogger("Enrolement Query");

/**
 * Queryde gestion des Enrôlements (inscriptions de l'utilisateur à une classe).
 * Gère les opérations de recherche, création, et mutation des liens entre utilisateur et classe.
 */
export class EnrolementQuery {
  // =============================================================================
  //  FETCH OPERATIONS
  // =============================================================================

  private static getFilterOptions(
    filters: TEnrolementFilter,
    orders?: FindOptions["order"],
  ) {
    if (!filters.schoolId || !filters.yearId) {
      throw new Error("Validation Error: schoolId and yearId are required.");
    }

    return buildFindOptions(filters, orders);
  }

  /**
   * Récupère la liste des enrôlements actifs pour une école et une année donnée.
   *
   * @param queryArgs - Paramètres incluant schoolId, yearId et filtres d'enrôlement supplémentaires.
   * @returns Liste des enrôlements avec les données utilisateur et de classe.
   * @throws {Error} Erreur de Querysi la requête DB échoue.
   */
  static async findMany(filters: TEnrolementFilter): Promise<TEnrolementDTO[]> {
    const options = this.getFilterOptions(filters, DEFAULT_SORT_ORDER);

    try {
      const enrolements = await ClassroomEnrolement.findAll({
        ...options,
        include: [
          User,
          {
            model: ClassRoom,
            include: [StudyYear],
            required: true,
          },
        ],
      });
      return enrolements.map((e) => e.toJSON()) as TEnrolementDTO[];
    } catch (error) {
      logger.error("EnrolementService.getEnrolements: DB query failed.", error);
      return [];
    }
  }
  static async getTotalStudents(filters: TEnrolementFilter): Promise<number> {
    const options = this.getFilterOptions(filters, DEFAULT_SORT_ORDER);
    return ClassroomEnrolement.count(options).catch((err) => {
      logger.error("Failed to get total students", err);
      return 0;
    });
  }
  static async getStudentsCountByClass(
    filters: TEnrolementFilter,
  ): Promise<unknown[]> {
    try {
      const options = this.getFilterOptions(filters, [
        [Sequelize.col("ClassRoom.short_identifier"), "ASC"],
      ]);

      const results = await ClassroomEnrolement.findAll({
        attributes: [
          "classroomId",
          [Sequelize.fn("COUNT", Sequelize.col("student_id")), "value"],
        ],
        ...options,
        include: [
          {
            model: ClassRoom,
            attributes: ["identifier", "shortIdentifier"],
            required: true,
          },
        ],
        group: [
          Sequelize.col("ClassroomEnrolement.classroom_id"),
          Sequelize.col("ClassRoom.class_id"),
        ],
        raw: true,
      });

      return results.map((item) => item.toJSON());
    } catch (error) {
      console.log(error);
      logger.error("EnrolementQuery.getStudentsCountByClass failed", error);
      return [];
    }
  }

  /**
   * Répartition par Option (Ex: Informatique, Gestion, etc.)
   */
  static async getStudentsCountByOption(
    filters: TEnrolementFilter,
  ): Promise<unknown[]> {
    try {
      const options = this.getFilterOptions(filters, [
        Sequelize.col("ClassRoom->Option.option_short_name"),
        "ASC",
      ]);
      const results = await ClassroomEnrolement.findAll({
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("student_id")), "value"],
        ],
        ...options,
        include: [
          {
            model: ClassRoom,
            attributes: [],
            required: true,
            include: [
              {
                model: Option,
                attributes: ["optionShortName"],
                required: true,
              },
            ],
          },
        ],
        group: [Sequelize.col("ClassRoom->Option.option_name")],
        order: [[Sequelize.col("ClassRoom->Option.option_short_name"), "ASC"]],
        raw: true,
      });

      return results.map((item) => item.toJSON());
    } catch (error) {
      logger.error("EnrolementQuery.getStudentsCountByOption failed", error);
      return [];
    }
  }

  /**
   * Récupère un enrôlement unique par son ID.
   *
   * @param enrolementId - L'ID unique de l'enrôlement.
   * @returns L'enrôlement DTO ou `null` si non trouvé.
   */
  static async findById(enrolementId: string): Promise<TEnrolementDTO | null> {
    if (!enrolementId) return null;

    try {
      const enrolement = await ClassroomEnrolement.findByPk(enrolementId, {
        include: [User, ClassRoom],
      });
      return enrolement ? (enrolement.toJSON() as TEnrolementDTO) : null;
    } catch (error) {
      logger.error(
        `EnrolementService.getEnrolementById: Error for ID ${enrolementId}.`,
        error,
      );
      return null;
    }
  }

  /**
   * Taux de rétention (KPI complexe)
   * Retourne un pourcentage pour un graphique de type "Radial" ou "Gauge"
   */
  static async getRetentionMetrics(filters: TEnrolementFilter) {
    const options = this.getFilterOptions(filters, DEFAULT_SORT_ORDER);
    const include = [{ model: ClassRoom, required: true }];

    const [total, news] = await Promise.all([
      ClassroomEnrolement.count({ ...options, include }),
      ClassroomEnrolement.count({
        where: { ...options.where, isNewStudent: true },
        include,
      }),
    ]);

    const oldStudents = total - news;

    return { total, oldStudents, news };
  }

  /**
   * Récupère la répartition des élèves par statut (Actif, Exclu, etc.)
   * @param schoolId ID de l'école
   * @param yearId ID de l'année scolaire (optionnel pour voir l'historique global)
   */
  static async getStudentStatusStats(filters: TEnrolementFilter) {
    try {
      const options = this.getFilterOptions(filters, DEFAULT_SORT_ORDER);
      const results = await ClassroomEnrolement.findAll({
        ...options,
        attributes: [
          "status",
          [Sequelize.fn("COUNT", Sequelize.col("enrolement_id")), "count"],
        ],
        group: ["status"],
        raw: true,
      });
      return results.map((item) => item.toJSON());
    } catch (error) {
      logger.error("StatsService.getStudentStatusStats failed", error);
      return [];
    }
  }

  /**
   * KPI Rapide pour les cartes de résumé (Summary Cards)
   */
  static async getQuickKpis(filters: TEnrolementFilter) {
    const stats = await this.getStudentStatusStats(filters);

    return {
      total: stats.reduce((acc, curr) => acc + curr.count, 0),
      active:
        stats.find((s) => s.status === STUDENT_STATUS.EN_COURS)?.count || 0,
      excluded:
        stats.find((s) => s.status === STUDENT_STATUS.EXCLUT)?.count || 0,
      inactive:
        stats.find((s) => s.status === STUDENT_STATUS.ABANDON)?.count || 0,
    };
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
  static async create(data: TEnrolementCreate): Promise<TEnrolement> {
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
        error,
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
  static async quickCreate({
    student,
    isInSystem,
    studentId,
    ...enrolement
  }: TEnrolementQuickCreate): Promise<TEnrolement> {
    try {
      let studentInstance: TUser | null = null;
      if (isInSystem && studentId) {
        const existingStudent = await UserQuery.findById(studentId);
        if (!existingStudent) {
          throw Error("L'eleve n'existe pas");
        }
        studentInstance = existingStudent;
      }

      if (!isInSystem && student) {
        // 2. Création du nouvel utilisateur (via le QueryUser/Account)
        studentInstance = await UserQuery.create({
          ...student,
          schoolId: enrolement.schoolId,
        });
      }

      if (!studentInstance) {
        throw Error("Erreur lors de la creation de l'eleve");
      }

      // 3. Création de l'enrôlement avec l'ID du nouvel utilisateur
      const enrolementInstance = await ClassroomEnrolement.create({
        ...enrolement,
        studentId: studentInstance.userId,
      });

      logger.info(
        `Quick Enrolement created: ${enrolementInstance.enrolementId}`,
        {
          studentId: studentInstance.userId,
        },
      );
      return enrolementInstance.toJSON();
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
  static async update(
    enrolementId: string,
    data: TEnrolementUpdate,
  ): Promise<TEnrolement | null> {
    if (!enrolementId) return null;

    try {
      const enrolement = await ClassroomEnrolement.findByPk(enrolementId);

      if (!enrolement) {
        logger.warn(
          `EnrolementService.updateEnrolement: ID ${enrolementId} not found.`,
        );
        return null;
      }
      const updatedEnrolement = await enrolement.update(data);
      return updatedEnrolement.toJSON();
    } catch (error) {
      logger.error(
        `EnrolementService.updateEnrolement: Error updating ${enrolementId}.`,
        error,
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
  static async delete(enrolementId: string): Promise<boolean> {
    if (!enrolementId) return false;

    try {
      const deletedRowCount = await ClassroomEnrolement.destroy({
        where: { enrolementId },
      });
      return deletedRowCount > 0;
    } catch (error) {
      logger.error(
        `EnrolementService.deleteEnrolement: Error deleting ${enrolementId}.`,
        error,
      );
      throw new Error("Queryerror: Delete operation failed.");
    }
  }
}
