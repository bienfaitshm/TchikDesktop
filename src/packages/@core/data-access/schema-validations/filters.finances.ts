import type { z } from "zod";
import {
  WalletSchema,
  FeeTypeSchema,
  FeeScheduleSchema,
  FeeConfigurationBase,
  FeeAssignmentSchema,
  StudentPaymentSchema,
  DailyExchangeRateSchema,
  FeeOverrideSchema,
} from "./model.finance";
import { withQueryOptions } from "./helpers";

/* =========================================================================
   WALLET FILTER
   ========================================================================= */

/**
 * Filter schema for querying wallet entities.
 */
export const WalletFilterSchema = withQueryOptions({
  wallets: WalletSchema.omit({ currentBalance: true }),
});
export type WalletFilter = z.infer<typeof WalletFilterSchema>;

/* =========================================================================
   FEE TYPE FILTER
   ========================================================================= */

/**
 * Filter schema for querying fee types alongside their linked wallets.
 */
export const FeeTypeFilterSchema = withQueryOptions({
  wallets: WalletSchema,
  feeTypes: FeeTypeSchema,
});
export type FeeTypeFilter = z.infer<typeof FeeTypeFilterSchema>;

/* =========================================================================
   FEE SCHEDULE FILTER
   ========================================================================= */

/**
 * Filter schema for querying fee installment schedule definitions.
 */
export const FeeScheduleFilterSchema = withQueryOptions({
  feeSchedules: FeeScheduleSchema,
});
export type FeeScheduleFilter = z.infer<typeof FeeScheduleFilterSchema>;

/* =========================================================================
   FEE CONFIGURATION FILTER
   ========================================================================= */

/**
 * Filter schema for querying entity-targeted fee configurations.
 */
export const FeeConfigurationFilterSchema = withQueryOptions({
  feeConfigurations: FeeConfigurationBase,
});
export type FeeConfigurationFilter = z.infer<
  typeof FeeConfigurationFilterSchema
>;

/* =========================================================================
   FEE ASSIGNMENT FILTER
   ========================================================================= */

/**
 * Filter schema for querying student fee assignments with fee types and schedules.
 */
export const FeeAssignmentFilterSchema = withQueryOptions({
  feeAssignments: FeeAssignmentSchema,
  feeTypes: FeeTypeSchema,
  feeSchedules: FeeScheduleSchema,
});
export type FeeAssignmentFilter = z.infer<typeof FeeAssignmentFilterSchema>;

/* =========================================================================
   STUDENT PAYMENT FILTER
   ========================================================================= */

/**
 * Filter schema for querying individual student payment transaction records.
 */
export const StudentPaymentFilterSchema = withQueryOptions({
  studentPayments: StudentPaymentSchema,
});
export type StudentPaymentFilter = z.infer<typeof StudentPaymentFilterSchema>;

/* =========================================================================
   DAILY EXCHANGE RATE FILTER
   ========================================================================= */

/**
 * Filter schema for querying historical and daily currency exchange rates.
 */
export const DailyExchangeRateFilterSchema = withQueryOptions({
  dailyExchangeRates: DailyExchangeRateSchema,
});
export type DailyExchangeRateFilter = z.infer<
  typeof DailyExchangeRateFilterSchema
>;

/* =========================================================================
   FEE OVERRIDE FILTER
   ========================================================================= */

/**
 * Filter schema for querying custom fee overrides targeting classes or enrollments.
 */
export const FeeOverrideFilterSchema = withQueryOptions({
  feeOverrides: FeeOverrideSchema,
});
export type FeeOverrideFilter = z.infer<typeof FeeOverrideFilterSchema>;
