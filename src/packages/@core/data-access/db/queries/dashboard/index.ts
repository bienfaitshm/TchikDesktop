import { db } from "@/packages/@core/data-access/db/config";
import {
  users,
  classroomEnrollments,
  classrooms,
  options,
  studyYears,
} from "@/packages/@core/data-access/db/schemas/schema";
import { eq, and, sql, count, SQL, asc } from "drizzle-orm";
import type { SQLiteTable, SQLiteColumn } from "drizzle-orm/sqlite-core";
import { getLogger } from "@/packages/logger";
import {
  USER_ROLE_ENUM,
  STUDENT_STATUS_ENUM,
  USER_GENDER_ENUM,
} from "@/packages/@core/data-access/db/enum";

const logger = getLogger("StatsService");

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ClassStatsDTO extends ChartDataPoint {
  classId: string;
  shortName: string;
}

export interface EnrollmentStatsByYear {
  yearId: string;
  yearName: string;
  total: number;
  female: number;
  male: number;
}

export interface StatsSummary {
  total: number;
  active: number;
  excluded: number;
  dropout: number;
}

/**
 * Exécute une agrégation `COUNT` groupée par une colonne.
 * Applique les filtres passés et traduit éventuellement les clés de groupe via `labelMapping`.
 *
 * @param table - Table Drizzle
 * @param column - Colonne de regroupement
 * @param filters - Condition(s) WHERE (objet ou array d'opérateurs Drizzle)
 * @param labelMapping - Mapping optionnel pour renommer les labels
 * @returns Liste de points de données { label, value }
 */
async function aggregateCount(
  table: SQLiteTable,
  column: SQLiteColumn,
  filters: SQL | undefined,
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
    logger.error(`Aggregation on ${table} failed`, error as Error);
    return [];
  }
}

/**
 * Statistiques liées aux inscriptions et à la répartition par année.
 */
export namespace EnrollmentStats {
  /**
   * Nombre total d'élèves pour une école et une année donnée.
   */
  export async function getTotalStudents(
    schoolId: string,
    yearId: string,
  ): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(classroomEnrollments)
      .where(
        and(
          eq(classroomEnrollments.schoolId, schoolId),
          eq(classroomEnrollments.yearId, yearId),
        ),
      );
    return result?.value ?? 0;
  }

  /**
   * Répartition des inscriptions par année scolaire avec détails par genre.
   * Retourne pour chaque année : total, nombre de filles, nombre de garçons.
   */
  export async function getStatsByYear(
    schoolId: string,
  ): Promise<EnrollmentStatsByYear[]> {
    try {
      const results = await db
        .select({
          yearId: studyYears.yearId,
          yearName: studyYears.yearName,
          total: count(classroomEnrollments.enrollmentId),
          female: sql<number>`COUNT(CASE WHEN ${users.gender} = ${USER_GENDER_ENUM.FEMALE} THEN 1 END)`,
          male: sql<number>`COUNT(CASE WHEN ${users.gender} = ${USER_GENDER_ENUM.MALE} THEN 1 END)`,
        })
        .from(studyYears)
        .leftJoin(
          classroomEnrollments,
          and(
            eq(studyYears.yearId, classroomEnrollments.yearId),
            eq(classroomEnrollments.schoolId, schoolId),
          ),
        )
        .leftJoin(users, eq(classroomEnrollments.studentId, users.userId))
        .where(eq(studyYears.schoolId, schoolId))
        .groupBy(studyYears.yearId)
        .orderBy(asc(studyYears.startDate));

      return results.map((row) => ({
        ...row,
        total: Number(row.total),
        female: Number(row.female),
        male: Number(row.male),
      }));
    } catch (error) {
      logger.error("EnrollmentStats.getStatsByYear failed", error as Error);
      return [];
    }
  }
}

/**
 * Statistiques de répartition par genre (étudiants uniquement).
 */
