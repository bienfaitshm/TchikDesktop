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
import { DatabaseError } from "@/packages/drizzle-queries";

export type DataExportFilters = Partial<{
  classroom: BaseClassroomFilters;
  enrollment: BaseClassroomEnrollmentFilters;
  assignment: BaseSeatingAssignmentFilter;
}>;

export function extractFilter(
  filters: DataExportFilters,
  key: keyof DataExportFilters,
) {
  if (key === "assignment") {
    return extractSeatingAssignmentFiltersQueryPayload(filters[key] ?? {});
  }
  if (key === "classroom") {
    return extractClassroomFiltersQueryPayload(filters[key] ?? {});
  }
  if (key === "enrollment") {
    return extractEnrollmentFiltersQueryPayload(filters[key] ?? {});
  }
  return {};
}

export class ClassroomDataExport {
  constructor(private db: TDataBase) {}

  getClient(tx?: TDataBase): TDataBase {
    return tx ?? this.db;
  }

  public async findClassroomsWithStudents(
    filters: DataExportFilters = {},
    tx: TDataBase = this.db,
  ) {
    try {
      const client = this.getClient(tx);

      return await client.query.classrooms.findMany({
        ...extractFilter(filters, "classroom"),
        with: {
          enrollments: {
            ...extractFilter(filters, "enrollment"),
            with: { student: true },
          },
        },
      });
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Error retrieving classrooms and their associated students.",
      );
      throw dbError;
    }
  }

  /**
   * Fetches the complete classroom structural hierarchy, including students and seating assignments.
   * @param filters - Query parameters applied to the root classroom table.
   * @param tx - Optional database transaction client.
   * @returns A promise resolving to classrooms containing their enrollments and seating assignments.
   */
  public async findClassroomsWithStudentAndAssignments(
    filters: DataExportFilters = {},
    tx: TDataBase = this.db,
  ) {
    try {
      const client = this.getClient(tx);

      return await client.query.classrooms.findMany({
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
      });
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Error retrieving the complete seating assignment hierarchy.",
      );
      throw dbError;
    }
  }
}

export const classroomDataExport = new ClassroomDataExport(db);
