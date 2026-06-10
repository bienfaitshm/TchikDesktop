import { ClassroomRepository } from "./classroom.repository";
import { ClassroomMapper } from "./classroom.mapper";

export class ClassroomService {
  constructor(private readonly classroomRepository: ClassroomRepository) {}

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
}

export const classroomRepository = new ClassroomRepository();
export const classroomService = new ClassroomService(classroomRepository);
