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
  status: boolean | undefined;
  currency: CURRENCY_ENUM | undefined;
}

/** Represents a row item matching a student and their installment cells. */
export type ReportRow = {
  no: number;
  name: string;
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
 * @param amount - Optional numeric amount to format.
 * @param currency - Currency enum identifier, defaults to CDF.
 * @returns Formatted currency string or an empty string if amount is missing.
 */
function innerFormatCurrency(
  amount?: number,
  currency: CURRENCY_ENUM = CURRENCY_ENUM.CDF as CURRENCY_ENUM,
): string {
  if (amount !== undefined && amount !== null && amount !== 0) {
    return formatCurrency(amount, currency);
  }
  return "";
}

/**
 * Transforms classroom, student, and payment resolver data into a dynamic report template structure.
 * @param input - Composite object containing school information, classroom reports, and fee types.
 * @returns Structurally mapped template data for export view consumption.
 */
export function buildDynamicTemplateData(
  input: { school: SchoolInfo } & PaymentResolverData,
): DynamicTemplateData {
  const classesView: ClassroomReportView[] = [];

  input.classrooms.forEach((classroom) => {
    const classes: FeeTypeReportView[] = [];

    input.feetypes.forEach((feeType) => {
      const headers = feeType.schedules.map((col) => col.installmentName);
      const rows: ReportRow[] = [];

      classroom.enrollments.forEach(({ student, ...enrollment }, idx) => {
        const studentInfo = student as StudentWithFullName;
        const fullName =
          studentInfo.fullName ??
          [studentInfo.lastName, studentInfo.middleName, studentInfo.firstName]
            .filter(Boolean)
            .join(" ");

        const payments = new Map<string, FeeAssignmentWithSummary>(
          (enrollment.feeAssignments as FeeAssignmentWithSummary[])?.map(
            (feeAss) => [feeAss.scheduleId, feeAss],
          ),
        );

        const cells: ReportCell[] = feeType.schedules.map((schedule) => {
          const rawVal = payments.get(schedule.scheduleId);
          return {
            value: innerFormatCurrency(rawVal?.totalPaid, rawVal?.currency),
            status: rawVal?.isFullyPaid,
            currency: rawVal?.currency,
          };
        });

        rows.push({
          no: idx + 1,
          name: fullName,
          cells,
        });
      });

      classes.push({
        feeTypeName: feeType.name,
        headers,
        rows,
      });
    });

    classesView.push({
      name: classroom.identifier,
      shortName: classroom.shortIdentifier,
      rowValues: classes,
    });
  });

  return {
    ...input,
    classesView,
  };
}