export namespace GenderStats {
  /**
   * Distribution des genres pour les élèves d'une école.
   * Labels retournés : "masculin", "feminin", "autre".
   */
  export async function getDistribution(
    schoolId: string,
  ): Promise<ChartDataPoint[]> {
    const labels: Record<string, string> = {
      MALE: "masculin",
      FEMALE: "feminin",
      OTHER: "autre",
    };

    return aggregateCount(
      users,
      users.gender,
      and(eq(users.schoolId, schoolId), eq(users.role, USER_ROLE_ENUM.STUDENT)),
      labels,
    );
  }
}

/**
 * Statistiques par classe.
 */
export namespace ClassroomStats {
  /**
   * Nombre d'élèves par classe pour une année donnée.
   * Retourne l'identifiant de la classe, son libellé, son nom court et l'effectif.
   */
  export async function getStudentsCountByClass(
    schoolId: string,
    yearId: string,
  ): Promise<ClassStatsDTO[]> {
    try {
      const results = await db
        .select({
          classId: classrooms.classId,
          label: classrooms.identifier,
          shortName: classrooms.shortIdentifier,
          value: count(classroomEnrollments.studentId),
        })
        .from(classroomEnrollments)
        .innerJoin(
          classrooms,
          eq(classroomEnrollments.classroomId, classrooms.classId),
        )
        .where(
          and(
            eq(classroomEnrollments.schoolId, schoolId),
            eq(classrooms.yearId, yearId),
          ),
        )
        .groupBy(classrooms.classId)
        .orderBy(classrooms.shortIdentifier);

      return results.map((item) => ({
        ...item,
        value: Number(item.value),
      }));
    } catch (error) {
      logger.error(
        "ClassroomStats.getStudentsCountByClass failed",
        error as Error,
      );
      return [];
    }
  }
}

/**
 * Statistiques par option.
 */
export namespace OptionStats {
  /**
   * Nombre d'élèves par option pour une année donnée.
   * Le label correspond au nom court de l'option.
   */
  export async function getStudentsCountByOption(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    try {
      return await db
        .select({
          label: options.optionShortName,
          value: count(classroomEnrollments.studentId),
        })
        .from(classroomEnrollments)
        .innerJoin(
          classrooms,
          eq(classroomEnrollments.classroomId, classrooms.classId),
        )
        .innerJoin(options, eq(classrooms.optionId, options.optionId))
        .where(
          and(
            eq(classroomEnrollments.schoolId, schoolId),
            eq(classrooms.yearId, yearId),
          ),
        )
        .groupBy(options.optionShortName)
        .orderBy(options.optionShortName);
    } catch (error) {
      logger.error(
        "OptionStats.getStudentsCountByOption failed",
        error as Error,
      );
      return [];
    }
  }
}

/**
 * Statistiques de rétention (anciens vs nouveaux élèves).
 */
export namespace RetentionStats {
  /**
   * Calcule le nombre d'anciens élèves et de nouveaux élèves actifs.
   * Labels : "anciens", "nouveaux".
   */
  export async function getMetrics(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    const baseFilter = and(
      eq(classroomEnrollments.schoolId, schoolId),
      eq(classroomEnrollments.yearId, yearId),
      eq(classroomEnrollments.status, STUDENT_STATUS_ENUM.ACTIVE),
    );

    const [results] = await db
      .select({
        total: count(),
        newStudents: sql<number>`count(case when ${classroomEnrollments.isNewStudent} = 1 then 1 end)`,
      })
      .from(classroomEnrollments)
      .where(baseFilter);

    const total = results?.total ?? 0;
    const news = results?.newStudents ?? 0;
    const oldStudents = total - news;

    return [
      { label: "anciens", value: oldStudents },
      { label: "nouveaux", value: news },
    ];
  }
}

/**
 * Statistiques des statuts d'élèves (actif, abandon, exclu).
 */
