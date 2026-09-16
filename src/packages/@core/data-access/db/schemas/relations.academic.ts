import { relations } from "drizzle-orm";
import {
  schools,
  users,
  tutors,
  options,
  studyYears,
  classrooms,
  classroomEnrollments,
  classroomEnrollmentActions,
  localrooms,
  seatingSessions,
  seatingAssignments,
  feeAssignments,
} from "./schema";

/**
 * Defines relational mappings for the schools entity.
 */
export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  tutors: many(tutors),
  options: many(options),
  classrooms: many(classrooms),
  enrollments: many(classroomEnrollments),
  localrooms: many(localrooms),
  seatingSessions: many(seatingSessions),
}));

/**
 * Defines relational mappings for the users entity.
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.schoolId],
  }),
  tutor: one(tutors),
  enrollments: many(classroomEnrollments),
}));

/**
 * Defines relational mappings for the tutors entity.
 */
export const tutorsRelations = relations(tutors, ({ one, many }) => ({
  school: one(schools, {
    fields: [tutors.schoolId],
    references: [schools.schoolId],
  }),
  user: one(users, {
    fields: [tutors.userId],
    references: [users.userId],
  }),
  enrollments: many(classroomEnrollments),
}));

/**
 * Defines relational mappings for the options entity.
 */
export const optionsRelations = relations(options, ({ one, many }) => ({
  school: one(schools, {
    fields: [options.schoolId],
    references: [schools.schoolId],
  }),
  classrooms: many(classrooms),
}));

/**
 * Defines relational mappings for the study years entity.
 */
export const studyYearsRelations = relations(studyYears, ({ many }) => ({
  enrollments: many(classroomEnrollments),
  seatingSessions: many(seatingSessions),
}));

/**
 * Defines relational mappings for the classrooms entity.
 */
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

/**
 * Defines relational mappings for the classroom enrollments entity.
 */
export const classroomEnrollmentsRelations = relations(
  classroomEnrollments,
  ({ one, many }) => ({
    student: one(users, {
      fields: [classroomEnrollments.studentId],
      references: [users.userId],
    }),
    tutor: one(tutors, {
      fields: [classroomEnrollments.tutorId],
      references: [tutors.tutorId],
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
    feeAssignments: many(feeAssignments),
  }),
);

/**
 * Defines relational mappings for classroom enrollment actions entity.
 */
export const classroomEnrollmentActionsRelations = relations(
  classroomEnrollmentActions,
  ({ one }) => ({
    enrollment: one(classroomEnrollments, {
      fields: [classroomEnrollmentActions.enrollmentId],
      references: [classroomEnrollments.enrollmentId],
    }),
  }),
);

/**
 * Defines relational mappings for physical local rooms entity.
 */
export const localroomsRelations = relations(localrooms, ({ one, many }) => ({
  school: one(schools, {
    fields: [localrooms.schoolId],
    references: [schools.schoolId],
  }),
  seatingSessions: many(seatingSessions),
}));

/**
 * Defines relational mappings for seating sessions entity.
 */
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
    seatingAssignments: many(seatingAssignments),
  }),
);

/**
 * Defines relational mappings for individual seating assignments entity.
 */
export const seatingAssignmentsRelations = relations(
  seatingAssignments,
  ({ one }) => ({
    session: one(seatingSessions, {
      fields: [seatingAssignments.sessionId],
      references: [seatingSessions.sessionId],
    }),
    enrollment: one(classroomEnrollments, {
      fields: [seatingAssignments.enrollmentId],
      references: [classroomEnrollments.enrollmentId],
    }),
  }),
);
