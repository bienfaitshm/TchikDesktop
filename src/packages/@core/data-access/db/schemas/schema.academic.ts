import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import {
  SECTION_ENUM,
  USER_GENDER_ENUM,
  USER_ROLE_ENUM,
  STUDENT_STATUS_ENUM,
} from "../options";
import {
  generateNumericEnrollmentCode,
  generateProvisionalUsername,
} from "../utils";
import {
  primaryKeyId,
  enumColumn,
  timestamps,
  foreignKeyId,
  timestampColumn,
} from "../drizzle-fields";

type AsUpdatePayload<T, PK extends keyof T> = Partial<
  Omit<T, PK | "createdAt" | "updatedAt">
>;

export const schools = sqliteTable("schools", {
  schoolId: primaryKeyId("school_id"),
  name: text("name").notNull(),
  address: text("address").notNull(),
  town: text("town").notNull(),
  logo: text("logo"),
  ...timestamps,
});

export type TableSchool = typeof schools;
export type School = InferSelectModel<TableSchool>;
export type InsertSchool = InferInsertModel<TableSchool>;
export type UpdateSchool = AsUpdatePayload<InsertSchool, "schoolId">;

export const withSchoolId = {
  schoolId: foreignKeyId("school_id", {
    ref: () => schools.schoolId,
    actions: { onDelete: "cascade" },
  }),
};

export const users = sqliteTable(
  "users",
  {
    userId: primaryKeyId("user_id"),
    lastName: text("last_name").notNull(),
    middleName: text("middle_name").notNull(),
    firstName: text("first_name"),
    username: text("username")
      .notNull()
      .unique()
      .$defaultFn(generateProvisionalUsername),
    password: text("password").notNull(),
    gender: enumColumn("gender", USER_GENDER_ENUM)
      .notNull()
      .default(USER_GENDER_ENUM.MALE),
    role: enumColumn("role", USER_ROLE_ENUM)
      .notNull()
      .default(USER_ROLE_ENUM.STUDENT),
    birthDate: timestampColumn("birth_date"),
    birthPlace: text("birth_place"),
    ...withSchoolId,
    ...timestamps,
  },
  (table) => [
    index("users_school_idx").on(table.schoolId),
    index("users_role_idx").on(table.role),
    index("users_school_last_name_idx").on(table.schoolId, table.lastName),
    index("users_school_middle_name_idx").on(table.schoolId, table.middleName),
    index("users_school_first_name_idx").on(table.schoolId, table.firstName),
  ],
);

export type TableUser = typeof users;
export type User = InferSelectModel<TableUser>;
export type InsertUser = InferInsertModel<TableUser>;
export type UpdateUser = AsUpdatePayload<InsertUser, "userId">;

export const options = sqliteTable(
  "options",
  {
    optionId: primaryKeyId("option_id"),
    optionName: text("option_name").notNull(),
    optionShortName: text("option_short_name").notNull(),
    section: enumColumn("section", SECTION_ENUM)
      .notNull()
      .default(SECTION_ENUM.SECONDARY),
    ...withSchoolId,
    ...timestamps,
  },
  (table) => [index("options_school_idx").on(table.schoolId)],
);

export type TableOption = typeof options;
export type Option = InferSelectModel<TableOption>;
export type InsertOption = InferInsertModel<TableOption>;
export type UpdateOption = AsUpdatePayload<InsertOption, "optionId">;

export const studyYears = sqliteTable(
  "study_years",
  {
    yearId: primaryKeyId("year_id"),
    yearName: text("year_name").notNull(),
    startDate: timestampColumn("start_date"),
    endDate: timestampColumn("end_date"),
    ...withSchoolId,
    ...timestamps,
  },
  (table) => [
    index("study_years_school_idx").on(table.schoolId),
    uniqueIndex("school_year_name_unique_idx").on(
      table.schoolId,
      table.yearName,
    ),
  ],
);

export type TableStudyYear = typeof studyYears;
export type StudyYear = InferSelectModel<TableStudyYear>;
export type InsertStudyYear = InferInsertModel<TableStudyYear>;
export type UpdateStudyYear = AsUpdatePayload<InsertStudyYear, "yearId">;

export const classrooms = sqliteTable(
  "classrooms",
  {
    classId: primaryKeyId("class_id"),
    identifier: text("identifier").notNull(),
    shortIdentifier: text("short_identifier").notNull(),
    section: enumColumn("section", SECTION_ENUM).notNull(),
    optionId: text("option_id").references(() => options.optionId, {
      onDelete: "set null",
    }),
    ...withSchoolId,
    ...timestamps,
  },
  (table) => [
    index("classrooms_school_idx").on(table.schoolId),
    index("classrooms_school_indentifier_idx").on(
      table.schoolId,
      table.identifier,
    ),
    index("classrooms_school_short_indentifier_idx").on(
      table.schoolId,
      table.shortIdentifier,
    ),
  ],
);

export type TableClassroom = typeof classrooms;
export type Classroom = InferSelectModel<TableClassroom>;
export type InsertClassroom = InferInsertModel<TableClassroom>;
export type UpdateClassroom = AsUpdatePayload<InsertClassroom, "classId">;

export const withYearAndSchoolIds = {
  ...withSchoolId,
  yearId: foreignKeyId("year_id", {
    ref: () => schools.schoolId,
    actions: { onDelete: "cascade" },
  }),
};

export const classroomEnrollments = sqliteTable(
  "classroom_enrollments",
  {
    enrollmentId: primaryKeyId("enrollment_id"),
    classroomId: text("classroom_id")
      .notNull()
      .references(() => classrooms.classId, { onDelete: "cascade" }),
    status: enumColumn("status", STUDENT_STATUS_ENUM)
      .notNull()
      .default(STUDENT_STATUS_ENUM.ACTIVE),
    isNewStudent: integer("is_new_student", { mode: "boolean" })
      .notNull()
      .default(false),
    studentCode: text("student_code")
      .notNull()
      .$defaultFn(generateNumericEnrollmentCode),
    studentId: text("student_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    ...withYearAndSchoolIds,
    ...timestamps,
  },
  (table) => [
    index("enrollments_school_idx").on(table.schoolId),
    index("enrollments_classroom_idx").on(table.classroomId),
    index("enrollments_student_idx").on(table.studentId),
    uniqueIndex("student_year_unique_idx").on(table.studentId, table.yearId),
  ],
);

export type TableClassroomEnrollment = typeof classroomEnrollments;
export type ClassroomEnrollment = InferSelectModel<TableClassroomEnrollment>;
export type InsertClassroomEnrollment =
  InferInsertModel<TableClassroomEnrollment>;
export type UpdateClassroomEnrollment = AsUpdatePayload<
  InsertClassroomEnrollment,
  "enrollmentId"
>;
