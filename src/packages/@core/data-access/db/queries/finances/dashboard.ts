import { eq, and, sql, desc } from "drizzle-orm";
import {
  users,
  classrooms,
  feeConfigurations,
  feeTypes,
  feeAssignments,
  classroomEnrollments,
  studentPayments,
} from "@/packages/@core/data-access/db/schemas";
import { type TDataBase, db } from "@/packages/@core/data-access/db/config";
import { UserRepository } from "../users";
import { CURRENCY_ENUM } from "../../options";

export interface TreasuryKpiResult {
  totalExpected: number;
  totalCollected: number;
  currency: CURRENCY_ENUM;
}

export interface RevenueChartDataResult {
  date: Date;
  collected: number;
}

export interface RecentPaymentResult {
  paymentId: string;
  studentName: string;
  classroomName: string;
  amount: number;
  currency: string;
  feeTypeName: string;
  method: string;
  reference: string | null;
  date: Date | string | null;
}

export interface ClassroomPerformanceResult {
  classroomName: string;
  totalStudents: number;
  totalExpected: number;
  totalPaid: number;
}

export interface FeeTypeCollectionRateResult {
  feeTypeName: string;
  totalExpected: number;
  totalPaid: number;
}

export interface FinDashBoard {
  kpis: TreasuryKpiResult | undefined;
  revenueChart: RevenueChartDataResult[];
  recentPayments: RecentPaymentResult[];
  classroomPerformance: ClassroomPerformanceResult[];
  feeTypeCollectionRates: FeeTypeCollectionRateResult[];
}

/**
 * Service managing financial statistics and reports for the institution.
 */
export class FinancialStatisticsService {
  constructor(private readonly db: TDataBase) {}

  /**
   * Retrieves all consolidated data required to power the financial dashboard.
   * @param currentSchoolId - The identifier of the school.
   * @param currentYearId - The identifier of the current academic year.
   * @returns An object containing all dataset metrics for the dashboard.
   */
  public getDashboardData(
    currentSchoolId: string,
    currentYearId: string,
  ): FinDashBoard {
    const kpis = this.getTreasuryKpis(currentSchoolId, currentYearId);
    const revenueChart = this.getRevenueChartData(
      currentSchoolId,
      currentYearId,
    );
    const recentPayments = this.getRecentPayments(
      currentSchoolId,
      currentYearId,
    );
    const classroomPerformance = this.getClassroomPerformance(
      currentSchoolId,
      currentYearId,
    );
    const feeTypeCollectionRates = this.getFeeTypeCollectionRates(
      currentSchoolId,
      currentYearId,
    );

    return {
      kpis,
      revenueChart,
      recentPayments,
      classroomPerformance,
      feeTypeCollectionRates,
    };
  }

  /**
   * Retrieves high-level treasury key performance indicators.
   * @param currentSchoolId - The identifier of the school.
   * @param currentYearId - The identifier of the current academic year.
   * @returns An object containing total expected and collected amounts.
   */
  public getTreasuryKpis(
    currentSchoolId: string,
    currentYearId: string,
  ): TreasuryKpiResult | undefined {
    return this.db
      .select({
        totalExpected: sql<number>`COALESCE(SUM(${feeAssignments.totalAmount}), 0)`,
        totalCollected: sql<number>`COALESCE(SUM(${feeAssignments.amountPaid}), 0)`,
        currency: feeAssignments.currency,
      })
      .from(feeAssignments)
      .innerJoin(
        classroomEnrollments,
        eq(feeAssignments.enrollmentId, classroomEnrollments.enrollmentId),
      )
      .where(
        and(
          eq(classroomEnrollments.schoolId, currentSchoolId),
          eq(classroomEnrollments.yearId, currentYearId),
        ),
      )
      .get();
  }

  /**
   * Retrieves temporal data for the revenue chart grouped by day.
   * @param currentSchoolId - The identifier of the school.
   * @param currentYearId - The identifier of the current academic year.
   * @returns An array of aggregated daily revenue records.
   */
  public getRevenueChartData(
    currentSchoolId: string,
    currentYearId: string,
  ): RevenueChartDataResult[] {
    return this.db
      .select({
        date: studentPayments.createdAt,
        collected: sql<number>`COALESCE(SUM(${studentPayments.amountConverted}), 0)`,
      })
      .from(studentPayments)
      .where(
        and(
          eq(studentPayments.schoolId, currentSchoolId),
          eq(studentPayments.yearId, currentYearId),
        ),
      )
      .groupBy(sql`DATE(${studentPayments.createdAt})`)
      .orderBy(sql`DATE(${studentPayments.createdAt})`)
      .all();
  }

