import { useMutation, useSuspenseQuery } from "../base";
import { school as schoolApi } from "@/renderer/libs/apis";
import type {
  StudyYear,
  StudyYearCreate,
  StudyYearUpdate,
  StudyYearFilter,
} from "@/packages/@core/data-access/schema-validations";
import type { QueryUpdatePayload } from "../base";
import type {
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

export const studyYearKeys = {
  all: ["studyYears"] as const,
  lists: (params?: StudyYearFilter) =>
    [...studyYearKeys.all, "list", { params }] as const,
  details: () => [...studyYearKeys.all, "detail"] as const,
  detail: (id: string) => [...studyYearKeys.details(), id] as const,
  mutations: {
    create: () => [...studyYearKeys.all, "create"] as const,
    update: () => [...studyYearKeys.all, "update"] as const,
    delete: () => [...studyYearKeys.all, "delete"] as const,
  },
} as const;

export function useGetStudyYears(
  params?: StudyYearFilter,
  options?: Partial<UseSuspenseQueryOptions<StudyYear[]>>,
) {
  return useSuspenseQuery({
    queryKey: studyYearKeys.lists(params),
    queryFn: () => schoolApi.fetchStudyYears(params),
    ...options,
  });
}

export function useGetStudyYearById(
  yearId: string,
  options?: Partial<UseSuspenseQueryOptions<StudyYear>>,
) {
  return useSuspenseQuery({
    queryKey: studyYearKeys.detail(yearId),
    queryFn: () => schoolApi.fetchStudyYearById(yearId),
    ...options,
  });
}

export function useCreateStudyYear(
  options?: Partial<UseMutationOptions<StudyYear, Error, StudyYearCreate>>,
) {
  return useMutation({
    mutationKey: studyYearKeys.mutations.create(),
    mutationFn: (data: StudyYearCreate) => schoolApi.createStudyYear(data),
    ...options,
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
  });
}

export function useDeleteStudyYear(
  options?: Partial<UseMutationOptions<boolean, Error, string>>,
) {
  return useMutation({
    mutationKey: studyYearKeys.mutations.delete(),
    mutationFn: (id: string) => schoolApi.deleteStudyYear(id),
    ...options,
  });
}
