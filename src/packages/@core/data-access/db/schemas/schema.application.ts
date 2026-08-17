import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { ENROLLMENT_ACTION_ENUM } from "../enum";
import {
  primaryKeyId,
  enumColumn,
  timestamps,
  foreignKeyId,
} from "../drizzle-fields";
import { classroomEnrollments, schools, users } from "./schema.academic";

type AsUpdatePayload<T, PK extends keyof T> = Partial<
  Omit<T, PK | "createdAt" | "updatedAt">
>;

// actions applications
export const classroomEnrollmentActions = sqliteTable(
  "classroom_enrollment_actions",
  {
    actionId: primaryKeyId("action_id"),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => classroomEnrollments.enrollmentId, {
        onDelete: "cascade",
      }),
    reason: text("reason"),
    action: enumColumn("action", ENROLLMENT_ACTION_ENUM).notNull(),
    ...timestamps,
  },
  (table) => [index("actions_enrollment_idx").on(table.enrollmentId)],
);

export type TableClassroomEnrollmentAction = typeof classroomEnrollmentActions;
export type ClassroomEnrollmentAction =
  InferSelectModel<TableClassroomEnrollmentAction>;
export type InsertClassroomEnrollmentAction =
  InferInsertModel<TableClassroomEnrollmentAction>;
export type UpdateClassroomEnrollmentAction = AsUpdatePayload<
  InsertClassroomEnrollmentAction,
  "actionId"
>;

export const exportHistories = sqliteTable(
  "export_histories",
  {
    exportId: primaryKeyId("export_id"),
    fileType: text("file_type").notNull(),
    exportKey: text("export_key").notNull(),
    exportName: text("export_name").notNull(),
    filePath: text("file_path"),
    schoolId: foreignKeyId("school_id", {
      ref: () => schools.schoolId,
      actions: { onDelete: "cascade" },
    }),
    userId: text("user_id").references(() => users.userId, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("exports_school_idx").on(table.schoolId),
    index("exports_user_idx").on(table.userId),
    index("exports_key_idx").on(table.exportKey),
    index("exports_file_type_idx").on(table.fileType),
  ],
);

export type TableExportHistory = typeof exportHistories;
export type ExportHistory = InferSelectModel<TableExportHistory>;
export type InsertExportHistory = InferInsertModel<TableExportHistory>;
export type UpdateExportHistory = AsUpdatePayload<
  InsertExportHistory,
  "exportId"
>;
