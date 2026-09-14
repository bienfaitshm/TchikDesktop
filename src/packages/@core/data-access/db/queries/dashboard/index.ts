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
  SECTION_ENUM,
  STUDENT_STATUS_ENUM,
  USER_GENDER_ENUM,
} from "@/packages/@core/data-access/db/enum";

const logger = getLogger("statsService");

/**
 * Defines a standard data point for charting libraries.
 */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/**
 * Data transfer object for classroom statistics.
 */
export interface ClassStatsDTO extends ChartDataPoint {
  classId: string;
  shortName: string;
  section: SECTION_ENUM | null;
}

/**
 * Represents yearly enrollment metrics divided by gender.
 */
export interface EnrollmentStatsByYear {
  yearId: string;
  yearName: string;
  total: number;
  female: number;
  male: number;
}

/**
 * Summary of student distribution by academic status.
 */
export interface StatsSummary {
  total: number;
  active: number;
  excluded: number;
  dropout: number;
}

/**
 * Executes a COUNT aggregation grouped by a specified column.
 * @param table - The Drizzle SQLite table target.
 * @param column - The column to group the counts by.
 * @param filters - SQL conditions to filter the queried rows.
 * @param labelMapping - Optional map to translate database keys to UI labels.
 * @returns Array of chart data points representing the counts.
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
 * Retrieves the total number of enrolled students for a given school year.
 * @param schoolId - The unique identifier of the school.
 * @param yearId - The academic year identifier.
 * @returns The total student count.
 */
export async function getTotalStudents(
  schoolId: string,
  yearId: string,
): Promise<number> {
  try {
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
  } catch (error) {
    logger.error("getTotalStudents failed", error as Error);
    return 0;
  }
}

/**
 * Fetches enrollment statistics divided by academic year and gender.
 * @param schoolId - The unique identifier of the school.
 * @returns Array containing the yearly historical enrollment data.
 */
export async function getEnrollmentStatsByYear(
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
      .where(eq(studyYears.yearId, classroomEnrollments.yearId))
      .groupBy(studyYears.yearId)
      .orderBy(asc(studyYears.startDate))
      .all();

    return results.map((row) => ({
      ...row,
      total: Number(row.total),
      female: Number(row.female),
      male: Number(row.male),
    }));
  } catch (error) {
    logger.error("getEnrollmentStatsByYear failed", error as Error);
    return [];
  }
}

/**
 * Gets the gender distribution of enrolled students.
 * @param schoolId - The unique identifier of the school.
 * @param yearId - The academic year identifier.
 * @returns Array of chart data points for male, female, and other genders.
 */
export async function getGenderDistribution(
  schoolId: string,
  yearId: string,
): Promise<ChartDataPoint[]> {
  const labels: Record<string, string> = {
    [USER_GENDER_ENUM.MALE]: "male",
    [USER_GENDER_ENUM.FEMALE]: "female",
    OTHER: "other",
  };

  return aggregateCount(
    classroomEnrollments,
    users.gender,
    and(
      eq(classroomEnrollments.schoolId, schoolId),
      eq(classroomEnrollments.yearId, yearId),
    ),
    labels,
  );
}

/**
 * Retrieves the total number of students enrolled per classroom.
 * @param schoolId - The unique identifier of the school.
 * @param yearId - The academic year identifier.
 * @returns Array of DTOs detailing counts per classroom.
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
        section: classrooms.section,
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
          eq(classroomEnrollments.yearId, yearId),
        ),
      )
      .groupBy(classrooms.classId)
      .orderBy(classrooms.shortIdentifier);

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
 * Retrieves student counts grouped by their selected study options.
 * @param schoolId - The unique identifier of the school.
 * @param yearId - The academic year identifier.
 * @returns Array of chart data points representing counts per study option.
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
          eq(classroomEnrollments.yearId, yearId),
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
 * Analyzes the retention metrics comparing returning vs newly enrolled students.
 * @param schoolId - The unique identifier of the school.
 * @param yearId - The academic year identifier.
 * @returns Array of chart data points representing returning and new students.
 */
export async function getRetentionMetrics(
  schoolId: string,
  yearId: string,
): Promise<ChartDataPoint[]> {
  try {
    const baseFilter = and(
      eq(classroomEnrollments.schoolId, schoolId),
      eq(classroomEnrollments.yearId, yearId),
      eq(classroomEnrollments.status, STUDENT_STATUS_ENUM.ACTIVE),
    );

    const [results] = await db
      .select({
        total: count(),
        newStudents: sql<number>`COUNT(CASE WHEN ${classroomEnrollments.isNewStudent} = 1 THEN 1 END)`,
      })
      .from(classroomEnrollments)
      .where(baseFilter);

    const total = results?.total ?? 0;
    const newStudents = results?.newStudents ?? 0;
    const returningStudents = total - newStudents;

    return [
      { label: "returning", value: returningStudents },
      { label: "new", value: newStudents },
    ];
  } catch (error) {
    logger.error("getRetentionMetrics failed", error as Error);
    return [];
  }
}

/**
 * Aggregates the student body based on their current academic status.
 * @param schoolId - The unique identifier of the school.
 * @param yearId - The academic year identifier.
 * @returns Array of chart data points representing status counts.
 */
export async function getStudentStatusStats(
  schoolId: string,
  yearId: string,
): Promise<ChartDataPoint[]> {
  const statusLabels: Record<string, string> = {
    [STUDENT_STATUS_ENUM.ACTIVE]: "active",
    [STUDENT_STATUS_ENUM.DROPOUT]: "dropout",
    [STUDENT_STATUS_ENUM.EXPELLED]: "expelled",
  };

  return aggregateCount(
    classroomEnrollments,
    classroomEnrollments.status,
    and(
      eq(classroomEnrollments.schoolId, schoolId),
      eq(classroomEnrollments.yearId, yearId),
    ),
    statusLabels,
  );
}

/**
 * Computes high-level Key Performance Indicators for the dashboard in a single query.
 * @param schoolId - The unique identifier of the school.
 * @param yearId - The academic year identifier.
 * @returns Object summarizing the total KPIs.
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
    logger.error("getQuickKpis failed", error as Error);
    return { total: 0, active: 0, excluded: 0, dropout: 0 };
  }
}

/**
 * Facade providing backward compatibility for existing statistical service calls.
 */
export const StatsService = {
  getTotalStudents,
  getGenderDistribution,
  getEnrollmentStatsByYear,
  getStudentsCountByClass,
  getStudentsCountByOption,
  getRetentionMetrics,
  getStudentStatusStats,
  getQuickKpis,
};
