import type {
  ClassroomEnrollment,
  School,
  User,
  StudyYear,
  Classroom,
  SeatingAssignment,
  Localroom,
} from "@/packages/@core/data-access/db/schemas";

export type ClassroomWithEnrollements = Classroom & {
  enrollments: EnrollmentWithStudent[];
};
export type EnrollmentWithStudent = ClassroomEnrollment & {
  student: User;
  assignment: SeatingAssignment & { localroom: Localroom };
};
export type SchoolWithYearStudy = School & { studyYear: StudyYear };

export interface SeatingBadgeReportPayload {
  school: SchoolWithYearStudy;
  classrooms: ClassroomWithEnrollements[];
}
