import type {
  Classroom,
  ClassroomEnrollment,
  User,
  SeatingAssignment,
  FeeAssignment,
  StudentPayment,
} from "@/packages/@core/data-access/db/schemas/schema";
import { compareByFullName, withFullName } from "../query-utils";
import { ClassroomReportDTO } from "./classroom.data-export";

/** Represents a student entity enriched with a formatted full name property. */
export type StudentWithFullName = User & { fullName: string };

/** Represents an enrollment record containing student details. */
export type EnrollmentWithStudent = ClassroomEnrollment & {
  student: User;
};

/** Represents an enrollment record containing seating assignments. */
export type EnrollmentWithAssignments = ClassroomEnrollment & {
  seatingAssignments?: SeatingAssignment[];
};

/** Represents a fee assignment record joined with its execution payments. */
export type FeeAssignmentWithPayments = FeeAssignment & {
  payments?: StudentPayment[];
};

/** Represents a fee assignment enriched with calculated balance metrics. */
export type FeeAssignmentWithSummary = FeeAssignmentWithPayments & {
  totalPaid: number;
  remainingBalance: number;
  isFullyPaid: boolean;
};

/** Represents an enrollment containing student details and fee assignments with payments. */
export type EnrollmentWithFinancials = EnrollmentWithStudent & {
  feeAssignments: FeeAssignmentWithPayments[];
};

/** Represents a classroom entity containing enrollments with student details and optional seating assignments. */
export type ClassroomWithEnrollment = Classroom & {
  enrollments: (ClassroomEnrollment & {
    student: User;
    seatingAssignments?: SeatingAssignment[];
    feeAssignments?: FeeAssignmentWithPayments[];
  })[];
};

/**
 * Utility class providing transformation and mapping functions for classroom relational entities.
 */
export class ClassroomMapper {
  /**
   * Enriches student objects with formatted full names and sorts classroom enrollments alphabetically.
   * @template T - Type extending a classroom structure with student enrollments.
   * @param classrooms - Array of classroom objects containing enrollments.
   * @returns Array of classrooms with updated and sorted student enrollments.
   */
  static toClassroomWithSortedStudents<
    T extends { enrollments: EnrollmentWithStudent[] },
  >(
    classrooms: T[],
  ): (Omit<T, "enrollments"> & {
    enrollments: (Omit<EnrollmentWithStudent, "student"> & {
      student: StudentWithFullName;
    })[];
  })[] {
    return classrooms.map(({ enrollments, ...classroom }) => {
      const formattedEnrollments = enrollments.map((enrollment) => ({
        ...enrollment,
        student: withFullName(enrollment.student),
      }));

      formattedEnrollments.sort(compareByFullName((e) => e.student));

      return {
        ...(classroom as Omit<T, "enrollments">),
        enrollments: formattedEnrollments,
      };
    });
  }

  /**
   * Normalizes classroom enrollments by extracting the primary seating assignment into a single property.
   * @template T - Type extending a classroom structure with seating assignment enrollments.
   * @param classrooms - Array of classroom objects containing enrollments with seating assignments.
   * @returns Array of classrooms with flattened assignment properties on enrollments.
   */
  static normalizeEnrollments<
    T extends { enrollments: EnrollmentWithAssignments[] },
  >(
    classrooms: T[],
  ): (Omit<T, "enrollments"> & {
    enrollments: (EnrollmentWithAssignments & {
      assignment: SeatingAssignment | null;
    })[];
  })[] {
    return classrooms.map((classroom) => ({
      ...classroom,
      enrollments: classroom.enrollments.map((enrollment) => {
        const [firstAssignment] = enrollment.seatingAssignments ?? [];
        return {
          ...enrollment,
          assignment: firstAssignment ?? null,
        };
      }),
    }));
  }

  /**
   * Computes payment totals, remaining balances, and payment statuses for fee assignments.
   * @param feeAssignments - List of fee assignments containing payment execution records.
   * @returns List of fee assignments enriched with financial summary fields.
   */
  static enrichStudentFinancials(
    feeAssignments: FeeAssignmentWithPayments[] = [],
  ): FeeAssignmentWithSummary[] {
    return feeAssignments.map((assignment) => {
      const payments = assignment.payments ?? [];
      const totalPaid = payments.reduce(
        (sum, payment) => sum + (payment.amountReceived ?? 0),
        0,
      );
      const dueAmount = assignment.totalAmount ?? 0;
      const remainingBalance = Math.max(0, dueAmount - totalPaid);
      const isFullyPaid = remainingBalance === 0 && dueAmount > 0;

      return {
        ...assignment,
        totalPaid,
        remainingBalance,
        isFullyPaid,
      };
    });
  }

  /**
   * Applies complete dataset transformations (sorting, seating normalization, financial calculation) in a single pass.
   * @template T - Type representing a complete relational classroom dataset.
   * @param classrooms - Raw list of classrooms retrieved from storage queries.
   * @returns Transformed classrooms ready for report rendering and UI presentation.
   */
  static toClassroomReport<T extends ClassroomReportDTO>(classrooms: T[]) {
    return classrooms.map(({ enrollments, ...classroom }) => {
      const processedEnrollments = enrollments.map((enrollment) => {
        const enrichedFeeAssignments = this.enrichStudentFinancials(
          enrollment.feeAssignments,
        );
        const totalPaidAllFees = enrichedFeeAssignments.reduce(
          (sum, fee) => sum + fee.amountPaid,
          0,
        );

        return {
          ...enrollment,
          student: withFullName(enrollment.student),
          feeAssignments: enrichedFeeAssignments,
          totalPaid: totalPaidAllFees,
        };
      });

      processedEnrollments.sort(compareByFullName((e) => e.student));

      return {
        ...(classroom as Omit<T, "enrollments">),
        enrollments: processedEnrollments,
      };
    });
  }
}
