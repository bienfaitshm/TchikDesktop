import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel, sql } from "drizzle-orm";
import {
  classrooms,
  classroomEnrollments,
  options,
  withYearAndSchoolIds,
  withSchoolId,
  users,
} from "./schema";
import {
  FEE_SCHEDULES_ENUM,
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
  SECTION_ENUM,
} from "../options";
import {
  primaryKeyId,
  foreignKeyId,
  foreignKeyIdNoNull,
  enumColumn,
  timestamps,
} from "../drizzle-fields";
import type { AsUpdatePayload } from "./types";

export const wallets = sqliteTable(
  "wallets",
  {
    walletId: primaryKeyId("wallet_id"),
    name: text("name").notNull(),
    currency: enumColumn("currency", CURRENCY_ENUM)
      .notNull()
      .default(CURRENCY_ENUM.CDF),
    currentBalance: integer("current_balance").notNull().default(0),
    ...withSchoolId,
    ...timestamps,
  },
  (table) => [index("wallets_school_idx").on(table.schoolId)],
);

export type TableWallet = typeof wallets;
export type Wallet = InferSelectModel<TableWallet>;
export type InsertWallet = InferInsertModel<TableWallet>;
export type UpdateWallet = AsUpdatePayload<InsertWallet, "walletId">;

export const feeTypes = sqliteTable(
  "fee_types",
  {
    feeTypeId: primaryKeyId("fee_type_id"),
    name: text("name").notNull(),
    walletId: foreignKeyIdNoNull("wallet_id", {
      ref: () => wallets.walletId,
      actions: { onDelete: "cascade" },
    }),
    ...withYearAndSchoolIds,
    ...timestamps,
  },
  (table) => [
    index("fee_types_school_year_idx").on(table.schoolId, table.yearId),
    index("fee_types_wallet_idx").on(table.walletId),
  ],
);

export type TableFeeType = typeof feeTypes;
export type FeeType = InferSelectModel<TableFeeType>;
export type InsertFeeType = InferInsertModel<TableFeeType>;
export type UpdateFeeType = AsUpdatePayload<InsertFeeType, "feeTypeId">;

export const feeSchedules = sqliteTable(
  "fee_schedules",
  {
    scheduleId: primaryKeyId("schedule_id"),
    installmentName: text("installment_name").notNull(),
    feeTypeId: foreignKeyIdNoNull("fee_type_id", {
      ref: () => feeTypes.feeTypeId,
      actions: { onDelete: "cascade" },
    }),
    ...timestamps,
  },
  (table) => [index("fee_schedules_fee_type_idx").on(table.feeTypeId)],
);

export type TableFeeSchedule = typeof feeSchedules;
export type FeeSchedule = InferSelectModel<TableFeeSchedule>;
export type InsertFeeSchedule = InferInsertModel<TableFeeSchedule>;
export type UpdateFeeSchedule = AsUpdatePayload<
  InsertFeeSchedule,
  "scheduleId"
>;

export const feeConfigurations = sqliteTable(
  "fee_configurations",
  {
    feeConfigId: primaryKeyId("fee_config_id"),
    name: text("name").notNull(),
    totalAmount: integer("total_amount").notNull(),
    currency: enumColumn("currency", CURRENCY_ENUM)
      .notNull()
      .default(CURRENCY_ENUM.CDF),
    section: enumColumn("section", SECTION_ENUM),
    optionId: foreignKeyId("option_id", {
      type: "NULL",
      ref: () => options.optionId,
      actions: { onDelete: "cascade" },
    }),
    classroomId: foreignKeyId("classroom_id", {
      type: "NULL",
      ref: () => classrooms.classId,
      actions: { onDelete: "cascade" },
    }),
    feeTypeId: foreignKeyIdNoNull("fee_type_id", {
      ref: () => feeTypes.feeTypeId,
      actions: { onDelete: "cascade" },
    }),
    ...withYearAndSchoolIds,
    ...timestamps,
  },
  (table) => [
    check(
      "exactly_one_target_check",
      sql`
        (${table.section} IS NOT NULL AND ${table.optionId} IS NULL AND ${table.classroomId} IS NULL)
        OR
        (${table.section} IS NULL AND ${table.optionId} IS NOT NULL AND ${table.classroomId} IS NULL)
        OR
        (${table.section} IS NULL AND ${table.optionId} IS NULL AND ${table.classroomId} IS NOT NULL)
      `,
    ),
    index("fee_config_school_year_idx").on(table.schoolId, table.yearId),
    index("fee_config_fee_type_idx").on(table.feeTypeId),
    index("fee_config_option_idx").on(table.optionId),
    index("fee_config_classroom_idx").on(table.classroomId),
  ],
);

