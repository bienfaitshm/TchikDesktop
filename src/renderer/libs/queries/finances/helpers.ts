import { useMemo, useState } from "react";
import { useDebounce } from "../base";
import {
  useGetFeeTypeAsOptions,
  useGetFeeAssignmentAsOptions,
  useGetFeeConfigurationAsOptions,
  useGetFeeSchedulesAsOptions,
  useGetDailyExchangeRateAsOptions,
  useGetStudentPaymentAsOptions,
} from "./finances";

import type {
  FeeTypeFilter,
  FeeAssignmentFilter,
  FeeScheduleFilter,
  StudentPaymentFilter,
  DailyExchangeRateFilter,
  FeeConfiguration,
} from "@/packages/@core/data-access/schema-validations";

export interface SearchHookOptions<TFilters = Record<string, any>> {
  /** Filtres additionnels optionnels pour restreindre la recherche */
  filters?: TFilters;
  /** Délai de debounce en millisecondes (par défaut: 300ms) */
  debounceMs?: number;
}

/**
 * 2. Hook Générique Interne (Factory Pattern)
 * Centralise la logique de debounce et de gestion d'état pour éviter la duplication.
 */
function useGenericSearchOptions<TData, TFilters>(
  useQueryHook: (params: { search: string; filters?: TFilters }) => {
    data?: TData[];
    isLoading: boolean;
    isFetching: boolean;
  },
  options: SearchHookOptions<TFilters> = {},
) {
  const { filters, debounceMs = 300 } = options;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, debounceMs);

  const serializedFilters = JSON.stringify(filters);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      filters: filters,
    }),
    [debouncedSearch, serializedFilters],
  );

  const { data = [], isLoading, isFetching } = useQueryHook(queryParams);

  return {
    searchQuery,
    options: data,
    isSearching: isLoading || isFetching,
    setSearchQuery,
  };
}

/**
 * Recherche des types de frais (Fee Types)
 */
export function useSearchFeeTypeOptions(
  options?: SearchHookOptions<FeeTypeFilter>,
) {
  return useGenericSearchOptions(useGetFeeTypeAsOptions, options);
}

/**
 * Recherche des assignations de frais (Fee Assignments)
 */
export function useSearchFeeAssignmentOptions(
  options?: SearchHookOptions<FeeAssignmentFilter>,
) {
  return useGenericSearchOptions(useGetFeeAssignmentAsOptions, options);
}

/**
 * Recherche des configurations de frais (Fee Configurations)
 */
export function useSearchFeeConfigurationOptions(
  options?: SearchHookOptions<FeeConfiguration>,
) {
  return useGenericSearchOptions(useGetFeeConfigurationAsOptions, options);
}

/**
 * Recherche des échéanciers (Fee Schedules)
 */
export function useSearchFeeScheduleOptions(
  options?: SearchHookOptions<FeeScheduleFilter>,
) {
  return useGenericSearchOptions(useGetFeeSchedulesAsOptions, options);
}

/**
 * Recherche des taux de change journaliers (Daily Exchange Rates)
 */
export function useSearchDailyExchangeRateOptions(
  options?: SearchHookOptions<DailyExchangeRateFilter>,
) {
  return useGenericSearchOptions(useGetDailyExchangeRateAsOptions, options);
}

/**
 * Recherche des paiements d'élèves (Student Payments)
 */
export function useSearchStudentPaymentOptions(
  options?: SearchHookOptions<StudentPaymentFilter>,
) {
  return useGenericSearchOptions(useGetStudentPaymentAsOptions, options);
}
