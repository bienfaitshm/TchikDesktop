import {
  extractClassroomFiltersQueryPayload,
  BaseClassroomFilters,
} from "./classroom.repository";
import {
  extractEnrollmentFiltersQueryPayload,
  BaseClassroomEnrollmentFilters,
} from "../enrollments/enrollment.repository";
import {
  extractSeatingAssignmentFiltersQueryPayload,
  BaseSeatingAssignmentFilter,
} from "../seatings/assignment";
import { TDataBase, db } from "../../config";
import type {
  Classroom,
  ClassroomEnrollment,
  FeeAssignment,
  StudentPayment,
  User,
} from "../../schemas";
import { DatabaseError } from "@/packages/drizzle-queries";

export type ClassroomReportDTO = Classroom & {
  enrollments: (ClassroomEnrollment & {
    student: User;
    feeAssignments: (FeeAssignment & { payments: StudentPayment[] })[];
  })[];
};

/**
 * Filter configuration structure supported by classroom data export queries.
 */
export type DataExportFilters = Partial<{
  classroom: BaseClassroomFilters;
  enrollment: BaseClassroomEnrollmentFilters;
  assignment: BaseSeatingAssignmentFilter;
}>;

/** Type definition for filter payload extractor functions. */
type FilterExtractor = (filter: unknown) => Record<string, unknown>;

/** Strategy dictionary mapping filter keys to their respective payload extractors. */
const FILTER_EXTRACTORS: Record<keyof DataExportFilters, FilterExtractor> = {
  assignment: (f) =>
    extractSeatingAssignmentFiltersQueryPayload(
      (f as BaseSeatingAssignmentFilter) ?? {},
    ),
  classroom: (f) =>
    extractClassroomFiltersQueryPayload((f as BaseClassroomFilters) ?? {}),
  enrollment: (f) =>
    extractEnrollmentFiltersQueryPayload(
      (f as BaseClassroomEnrollmentFilters) ?? {},
    ),
};

/**
 * Extracts query payload parameters for a specific filter domain key.
 * @param filters - The root export filters map.
 * @param key - The targeted domain filter key.
 * @returns Standardized query payload object for Drizzle ORM.
 */
export function extractFilter(
  filters: DataExportFilters,
  key: keyof DataExportFilters,
): Record<string, unknown> {
  const extractor = FILTER_EXTRACTORS[key];
  const targetFilter = filters[key] ?? {};

  return typeof extractor === "function" ? extractor(targetFilter) : {};
}

/**
 * Service dedicated to retrieving classroom-related relational datasets for data exports.
 */
export class ClassroomDataExport {
  /**
   * Initializes the export service with a database client instance.
   * @param database - Drizzle database client instance.
   */
  constructor(private readonly database: TDataBase = db) {}

  /**
   * Resolves the active database client or fallback to default service instance.
   * @param tx - Optional transaction client.
   * @returns Active database client context.
   */
  private getClient(tx?: TDataBase): TDataBase {
    return tx ?? this.database;
  }

  /**
   * Safely wraps database query executions with uniform error handling.
   * @template R - Query return type.
   * @param queryFn - Callback function performing the database operation.
   * @param errorMessage - Contextual error description for exceptions.
   * @returns Promise resolving to query result.
   */
  private async executeQuery<R>(
    queryFn: (client: TDataBase) => Promise<R>,
    errorMessage: string,
    tx?: TDataBase,
  ): Promise<R> {
    try {
      const client = this.getClient(tx);
      return await queryFn(client);
    } catch (error) {
      throw DatabaseError.from(error, errorMessage);
    }
  }

  /**
   * Retrieves classrooms along with their enrolled students.
   * @param filters - Optional query filters for classrooms and enrollments.
   * @param tx - Optional database transaction client.
   * @returns List of classrooms containing associated student records.
   */
  public async findClassroomsWithStudents(
    filters: DataExportFilters = {},
    tx?: TDataBase,
  ) {
    return this.executeQuery(
      (client) =>
        client.query.classrooms.findMany({
          ...extractFilter(filters, "classroom"),
          with: {
            enrollments: {
              ...extractFilter(filters, "enrollment"),
              with: { student: true },
            },
          },
        }),
      "Error retrieving classrooms and their associated students.",
      tx,
    );
  }

  /**
   * Retrieves classrooms with students and their payment records.
   * @param filters - Optional query filters for classrooms and enrollments.
   * @param tx - Optional database transaction client.
   * @returns List of classrooms containing student fee assignments and payment logs.
   */
  public async findClassroomsWithStudentsAndPayments(
    filters: DataExportFilters = {},
    tx?: TDataBase,
  ): Promise<ClassroomReportDTO[]> {
    return this.executeQuery(
      (client) =>
        client.query.classrooms.findMany({
          ...extractFilter(filters, "classroom"),
          with: {
            enrollments: {
              ...extractFilter(filters, "enrollment"),
              with: {
                student: true,
                feeAssignments: {
                  with: {
                    payments: true,
                  },
                },
              },
            },
          },
        }),
      "Error retrieving classrooms with student payment records.",
      tx,
    );
  }

  /**
   * Fetches complete classroom hierarchy including students and seating assignments.
   * @param filters - Optional query filters applied across domains.
   * @param tx - Optional database transaction client.
   * @returns List of classrooms containing enrollments and room seating allocations.
   */
  public async findClassroomsWithStudentsAndAssignments(
    filters: DataExportFilters = {},
    tx?: TDataBase,
  ) {
    return this.executeQuery(
      (client) =>
        client.query.classrooms.findMany({
          ...extractFilter(filters, "classroom"),
          with: {
            enrollments: {
              ...extractFilter(filters, "enrollment"),
              with: {
                student: true,
                seatingAssignments: {
                  ...extractFilter(filters, "assignment"),
                  with: { localroom: true },
                },
              },
            },
          },
        }),
      "Error retrieving the complete seating assignment hierarchy.",
      tx,
    );
  }
}

export const classroomDataExport = new ClassroomDataExport(db);
