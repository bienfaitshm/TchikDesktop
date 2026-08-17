import { useCallback } from "react";
import {
  useGetFeeTypeAsOptions,
  useGetFeeAssignmentAsOptions,
  useGetFeeConfigurationAsOptions,
  useGetFeeSchedulesAsOptions,
  useGetDailyExchangeRateAsOptions,
  useGetStudentPaymentAsOptions,
} from "./finances";

import { useGenericSearchOptions } from "../base";
import { FeeScheduleFilter } from "@/packages/@core/data-access/schema-validations";

export interface FinanceOptionSearchParams {
  schoolId: string;
  yearId: string;
}

/**
 * Provides a debounced search query hook for retrieving fee type selection options.
 * @param params - Context parameters specifying schoolId and yearId.
 * @returns Search option results containing options array, loading state, and search controls.
 */
export function useSearchFeeTypeOptions(params: FinanceOptionSearchParams) {
  const { schoolId, yearId } = params;

  const buildQuery = useCallback(
    (search: string) => ({
      where: {
        feeTypes: {
          schoolId: { $eq: schoolId },
          yearId: { $eq: yearId },
        },
      },
      or: [
        { feeTypes: { name: { $like: `%${search}%` } } },
        { wallets: { name: { $like: `%${search}%` } } },
      ],
    }),
    [schoolId, yearId],
  );

  return useGenericSearchOptions(useGetFeeTypeAsOptions, buildQuery);
}

/**
 * Provides a debounced search query hook for fee assignment options.
 * @param params - Context parameters specifying schoolId and yearId.
 * @returns Search option results containing options array, loading state, and search controls.
 */
export function useSearchFeeAssignmentOptions(
  params: FinanceOptionSearchParams,
) {
  const { schoolId, yearId } = params;

  const buildQuery = useCallback(
    (search: string) => ({
      where: {
        feeAssignments: {
          enrollmentId: { $like: `%${search}%` },
        },
      },
    }),
    [schoolId, yearId],
  );

  return useGenericSearchOptions(useGetFeeAssignmentAsOptions, buildQuery);
}

/**
 * Provides a debounced search query hook for fee configuration options.
 * @param params - Context parameters specifying schoolId and yearId.
 * @returns Search option results containing options array, loading state, and search controls.
 */
export function useSearchFeeConfigurationOptions(
  params: FinanceOptionSearchParams,
) {
  const { schoolId, yearId } = params;

  const buildQuery = useCallback(
    (search: string) => ({
      where: {
        feeConfigurations: {
          schoolId: { $eq: schoolId },
          yearId: { $eq: yearId },
          name: { $like: `%${search}%` },
        },
      },
    }),
    [schoolId, yearId],
  );

  return useGenericSearchOptions(useGetFeeConfigurationAsOptions, buildQuery);
}

/**
 * Provides a debounced search query hook for fee schedule options.
 * @param params - Context parameters specifying schoolId and yearId.
 * @returns Search option results containing options array, loading state, and search controls.
 */
export function useSearchFeeScheduleOptions(params: FinanceOptionSearchParams) {
  const { schoolId, yearId } = params;

  const buildQuery = useCallback(
    (search: string): FeeScheduleFilter => ({
      where: {
        feeSchedules: {
          installmentName: { $like: `%${search}%` },
        },
      },
    }),
    [schoolId, yearId],
  );

  return useGenericSearchOptions(useGetFeeSchedulesAsOptions, buildQuery);
}

/**
 * Provides a debounced search query hook for daily exchange rate options.
 * @param params - Context parameters specifying schoolId and yearId.
 * @returns Search option results containing options array, loading state, and search controls.
 */
export function useSearchDailyExchangeRateOptions(
  params: FinanceOptionSearchParams,
) {
  const { schoolId, yearId } = params;

  const buildQuery = useCallback(
    (search: string) => ({
      where: {
        dailyExchangeRates: {
          schoolId: { $eq: schoolId },
        },
      },
      or: [
        { dailyExchangeRates: { currencyFrom: { $like: `%${search}%` } } },
        { dailyExchangeRates: { currencyTo: { $like: `%${search}%` } } },
      ],
    }),
    [schoolId, yearId],
  );

  return useGenericSearchOptions(useGetDailyExchangeRateAsOptions, buildQuery);
}

/**
 * Provides a debounced search query hook for student payment options.
 * @param params - Context parameters specifying schoolId and yearId.
 * @returns Search option results containing options array, loading state, and search controls.
 */
export function useSearchStudentPaymentOptions(
  params: FinanceOptionSearchParams,
) {
  const { schoolId, yearId } = params;

  const buildQuery = useCallback(
    (search: string) => ({
      where: {
        studentPayments: {
          schoolId: { $eq: schoolId },
          yearId: { $eq: yearId },
        },
      },
      or: [
        { studentPayments: { transactionReference: { $like: `%${search}%` } } },
        { studentPayments: { paymentMethod: { $like: `%${search}%` } } },
      ],
    }),
    [schoolId, yearId],
  );

  return useGenericSearchOptions(useGetStudentPaymentAsOptions, buildQuery);
}
