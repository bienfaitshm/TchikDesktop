// stats.service.ts

import { User, ClassroomEnrolement, ClassRoom, Option } from "@/main/db/models";
import { USER_ROLE, STUDENT_STATUS } from "@/commons/constants/enum"; // Assurez-vous d'avoir les constantes d'énumération
import { type WhereOptions, fn, col } from "sequelize";

// =============================================================================
//  TYPAGES DTO (Data Transfer Object)
// =============================================================================

/**
 * Type générique pour les résultats d'agrégation { key: count } (ex: Genre, Statut).
 */
export type StatsCount = { [key: string]: number };

/**
 * DTO pour le décompte des étudiants par classe.
 */
export interface ClassCountDTO {
  classId: string;
  className: string;
  shortName: string;
  studentCount: number;
}

/**
 * DTO pour le décompte des étudiants par option.
 */
export interface OptionCountDTO {
  optionName: string;
  studentCount: number;
}

/**
 * DTO pour le décompte des étudiants par classe et année de promotion.
 */
export interface PromotionCountDTO {
  promotionYear: number;
  studentCount: number;
}

// --- Logger Interface (Simulé pour l'observabilité) ---
const logger = {
  info: (msg: string, meta?: object) => console.info(`[INFO] ${msg}`, meta),
  error: (msg: string, error?: unknown) =>
    console.error(`[ERROR] ${msg}`, error),
  warn: (msg: string, meta?: object) => console.warn(`[WARN] ${msg}`, meta),
};

/**
 * Service de gestion des statistiques et des métriques clés (KPIs).
 * Utilise les fonctions d'agrégation de Sequelize.
 */
export class StatsService {
  // =============================================================================
  //  MÉTRIQUES DE BASE (Rendu plus robuste)
  // =============================================================================

  /**
   * @description Compte le nombre total d'étudiants actifs.
   * @param schoolId L'ID de l'école.
   * @returns Le nombre total d'étudiants.
   * @throws {Error} Erreur de service si la requête DB échoue.
   */
  static async getTotalStudents(schoolId: string): Promise<number> {
    try {
      return await User.count({
        where: {
          schoolId,
          role: USER_ROLE.STUDENT,
        } as WhereOptions<User>,
      });
    } catch (error) {
      logger.error("StatsService.getTotalStudents failed.", error);
      throw new Error(
        "Service unavailable: Cannot retrieve total student count."
      );
    }
  }

  /**
   * @description Compte le nombre d'étudiants par genre (masculin/féminin).
   * @param schoolId L'ID de l'école.
   * @returns Un objet avec le décompte par genre.
   * @throws {Error} Erreur de service.
   */
  static async getStudentCountByGender(schoolId: string): Promise<StatsCount> {
    try {
      const result = await User.findAll({
        attributes: ["gender", [fn("COUNT", col("gender")), "count"]],
        where: {
          schoolId,
          role: USER_ROLE.STUDENT,
        } as WhereOptions<User>,
        group: ["gender"],
        raw: true,
      });

      return result.reduce((acc, item: any) => {
        // La clé de l'agrégation est dynamique (gender)
        acc[item.gender] = parseInt(item.count, 10);
        return acc;
      }, {} as StatsCount);
    } catch (error) {
      logger.error("StatsService.getStudentCountByGender failed.", error);
      throw new Error(
        "Service unavailable: Cannot retrieve student count by gender."
      );
    }
  }

  /**
   * @description Compte le nombre de nouveaux étudiants pour l'année en cours.
   * @param schoolId L'ID de l'école.
   * @returns Le nombre de nouveaux étudiants.
   * @throws {Error} Erreur de service.
   */
  static async getNewStudentsCount(schoolId: string): Promise<number> {
    try {
      return await ClassroomEnrolement.count({
        where: {
          schoolId,
          isNewStudent: true,
        } as WhereOptions<ClassroomEnrolement>,
      });
    } catch (error) {
      logger.error("StatsService.getNewStudentsCount failed.", error);
      throw new Error(
        "Service unavailable: Cannot retrieve new student count."
      );
    }
  }

