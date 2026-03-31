import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  SECTION_ENUM,
  USER_GENDER_ENUM,
  USER_ROLE_ENUM,
  STUDENT_STATUS_ENUM,
  ENROLEMENT_ACTION_ENUM,
} from "../enum";
import {
  generateNumericEnrollmentCode,
  generateProvisionalUsername,
} from "../utils";

import { primaryKeyId, enumColumn, timestamps } from "../drizzle-fields";

// --- IDENTITY ---

export const schools = sqliteTable("Schools", {
  schoolId: primaryKeyId("school_id"),
  name: text("name").notNull(),
  adress: text("adress").notNull(),
  town: text("town").notNull(),
  logo: text("logo"),
  ...timestamps,
});

export const users = sqliteTable("Users", {
  userId: primaryKeyId("user_id"),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name").notNull(),
  firstName: text("first_name"),
  username: text("username")
    .notNull()
    .unique()
    .$defaultFn(generateProvisionalUsername),
  password: text("password").notNull().default("000000"),
  gender: enumColumn("gender", USER_GENDER_ENUM)
    .notNull()
    .default(USER_GENDER_ENUM.MALE),
  role: enumColumn("role", USER_ROLE_ENUM)
    .notNull()
    .default(USER_ROLE_ENUM.STUDENT),
  birthDate: text("birth_date"),
  birthPlace: text("birth_place"),
  schoolId: text("school_id")
    .notNull()
    .references(() => schools.schoolId),
  ...timestamps,
});

export const options = sqliteTable("Options", {
  optionId: primaryKeyId("option_id"),
  optionName: text("option_name").notNull(),
  optionShortName: text("option_short_name").notNull(),
  section: enumColumn("section", SECTION_ENUM)
    .notNull()
    .default(SECTION_ENUM.SECONDARY),
  schoolId: text("school_id")
    .notNull()
    .references(() => schools.schoolId),
});

export const studyYears = sqliteTable("StudyYears", {
  yearId: primaryKeyId("year_id"),
  yearName: text("year_name").notNull().unique(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  schoolId: text("school_id")
    .notNull()
    .references(() => schools.schoolId),
  ...timestamps,
});

// --- ACADEMIC ---

export const classRooms = sqliteTable("ClassRooms", {
  classId: primaryKeyId("class_id"),
  identifier: text("identifier").notNull(),
  shortIdentifier: text("short_identifier").notNull(),
  section: enumColumn("section", SECTION_ENUM).notNull(),
  yearId: text("year_id")
    .notNull()
    .references(() => studyYears.yearId),
  optionId: text("option_id").references(() => options.optionId),
  schoolId: text("school_id")
    .notNull()
    .references(() => schools.schoolId),
  ...timestamps,
});

export const classroomEnrolements = sqliteTable("ClassroomEnrolements", {
  enrolementId: primaryKeyId("enrolement_id"),
  classroomId: text("classroom_id")
    .notNull()
    .references(() => classRooms.classId),
  status: enumColumn("status", STUDENT_STATUS_ENUM)
    .notNull()
    .default(STUDENT_STATUS_ENUM.EN_COURS),
  isNewStudent: integer("is_new_student", { mode: "boolean" })
    .notNull()
    .default(false),
  studentCode: text("student_code")
    .notNull()
    .$defaultFn(generateNumericEnrollmentCode),
  studentId: text("student_id")
    .notNull()
    .references(() => users.userId),
  schoolId: text("school_id")
    .notNull()
    .references(() => schools.schoolId),
  yearId: text("year_id")
    .notNull()
    .references(() => studyYears.yearId),
  ...timestamps,
});

export const classroomEnrolementActions = sqliteTable(
  "ClassroomEnrolementActions",
  {
    actionId: primaryKeyId("action_id"),
    enrolementId: text("enrolement_id")
      .notNull()
      .references(() => classroomEnrolements.enrolementId),
    reason: text("reason"),
    action: enumColumn("action", ENROLEMENT_ACTION_ENUM).notNull(),
    ...timestamps,
  },
);

// --- SEATING (PLACEMENT) ---

export const localRooms = sqliteTable("LocalRooms", {
  localRoomId: primaryKeyId("local_room_id"),
  name: text("name").notNull(),
  maxCapacity: integer("max_capacity").notNull().default(0),
  totalRows: integer("total_rows").notNull().default(0),
  totalColumns: integer("total_columns").notNull().default(0),
  schoolId: text("school_id")
    .notNull()
    .references(() => schools.schoolId),
});

export const seatingSessions = sqliteTable("SeatingSessions", {
  sessionId: primaryKeyId("session_id"),
  sessionName: text("session_name").notNull(),
  schoolId: text("school_id")
    .notNull()
    .references(() => schools.schoolId),
  yearId: text("year_id")
    .notNull()
    .references(() => studyYears.yearId),
});

export const seatingAssignments = sqliteTable(
  "SeatingAssignments",
  {
    assignmentId: primaryKeyId("assignment_id"),
    sessionId: text("session_id")
      .notNull()
      .references(() => seatingSessions.sessionId),
    localRoomId: text("local_room_id")
      .notNull()
      .references(() => localRooms.localRoomId),
    enrolementId: text("enrolement_id")
      .notNull()
      .references(() => classroomEnrolements.enrolementId),
    rowPosition: integer("row_position").notNull(),
    columnPosition: integer("column_position").notNull(),
  },
  (table) => ({
    // Index uniques pour éviter les doublons de placement
    sessionEnrolementIdx: uniqueIndex("session_enrolement_idx").on(
      table.sessionId,
      table.enrolementId,
    ),
    seatPositionIdx: uniqueIndex("seat_position_idx").on(
      table.sessionId,
      table.localRoomId,
      table.rowPosition,
      table.columnPosition,
    ),
  }),
);
