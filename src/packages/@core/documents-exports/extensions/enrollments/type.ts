import type {
  TEnrolement,
  TSchool,
  TUser,
  TStudyYear,
  TClassroom,
} from "@/packages/@core/data-access/db/schemas/types";

export type ClassroomWithEnrollements = TClassroom & {
  enrollments: EnrollmentWithStudent[];
};
export type EnrollmentWithStudent = TEnrolement & { student: TUser };
export type SchoolWithYearStudy = TSchool & { studyYear: TStudyYear };

export interface EnrollmentReportPayload {
  school: SchoolWithYearStudy;
  classrooms: ClassroomWithEnrollements[];
}