  // =============================================================================
  //  MÉTRIQUES D'AGRÉGATION AVEC JOINTURES
  // =============================================================================

  /**
   * @description Compte le nombre d'étudiants par classe pour une année scolaire spécifique.
   * @param schoolId L'ID de l'école.
   * @param yearId L'ID de l'année scolaire.
   * @returns Liste d'objets détaillés par classe.
   * @throws {Error} Erreur de service.
   */
  static async getStudentsCountByClass(
    schoolId: string,
    yearId: string
  ): Promise<ClassCountDTO[]> {
    if (!schoolId || !yearId)
      throw new Error("Validation Error: schoolId and yearId required.");

    try {
      const result = await ClassroomEnrolement.findAll({
        attributes: [
          "classroomId",
          [fn("COUNT", col("student_id")), "studentCount"],
        ],
        where: { schoolId } as WhereOptions<ClassroomEnrolement>,
        include: [
          {
            model: ClassRoom,
            attributes: ["identifier", "shortIdentifier"],
            required: true,
            where: { yearId } as WhereOptions<ClassRoom>,
          },
        ],
        group: ["ClassroomEnrolement.classroomId", "ClassRoom.classId"],
        raw: true,
      });

      return result.map((item: any) => ({
        classId: item.classroomId,
        className: item["ClassRoom.identifier"],
        shortName: item["ClassRoom.shortIdentifier"],
        studentCount: parseInt(item.studentCount, 10),
      }));
    } catch (error) {
      logger.error("StatsService.getStudentsCountByClass failed.", error);
      throw new Error(
        "Service unavailable: Cannot retrieve student count by class."
      );
    }
  }

  /**
   * @description Compte le nombre d'étudiants par statut d'inscription (ex: EN_COURS, EXCLU).
   * @param schoolId L'ID de l'école.
   * @returns Un objet avec le décompte par statut.
   * @throws {Error} Erreur de service.
   */
  static async getStudentCountByStatus(schoolId: string): Promise<StatsCount> {
    try {
      const result = await ClassroomEnrolement.findAll({
        attributes: ["status", [fn("COUNT", col("status")), "count"]],
        where: { schoolId } as WhereOptions<ClassroomEnrolement>,
        group: ["status"],
        raw: true,
      });

      return result.reduce((acc, item: any) => {
        acc[item.status] = parseInt(item.count, 10);
        return acc;
      }, {} as StatsCount);
    } catch (error) {
      logger.error("StatsService.getStudentCountByStatus failed.", error);
      throw new Error(
        "Service unavailable: Cannot retrieve student count by status."
      );
    }
  }

  /**
   * @description Compte le nombre total d'étudiants par option d'étude pour l'année en cours.
   * @param schoolId L'ID de l'école.
   * @param yearId L'ID de l'année scolaire.
   * @returns Liste d'objets contenant le nom de l'option et le nombre d'étudiants.
   * @throws {Error} Erreur de service.
   */
  static async getStudentsCountByOption(
    schoolId: string,
    yearId: string
  ): Promise<OptionCountDTO[]> {
    if (!schoolId || !yearId)
      throw new Error("Validation Error: schoolId and yearId required.");

    try {
      const result = await ClassroomEnrolement.findAll({
        attributes: [[fn("COUNT", col("student_id")), "studentCount"]],
        where: { schoolId } as WhereOptions<ClassroomEnrolement>,
        include: [
          {
            model: ClassRoom,
            attributes: [], // Seulement pour la jointure
            required: true,
            where: { yearId } as WhereOptions<ClassRoom>,
            include: [
              {
                model: Option,
                attributes: ["optionName"],
                required: true,
              },
            ],
          },
        ],
        group: ["ClassRoom.Option.optionName"],
        raw: true,
      });

      return result.map((item: any) => ({
        optionName: item["ClassRoom.Option.optionName"],
        studentCount: parseInt(item.studentCount, 10),
      }));
    } catch (error) {
      logger.error("StatsService.getStudentsCountByOption failed.", error);
      throw new Error(
        "Service unavailable: Cannot retrieve student count by option."
      );
    }
  }

