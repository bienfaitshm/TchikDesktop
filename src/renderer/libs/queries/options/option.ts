import {
  useQuery,
  queryOptions,
  keepPreviousData,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { option as optionApi } from "@/renderer/libs/apis";
import type {
  Option,
  OptionFilter,
  OptionUpdate,
  OptionCreate,
} from "@/packages/@core/data-access/schema-validations";
import {
  useMutation,
  useSuspenseQuery,
  type QueryUpdatePayload,
} from "../base";
import { queryClient } from "../providers";

/**
 * 1. Query Key Factory
 */
export const optionKeys = {
  all: ["schools", "options"] as readonly unknown[],
  lists: (params?: OptionFilter) =>
    params
      ? ([...optionKeys.all, "list", params] as readonly unknown[])
      : ([...optionKeys.all, "list"] as readonly unknown[]),
  options: (params?: OptionFilter) =>
    params
      ? ([...optionKeys.all, "options", params] as readonly unknown[])
      : ([...optionKeys.all, "options"] as readonly unknown[]),
  details: () => [...optionKeys.all, "detail"] as readonly unknown[],
  detail: (id: string) => [...optionKeys.details(), id] as readonly unknown[],
  mutations: {
    create: () => [...optionKeys.all, "create"] as readonly unknown[],
    update: () => [...optionKeys.all, "update"] as readonly unknown[],
    delete: () => [...optionKeys.all, "delete"] as readonly unknown[],
  },
} as const;

/**
 * 2. Query Options Configurations
 */
export const optionQueries = {
  list: (params?: OptionFilter) =>
    queryOptions({
      queryKey: optionKeys.lists(params),
      queryFn: () => optionApi.fetchOptions(params),
    }),

  detail: (optionId: string) =>
    queryOptions({
      queryKey: optionKeys.detail(optionId),
      queryFn: () => optionApi.fetchOptionById(optionId),
    }),
};

/**
 * 3. Loader pour React Router
 */
export function loadOptions(params?: OptionFilter) {
  return queryClient.ensureQueryData(optionQueries.list(params));
}

export function loadOption(optionId: string) {
  return queryClient.ensureQueryData(optionQueries.detail(optionId));
}
/**
 * 4. Hooks de Lecture (Queries)
 */
export function useGetOptions(params?: OptionFilter) {
  return useSuspenseQuery(optionQueries.list(params));
}

export function useGetOptionById(optionId: string) {
  return useSuspenseQuery(optionQueries.detail(optionId));
}

export function useGetOptionsAsOptions(
  params?: OptionFilter,
  // options?: Partial<UseQueryOptions<(SelectOption & Option)[]>>,
) {
  return useQuery({
    queryKey: optionKeys.options(params),
    queryFn: () => optionApi.fetchAsOptions(params),
    placeholderData: keepPreviousData,
    // ...options,
  });
}

/**
 * 5. Hooks d'Écriture (Mutations)
 */
export function useCreateOption(
  options?: Partial<UseMutationOptions<Option, Error, OptionCreate>>,
) {
  return useMutation({
    mutationKey: optionKeys.mutations.create(),
    mutationFn: (data: OptionCreate) => optionApi.createOption(data),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.lists() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
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
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: optionKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: optionKeys.detail(variables.id),
        }),
      ]);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteOption(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: optionKeys.mutations.delete(),
    mutationFn: (optionId: string) => optionApi.deleteOption(optionId),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
