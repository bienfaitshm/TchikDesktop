import { relations } from "drizzle-orm";
import {
  schools,
  users,
  options,
  studyYears,
  classrooms,
  classroomEnrollments,
  classroomEnrollmentActions,
  localrooms,
  seatingSessions,
  seatingAssignments,
} from "./schema";

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  options: many(options),
  studyYears: many(studyYears),
  classrooms: many(classrooms),
  enrollments: many(classroomEnrollments),
  localrooms: many(localrooms),
  seatingSessions: many(seatingSessions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.schoolId],
  }),
  enrollments: many(classroomEnrollments),
}));

export const optionsRelations = relations(options, ({ one, many }) => ({
  school: one(schools, {
    fields: [options.schoolId],
    references: [schools.schoolId],
  }),
  classrooms: many(classrooms),
}));

export const studyYearsRelations = relations(studyYears, ({ one, many }) => ({
  school: one(schools, {
    fields: [studyYears.schoolId],
    references: [schools.schoolId],
  }),
  classrooms: many(classrooms),
  enrollments: many(classroomEnrollments),
  seatingSessions: many(seatingSessions),
}));

// ==========================================
// --- ACADEMIC RELATIONS ---
// ==========================================

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  school: one(schools, {
    fields: [classrooms.schoolId],
    references: [schools.schoolId],
  }),
  option: one(options, {
    fields: [classrooms.optionId],
    references: [options.optionId],
  }),
  enrollments: many(classroomEnrollments),
}));

export const classroomEnrollmentsRelations = relations(
  classroomEnrollments,
  ({ one, many }) => ({
    student: one(users, {
      fields: [classroomEnrollments.studentId],
      references: [users.userId],
    }),
    classroom: one(classrooms, {
      fields: [classroomEnrollments.classroomId],
      references: [classrooms.classId],
    }),
    school: one(schools, {
      fields: [classroomEnrollments.schoolId],
      references: [schools.schoolId],
    }),
    year: one(studyYears, {
      fields: [classroomEnrollments.yearId],
      references: [studyYears.yearId],
    }),
    actions: many(classroomEnrollmentActions),
    seatingAssignments: many(seatingAssignments),
  }),
);