  /**
   * @description Obtient le nombre total de classes par section (e.g., Primaire, Secondaire).
   * @param schoolId L'ID de l'école.
   * @returns Un objet avec le décompte des classes par section.
   * @throws {Error} Erreur de service.
   */
  static async getClassCountBySection(schoolId: string): Promise<StatsCount> {
    try {
      const result = await ClassRoom.findAll({
        attributes: ["section", [fn("COUNT", col("section")), "count"]],
        where: { schoolId } as WhereOptions<ClassRoom>,
        group: ["section"],
        raw: true,
      });

      return result.reduce((acc, item: any) => {
        acc[item.section] = parseInt(item.count, 10);
        return acc;
      }, {} as StatsCount);
    } catch (error) {
      logger.error("StatsService.getClassCountBySection failed.", error);
      throw new Error(
        "Service unavailable: Cannot retrieve class count by section."
      );
    }
  }

  // =============================================================================
  //  MÉTHODES AVANCÉES (TENDANCES ET KPIS)
  // =============================================================================

  /**
   * @description Calcule le ratio Hommes/Femmes (KPI de parité).
   * @param schoolId L'ID de l'école.
   * @returns {Promise<number>} Ratio Hommes / Femmes.
   */
  static async getGenderRatio(schoolId: string): Promise<number> {
    const counts = await this.getStudentCountByGender(schoolId);
    const maleCount = counts["M"] || 0;
    const femaleCount = counts["F"] || 0;

    if (femaleCount === 0) return maleCount > 0 ? Infinity : 0; // Gère la division par zéro

    return maleCount / femaleCount;
  }

  /**
   * @description Calcule le taux de redoublement (Basé sur une année fictive de redoublement/ré-inscription).
   * NOTE: Ceci nécessite une logique métier spécifique pour identifier les redoublants (ex: année précédente vs année actuelle).
   * Nous allons simuler un taux basé sur les étudiants qui ne sont *pas* marqués comme 'isNewStudent' et qui ne sont pas exclus.
   *
   * @param schoolId L'ID de l'école.
   * @param yearId L'ID de l'année scolaire.
   * @returns {Promise<number>} Le taux de non-nouveaux étudiants (incluant les redoublants/anciens).
   */
  static async getRetentionRate(
    schoolId: string,
    yearId: string
  ): Promise<number> {
    try {
      // 1. Total des inscriptions actives pour l'année
      const totalEnrolements = await ClassroomEnrolement.count({
        where: {
          schoolId,
          status: STUDENT_STATUS.EN_COURS,
        } as WhereOptions<ClassroomEnrolement>,
        include: [{ model: ClassRoom, required: true, where: { yearId } }],
      });

      if (totalEnrolements === 0) return 0;

      // 2. Nombre de nouveaux étudiants (simulé pour l'année)
      const newStudentsCount = await ClassroomEnrolement.count({
        where: {
          schoolId,
          isNewStudent: true,
          status: STUDENT_STATUS.EN_COURS,
        } as WhereOptions<ClassroomEnrolement>,
        include: [{ model: ClassRoom, required: true, where: { yearId } }],
      });

      // Rétention = 1 - (Nouveaux / Total)
      const nonNewStudents = totalEnrolements - newStudentsCount;
      return nonNewStudents / totalEnrolements;
    } catch (error) {
      logger.error("StatsService.getRetentionRate failed.", error);
      throw new Error("Service unavailable: Cannot retrieve retention rate.");
    }
  }
}
