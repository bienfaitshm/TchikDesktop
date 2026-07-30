import { queryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { school as schoolApi } from "@/renderer/libs/apis";
import type {
  StudyYearCreate,
  StudyYearUpdate,
  StudyYearFilter,
} from "@/packages/@core/data-access/schema-validations";
import {
  useMutation,
  useSuspenseQuery,
  type QueryUpdatePayload,
} from "../base";
import { queryClient } from "../providers";
import type { StudyYear } from "@/packages/@core/data-access/db";

/**
 * 1. Query Key Factory
 */
export const studyYearKeys = {
  all: ["studyYears"] as readonly unknown[],
  lists: (params?: StudyYearFilter) =>
    params
      ? ([...studyYearKeys.all, "list", params] as readonly unknown[])
      : ([...studyYearKeys.all, "list"] as readonly unknown[]),
  details: () => [...studyYearKeys.all, "detail"] as readonly unknown[],
  detail: (id: string) =>
    [...studyYearKeys.details(), id] as readonly unknown[],
  mutations: {
    create: () => [...studyYearKeys.all, "create"] as readonly unknown[],
    update: () => [...studyYearKeys.all, "update"] as readonly unknown[],
    delete: () => [...studyYearKeys.all, "delete"] as readonly unknown[],
  },
} as const;

/**
 * 2. Query Options Configurations
 */
export const studyYearQueries = {
  list: (params?: StudyYearFilter) =>
    queryOptions({
      queryKey: studyYearKeys.lists(params),
      queryFn: () => schoolApi.fetchStudyYears(params),
    }),

  detail: (yearId: string) =>
    queryOptions({
      queryKey: studyYearKeys.detail(yearId),
      queryFn: () => schoolApi.fetchStudyYearById(yearId),
    }),
};

/**
 * 3. Loader pour React Router
 */
export function loadStudyYears(params?: StudyYearFilter) {
  return queryClient.ensureQueryData(studyYearQueries.list(params));
}

export function loadStudyYear(yearId: string) {
  return queryClient.ensureQueryData(studyYearQueries.detail(yearId));
}

/**
 * 4. Hooks de Lecture (Queries)
 */
export function useGetStudyYears(params?: StudyYearFilter) {
  return useSuspenseQuery(studyYearQueries.list(params));
}

export function useGetStudyYearById(yearId: string) {
  return useSuspenseQuery(studyYearQueries.detail(yearId));
}

/**
 * 5. Hooks d'Écriture (Mutations)
 */
export function useCreateStudyYear(
  options?: Partial<UseMutationOptions<StudyYear, Error, StudyYearCreate>>,
) {
  return useMutation({
    mutationKey: studyYearKeys.mutations.create(),
    mutationFn: (data: StudyYearCreate) => schoolApi.createStudyYear(data),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: studyYearKeys.lists() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateStudyYear(
  options?: Partial<
    UseMutationOptions<StudyYear, Error, QueryUpdatePayload<StudyYearUpdate>>
  >,
) {
  return useMutation({
    mutationKey: studyYearKeys.mutations.update(),
    mutationFn: ({ data, id }: QueryUpdatePayload<StudyYearUpdate>) =>
      schoolApi.updateStudyYear(id, data),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studyYearKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: studyYearKeys.detail(variables.id),
        }),
      ]);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteStudyYear(
  options?: Partial<UseMutationOptions<boolean, Error, string>>,
) {
  return useMutation({
    mutationKey: studyYearKeys.mutations.delete(),
    mutationFn: (id: string) => schoolApi.deleteStudyYear(id),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: studyYearKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
