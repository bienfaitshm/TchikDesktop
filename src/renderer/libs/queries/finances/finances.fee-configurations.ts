import { useMutation, useSuspenseQuery } from "../base";
import { feeConfiguration as feeConfigApi } from "@/renderer/libs/apis";
import type {
  FeeApplicableConfiguration,
  FeeConfigurationCreate,
  FeeConfigurationFilter,
  FeeConfigurationUpdate,
  FinClassroomApplicableConfigParams,
} from "@/packages/@core/data-access/schema-validations";
import type { FeeConfigurationDTO } from "@/packages/@core/data-access/db";
import type { TQueryUpdate } from "../type";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

/**
 * Factory for React Query keys related to fee configurations.
 */
export const feeConfigurationKeys = {
  all: ["fin", "fee-configurations"] as const,
  lists: (params?: FeeConfigurationFilter) =>
    [...feeConfigurationKeys.all, "list", { params }] as const,
  applicable: (params?: FeeApplicableConfiguration) =>
    [...feeConfigurationKeys.all, "applicable", { params }] as const,
  applicableClassroom: (params: FinClassroomApplicableConfigParams) =>
    [...feeConfigurationKeys.all, "applicable-classroom", { params }] as const,
  options: (params?: FeeConfigurationFilter) =>
    [...feeConfigurationKeys.all, "options", { params }] as const,
  details: () => [...feeConfigurationKeys.all, "detail"] as const,
  detail: (id: string) => [...feeConfigurationKeys.details(), id] as const,
  mutations: {
    create: () => [...feeConfigurationKeys.all, "create"] as const,
    update: () => [...feeConfigurationKeys.all, "update"] as const,
    delete: () => [...feeConfigurationKeys.all, "delete"] as const,
  },
} as const;

/* =========================================================================
   QUERIES (SUSPENSE)
   ========================================================================= */

/**
 * Suspense query hook to fetch filtered fee configurations.
 * @param params - Optional query filters.
 * @param options - Additional suspense query configuration options.
 * @returns Suspense query result with list of fee configuration DTOs.
 */
export function useGetFeeConfigurations(
  params?: FeeConfigurationFilter,
  options?: Partial<UseSuspenseQueryOptions<FeeConfigurationDTO[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeConfigurationKeys.lists(params),
    queryFn: () => feeConfigApi.fetchFeeConfigurations(params),
    ...options,
  });
}

/**
 * Suspense query hook to fetch applicable fee configurations for global context.
 * @param params - Optional applicable lookup parameters.
 * @param options - Additional suspense query configuration options.
 * @returns Suspense query result with applicable fee configurations.
 */
export function useGetFeeApplicableConfigurations(
  params?: FeeApplicableConfiguration,
  options?: Partial<UseSuspenseQueryOptions<FeeApplicableConfiguration[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeConfigurationKeys.applicable(params),
    queryFn: () => feeConfigApi.fetchFeeApplicableConfigurations(params),
    ...options,
  });
}

/**
 * Suspense query hook to fetch applicable fee configurations for a specific classroom.
 * @param params - Classroom contextual lookup parameters.
 * @param options - Additional suspense query configuration options.
 * @returns Suspense query result with classroom applicable fee configurations.
 */
export function useGetClassroomFeeConfigApplicable(
  params: FinClassroomApplicableConfigParams,
  options?: Partial<UseSuspenseQueryOptions<FeeApplicableConfiguration[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeConfigurationKeys.applicableClassroom(params),
    queryFn: () => feeConfigApi.fetchClassroomFeeConfigApplicable(params),
    ...options,
  });
}

/**
 * Suspense query hook to fetch fee configurations formatted as UI select options.
 * @param params - Optional query filters.
 * @param options - Additional suspense query configuration options.
 * @returns Suspense query result with select options merged with DTOs.
 */
export function useGetFeeConfigurationAsOptions(
  params?: FeeConfigurationFilter,
  options?: Partial<
    UseSuspenseQueryOptions<(SelectOption & FeeConfigurationDTO)[]>
  >,
) {
  return useSuspenseQuery({
    queryKey: feeConfigurationKeys.options(params),
    queryFn: () => feeConfigApi.fetchFeeConfigurationsAsOptions(params),
    ...options,
  });
}

/**
 * Suspense query hook to fetch a single fee configuration by identifier.
 * @param feeConfigId - Unique identifier of the fee configuration.
 * @param options - Additional suspense query configuration options.
 * @returns Suspense query result with target fee configuration DTO.
 */
export function useGetFeeConfigurationById(
  feeConfigId: string,
  options?: Partial<UseSuspenseQueryOptions<FeeConfigurationDTO>>,
) {
  return useSuspenseQuery({
    queryKey: feeConfigurationKeys.detail(feeConfigId),
    queryFn: () => feeConfigApi.fetchFeeConfigurationById(feeConfigId),
    ...options,
  });
}

/* =========================================================================
   MUTATIONS
   ========================================================================= */

/**
 * Mutation hook to create a new fee configuration.
 * @param options - Additional mutation configuration options.
 * @returns Mutation object for creating fee configurations.
 */
export function useCreateFeeConfiguration(
  options?: Partial<
    UseMutationOptions<FeeConfigurationDTO, Error, FeeConfigurationCreate>
  >,
) {
  return useMutation({
    mutationKey: feeConfigurationKeys.mutations.create(),
    mutationFn: (data) => feeConfigApi.createFeeConfiguration(data),
    ...options,
  });
}

/**
 * Mutation hook to update an existing fee configuration by identifier.
 * @param options - Additional mutation configuration options.
 * @returns Mutation object for updating fee configurations.
 */
export function useUpdateFeeConfiguration(
  options?: Partial<
    UseMutationOptions<
      FeeConfigurationDTO,
      Error,
      TQueryUpdate<FeeConfigurationUpdate>
    >
  >,
) {
  return useMutation({
    mutationKey: feeConfigurationKeys.mutations.update(),
    mutationFn: ({ data, id }) => feeConfigApi.updateFeeConfiguration(id, data),
    ...options,
  });
}

/**
 * Mutation hook to delete a fee configuration by identifier.
 * @param options - Additional mutation configuration options.
 * @returns Mutation object for deleting fee configurations.
 */
export function useDeleteFeeConfiguration(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: feeConfigurationKeys.mutations.delete(),
    mutationFn: (feeConfigId: string) =>
      feeConfigApi.deleteFeeConfiguration(feeConfigId),
    ...options,
  });
}
