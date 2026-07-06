import { relations } from "drizzle-orm";
import {
  wallets,
  feeTypes,
  feeSchedules,
  feeConfigurations,
  feeAssignments,
  studentPayments,
  dailyExchangeRates,
} from "./schema.finance";
import {
  schools,
  studyYears,
  classrooms,
  classroomEnrollments,
  options,
} from "./schema";

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  school: one(schools, {
    fields: [wallets.schoolId],
    references: [schools.schoolId],
  }),
  feeTypes: many(feeTypes),
}));

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
}));

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

export const studentPaymentsRelations = relations(
  studentPayments,
  ({ one }) => ({
    assignment: one(feeAssignments, {
      fields: [studentPayments.assignmentId],
      references: [feeAssignments.assignmentId],
    }),
  }),
);

export const dailyExchangeRatesRelations = relations(
  dailyExchangeRates,
  ({ one }) => ({
    school: one(schools, {
      fields: [dailyExchangeRates.schoolId],
      references: [schools.schoolId],
    }),
  }),
);
