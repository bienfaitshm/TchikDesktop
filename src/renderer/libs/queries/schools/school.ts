import { useMutation, useSuspenseQuery } from "../base";
import { school as schoolApi } from "@/renderer/libs/apis";
import type {
  School,
  SchoolCreate,
  SchoolUpdate,
  SchoolFilter,
} from "@/packages/@core/data-access/schema-validations";
import type { QueryUpdatePayload } from "../base";
import type {
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

/**
 * 1. Query Key Factory
 */
export const schoolKeys = {
  all: ["schools"] as const,
  lists: (params?: SchoolFilter) =>
    [...schoolKeys.all, "list", { params }] as const,
  details: () => [...schoolKeys.all, "detail"] as const,
  detail: (id: string) => [...schoolKeys.details(), id] as const,
  mutations: {
    create: () => [...schoolKeys.all, "create"] as const,
    update: () => [...schoolKeys.all, "update"] as const,
    delete: () => [...schoolKeys.all, "delete"] as const,
  },
} as const;

/**
 * 2. Hooks de Lecture (Queries)
 */

export function useGetSchools(
  params?: SchoolFilter,
  options?: Partial<UseSuspenseQueryOptions<School[]>>,
) {
  return useSuspenseQuery({
    queryKey: schoolKeys.lists(params),
    queryFn: () => schoolApi.fetchSchools(params),
    ...options,
  });
}

export function useGetSchoolById(
  schoolId: string,
  options?: Partial<UseSuspenseQueryOptions<School>>,
) {
  return useSuspenseQuery({
    // Résolution de la clé pour le ciblage par identifiant unique
    queryKey: schoolKeys.detail(schoolId),
    queryFn: () => schoolApi.fetchSchoolById(schoolId),
    ...options,
  });
}

/**
 * 3. Hooks d'Écriture (Mutations)
 */

export function useCreateSchool(
  options?: Partial<UseMutationOptions<School, Error, SchoolCreate>>,
) {
  return useMutation({
    mutationKey: schoolKeys.mutations.create(),
    mutationFn: (data: SchoolCreate) => schoolApi.createSchool(data),
    ...options,
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
  });
}

export function useDeleteSchool(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: schoolKeys.mutations.delete(),
    mutationFn: (schoolId: string) => schoolApi.deleteSchool(schoolId),
    ...options,
  });
}
