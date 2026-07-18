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
import type { z } from "zod";

export const WalletFilterSchema = withQueryOptions({
  wallets: WalletSchema,
});
export type WalletFilter = z.infer<typeof WalletFilterSchema>;

export const FeeTypeFilterSchema = withQueryOptions({
  wallets: WalletSchema,
  feeTypes: FeeTypeSchema,
});
export type FeeTypeFilter = z.infer<typeof FeeTypeFilterSchema>;

export const FeeScheduleFilterSchema = withQueryOptions({
  feeSchedules: FeeScheduleSchema,
});
export type FeeScheduleFilter = z.infer<typeof FeeScheduleFilterSchema>;

export const FeeConfigurationFilterSchema = withQueryOptions({
  feeConfigurations: FeeConfigurationBase,
});
export type FeeConfigurationFilter = z.infer<
  typeof FeeConfigurationFilterSchema
>;

export const FeeAssignmentFilterSchema = withQueryOptions({
  feeAssignments: FeeAssignmentSchema,
});
export type FeeAssignmentFilter = z.infer<typeof FeeAssignmentFilterSchema>;

export const StudentPaymentFilterSchema = withQueryOptions({
  studentPayments: StudentPaymentSchema,
});
export type StudentPaymentFilter = z.infer<typeof StudentPaymentFilterSchema>;

export const DailyExchangeRateFilterSchema = withQueryOptions({
  dailyExchangeRates: DailyExchangeRateSchema,
});
export type DailyExchangeRateFilter = z.infer<
  typeof DailyExchangeRateFilterSchema
>;
