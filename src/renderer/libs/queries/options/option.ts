import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { option as optionApi } from "@/renderer/libs/apis";
import type {
  Option,
  OptionFilter,
  OptionUpdate,
  OptionCreate,
} from "@/packages/@core/data-access/schema-validations";
import type { SearchOptionQueryParams } from "@/packages/@core/apis/clients";
import {
  useMutation,
  useSuspenseQuery,
  type QueryUpdatePayload,
} from "../base";
import type {
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { SelectOption } from "@/packages/@core/data-access/db/queries";

/**
 * 1. Query Key Factory (Strictement immuable et centralisée)
 */
export const optionKeys = {
  all: ["options"] as const,
  lists: (params?: OptionFilter) =>
    [...optionKeys.all, "list", { params }] as const,
  options: (params?: SearchOptionQueryParams) =>
    [...optionKeys.all, "options", { params }] as const,
  details: () => [...optionKeys.all, "detail"] as const,
  detail: (id: string) => [...optionKeys.details(), id] as const,
  mutations: {
    create: () => [...optionKeys.all, "create"] as const,
    update: () => [...optionKeys.all, "update"] as const,
    delete: () => [...optionKeys.all, "delete"] as const,
  },
} as const;

/**
 * 2. Hooks de Lecture (Queries)
 */

export function useGetOptions(
  params?: OptionFilter,
  options?: Partial<UseSuspenseQueryOptions<Option[]>>,
) {
  return useSuspenseQuery({
    queryKey: optionKeys.lists(params),
    queryFn: () => optionApi.fetchOptions(params),
    ...options,
  });
}

export function useGetOptionsAsOptions(
  params?: SearchOptionQueryParams,
  options?: Partial<UseQueryOptions<(SelectOption & Option)[]>>,
) {
  return useQuery({
    queryKey: optionKeys.options(params),
    queryFn: () => optionApi.fetchAsOptions(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useGetOptionById(
  optionId: string,
  options?: Partial<UseSuspenseQueryOptions<Option>>,
) {
  return useSuspenseQuery({
    queryKey: optionKeys.detail(optionId),
    queryFn: () => optionApi.fetchOptionById(optionId),
    ...options,
  });
}

/**
 * 3. Hooks d'Écriture (Mutations)
 */

export function useCreateOption(
  options?: Partial<UseMutationOptions<Option, Error, OptionCreate>>,
) {
  return useMutation({
    mutationKey: optionKeys.mutations.create(),
    mutationFn: (data: OptionCreate) => optionApi.createOption(data),
    ...options,
  });
}

export function useUpdateOption(
  options?: Partial<
    UseMutationOptions<Option, Error, QueryUpdatePayload<OptionUpdate>>
  >,
) {
  return useMutation({
    mutationKey: optionKeys.mutations.update(),
    mutationFn: ({ data, id }: QueryUpdatePayload<OptionUpdate>) =>
      optionApi.updateOption(id, data),
    ...options,
  });
}

export function useDeleteOption(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: optionKeys.mutations.delete(),
    mutationFn: (optionId: string) => optionApi.deleteOption(optionId),
    ...options,
  });
}
