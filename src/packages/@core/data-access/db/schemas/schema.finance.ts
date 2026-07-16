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
  enumColumn,
  timestamps,
} from "../drizzle-fields";
import type { AsUpdatePayload } from "./types";

// 1. Portefeuilles (caisses virtuelles par type de frais)
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

// 2. Types de frais (rattachés à un portefeuille)
export const feeTypes = sqliteTable(
  "fee_types",
  {
    feeTypeId: primaryKeyId("fee_type_id"),
    name: text("name").notNull(),
    walletId: foreignKeyId("wallet_id", {
      ref: () => wallets.walletId,
      actions: { onDelete: "cascade" },
    }),
    ...withYearAndSchoolIds,
    ...timestamps,
  },
  (table) => [index("fee_type_school_idx").on(table.schoolId)],
);

export type TableFeeType = typeof feeTypes;
export type FeeType = InferSelectModel<TableFeeType>;
export type InsertFeeType = InferInsertModel<TableFeeType>;
export type UpdateFeeType = AsUpdatePayload<InsertFeeType, "feeTypeId">;

// 3. Échéancier de Paiement (Le découpage temporel par mois / par volée)
export const feeSchedules = sqliteTable("fee_schedules", {
  scheduleId: primaryKeyId("schedule_id"),
  installmentName: text("installment_name").notNull(),
  feeTypeId: foreignKeyId("fee_type_id", {
    ref: () => feeTypes.feeTypeId,
    actions: { onDelete: "cascade" },
  }),
  ...timestamps,
});

export type TableFeeSchedule = typeof feeSchedules;
export type FeeSchedule = InferSelectModel<TableFeeSchedule>;
export type InsertFeeSchedule = InferInsertModel<TableFeeSchedule>;
export type UpdateFeeSchedule = AsUpdatePayload<
  InsertFeeSchedule,
  "scheduleId"
>;

// 4. Configuration des frais (montant, devise, cible)
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
    feeTypeId: foreignKeyId("fee_type_id", {
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
  ],
);

export type TableFeeConfiguration = typeof feeConfigurations;
export type FeeConfiguration = InferSelectModel<TableFeeConfiguration>;
export type InsertFeeConfiguration = InferInsertModel<TableFeeConfiguration>;
export type UpdateFeeConfiguration = AsUpdatePayload<
  InsertFeeConfiguration,
  "feeConfigId"
>;

// 4. Attribution d’un échéancier à un élève (via son inscription active)
export const feeAssignments = sqliteTable(
  "fee_assignments",
  {
    assignmentId: primaryKeyId("assignment_id"),
    enrollmentId: foreignKeyId("enrollment_id", {
      ref: () => classroomEnrollments.enrollmentId,
      actions: { onDelete: "cascade" },
    }),
    feeConfigId: foreignKeyId("fee_config_id", {
      ref: () => feeConfigurations.feeConfigId,
      actions: { onDelete: "cascade" },
    }),
    scheduleId: foreignKeyId("schedule_id", {
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
  ],
);

export type TableFeeAssignment = typeof feeAssignments;
export type FeeAssignment = InferSelectModel<TableFeeAssignment>;
export type InsertFeeAssignment = InferInsertModel<TableFeeAssignment>;
export type UpdateFeeAssignment = AsUpdatePayload<
  InsertFeeAssignment,
  "assignmentId"
>;

// 5. Historique comptable des paiements réels
export const studentPayments = sqliteTable(
  "student_payments",
  {
    paymentId: primaryKeyId("payment_id"),
    assignmentId: foreignKeyId("assignment_id", {
      ref: () => feeAssignments.assignmentId,
      actions: { onDelete: "cascade" },
    }),

    // Montant et devise remis physiquement
    amountReceived: integer("amount_received").notNull(),
    currencyReceived: enumColumn("currency_received", CURRENCY_ENUM)
      .notNull()
      .default(CURRENCY_ENUM.CDF),

    // Taux de change appliqué, multiplié par 1 000 000 pour précision (ex: 2850750000 pour 2850.75 CDF / 1 USD)
    appliedExchangeRate: integer("applied_exchange_rate").notNull(),
    // Montant converti dans la devise de la dette (en centimes)
    amountConverted: integer("amount_converted").notNull(),

    paymentMethod: enumColumn("payment_method", PAYMENT_METHOD_ENUM).notNull(),
    transactionReference: text("transaction_reference"),

    ...timestamps,
  },
  (table) => [index("payments_assignment_idx").on(table.assignmentId)],
);

export type TableStudentPayment = typeof studentPayments;
export type StudentPayment = InferSelectModel<TableStudentPayment>;
export type InsertStudentPayment = InferInsertModel<TableStudentPayment>;
export type UpdateStudentPayment = AsUpdatePayload<
  InsertStudentPayment,
  "paymentId"
>;

// 6. Taux de change quotidien (TauxDuJour)
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
  (table) => [index("daily_rate_date_idx").on(table.date)],
);

export type TableDailyExchangeRate = typeof dailyExchangeRates;
export type DailyExchangeRate = InferSelectModel<TableDailyExchangeRate>;
export type InsertDailyExchangeRate = InferInsertModel<TableDailyExchangeRate>;
export type UpdateDailyExchangeRate = AsUpdatePayload<
  InsertDailyExchangeRate,
  "rateId"
>;
