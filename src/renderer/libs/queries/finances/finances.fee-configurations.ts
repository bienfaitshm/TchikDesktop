import { useMutation, useSuspenseQuery } from "../base";
import { feeConfiguration as feeConfigApi } from "@/renderer/libs/apis";
import type {
  FeeConfigurationCreate,
  FeeConfigurationFilter,
  FeeConfigurationUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type {
  FeeConfigurationDTO,
  FeeApplicableConfiguration,
} from "@/packages/@core/data-access/db";
import type { FeeApplicableConfiguration as ApplicableParams } from "@/packages/@core/apis/servers/handlers/fee-configurations";
import type { TQueryUpdate } from "../type";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export type ApplicableFeeConfigParams = ApplicableParams;

export const feeConfigurationKeys = {
  all: ["fin", "fee-configurations"] as const,
  lists: (params?: FeeConfigurationFilter) =>
    [...feeConfigurationKeys.all, "list", { params }] as const,
  applicable: (params?: ApplicableParams) =>
    [...feeConfigurationKeys.all, "applicable", { params }] as const,
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

export function useGetFeeApplicableConfigurations(
  params?: ApplicableParams,
  options?: Partial<UseSuspenseQueryOptions<FeeApplicableConfiguration[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeConfigurationKeys.applicable(params),
    queryFn: () => feeConfigApi.fetchFeeApplicableConfigurations(params),
    ...options,
  });
}

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
