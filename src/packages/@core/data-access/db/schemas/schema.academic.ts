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
  timestampColumn,
  foreignKeyIdNoNull,
} from "../drizzle-fields";

/**
 * Utility type deriving an update payload type by excluding primary keys and immutable timestamps.
 * @template T - Base entity model type.
 * @template PK - Primary key property name to omit.
 */
type AsUpdatePayload<T, PK extends keyof T> = Partial<
  Omit<T, PK | "createdAt" | "updatedAt">
>;

/**
 * Schools database table schema definition.
 */
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

/**
 * Reusable column mixin adding a non-null school foreign key constraint with cascade deletion.
 */
export const withSchoolId = {
  schoolId: foreignKeyIdNoNull("school_id", {
    ref: () => schools.schoolId,
    actions: { onDelete: "cascade" },
  }),
};

/**
 * Users database table schema definition with search indexes.
 */
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

/**
 * Tutors database table schema definition with school scope and lookup indexes.
 */
export const tutors = sqliteTable(
  "tutors",
  {
    tutorId: primaryKeyId("tutor_id"),
    profession: text("profession"),
    address: text("address"),
    phoneNumber: text("phone_number"),
    ...withSchoolId,
    ...timestamps,
  },
  (table) => [
    index("tutors_school_idx").on(table.schoolId),
    index("tutors_phone_number_idx").on(table.phoneNumber),
    index("tutors_school_phone_idx").on(table.schoolId, table.phoneNumber),
  ],
);

export type TableTutor = typeof tutors;
export type Tutor = InferSelectModel<TableTutor>;
export type InsertTutor = InferInsertModel<TableTutor>;
export type UpdateTutor = AsUpdatePayload<InsertTutor, "tutorId">;

/**
 * Academic options database table schema definition.
 */
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

/**
 * Study years database table schema definition.
 */
export const studyYears = sqliteTable("study_years", {
  yearId: primaryKeyId("year_id"),
  yearName: text("year_name").notNull(),
  startDate: timestampColumn("start_date"),
  endDate: timestampColumn("end_date"),
  ...timestamps,
});

export type TableStudyYear = typeof studyYears;
export type StudyYear = InferSelectModel<TableStudyYear>;
export type InsertStudyYear = InferInsertModel<TableStudyYear>;
export type UpdateStudyYear = AsUpdatePayload<InsertStudyYear, "yearId">;

/**
 * Classrooms database table schema definition.
 */
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
    index("classrooms_school_identifier_idx").on(
      table.schoolId,
      table.identifier,
    ),
    index("classrooms_school_short_identifier_idx").on(
      table.schoolId,
      table.shortIdentifier,
    ),
  ],
);

export type TableClassroom = typeof classrooms;
export type Classroom = InferSelectModel<TableClassroom>;
export type InsertClassroom = InferInsertModel<TableClassroom>;
export type UpdateClassroom = AsUpdatePayload<InsertClassroom, "classId">;

/**
 * Reusable column mixin combining school and academic year foreign key constraints.
 */
export const withYearAndSchoolIds = {
  ...withSchoolId,
  yearId: foreignKeyIdNoNull("year_id", {
    ref: () => studyYears.yearId,
    actions: { onDelete: "cascade" },
  }),
};

/**
 * Classroom enrollments database table schema definition with foreign keys and unique constraints.
 */
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
    tutorId: text("tutor_id").references(() => tutors.tutorId, {
      onDelete: "set null",
    }),
    ...withYearAndSchoolIds,
    ...timestamps,
  },
  (table) => [
    index("enrollments_school_idx").on(table.schoolId),
    index("enrollments_classroom_idx").on(table.classroomId),
    index("enrollments_student_idx").on(table.studentId),
    index("enrollments_tutor_idx").on(table.tutorId),
    index("enrollments_year_idx").on(table.yearId),
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
