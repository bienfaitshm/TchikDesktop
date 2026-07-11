import { useMutation, useSuspenseQuery } from "../base";
import { dailyExchangeRate as rateApi } from "@/renderer/libs/apis";
import type {
  DailyExchangeRateCreate,
  DailyExchangeRateFilter,
  DailyExchangeRateUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { DailyExchangeRate } from "@/packages/@core/data-access/db";
import type { TQueryUpdate } from "../type";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export const dailyExchangeRateKeys = {
  all: ["daily-exchange-rates"] as const,
  lists: (params?: DailyExchangeRateFilter) =>
    [...dailyExchangeRateKeys.all, "list", { params }] as const,
  lts: (params?: DailyExchangeRateFilter) =>
    [...dailyExchangeRateKeys.all, "lts", { params }] as const,
  options: (params?: DailyExchangeRateFilter) =>
    [...dailyExchangeRateKeys.all, "options", { params }] as const,
  details: () => [...dailyExchangeRateKeys.all, "detail"] as const,
  detail: (id: string) => [...dailyExchangeRateKeys.details(), id] as const,
  mutations: {
    create: () => [...dailyExchangeRateKeys.all, "create"] as const,
    update: () => [...dailyExchangeRateKeys.all, "update"] as const,
    delete: () => [...dailyExchangeRateKeys.all, "delete"] as const,
  },
} as const;

export function useGetDailyExchangeRates(
  params?: DailyExchangeRateFilter,
  options?: Partial<UseSuspenseQueryOptions<DailyExchangeRate[]>>,
) {
  return useSuspenseQuery({
    queryKey: dailyExchangeRateKeys.lists(params),
    queryFn: () => rateApi.fetchDailyExchangeRates(params),
    ...options,
  });
}

export function useGetLatestDailyExchangeRate(
  params?: DailyExchangeRateFilter,
  options?: Partial<UseSuspenseQueryOptions<DailyExchangeRate | null>>,
) {
  return useSuspenseQuery({
    queryKey: dailyExchangeRateKeys.lts(params),
    queryFn: () => rateApi.fetchLatestDailyExchangeRate(params),
    ...options,
  });
}

export function useGetDailyExchangeRateAsOptions(
  params?: DailyExchangeRateFilter,
  options?: Partial<
    UseSuspenseQueryOptions<(SelectOption & DailyExchangeRate)[]>
  >,
) {
  return useSuspenseQuery({
    queryKey: dailyExchangeRateKeys.options(params),
    queryFn: () => rateApi.fetchDailyExchangeRatesAsOptions(params),
    ...options,
  });
}

export function useGetDailyExchangeRateById(
  rateId: string,
  options?: Partial<UseSuspenseQueryOptions<DailyExchangeRate>>,
) {
  return useSuspenseQuery({
    queryKey: dailyExchangeRateKeys.detail(rateId),
    queryFn: () => rateApi.fetchDailyExchangeRateById(rateId),
    ...options,
  });
}

export function useCreateDailyExchangeRate(
  options?: Partial<
    UseMutationOptions<DailyExchangeRate, Error, DailyExchangeRateCreate>
  >,
) {
  return useMutation({
    mutationKey: dailyExchangeRateKeys.mutations.create(),
    mutationFn: (data) => rateApi.createDailyExchangeRate(data),
    ...options,
  });
}

export function useUpdateDailyExchangeRate(
  options?: Partial<
    UseMutationOptions<
      DailyExchangeRate,
      Error,
      TQueryUpdate<DailyExchangeRateUpdate>
    >
  >,
) {
  return useMutation({
    mutationKey: dailyExchangeRateKeys.mutations.update(),
    mutationFn: ({ data, id }) => rateApi.updateDailyExchangeRate(id, data),
    ...options,
  });
}

export function useDeleteDailyExchangeRate(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: dailyExchangeRateKeys.mutations.delete(),
    mutationFn: (rateId: string) => rateApi.deleteDailyExchangeRate(rateId),
    ...options,
  });
}
