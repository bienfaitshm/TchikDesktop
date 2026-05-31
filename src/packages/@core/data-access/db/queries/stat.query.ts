import { db } from "../config";
import {
  users,
  classroomEnrolements,
  classRooms,
  options,
} from "../schemas/schema";
import { eq, and, sql, count, SQL } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { USER_ROLE_ENUM, STUDENT_STATUS_ENUM } from "../enum";

const logger = getLogger("StatsService");

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ClassStatsDTO extends ChartDataPoint {
  classId: string;
  shortName: string;
}

/**
 * Service de statistiques scolaires.
 * Toutes les méthodes renvoient des données sans informations de style (couleurs, etc.)
 * pour respecter la séparation backend / frontend.
 */
export class StatsService {
  /**
   * Agrégation générique groupée par une colonne.
   */
  private static async aggregateCount<
    TTable extends Record<string, any>,
    TColumn extends keyof TTable & string,
  >(
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
          labelMapping?.[item.groupKey as string] ?? (item.groupKey as string),
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
   * Répartition Hommes/Femmes.
   * Retourne des labels sans accents : "masculin", "feminin", "autre".
   * Correspond à la config GENDER_CONFIG (clés : masculin, féminin).
   */
  static async getGenderDistribution(
    schoolId: string,
  ): Promise<ChartDataPoint[]> {
    const labels = {
      MALE: "masculin",
      FEMALE: "feminin",
      OTHER: "autre",
    };

    return this.aggregateCount(
      users,
      users.gender,
      and(eq(users.schoolId, schoolId), eq(users.role, USER_ROLE_ENUM.STUDENT)),
      labels,
    );
  }

  /**
   * Nombre d'élèves par classe (BarChart).
   * Les champs `label` et `shortName` sont conservés tels quels ;
   * la config CLASS_CONFIG peut mapper `value` → couleur.
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
   * Répartition par Option (BarChart).
   * Le label est le nom court de l'option.
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
   * Taux de rétention (Anciens vs Nouveaux).
   * Labels retournés : "anciens", "nouveaux".
   * Compatible avec RETENTION_CONFIG.
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
      { label: "anciens", value: oldStudents },
      { label: "nouveaux", value: news },
    ];
  }

  /**
   * Statuts des élèves (Actif, Abandon, Exclu).
   * Labels retournés : "active", "abandon", "exclu".
   * Compatible avec STATUS_CONFIG.
   */
  static async getStudentStatusStats(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    // Mapping de l'enum vers les clés de STATUS_CONFIG
    const statusKeys: Record<string, string> = {
      [STUDENT_STATUS_ENUM.EN_COURS]: "active",
      [STUDENT_STATUS_ENUM.ABANDON]: "abandon",
      [STUDENT_STATUS_ENUM.EXCLUT]: "exclu",
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
      label: statusKeys[item.status] ?? item.status,
      value: Number(item.count),
    }));
  }

  /**
   * KPI rapides pour les Summary Cards.
   * Retourne les totaux calculés à partir des statuts.
   */
  static async getQuickKpis(schoolId: string, yearId: string) {
    const stats = await this.getStudentStatusStats(schoolId, yearId);
    const total = stats.reduce((acc, curr) => acc + curr.value, 0);
    const active = stats.find((s) => s.label === "active")?.value ?? 0;
    const excluded = stats.find((s) => s.label === "exclu")?.value ?? 0;

    return { total, active, excluded };
  }
}
