import { relations } from "drizzle-orm";
import {
  wallets,
  feeTypes,
  feeSchedules,
  feeConfigurations,
  feeAssignments,
  studentPayments,
  dailyExchangeRates,
  feeOverrides,
} from "./schema.finance";
import {
  schools,
  studyYears,
  classrooms,
  classroomEnrollments,
  options,
  users,
} from "./schema";

/**
 * Defines relations for the wallets table, mapping owning school and child fee types.
 */
export const walletsRelations = relations(wallets, ({ one, many }) => ({
  school: one(schools, {
    fields: [wallets.schoolId],
    references: [schools.schoolId],
  }),
  feeTypes: many(feeTypes),
}));

/**
 * Defines relations for fee types, linking wallet, academic year, school, schedules, configs, and overrides.
 */
export const feeTypesRelations = relations(feeTypes, ({ one, many }) => ({
  wallet: one(wallets, {
    fields: [feeTypes.walletId],
    references: [wallets.walletId],
  }),
  year: one(studyYears, {
    fields: [feeTypes.yearId],
    references: [studyYears.yearId],
  }),
  school: one(schools, {
    fields: [feeTypes.schoolId],
    references: [schools.schoolId],
  }),
  feeConfigurations: many(feeConfigurations),
  schedules: many(feeSchedules),
  feeOverrides: many(feeOverrides),
}));

/**
 * Defines relations for fee schedules, linking parent fee type to child assignments.
 */
export const feeSchedulesRelations = relations(
  feeSchedules,
  ({ one, many }) => ({
    feeType: one(feeTypes, {
      fields: [feeSchedules.feeTypeId],
      references: [feeTypes.feeTypeId],
    }),
    assignments: many(feeAssignments),
  }),
);

/**
 * Defines relations for fee configurations, linking fee type, context scope, and student assignments.
 */
export const feeConfigurationsRelations = relations(
  feeConfigurations,
  ({ one, many }) => ({
    feeType: one(feeTypes, {
      fields: [feeConfigurations.feeTypeId],
      references: [feeTypes.feeTypeId],
    }),
    year: one(studyYears, {
      fields: [feeConfigurations.yearId],
      references: [studyYears.yearId],
    }),
    school: one(schools, {
      fields: [feeConfigurations.schoolId],
      references: [schools.schoolId],
    }),
    option: one(options, {
      fields: [feeConfigurations.optionId],
      references: [options.optionId],
    }),
    classroom: one(classrooms, {
      fields: [feeConfigurations.classroomId],
      references: [classrooms.classId],
    }),
    assignments: many(feeAssignments),
  }),
);

/**
 * Defines relations for fee assignments, linking student enrollment, fee config, schedule, and payments.
 */
export const feeAssignmentsRelations = relations(
  feeAssignments,
  ({ one, many }) => ({
    enrollment: one(classroomEnrollments, {
      fields: [feeAssignments.enrollmentId],
      references: [classroomEnrollments.enrollmentId],
    }),
    feeConfig: one(feeConfigurations, {
      fields: [feeAssignments.feeConfigId],
      references: [feeConfigurations.feeConfigId],
    }),
    schedule: one(feeSchedules, {
      fields: [feeAssignments.scheduleId],
      references: [feeSchedules.scheduleId],
    }),
    payments: many(studentPayments),
  }),
);

/**
 * Defines relations for student payments, linking assignments, collector user, school, and year.
 */
export const studentPaymentsRelations = relations(
  studentPayments,
  ({ one }) => ({
    assignment: one(feeAssignments, {
      fields: [studentPayments.assignmentId],
      references: [feeAssignments.assignmentId],
    }),
    user: one(users, {
      fields: [studentPayments.userId],
      references: [users.userId],
    }),
    school: one(schools, {
      fields: [studentPayments.schoolId],
      references: [schools.schoolId],
    }),
    year: one(studyYears, {
      fields: [studentPayments.yearId],
      references: [studyYears.yearId],
    }),
  }),
);

/**
 * Defines relations for daily exchange rates, linking exchange records to their respective school.
 */
export const dailyExchangeRatesRelations = relations(
  dailyExchangeRates,
  ({ one }) => ({
    school: one(schools, {
      fields: [dailyExchangeRates.schoolId],
      references: [schools.schoolId],
    }),
  }),
);

/**
 * Defines relations for fee overrides, linking override rules to fee type, classroom, or specific enrollment.
 */
export const feeOverridesRelations = relations(feeOverrides, ({ one }) => ({
  feeType: one(feeTypes, {
    fields: [feeOverrides.feeTypeId],
    references: [feeTypes.feeTypeId],
  }),
  classroom: one(classrooms, {
    fields: [feeOverrides.classId],
    references: [classrooms.classId],
  }),
  enrollment: one(classroomEnrollments, {
    fields: [feeOverrides.enrollmentId],
    references: [classroomEnrollments.enrollmentId],
  }),
}));