export namespace StatusStats {
  /**
   * Répartition des élèves par statut pour une école et une année.
   * Labels retournés : "active", "abandon", "exclu".
   */
  export async function getStudentStatusStats(
    schoolId: string,
    yearId: string,
  ): Promise<ChartDataPoint[]> {
    const statusKeys: Record<string, string> = {
      [STUDENT_STATUS_ENUM.ACTIVE]: "active",
      [STUDENT_STATUS_ENUM.DROPOUT]: "abandon",
      [STUDENT_STATUS_ENUM.EXPELLED]: "exclu",
    };

    try {
      const results = await db
        .select({
          status: classroomEnrollments.status,
          count: count(),
        })
        .from(classroomEnrollments)
        .where(
          and(
            eq(classroomEnrollments.schoolId, schoolId),
            eq(classroomEnrollments.yearId, yearId),
          ),
        )
        .groupBy(classroomEnrollments.status);

      return results.map((item) => ({
        label: statusKeys[item.status] ?? item.status,
        value: Number(item.count),
      }));
    } catch (error) {
      logger.error("StatusStats.getStudentStatusStats failed", error as Error);
      return [];
    }
  }
}

/**
 * Indicateurs clés rapides (KPI) pour les cartes de résumé.
 */
export namespace KpiStats {
  /**
   * Retourne les totaux agrégés : nombre total d'élèves, actifs et exclus.
   * Optimisé via une seule requête d'agrégation.
   */
  export async function getQuickKpis(
    schoolId: string,
    yearId: string,
  ): Promise<StatsSummary> {
    try {
      const [result] = await db
        .select({
          total: count(),
          active: sql<number>`COUNT(CASE WHEN ${classroomEnrollments.status} = ${STUDENT_STATUS_ENUM.ACTIVE} THEN 1 END)`,
          dropout: sql<number>`COUNT(CASE WHEN ${classroomEnrollments.status} = ${STUDENT_STATUS_ENUM.DROPOUT} THEN 1 END)`,
          excluded: sql<number>`COUNT(CASE WHEN ${classroomEnrollments.status} = ${STUDENT_STATUS_ENUM.EXPELLED} THEN 1 END)`,
        })
        .from(classroomEnrollments)
        .where(
          and(
            eq(classroomEnrollments.schoolId, schoolId),
            eq(classroomEnrollments.yearId, yearId),
          ),
        );

      return {
        total: result?.total ?? 0,
        active: result?.active ?? 0,
        excluded: result?.excluded ?? 0,
        dropout: result?.dropout ?? 0,
      };
    } catch (error) {
      logger.error("KpiStats.getQuickKpis failed", error as Error);
      return { total: 0, active: 0, excluded: 0, dropout: 0 };
    }
  }
}

/**
 * Service de statistiques scolaires (façade).
 * Toutes les méthodes conservent la signature originale pour la rétrocompatibilité.
 * La logique métier est déléguée aux modules spécialisés.
 *
 * **Toutes les données renvoyées sont sans style** (couleurs, etc.) pour respecter
 * la séparation backend / frontend.
 */
export class StatsService {
  static getTotalStudents(schoolId: string, yearId: string) {
    return EnrollmentStats.getTotalStudents(schoolId, yearId);
  }

  static getGenderDistribution(schoolId: string) {
    return GenderStats.getDistribution(schoolId);
  }

  static getEnrollmentStatsByYear(schoolId: string) {
    return EnrollmentStats.getStatsByYear(schoolId);
  }

  static getStudentsCountByClass(schoolId: string, yearId: string) {
    return ClassroomStats.getStudentsCountByClass(schoolId, yearId);
  }

  static getStudentsCountByOption(schoolId: string, yearId: string) {
    return OptionStats.getStudentsCountByOption(schoolId, yearId);
  }

  static getRetentionMetrics(schoolId: string, yearId: string) {
    return RetentionStats.getMetrics(schoolId, yearId);
  }

  static getStudentStatusStats(schoolId: string, yearId: string) {
    return StatusStats.getStudentStatusStats(schoolId, yearId);
  }

  static getQuickKpis(schoolId: string, yearId: string) {
    return KpiStats.getQuickKpis(schoolId, yearId);
  }
}
