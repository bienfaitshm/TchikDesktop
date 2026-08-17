import { relations } from "drizzle-orm";
import {
  schools,
  studyYears,
  classroomEnrollments,
  localrooms,
  seatingSessions,
  seatingAssignments,
} from "./schema";

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
