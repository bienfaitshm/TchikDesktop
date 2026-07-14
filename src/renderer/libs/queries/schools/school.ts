import {
  queryOptions,
  keepPreviousData,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { school as schoolApi } from "@/renderer/libs/apis";
import type {
  SchoolCreate,
  SchoolUpdate,
  SchoolFilter,
} from "@/packages/@core/data-access/schema-validations";
import type { School } from "@/packages/@core/data-access/db/schemas";
import {
  useMutation,
  useSuspenseQuery,
  type QueryUpdatePayload,
} from "../base";
import { queryClient } from "../providers";

/**
 * 1. Query Key Factory
 */
export const schoolKeys = {
  all: ["schools"] as readonly unknown[],
  lists: (params?: SchoolFilter) =>
    params
      ? ([...schoolKeys.all, "list", params] as readonly unknown[])
      : ([...schoolKeys.all, "list"] as readonly unknown[]),
  details: () => [...schoolKeys.all, "detail"] as readonly unknown[],
  detail: (id: string) => [...schoolKeys.details(), id] as readonly unknown[],
  mutations: {
    create: () => [...schoolKeys.all, "create"] as readonly unknown[],
    update: () => [...schoolKeys.all, "update"] as readonly unknown[],
    delete: () => [...schoolKeys.all, "delete"] as readonly unknown[],
  },
} as const;

/**
 * 2. Query Options Configurations
 */
export const schoolQueries = {
  list: (params?: SchoolFilter) =>
    queryOptions({
      queryKey: schoolKeys.lists(params),
      queryFn: () => schoolApi.fetchSchools(params),
    }),

  detail: (schoolId: string) =>
    queryOptions({
      queryKey: schoolKeys.detail(schoolId),
      queryFn: () => schoolApi.fetchSchoolById(schoolId),
    }),
};

/**
 * 3. Loader pour React Router
 */
export function loadSchools(params?: SchoolFilter) {
  return queryClient.ensureQueryData(schoolQueries.list(params));
}

export function loadSchool(schoolId: string) {
  return queryClient.ensureQueryData(schoolQueries.detail(schoolId));
}

/**
 * 4. Hooks de Lecture (Queries)
 */
export function useGetSchools(params?: SchoolFilter) {
  return useSuspenseQuery(schoolQueries.list(params));
}

export function useGetSchoolById(schoolId: string) {
  return useSuspenseQuery(schoolQueries.detail(schoolId));
}

/**
 * 5. Hooks d'Écriture (Mutations)
 */
export function useCreateSchool(
  options?: Partial<UseMutationOptions<School, Error, SchoolCreate>>,
) {
  return useMutation({
    mutationKey: schoolKeys.mutations.create(),
    mutationFn: (data: SchoolCreate) => schoolApi.createSchool(data),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: schoolKeys.lists() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateSchool(
  options?: Partial<
    UseMutationOptions<School, Error, QueryUpdatePayload<SchoolUpdate>>
  >,
) {
  return useMutation({
    mutationKey: schoolKeys.mutations.update(),
    mutationFn: ({ data, id }: QueryUpdatePayload<SchoolUpdate>) =>
      schoolApi.updateSchool(id, data),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: schoolKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: schoolKeys.detail(variables.id),
        }),
      ]);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteSchool(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: schoolKeys.mutations.delete(),
    mutationFn: (schoolId: string) => schoolApi.deleteSchool(schoolId),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: schoolKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
