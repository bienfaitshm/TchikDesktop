import type { z } from "zod";
import {
  WalletSchema,
  FeeTypeSchema,
  FeeScheduleSchema,
  FeeConfigurationBase,
  FeeAssignmentSchema,
  StudentPaymentSchema,
  DailyExchangeRateSchema,
} from "./model.finance";
import { withQueryOptions } from "./helpers";

/* =========================================================================
   WALLET FILTER
   ========================================================================= */
export const WalletFilterSchema = withQueryOptions({
  wallets: WalletSchema.omit({ currentBalance: true }),
});
export type WalletFilter = z.infer<typeof WalletFilterSchema>;

/* =========================================================================
   FEE TYPE FILTER
   ========================================================================= */
export const FeeTypeFilterSchema = withQueryOptions({
  wallets: WalletSchema,
  feeTypes: FeeTypeSchema,
});
export type FeeTypeFilter = z.infer<typeof FeeTypeFilterSchema>;

/* =========================================================================
   FEE SCHEDULE FILTER
   ========================================================================= */
export const FeeScheduleFilterSchema = withQueryOptions({
  feeSchedules: FeeScheduleSchema,
});
export type FeeScheduleFilter = z.infer<typeof FeeScheduleFilterSchema>;

/* =========================================================================
   FEE CONFIGURATION FILTER
   ========================================================================= */
export const FeeConfigurationFilterSchema = withQueryOptions({
  feeConfigurations: FeeConfigurationBase,
});
export type FeeConfigurationFilter = z.infer<
  typeof FeeConfigurationFilterSchema
>;

/* =========================================================================
   FEE ASSIGNMENT FILTER
   ========================================================================= */
export const FeeAssignmentFilterSchema = withQueryOptions({
  feeAssignments: FeeAssignmentSchema,
});
export type FeeAssignmentFilter = z.infer<typeof FeeAssignmentFilterSchema>;

/* =========================================================================
   STUDENT PAYMENT FILTER
   ========================================================================= */
export const StudentPaymentFilterSchema = withQueryOptions({
  studentPayments: StudentPaymentSchema,
});
export type StudentPaymentFilter = z.infer<typeof StudentPaymentFilterSchema>;

/* =========================================================================
   DAILY EXCHANGE RATE FILTER
   ========================================================================= */
export const DailyExchangeRateFilterSchema = withQueryOptions({
  dailyExchangeRates: DailyExchangeRateSchema,
});
export type DailyExchangeRateFilter = z.infer<
  typeof DailyExchangeRateFilterSchema
>;
