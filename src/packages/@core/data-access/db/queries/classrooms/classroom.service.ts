import {
  SelectOptionFacade,
  type SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import {
  ClassroomRepository,
  type ClassroomDTO,
  type BaseClasrromFilters,
} from "./classroom.repository";
import { ClassroomMapper } from "./classroom.mapper";

export class ClassroomService {
  public readonly classroomSelectService: SelectOptionFacade<ClassroomDTO>;

  constructor(private readonly classroomRepository: ClassroomRepository) {
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

  async getClassroomsWithStudents(options?: any) {
    const rawData =
      await this.classroomRepository.findClassroomsWithStudents(options);
    return ClassroomMapper.toClassroomWithSortedStudents(rawData);
  }

  async getClassroomsWithStudentAndAssignments(options?: any) {
    const rawData =
      await this.classroomRepository.findClassroomsWithStudentAndAssignments(
        options,
      );
    const sortedData = ClassroomMapper.toClassroomWithSortedStudents(rawData);
    return ClassroomMapper.normalizeEnrollments(sortedData);
  }

  /**
   * Récupère les options formatées pour les listes déroulantes (Select/Combobox)
   * Le typage des filtres est désormais strict et sécurisé.
   */
  async getOptions(args: SearchOptions<BaseClasrromFilters>) {
    return this.classroomSelectService.loadOptions(args);
  }
}

export const classroomRepository = new ClassroomRepository();
export const classroomService = new ClassroomService(classroomRepository);
