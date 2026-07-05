import { z } from "zod";
import {
  WalletSchema,
  FeeTypeSchema,
  FeeConfigurationBase,
  FeeAssignmentSchema,
  StudentPaymentSchema,
  DailyExchangeRateSchema,
} from "./model.finance";
import { withQueryOptions } from "./model";

export const WalletFilterSchema = withQueryOptions(WalletSchema);
export const FeeTypeFilterSchema = withQueryOptions(FeeTypeSchema);
export const FeeConfigurationFilterSchema =
  withQueryOptions(FeeConfigurationBase);
export const FeeAssignmentFilterSchema = withQueryOptions(FeeAssignmentSchema);
export const StudentPaymentFilterSchema =
  withQueryOptions(StudentPaymentSchema);
export const DailyExchangeRateFilterSchema = withQueryOptions(
  DailyExchangeRateSchema,
);

export type WalletFilter = z.infer<typeof WalletFilterSchema>;
export type FeeTypeFilter = z.infer<typeof FeeTypeFilterSchema>;
export type FeeConfigurationFilter = z.infer<
  typeof FeeConfigurationFilterSchema
>;
export type FeeAssignmentFilter = z.infer<typeof FeeAssignmentFilterSchema>;
export type StudentPaymentFilter = z.infer<typeof StudentPaymentFilterSchema>;
export type DailyExchangeRateFilter = z.infer<
  typeof DailyExchangeRateFilterSchema
>;
