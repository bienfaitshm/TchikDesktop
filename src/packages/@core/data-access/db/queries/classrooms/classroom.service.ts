import {
  ClassroomRepository,
  type ClassroomDTO,
  type BaseClassroomFilters,
} from "./classroom.repository";
import {
  ClassroomDataExport,
  classroomDataExport,
  type DataExportFilters,
} from "./classroom.data-export";
import { ClassroomMapper } from "./classroom.mapper";
import { SelectOptionFacade } from "@/packages/drizzle-queries";

/**
 * Domain service orchestrating classroom queries, selection facades, and export transformations.
 */
export class ClassroomService {
  /** Facade providing formatted selection options for dropdowns and comboboxes. */
  public readonly classroomSelectService: SelectOptionFacade<ClassroomDTO>;

  /**
   * Initializes the classroom service with required data access repositories.
   * @param classroomRepository - Repository handling basic classroom persistence operations.
   * @param classroomDataExport - Data export handler for complex relational classroom queries.
   */
  constructor(
    private readonly classroomRepository: ClassroomRepository,
    private readonly classroomDataExport: ClassroomDataExport,
  ) {
    this.classroomSelectService = new SelectOptionFacade<ClassroomDTO>(
      this.classroomRepository,
      {
        valueKey: "classId",
        labelKeyLong: "identifier",
        labelKeyShort: "shortIdentifier",
        labelFormat: "combined",
      },
    );
  }

  /**
   * Retrieves classrooms with student enrollments sorted alphabetically by full name.
   * @param options - Optional query filters for filtering data export results.
   * @returns Array of classrooms containing enriched and sorted student records.
   */
  async getClassroomsWithStudents(options?: DataExportFilters) {
    const rawData =
      await this.classroomDataExport.findClassroomsWithStudents(options);
    return ClassroomMapper.toClassroomWithSortedStudents(rawData);
  }

  /**
   * Retrieves classrooms with sorted students and normalized primary seating assignments.
   * @param options - Optional query filters for filtering data export results.
   * @returns Array of classrooms containing sorted students and flattened seating assignments.
   */
  async getClassroomsWithStudentsAndAssignments(options?: DataExportFilters) {
    const rawData =
      await this.classroomDataExport.findClassroomsWithStudentsAndAssignments(
        options,
      );
    const sortedData = ClassroomMapper.toClassroomWithSortedStudents(rawData);
    return ClassroomMapper.normalizeEnrollments(sortedData);
  }

  /**
   * Retrieves comprehensive classroom data including student names, seating, and payment summaries.
   * @param options - Optional query filters for filtering data export results.
   * @returns Array of classrooms formatted for complete reporting views.
   */
  async getClassroomsReport(options?: DataExportFilters) {
    const rawData =
      await this.classroomDataExport.findClassroomsWithStudentsAndPayments(
        options,
      );
    return ClassroomMapper.toClassroomReport(rawData);
  }

  /**
   * Loads strictly typed options formatted for UI dropdowns and select inputs.
   * @param args - Filter criteria restricting classroom option choices.
   * @returns Formatted option list suitable for combobox controls.
   */
  async getOptions(args: BaseClassroomFilters) {
    return this.classroomSelectService.loadOptions(args);
  }
}

export const classroomRepository = new ClassroomRepository();
export const classroomService = new ClassroomService(
  classroomRepository,
  classroomDataExport,
);
