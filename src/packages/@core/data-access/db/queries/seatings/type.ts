import {
  type Classroom,
  type ClassroomEnrollment,
  type User as Student,
  type Localroom,
  type SeatingSession,
  type SeatingAssignment,
} from "@/packages/@core/data-access/db/schemas";

export type EnrollmentWithRelations = ClassroomEnrollment & {
  student: Student;
  ClassroomEnrollment;
  classRoom: Classroom;
};

export type Assignment = SeatingAssignment & {
  localRoom: Localroom;
  enrollment: EnrollmentWithRelations;
};

export type SeatingSessionWithAssignment = SeatingSession & {
  assignments: Assignment[];
};

export type SeatingSessionGrouped = SeatingSession & {
  assignments: (Localroom & {
    students: Assignment[];
  })[];
};
