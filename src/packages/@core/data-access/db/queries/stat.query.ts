import { db } from "../config";
import {
  users,
  classroomEnrolements,
  classRooms,
  options,
} from "../schemas/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { USER_ROLE_ENUM, STUDENT_STATUS_ENUM } from "../enum";

const logger = getLogger("StatsService");

export interface ChartDataPoint {
  label: string;
  value: number;
  fill?: string;
}

export interface ClassStatsDTO extends ChartDataPoint {
  classId: string;
  shortName: string;
}

export class StatsService {
  /**
   * Helper privé pour les agrégations simples.
   * Utilise le moteur de requêtes Drizzle pour un groupement performant.
   */
  private static async aggregateCount(
    table: any,
    column: any,
    filters: any,
    labelMapping?: Record<string, string>,
  ): Promise<ChartDataPoint[]> {
    try {
      const results = await db
        .select({
          groupKey: column,
          count: count(),
        })
        .from(table)
        .where(filters)
        .groupBy(column);

      return results.map((item) => ({
        label:
          labelMapping?.[item.groupKey as string] || (item.groupKey as string),
        value: Number(item.count),
      }));
    } catch (error) {
      logger.error(`Aggregation failed`, error as Error);
      return [];
    }
  }

  // --- KPI MÉTRIQUES ---

  static async getTotalStudents(
    schoolId: string,
    yearId: string,
  ): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(classroomEnrolements)
      .where(
        and(
          eq(classroomEnrolements.schoolId, schoolId),
          eq(classroomEnrolements.yearId, yearId),
        ),
      );
    return result?.value ?? 0;
  }

  // --- DONNÉES GRAPHIQUES ---

  /**
   * Répartition Hommes/Femmes (PieChart)
   */
  static async getGenderDistribution(
    schoolId: string,
  ): Promise<ChartDataPoint[]> {
    const labels = { MALE: "Masculin", FEMALE: "Féminin", OTHER: "Autre" };
    return this.aggregateCount(
      users,
      users.gender,
      and(eq(users.schoolId, schoolId), eq(users.role, USER_ROLE_ENUM.STUDENT)),
      labels,
    );
  }

  /**
   * Nombre d'élèves par classe (BarChart)
   */
  static async getStudentsCountByClass(
    schoolId: string,
    yearId: string,
  ): Promise<ClassStatsDTO[]> {
    try {
      const results = await db
        .select({
          classId: classRooms.classId,
          label: classRooms.identifier,
          shortName: classRooms.shortIdentifier,
          value: count(classroomEnrolements.studentId),
        })
        .from(classroomEnrolements)
        .innerJoin(
          classRooms,
          eq(classroomEnrolements.classroomId, classRooms.classId),
        )
        .where(
          and(
            eq(classroomEnrolements.schoolId, schoolId),
            eq(classRooms.yearId, yearId),
          ),
        )
        .groupBy(classRooms.classId)
        .orderBy(classRooms.shortIdentifier);

      return results.map((item) => ({
        ...item,
        value: Number(item.value),
      }));
    } catch (error) {
      logger.error("getStudentsCountByClass failed", error as Error);
      return [];
    }
  }

  /**
   * Répartition par Option (Radar ou BarChart)
   */
  static async getStudentsCountByOption(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    try {
      return await db
        .select({
          label: options.optionShortName,
          value: count(classroomEnrolements.studentId),
        })
        .from(classroomEnrolements)
        .innerJoin(
          classRooms,
          eq(classroomEnrolements.classroomId, classRooms.classId),
        )
        .innerJoin(options, eq(classRooms.optionId, options.optionId))
        .where(
          and(
            eq(classroomEnrolements.schoolId, schoolId),
            eq(classRooms.yearId, yearId),
          ),
        )
        .groupBy(options.optionShortName)
        .orderBy(options.optionShortName);
    } catch (error) {
      logger.error("getStudentsCountByOption failed", error as Error);
      return [];
    }
  }

  /**
   * Taux de rétention (Anciens vs Nouveaux)
   */
  static async getRetentionMetrics(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    const baseFilter = and(
      eq(classroomEnrolements.schoolId, schoolId),
      eq(classroomEnrolements.yearId, yearId),
      eq(classroomEnrolements.status, STUDENT_STATUS_ENUM.EN_COURS),
    );

    const [results] = await db
      .select({
        total: count(),
        newStudents: sql<number>`count(case when ${classroomEnrolements.isNewStudent} = 1 then 1 end)`,
      })
      .from(classroomEnrolements)
      .where(baseFilter);

    const total = results?.total ?? 0;
    const news = results?.newStudents ?? 0;
    const oldStudents = total - news;

    return [
      { label: "Anciens", value: oldStudents, fill: "var(--color-old)" },
      { label: "Nouveaux", value: news, fill: "var(--color-new)" },
    ];
  }

  /**
   * Statuts des élèves (Actif, Abandon, etc.)
   */
  static async getStudentStatusStats(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    const statusLabels: Record<string, { label: string; color: string }> = {
      [STUDENT_STATUS_ENUM.EN_COURS]: {
        label: "Actifs / Abonnés",
        color: "var(--color-active)",
      },
      [STUDENT_STATUS_ENUM.ABANDON]: {
        label: "Abandons",
        color: "var(--color-abandon)",
      },
      [STUDENT_STATUS_ENUM.EXCLUT]: {
        label: "Exclus",
        color: "var(--color-excluded)",
      },
    };

    const results = await db
      .select({
        status: classroomEnrolements.status,
        count: count(),
      })
      .from(classroomEnrolements)
      .where(
        and(
          eq(classroomEnrolements.schoolId, schoolId),
          eq(classroomEnrolements.yearId, yearId),
        ),
      )
      .groupBy(classroomEnrolements.status);

    return results.map((item) => ({
      label: statusLabels[item.status]?.label || item.status,
      value: Number(item.count),
      fill: statusLabels[item.status]?.color || "var(--color-default)",
    }));
  }

  /**
   * KPI Rapide pour Summary Cards
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
