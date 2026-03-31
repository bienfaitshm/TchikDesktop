// relations.ts
import { relations } from "drizzle-orm";
import {
  schools,
  users,
  options,
  studyYears,
  classRooms,
  classroomEnrolements,
  classroomEnrolementActions,
  localRooms,
  seatingSessions,
  seatingAssignments,
} from "./schema";

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  options: many(options),
  studyYears: many(studyYears),
  classRooms: many(classRooms),
  enrolements: many(classroomEnrolements),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.schoolId],
  }),
  enrolements: many(classroomEnrolements),
}));

export const optionsRelations = relations(options, ({ one, many }) => ({
  school: one(schools, {
    fields: [options.schoolId],
    references: [schools.schoolId],
  }),
  classRooms: many(classRooms),
}));

export const studyYearsRelations = relations(studyYears, ({ one, many }) => ({
  school: one(schools, {
    fields: [studyYears.schoolId],
    references: [schools.schoolId],
  }),
  classRooms: many(classRooms),
  enrolements: many(classroomEnrolements),
}));

export const classRoomsRelations = relations(classRooms, ({ one, many }) => ({
  school: one(schools, {
    fields: [classRooms.schoolId],
    references: [schools.schoolId],
  }),
  year: one(studyYears, {
    fields: [classRooms.yearId],
    references: [studyYears.yearId],
  }),
  option: one(options, {
    fields: [classRooms.optionId],
    references: [options.optionId],
  }),
  enrolements: many(classroomEnrolements),
}));

export const enrolementsRelations = relations(
  classroomEnrolements,
  ({ one, many }) => ({
    student: one(users, {
      fields: [classroomEnrolements.studentId],
      references: [users.userId],
    }),
    classRoom: one(classRooms, {
      fields: [classroomEnrolements.classroomId],
      references: [classRooms.classId],
    }),
    school: one(schools, {
      fields: [classroomEnrolements.schoolId],
      references: [schools.schoolId],
    }),
    year: one(studyYears, {
      fields: [classroomEnrolements.yearId],
      references: [studyYears.yearId],
    }),
    actions: many(classroomEnrolementActions),
    seatingAssignments: many(seatingAssignments),
  }),
);

export const enrolementActionsRelations = relations(
  classroomEnrolementActions,
  ({ one }) => ({
    enrolement: one(classroomEnrolements, {
      fields: [classroomEnrolementActions.enrolementId],
      references: [classroomEnrolements.enrolementId],
    }),
  }),
);

export const seatingSessionsRelations = relations(
  seatingSessions,
  ({ many }) => ({
    assignments: many(seatingAssignments),
  }),
);

export const localRoomsRelations = relations(localRooms, ({ many }) => ({
  assignments: many(seatingAssignments),
}));

export const seatingAssignmentsRelations = relations(
  seatingAssignments,
  ({ one }) => ({
    session: one(seatingSessions, {
      fields: [seatingAssignments.sessionId],
      references: [seatingSessions.sessionId],
    }),
    localRoom: one(localRooms, {
      fields: [seatingAssignments.localRoomId],
      references: [localRooms.localRoomId],
    }),
    enrolement: one(classroomEnrolements, {
      fields: [seatingAssignments.enrolementId],
      references: [classroomEnrolements.enrolementId],
    }),
  }),
);
