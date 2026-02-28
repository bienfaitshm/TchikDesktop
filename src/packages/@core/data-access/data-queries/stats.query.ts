import { fn, col, WhereOptions } from "sequelize";
import {
  ClassRoom,
  Option,
  User,
  ClassroomEnrolement,
  USER_ROLE,
  STUDENT_STATUS,
} from "@/packages/@core/data-access/db";
import { getLogger } from "@/packages/logger";

export interface ChartDataPoint {
  label: string;
  value: number;
  fill?: string;
}

export interface ClassStatsDTO extends ChartDataPoint {
  classId: string;
  shortName: string;
}

const logger = getLogger("StatsService");

/**
 * Service de statistiques optimisé pour les tableaux de bord.
 * Les données sont formatées pour être directement injectées dans Shadcn/Charts.
 */
export class StatsService {
  /**
   * Centralise les agrégations simples pour réduire la répétition et améliorer la maintenance.
   */
  private static async aggregateCount(
    model: any,
    groupField: string,
    where: WhereOptions,
    labelMapping?: Record<string, string>,
  ): Promise<ChartDataPoint[]> {
    try {
      const results = await model.findAll({
        attributes: [
          [groupField, "groupKey"],
          [fn("COUNT", col(groupField)), "count"],
        ],
        where,
        group: ["groupKey"],
        raw: true,
      });

      return results.map((item: any) => ({
        label: labelMapping
          ? labelMapping[item.groupKey] || item.groupKey
          : item.groupKey,
        value: Number(item.count),
      }));
    } catch (error) {
      logger.error(`Aggregation failed on ${groupField}`, error);
      return [];
    }
  }

  // =============================================================================
  //  MÉTRIQUES KPI (VALEURS UNIQUES)
  // =============================================================================

  static async getTotalStudents(schoolId: string): Promise<number> {
    return User.count({
      where: { schoolId, role: USER_ROLE.STUDENT } as WhereOptions,
    }).catch((err) => {
      logger.error("Failed to get total students", err);
      return 0;
    });
  }

  // =============================================================================
  //  DONNÉES POUR GRAPHIQUES (ARRAY FORMAT)
  // =============================================================================

  /**
   * Idéal pour un PieChart (Répartition Hommes/Femmes)
   */
  static async getGenderDistribution(
    schoolId: string,
  ): Promise<ChartDataPoint[]> {
    const labels = { M: "Masculin", F: "Féminin", OTHER: "Autre" };
    return this.aggregateCount(
      User,
      "gender",
      { schoolId, role: USER_ROLE.STUDENT },
      labels,
    );
  }

  /**
   * Idéal pour un BarChart (Nombre d'élèves par classe)
   */
  static async getStudentsCountByClass(
    schoolId: string,
    yearId: string,
  ): Promise<ClassStatsDTO[]> {
    try {
      const results = await ClassroomEnrolement.findAll({
        attributes: ["classroomId", [fn("COUNT", col("student_id")), "value"]],
        where: { schoolId } as WhereOptions,
        include: [
          {
            model: ClassRoom,
            attributes: ["identifier", "shortIdentifier"],
            required: true,
            where: { yearId } as WhereOptions,
          },
        ],
        group: ["ClassroomEnrolement.classroomId", "ClassRoom.classId"],
        raw: true,
      });

      return results.map((item: any) => ({
        classId: item.classroomId,
        label: item["ClassRoom.identifier"],
        shortName: item["ClassRoom.shortIdentifier"],
        value: Number(item.value),
      }));
    } catch (error) {
      logger.error("getStudentsCountByClass failed", error);
      return [];
    }
  }

  /**
   * Répartition par Option (Ex: Informatique, Gestion, etc.)
   */
  static async getStudentsCountByOption(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    try {
      const results = await ClassroomEnrolement.findAll({
        attributes: [[fn("COUNT", col("student_id")), "value"]],
        where: { schoolId } as WhereOptions,
        include: [
          {
            model: ClassRoom,
            attributes: [],
            required: true,
            where: { yearId } as WhereOptions,
            include: [
              { model: Option, attributes: ["optionName"], required: true },
            ],
          },
        ],
        group: ["ClassRoom.Option.optionName"],
        raw: true,
      });

      return results.map((item: any) => ({
        label: item["ClassRoom.Option.optionName"],
        value: Number(item.value),
      }));
    } catch (error) {
      logger.error("getStudentsCountByOption failed", error);
      return [];
    }
  }

  /**
   * Taux de rétention (KPI complexe)
   * Retourne un pourcentage pour un graphique de type "Radial" ou "Gauge"
   */
  static async getRetentionMetrics(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    const where = { schoolId, status: STUDENT_STATUS.EN_COURS };
    const include = [{ model: ClassRoom, required: true, where: { yearId } }];

    const [total, news] = await Promise.all([
      ClassroomEnrolement.count({ where, include }),
      ClassroomEnrolement.count({
        where: { ...where, isNewStudent: true },
        include,
      }),
    ]);

    const oldStudents = total - news;

    return [
      { label: "Anciens", value: oldStudents, fill: "var(--color-old)" },
      { label: "Nouveaux", value: news, fill: "var(--color-new)" },
    ];
  }

  /**
   * Récupère la répartition des élèves par statut (Actif, Exclu, etc.)
   * @param schoolId ID de l'école
   * @param yearId ID de l'année scolaire (optionnel pour voir l'historique global)
   */
  static async getStudentStatusStats(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    try {
      // On récupère les comptes groupés par statut en une seule requête SQL
      const results = await ClassroomEnrolement.findAll({
        attributes: ["status", [fn("COUNT", col("enrolement_id")), "count"]],
        where: { schoolId, yearId } as WhereOptions,
        group: ["status"],
        raw: true,
      });

      // Mapping des labels pour l'affichage (traduction des ENUMS)
      const statusLabels: Record<string, { label: string; color: string }> = {
        [STUDENT_STATUS.EN_COURS]: {
          label: "Actifs / Abonnés",
          color: "var(--color-active)",
        },
        [STUDENT_STATUS.ABANDON]: {
          label: "Abandons",
          color: "var(--color-abandon)",
        },
        [STUDENT_STATUS.EXCLUT]: {
          label: "Exclus",
          color: "var(--color-excluded)",
        },
        // [STUDENT_STATUS.TRANSFERE]: { label: "Transférés", color: "var(--color-transferred)" },
      };

      // Formatage pour Shadcn Charts
      return results.map((item: any) => ({
        label: statusLabels[item.status]?.label || item.status,
        value: Number(item.count),
        fill: statusLabels[item.status]?.color || "var(--color-default)",
      }));
    } catch (error) {
      logger.error("StatsService.getStudentStatusStats failed", error);
      return [];
    }
  }

  /**
   * KPI Rapide pour les cartes de résumé (Summary Cards)
   */
  static async getQuickKpis(schoolId: string, yearId: string) {
    const stats = await this.getStudentStatusStats(schoolId, yearId);

    return {
      total: stats.reduce((acc, curr) => acc + curr.value, 0),
      active: stats.find((s) => s.label.includes("Actif"))?.value || 0,
      excluded: stats.find((s) => s.label.includes("Exclu"))?.value || 0,
    };
  }
}