  /**
   * Retrieves the history of the most recent payment transactions.
   * @param currentSchoolId - The identifier of the school.
   * @param currentYearId - The identifier of the current academic year.
   * @returns An array containing details of the latest five payments.
   */
  public getRecentPayments(
    currentSchoolId: string,
    currentYearId: string,
  ): RecentPaymentResult[] {
    return this.db
      .select({
        paymentId: studentPayments.paymentId,
        studentName: UserRepository.fullNameSql,
        classroomName: classrooms.identifier,
        amount: studentPayments.amountReceived,
        currency: studentPayments.currencyReceived,
        feeTypeName: feeTypes.name,
        method: studentPayments.paymentMethod,
        reference: studentPayments.transactionReference,
        date: studentPayments.createdAt,
      })
      .from(studentPayments)
      .innerJoin(
        feeAssignments,
        eq(studentPayments.assignmentId, feeAssignments.assignmentId),
      )
      .innerJoin(
        classroomEnrollments,
        eq(feeAssignments.enrollmentId, classroomEnrollments.enrollmentId),
      )
      .innerJoin(users, eq(classroomEnrollments.studentId, users.userId))
      .innerJoin(
        classrooms,
        eq(classroomEnrollments.classroomId, classrooms.classId),
      )
      .innerJoin(
        feeConfigurations,
        eq(feeAssignments.feeConfigId, feeConfigurations.feeConfigId),
      )
      .innerJoin(feeTypes, eq(feeConfigurations.feeTypeId, feeTypes.feeTypeId))
      .where(
        and(
          eq(studentPayments.schoolId, currentSchoolId),
          eq(studentPayments.yearId, currentYearId),
        ),
      )
      .orderBy(desc(studentPayments.createdAt))
      .limit(5)
      .all();
  }

  /**
   * Computes collection performance metrics broken down by classroom.
   * @param currentSchoolId - The identifier of the school.
   * @param currentYearId - The identifier of the current academic year.
   * @returns A summary array of classroom financial statistics.
   */
  public getClassroomPerformance(
    currentSchoolId: string,
    currentYearId: string,
  ): ClassroomPerformanceResult[] {
    return this.db
      .select({
        classroomName: classrooms.identifier,
        totalStudents: sql<number>`COUNT(DISTINCT ${classroomEnrollments.studentId})`,
        totalExpected: sql<number>`COALESCE(SUM(${feeAssignments.totalAmount}), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(${feeAssignments.amountPaid}), 0)`,
      })
      .from(classroomEnrollments)
      .innerJoin(
        classrooms,
        eq(classroomEnrollments.classroomId, classrooms.classId),
      )
      .leftJoin(
        feeAssignments,
        eq(classroomEnrollments.enrollmentId, feeAssignments.enrollmentId),
      )
      .where(
        and(
          eq(classroomEnrollments.schoolId, currentSchoolId),
          eq(classroomEnrollments.yearId, currentYearId),
        ),
      )
      .groupBy(classrooms.classId, classrooms.identifier)
      .all();
  }

  /**
   * Analyzes collection rates grouped by fee type categories.
   * @param currentSchoolId - The identifier of the school.
   * @param currentYearId - The identifier of the current academic year.
   * @returns An array detailing expected and paid amounts per fee type.
   */
  public getFeeTypeCollectionRates(
    currentSchoolId: string,
    currentYearId: string,
  ): FeeTypeCollectionRateResult[] {
    return this.db
      .select({
        feeTypeName: feeTypes.name,
        totalExpected: sql<number>`COALESCE(SUM(${feeAssignments.totalAmount}), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(${feeAssignments.amountPaid}), 0)`,
      })
      .from(feeAssignments)
      .innerJoin(
        feeConfigurations,
        eq(feeAssignments.feeConfigId, feeConfigurations.feeConfigId),
      )
      .innerJoin(feeTypes, eq(feeConfigurations.feeTypeId, feeTypes.feeTypeId))
      .innerJoin(
        classroomEnrollments,
        eq(feeAssignments.enrollmentId, classroomEnrollments.enrollmentId),
      )
      .where(
        and(
          eq(classroomEnrollments.schoolId, currentSchoolId),
          eq(classroomEnrollments.yearId, currentYearId),
        ),
      )
      .groupBy(feeTypes.feeTypeId, feeTypes.name)
      .all();
  }
}

export const financialStatisticsService = new FinancialStatisticsService(db);
