import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { primaryKeyId, timestampColumn } from "../drizzle-fields";

import { schools, studyYears, classroomEnrollments } from "./schema.academic";

type AsUpdatePayload<T, PK extends keyof T> = Partial<
  Omit<T, PK | "createdAt" | "updatedAt">
>;

export const localrooms = sqliteTable(
  "local_rooms",
  {
    localroomId: primaryKeyId("local_room_id"),
    name: text("name").notNull(),
    maxCapacity: integer("max_capacity").notNull().default(0),
    totalRows: integer("total_rows").notNull().default(0),
    totalColumns: integer("total_columns").notNull().default(0),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.schoolId, { onDelete: "cascade" }),
    ...timestampColumn,
  },
  (table) => [index("local_rooms_school_idx").on(table.schoolId)],
);

export type TableLocalroom = typeof localrooms;
export type Localroom = InferSelectModel<TableLocalroom>;
export type InsertLocalroom = InferInsertModel<TableLocalroom>;
export type UpdateLocalroom = AsUpdatePayload<InsertLocalroom, "localroomId">;

export const seatingSessions = sqliteTable(
  "seating_sessions",
  {
    sessionId: primaryKeyId("session_id"),
    sessionName: text("session_name").notNull(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.schoolId, { onDelete: "cascade" }),
    yearId: text("year_id")
      .notNull()
      .references(() => studyYears.yearId, { onDelete: "cascade" }),
    ...timestampColumn,
  },
  (table) => [index("seating_sessions_school_idx").on(table.schoolId)],
);

export type TableSeatingSession = typeof seatingSessions;
export type SeatingSession = InferSelectModel<TableSeatingSession>;
export type InsertSeatingSession = InferInsertModel<TableSeatingSession>;
export type UpdateSeatingSession = AsUpdatePayload<
  InsertSeatingSession,
  "sessionId"
>;

export const seatingAssignments = sqliteTable(
  "seating_assignments",
  {
    assignmentId: primaryKeyId("assignment_id"),
    sessionId: text("session_id")
      .notNull()
      .references(() => seatingSessions.sessionId, { onDelete: "cascade" }),
    localroomId: text("local_room_id")
      .notNull()
      .references(() => localrooms.localroomId, { onDelete: "cascade" }),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => classroomEnrollments.enrollmentId, {
        onDelete: "cascade",
      }),
    rowPosition: integer("row_position").notNull(),
    columnPosition: integer("column_position").notNull(),
  },
  (table) => [
    uniqueIndex("session_enrollment_idx").on(
      table.sessionId,
      table.enrollmentId,
    ),
    uniqueIndex("seat_position_idx").on(
      table.sessionId,
      table.localroomId,
      table.rowPosition,
      table.columnPosition,
    ),
  ],
);

export type TableSeatingAssignment = typeof seatingAssignments;
export type SeatingAssignment = InferSelectModel<TableSeatingAssignment>;
export type InsertSeatingAssignment = InferInsertModel<TableSeatingAssignment>;
export type UpdateSeatingAssignment = AsUpdatePayload<
  InsertSeatingAssignment,
  "assignmentId"
>;
