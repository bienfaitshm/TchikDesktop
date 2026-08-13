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
} from "./schema";

/**
 * Defines relational mapping for the schools entity.
 */
export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  tutors: many(tutors),
  options: many(options),
  studyYears: many(studyYears),
  classrooms: many(classrooms),
  enrollments: many(classroomEnrollments),
  localrooms: many(localrooms),
  seatingSessions: many(seatingSessions),
}));

/**
 * Defines relational mapping for the users entity.
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.schoolId],
  }),
  enrollments: many(classroomEnrollments),
}));

/**
 * Defines relational mapping for the tutors entity.
 */
export const tutorsRelations = relations(tutors, ({ one, many }) => ({
  school: one(schools, {
    fields: [tutors.schoolId],
    references: [schools.schoolId],
  }),
  enrollments: many(classroomEnrollments),
}));

/**
 * Defines relational mapping for the options entity.
 */
export const optionsRelations = relations(options, ({ one, many }) => ({
  school: one(schools, {
    fields: [options.schoolId],
    references: [schools.schoolId],
  }),
  classrooms: many(classrooms),
}));

/**
 * Defines relational mapping for the study years entity.
 */
export const studyYearsRelations = relations(studyYears, ({ many }) => ({
  classrooms: many(classrooms),
  enrollments: many(classroomEnrollments),
  seatingSessions: many(seatingSessions),
}));

/**
 * Defines relational mapping for the classrooms entity.
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
 * Defines relational mapping for the classroom enrollments entity.
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
  }),
);
