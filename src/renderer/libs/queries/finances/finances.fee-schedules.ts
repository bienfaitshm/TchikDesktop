import { useMutation, useSuspenseQuery } from "../base";
import { feeSchedule as scheduleApi } from "@/renderer/libs/apis";
import type {
  FeeScheduleCreate,
  FeeScheduleBulkCreate,
  FeeScheduleFilter,
  FeeScheduleUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { TQueryUpdate } from "../type";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import type { FeeSchedule } from "@/packages/@core/data-access/db";

/* =========================================================================
   FEE SCHEDULE QUERY KEYS
   ========================================================================= */
export const feeScheduleKeys = {
  all: ["fee-schedules"] as const,
  lists: (params?: FeeScheduleFilter) =>
    [...feeScheduleKeys.all, "list", { params }] as const,
  options: (params?: FeeScheduleFilter) =>
    [...feeScheduleKeys.all, "options", { params }] as const,
  byFeeType: (feeTypeId: string) =>
    [...feeScheduleKeys.all, "by-fee-type", feeTypeId] as const,
  details: () => [...feeScheduleKeys.all, "detail"] as const,
  detail: (id: string) => [...feeScheduleKeys.details(), id] as const,
  mutations: {
    create: () => [...feeScheduleKeys.all, "create"] as const,
    bulkCreate: () => [...feeScheduleKeys.all, "bulkCreate"] as const,
    update: () => [...feeScheduleKeys.all, "update"] as const,
    delete: () => [...feeScheduleKeys.all, "delete"] as const,
  },
} as const;

/* =========================================================================
   QUERIES (SUSPENSE)
   ========================================================================= */

export function useGetFeeSchedules(
  params?: FeeScheduleFilter,
  options?: Partial<UseSuspenseQueryOptions<FeeSchedule[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeScheduleKeys.lists(params),
    queryFn: () => scheduleApi.fetchFeeSchedules(params),
    ...options,
  });
}

export function useGetFeeSchedulesAsOptions(
  params?: FeeScheduleFilter,
  options?: Partial<UseSuspenseQueryOptions<(SelectOption & FeeSchedule)[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeScheduleKeys.options(params),
    queryFn: () => scheduleApi.fetchFeeSchedulesAsOptions(params),
    ...options,
  });
}

export function useGetFeeScheduleById(
  scheduleId: string,
  options?: Partial<UseSuspenseQueryOptions<FeeSchedule>>,
) {
  return useSuspenseQuery({
    queryKey: feeScheduleKeys.detail(scheduleId),
    queryFn: () => scheduleApi.fetchFeeScheduleById(scheduleId),
    ...options,
  });
}

/**
 * Récupère les échéances liées à un type de frais spécifique (Idéal pour l'UI réactive)
 */
export function useGetFeeSchedulesByFeeType(
  feeTypeId: string,
  options?: Partial<UseSuspenseQueryOptions<FeeSchedule[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeScheduleKeys.byFeeType(feeTypeId),
    queryFn: () => scheduleApi.fetchFeeSchedulesByFeeType(feeTypeId),
    ...options,
  });
}

/* =========================================================================
   MUTATIONS
   ========================================================================= */

export function useCreateFeeSchedule(
  options?: Partial<UseMutationOptions<FeeSchedule, Error, FeeScheduleCreate>>,
) {
  return useMutation({
    mutationKey: feeScheduleKeys.mutations.create(),
    mutationFn: (data) => scheduleApi.createFeeSchedule(data),
    ...options,
  });
}

export function useBulkCreateFeeSchedule(
  options?: Partial<
    UseMutationOptions<FeeSchedule[], Error, FeeScheduleBulkCreate>
  >,
) {
  return useMutation({
    mutationKey: feeScheduleKeys.mutations.bulkCreate(),
    mutationFn: (data) => scheduleApi.bulkCreateFeeSchedule(data),
    ...options,
  });
}

export function useUpdateFeeSchedule(
  options?: Partial<
    UseMutationOptions<FeeSchedule, Error, TQueryUpdate<FeeScheduleUpdate>>
  >,
) {
  return useMutation({
    mutationKey: feeScheduleKeys.mutations.update(),
    mutationFn: ({ data, id }) => scheduleApi.updateFeeSchedule(id, data),
    ...options,
  });
}

export function useDeleteFeeSchedule(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: feeScheduleKeys.mutations.delete(),
    mutationFn: (scheduleId: string) =>
      scheduleApi.deleteFeeSchedule(scheduleId),
    ...options,
  });
}