export type TableFeeConfiguration = typeof feeConfigurations;
export type FeeConfiguration = InferSelectModel<TableFeeConfiguration>;
export type InsertFeeConfiguration = InferInsertModel<TableFeeConfiguration>;
export type UpdateFeeConfiguration = AsUpdatePayload<
  InsertFeeConfiguration,
  "feeConfigId"
>;

export const feeAssignments = sqliteTable(
  "fee_assignments",
  {
    assignmentId: primaryKeyId("assignment_id"),
    enrollmentId: foreignKeyIdNoNull("enrollment_id", {
      ref: () => classroomEnrollments.enrollmentId,
      actions: { onDelete: "cascade" },
    }),
    feeConfigId: foreignKeyIdNoNull("fee_config_id", {
      ref: () => feeConfigurations.feeConfigId,
      actions: { onDelete: "cascade" },
    }),
    scheduleId: foreignKeyIdNoNull("schedule_id", {
      ref: () => feeSchedules.scheduleId,
      actions: { onDelete: "cascade" },
    }),
    amountPaid: integer("amount_paid").notNull().default(0),
    totalAmount: integer("total_amount").notNull().default(0),
    status: enumColumn("status", FEE_SCHEDULES_ENUM)
      .notNull()
      .default(FEE_SCHEDULES_ENUM.UNPAID),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("enrollment_fee_config_schedule_unique_idx").on(
      table.enrollmentId,
      table.feeConfigId,
      table.scheduleId,
    ),
    index("fee_assignments_config_idx").on(table.feeConfigId),
    index("fee_assignments_schedule_idx").on(table.scheduleId),
  ],
);

export type TableFeeAssignment = typeof feeAssignments;
export type FeeAssignment = InferSelectModel<TableFeeAssignment>;
export type InsertFeeAssignment = InferInsertModel<TableFeeAssignment>;
export type UpdateFeeAssignment = AsUpdatePayload<
  InsertFeeAssignment,
  "assignmentId"
>;

export const studentPayments = sqliteTable(
  "student_payments",
  {
    paymentId: primaryKeyId("payment_id"),
    assignmentId: foreignKeyIdNoNull("assignment_id", {
      ref: () => feeAssignments.assignmentId,
      actions: { onDelete: "cascade" },
    }),

    amountReceived: integer("amount_received").notNull(),
    currencyReceived: enumColumn("currency_received", CURRENCY_ENUM)
      .notNull()
      .default(CURRENCY_ENUM.CDF),
    appliedExchangeRate: integer("applied_exchange_rate").notNull(),
    amountConverted: integer("amount_converted").notNull(),

    paymentMethod: enumColumn("payment_method", PAYMENT_METHOD_ENUM).notNull(),
    transactionReference: text("transaction_reference"),
    userId: foreignKeyId("user_id", {
      type: "NULL",
      actions: { onDelete: "set default" },
      ref: () => users.userId,
    }),
    ...withYearAndSchoolIds,
    ...timestamps,
  },
  (table) => [
    index("payments_assignment_idx").on(table.assignmentId),
    index("payments_school_year_idx").on(table.schoolId, table.yearId),
    index("payments_user_idx").on(table.userId),
  ],
);

export type TableStudentPayment = typeof studentPayments;
export type StudentPayment = InferSelectModel<TableStudentPayment>;
export type InsertStudentPayment = InferInsertModel<TableStudentPayment>;
export type UpdateStudentPayment = AsUpdatePayload<
  InsertStudentPayment,
  "paymentId"
>;

export const dailyExchangeRates = sqliteTable(
  "daily_exchange_rates",
  {
    rateId: primaryKeyId("rate_id"),
    date: text("date").notNull(),

    currencyFrom: enumColumn("currency_from", CURRENCY_ENUM).notNull(),
    currencyTo: enumColumn("currency_to", CURRENCY_ENUM).notNull(),
    rate: integer("rate").notNull(),

    ...withSchoolId,
    ...timestamps,
  },
  (table) => [
    uniqueIndex("daily_rate_unique_idx").on(
      table.schoolId,
      table.date,
      table.currencyFrom,
      table.currencyTo,
    ),
    index("daily_rate_date_idx").on(table.date),
  ],
);

export type TableDailyExchangeRate = typeof dailyExchangeRates;
export type DailyExchangeRate = InferSelectModel<TableDailyExchangeRate>;
export type InsertDailyExchangeRate = InferInsertModel<TableDailyExchangeRate>;
export type UpdateDailyExchangeRate = AsUpdatePayload<
  InsertDailyExchangeRate,
  "rateId"
>;
