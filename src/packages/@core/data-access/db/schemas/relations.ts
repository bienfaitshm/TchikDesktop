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
  exportHistories,
} from "./schema";

// ==========================================
// --- IDENTITY & CORE RELATIONS ---
// ==========================================

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
  year: one(studyYears, {
    fields: [classrooms.yearId],
    references: [studyYears.yearId],
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

export const classroomEnrollmentActionsRelations = relations(
  classroomEnrollmentActions,
  ({ one }) => ({
    enrollment: one(classroomEnrollments, {
      fields: [classroomEnrollmentActions.enrollmentId],
      references: [classroomEnrollments.enrollmentId],
    }),
  }),
);

// ==========================================
// --- SEATING (PLACEMENT) RELATIONS ---
// ==========================================

export const localroomsRelations = relations(localrooms, ({ one, many }) => ({
  school: one(schools, {
    fields: [localrooms.schoolId],
    references: [schools.schoolId],
  }),
  assignments: many(seatingAssignments),
}));

export const seatingSessionsRelations = relations(
  seatingSessions,
  ({ one, many }) => ({
    school: one(schools, {
      fields: [seatingSessions.schoolId],
      references: [schools.schoolId],
    }),
    year: one(studyYears, {
      fields: [seatingSessions.yearId],
      references: [studyYears.yearId],
    }),
    assignments: many(seatingAssignments),
  }),
);

export const seatingAssignmentsRelations = relations(
  seatingAssignments,
  ({ one }) => ({
    session: one(seatingSessions, {
      fields: [seatingAssignments.sessionId],
      references: [seatingSessions.sessionId],
    }),
    localroom: one(localrooms, {
      fields: [seatingAssignments.localroomId],
      references: [localrooms.localroomId],
    }),
    enrollment: one(classroomEnrollments, {
      fields: [seatingAssignments.enrollmentId],
      references: [classroomEnrollments.enrollmentId],
    }),
  }),
);

export const exportHistoriesRelations = relations(
  exportHistories,
  ({ one }) => ({
    school: one(schools, {
      fields: [exportHistories.schoolId],
      references: [schools.schoolId],
    }),
    user: one(users, {
      fields: [exportHistories.userId],
      references: [users.userId],
    }),
  }),
);
