import type {
  Classroom,
  ClassroomEnrollment,
  User,
  SeatingAssignment,
} from "@/packages/@core/data-access/db/schemas/schema";
import { compareByFullName, withFullName } from "../query-utils";

export type ClassroomWithEnrollment = Classroom & {
  enrollments: (ClassroomEnrollment & {
    student: User;
    seatingAssignments?: SeatingAssignment[];
  })[];
};

export class ClassroomMapper {
  /**
   * Formate les étudiants en y injectant le nom complet et en les triant.
   */
  static toClassroomWithSortedStudents<
    T extends { enrollments: (ClassroomEnrollment & { student: User })[] },
  >(classrooms: T[]) {
    return classrooms.map(({ enrollments, ...classroom }) => {
      const sortedEnrollments = [...enrollments].sort(
        compareByFullName((e) => e.student),
      );

      return {
        ...classroom,
        enrollments: sortedEnrollments.map((e) => ({
          ...e,
          student: withFullName(e.student),
        })),
      };
    });
  }

  /**
   * Aplantit le premier seating assignment pour correspondre au besoin de l'UI.
   */
  static normalizeEnrollments<T extends ClassroomWithEnrollment>(
    classrooms: T[],
  ) {
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
}
