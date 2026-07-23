import { useMutation, useSuspenseQuery } from "../base";
import { feeType as feeTypeApi } from "@/renderer/libs/apis";
import type {
  FeeTypeCreate,
  FeeTypeBulkCreate,
  FeeTypeFilter,
  FeeTypeUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { TQueryUpdate } from "../type";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import type { FeeTypeDTO, FeeType } from "@/packages/@core/data-access/db";
import { FeeTypeSearchParams } from "@/packages/@core/apis/clients/finances.fee-types";

export const feeTypeKeys = {
  all: ["fee-types"] as const,
  lists: (params?: FeeTypeFilter) =>
    [...feeTypeKeys.all, "list", { params }] as const,
  options: (params?: FeeTypeSearchParams) =>
    [...feeTypeKeys.all, "options", { params }] as const,
  details: () => [...feeTypeKeys.all, "detail"] as const,
  detail: (id: string) => [...feeTypeKeys.details(), id] as const,
  mutations: {
    create: () => [...feeTypeKeys.all, "create"] as const,
    bulkCreate: () => [...feeTypeKeys.all, "bulkCreate"] as const,

    update: () => [...feeTypeKeys.all, "update"] as const,
    delete: () => [...feeTypeKeys.all, "delete"] as const,
  },
} as const;

export function useGetFeeTypes(
  params?: FeeTypeFilter,
  options?: Partial<UseSuspenseQueryOptions<FeeTypeDTO[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeTypeKeys.lists(params),
    queryFn: () => feeTypeApi.fetchFeeTypes(params),
    ...options,
  });
}

export function useGetFeeTypeAsOptions(
  params?: FeeTypeSearchParams,
  options?: Partial<UseSuspenseQueryOptions<(SelectOption & FeeTypeDTO)[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeTypeKeys.options(params),
    queryFn: () => feeTypeApi.fetchFeeTypesAsOptions(params),
    ...options,
  });
}

export function useGetFeeTypeById(
  feeTypeId: string,
  options?: Partial<UseSuspenseQueryOptions<FeeTypeDTO>>,
) {
  return useSuspenseQuery({
    queryKey: feeTypeKeys.detail(feeTypeId),
    queryFn: () => feeTypeApi.fetchFeeTypeById(feeTypeId),
    ...options,
  });
}

export function useCreateFeeType(
  options?: Partial<UseMutationOptions<FeeType, Error, FeeTypeCreate>>,
) {
  return useMutation({
    mutationKey: feeTypeKeys.mutations.create(),
    mutationFn: (data) => feeTypeApi.createFeeType(data),
    ...options,
  });
}

export function useBulkCreateFeeType(
  options?: Partial<UseMutationOptions<FeeType[], any, FeeTypeBulkCreate>>,
) {
  return useMutation({
    mutationKey: feeTypeKeys.mutations.bulkCreate(),
    mutationFn: (data) => feeTypeApi.bulkCreateFeeType(data),
    ...options,
  });
}

export function useUpdateFeeType(
  options?: Partial<
    UseMutationOptions<FeeType, Error, TQueryUpdate<FeeTypeUpdate>>
  >,
) {
  return useMutation({
    mutationKey: feeTypeKeys.mutations.update(),
    mutationFn: ({ data, id }) => feeTypeApi.updateFeeType(id, data),
    ...options,
  });
}

export function useDeleteFeeType(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: feeTypeKeys.mutations.delete(),
    mutationFn: (feeTypeId: string) => feeTypeApi.deleteFeeType(feeTypeId),
    ...options,
  });
}
