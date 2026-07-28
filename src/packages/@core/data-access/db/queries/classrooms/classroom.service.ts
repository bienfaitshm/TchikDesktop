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

export class ClassroomService {
  public readonly classroomSelectService: SelectOptionFacade<ClassroomDTO>;

  constructor(
    private readonly classroomRepository: ClassroomRepository,
    private readonly classExportData: ClassroomDataExport,
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

  async getClassroomsWithStudents(options?: DataExportFilters) {
    const rawData =
      await this.classExportData.findClassroomsWithStudents(options);
    return ClassroomMapper.toClassroomWithSortedStudents(rawData);
  }

  async getClassroomsWithStudentAndAssignments(options?: DataExportFilters) {
    const rawData =
      await this.classExportData.findClassroomsWithStudentAndAssignments(
        options,
      );
    const sortedData = ClassroomMapper.toClassroomWithSortedStudents(rawData);
    return ClassroomMapper.normalizeEnrollments(sortedData);
  }

  /**
   * Récupère les options formatées pour les listes déroulantes (Select/Combobox)
   * Le typage des filtres est désormais strict et sécurisé.
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
