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
 * Database table definition for schools storing organizational metadata.
 */
export const schools = sqliteTable("schools", {
  schoolId: primaryKeyId("school_id"),
  name: text("name").notNull(),
  address: text("address").notNull(),
  town: text("town").notNull(),
  logo: text("logo"),
  ...timestamps,
});

/** Represents the Drizzle table schema for schools. */
export type TableSchool = typeof schools;
/** Represents a selected school entity record. */
export type School = InferSelectModel<TableSchool>;
/** Represents the insertion payload for a school record. */
export type InsertSchool = InferInsertModel<TableSchool>;
/** Represents the update payload for a school record. */
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
 * Database table definition for users supporting students, tutors, and staff accounts.
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

/** Represents the Drizzle table schema for users. */
export type TableUser = typeof users;
/** Represents a selected user entity record. */
export type User = InferSelectModel<TableUser>;
/** Represents the insertion payload for a user record. */
export type InsertUser = InferInsertModel<TableUser>;
/** Represents the update payload for a user record. */
export type UpdateUser = AsUpdatePayload<InsertUser, "userId">;

/**
 * Database table definition for tutors managing student legal guardians.
 */
export const tutors = sqliteTable(
  "tutors",
  {
    tutorId: primaryKeyId("tutor_id"),
    profession: text("profession"),
    address: text("address"),
    phoneNumber: text("phone_number"),
    userId: text("user_id")
      .unique()
      .references(() => users.userId, { onDelete: "cascade" }),
    ...withSchoolId,
    ...timestamps,
  },
  (table) => [
    index("tutors_school_idx").on(table.schoolId),
    index("tutors_phone_number_idx").on(table.phoneNumber),
    index("tutors_school_phone_idx").on(table.schoolId, table.phoneNumber),
  ],
);

/** Represents the Drizzle table schema for tutors. */
export type TableTutor = typeof tutors;
/** Represents a selected tutor entity record. */
export type Tutor = InferSelectModel<TableTutor>;
/** Represents the insertion payload for a tutor record. */
export type InsertTutor = InferInsertModel<TableTutor>;
/** Represents the update payload for a tutor record. */
export type UpdateTutor = AsUpdatePayload<InsertTutor, "tutorId">;

/**
 * Database table definition for academic options or study streams.
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

/** Represents the Drizzle table schema for options. */
export type TableOption = typeof options;
/** Represents a selected option entity record. */
export type Option = InferSelectModel<TableOption>;
/** Represents the insertion payload for an option record. */
export type InsertOption = InferInsertModel<TableOption>;
/** Represents the update payload for an option record. */
export type UpdateOption = AsUpdatePayload<InsertOption, "optionId">;

/**
 * Database table definition for academic study years.
 */
export const studyYears = sqliteTable("study_years", {
  yearId: primaryKeyId("year_id"),
  yearName: text("year_name").notNull(),
  startDate: timestampColumn("start_date"),
  endDate: timestampColumn("end_date"),
  ...timestamps,
});

/** Represents the Drizzle table schema for study years. */
export type TableStudyYear = typeof studyYears;
/** Represents a selected study year entity record. */
export type StudyYear = InferSelectModel<TableStudyYear>;
/** Represents the insertion payload for a study year record. */
export type InsertStudyYear = InferInsertModel<TableStudyYear>;
/** Represents the update payload for a study year record. */
export type UpdateStudyYear = AsUpdatePayload<InsertStudyYear, "yearId">;

/**
 * Database table definition for school classrooms.
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

/** Represents the Drizzle table schema for classrooms. */
export type TableClassroom = typeof classrooms;
/** Represents a selected classroom entity record. */
export type Classroom = InferSelectModel<TableClassroom>;
/** Represents the insertion payload for a classroom record. */
export type InsertClassroom = InferInsertModel<TableClassroom>;
/** Represents the update payload for a classroom record. */
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
 * Database table definition for classroom enrollments connecting students, classrooms, and tutors per academic year.
 */
export const classroomEnrollments = sqliteTable(
  "classroom_enrollments",
  {
    enrollmentId: primaryKeyId("enrollment_id"),
    classroomId: foreignKeyIdNoNull("classroom_id", {
      ref: () => classrooms.classId,
      actions: { onDelete: "cascade" },
    }),
    status: enumColumn("status", STUDENT_STATUS_ENUM)
      .notNull()
      .default(STUDENT_STATUS_ENUM.ACTIVE),
    isNewStudent: integer("is_new_student", { mode: "boolean" })
      .notNull()
      .default(false),
    studentCode: text("student_code")
      .notNull()
      .$defaultFn(generateNumericEnrollmentCode),
    studentId: foreignKeyIdNoNull("student_id", {
      ref: () => users.userId,
      actions: { onDelete: "cascade" },
    }),
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

/** Represents the Drizzle table schema for classroom enrollments. */
export type TableClassroomEnrollment = typeof classroomEnrollments;
/** Represents a selected classroom enrollment entity record. */
export type ClassroomEnrollment = InferSelectModel<TableClassroomEnrollment>;
/** Represents the insertion payload for a classroom enrollment record. */
export type InsertClassroomEnrollment =
  InferInsertModel<TableClassroomEnrollment>;
/** Represents the update payload for a classroom enrollment record. */
export type UpdateClassroomEnrollment = AsUpdatePayload<
  InsertClassroomEnrollment,
  "enrollmentId"
>;
