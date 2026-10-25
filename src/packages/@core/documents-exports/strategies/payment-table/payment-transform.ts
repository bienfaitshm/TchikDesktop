import { formatCurrency } from "@/packages/currency";
import type { PaymentResolverData } from "./resolver";
import {
  CURRENCY_ENUM,
  type FeeAssignmentWithSummary,
  type SchoolInfo,
  type StudentWithFullName,
} from "@/packages/@core/data-access/db";

/** Represents a single table cell inside a fee schedule report. */
export interface ReportCell {
  value: string;
  status: string | undefined;
  currency: CURRENCY_ENUM | undefined;
}

/** Represents a row item matching a student and their installment cells. */
export type ReportRow = {
  no: number;
  name: string;
  status: string;
  isProDeo: boolean;
  cells: ReportCell[];
};

/** Represents payment breakdown view grouped by a fee type. */
export interface FeeTypeReportView {
  feeTypeName: string;
  headers: string[];
  rows: ReportRow[];
}

/** Represents a classroom entry with its respective fee type reports. */
export interface ClassroomReportView {
  name: string;
  shortName: string;
  rowValues: FeeTypeReportView[];
}

/** Represents the complete formatted dataset ready for template rendering. */
export interface DynamicTemplateData {
  school: SchoolInfo;
  classesView: ClassroomReportView[];
}

/**
 * Formats a numeric amount using the specified currency enum.
 * @param amount - Numeric amount to format.
 * @param currency - Currency enum identifier, defaults to CDF.
 * @returns Formatted currency string or an empty string if amount is missing.
 */
function formatAmount(
  amount?: number,
  currency: CURRENCY_ENUM = CURRENCY_ENUM.CDF as CURRENCY_ENUM,
): string {
  if (amount !== undefined && amount !== null && amount !== 0) {
    return formatCurrency(amount, currency);
  }
  return "";
}

/**
 * Resolves a student's full name from available properties.
 * @param student - Student object with optional names.
 * @returns The computed full name string.
 */
function resolveStudentFullName(student: unknown): string {
  const studentInfo = student as StudentWithFullName;
  if (studentInfo.fullName) {
    return studentInfo.fullName;
  }
  return [studentInfo.lastName, studentInfo.middleName, studentInfo.firstName]
    .filter(Boolean)
    .join(" ");
}

/**
 * Creates a lookup map for fee assignments by schedule ID.
 * @param feeAssignments - List of fee assignments with summaries.
 * @returns A Map linking schedule ID to its fee assignment.
 */
function createPaymentMap(
  feeAssignments?: FeeAssignmentWithSummary[],
): Map<string, FeeAssignmentWithSummary> {
  const map = new Map<string, FeeAssignmentWithSummary>();
  if (!feeAssignments) return map;

  for (const feeAss of feeAssignments) {
    map.set(feeAss.scheduleId, feeAss);
  }
  return map;
}

/**
 * Builds report cells for a specific fee type's schedules and payments.
 * @param schedules - List of fee schedules.
 * @param payments - Map of payments by schedule ID.
 * @returns Array of report cells.
 */
function buildReportCells(
  schedules: { scheduleId: string; installmentName: string }[],
  payments: Map<string, FeeAssignmentWithSummary>,
): ReportCell[] {
  return schedules.map((schedule) => {
    const rawVal = payments.get(schedule.scheduleId);
    return {
      value: formatAmount(rawVal?.totalPaid, rawVal?.currency),
      status: rawVal?.status,
      currency: rawVal?.currency,
    };
  });
}

/**
 * Builds report rows for all enrollments in a classroom for a specific fee type.
 * @param enrollments - List of student enrollments.
 * @param feeType - Fee type details including schedules.
 * @returns Array of report rows.
 */
function buildReportRows(
  enrollments: {
    student: unknown;
    isProDeo: boolean;
    status: string;
    feeAssignments?: unknown;
  }[],
  feeType: { schedules: { scheduleId: string; installmentName: string }[] },
): ReportRow[] {
  return enrollments.map((enrollment, idx) => {
    const fullName = resolveStudentFullName(enrollment.student);
    const payments = createPaymentMap(
      enrollment.feeAssignments as FeeAssignmentWithSummary[],
    );
    const cells = buildReportCells(feeType.schedules, payments);

    return {
      no: idx + 1,
      name: fullName,
      isProDeo: enrollment.isProDeo,
      status: enrollment.status,
      cells,
    };
  });
}

/**
 * Builds fee type report views for a given classroom.
 * @param feeTypes - List of fee types.
 * @param enrollments - List of student enrollments.
 * @returns Array of fee type report views.
 */
function buildClassroomFeeTypeReports(
  feeTypes: {
    name: string;
    schedules: { scheduleId: string; installmentName: string }[];
  }[],
  enrollments: {
    student: unknown;
    isProDeo: boolean;
    status: string;
    feeAssignments?: unknown;
  }[],
): FeeTypeReportView[] {
  return feeTypes.map((feeType) => {
    const headers = feeType.schedules.map((col) => col.installmentName);
    const rows = buildReportRows(enrollments, feeType);

    return {
      feeTypeName: feeType.name,
      headers,
      rows,
    };
  });
}

/**
 * Transforms classroom, student, and payment resolver data into a dynamic report template structure.
 * @param input - Object containing school information, classroom reports, and fee types.
 * @returns Structurally mapped template data for export view consumption.
 */
export function buildDynamicTemplateData(
  input: { school: SchoolInfo } & PaymentResolverData,
): DynamicTemplateData {
  const classesView: ClassroomReportView[] = input.classrooms.map(
    (classroom) => ({
      name: classroom.identifier,
      shortName: classroom.shortIdentifier,
      rowValues: buildClassroomFeeTypeReports(
        input.feetypes,
        classroom.enrollments,
      ),
    }),
  );

  return {
    ...input,
    classesView,
  };
}
