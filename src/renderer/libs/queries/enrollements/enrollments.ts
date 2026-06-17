import { useMutation, useSuspenseQuery } from "../base/query";
import {
  type Enrollment,
  type EnrollmentCreate,
  type EnrollmentQuickCreate,
  type EnrollmentUpdate,
  type EnrollmentFilter,
} from "@/packages/@core/data-access/schema-validations";
import { enrollment as enrollmentApi } from "@/renderer/libs/apis";
import type { QueryUpdatePayload } from "../base";
import type {
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

/**
 * 1. Query Key Factory
 * Centralise et structure toutes les clés de cache pour TanStack Query.
 */
export const enrollmentKeys = {
  all: ["enrollments"] as const,
  lists: (params?: EnrollmentFilter) =>
    [...enrollmentKeys.all, "list", { params }] as const,
  details: () => [...enrollmentKeys.all, "detail"] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
  mutations: {
    create: () => [...enrollmentKeys.all, "create"] as const,
    quickCreate: () => [...enrollmentKeys.all, "quick-create"] as const,
    update: () => [...enrollmentKeys.all, "update"] as const,
    delete: () => [...enrollmentKeys.all, "delete"] as const,
  },
} as const;

/**
 * 2. Hooks de Lecture (Queries)
 */

export function useGetEnrollments(
  params?: EnrollmentFilter,
  options?: Partial<UseSuspenseQueryOptions<Enrollment[]>>,
) {
  return useSuspenseQuery({
    queryKey: enrollmentKeys.lists(params),
    queryFn: () => enrollmentApi.fetchEnrollments(params),
    ...options,
  });
}

export function useGetEnrollmentById(
  enrollmentId: string,
  options?: Partial<UseSuspenseQueryOptions<Enrollment>>,
) {
  return useSuspenseQuery({
    queryKey: enrollmentKeys.detail(enrollmentId),
    queryFn: () => enrollmentApi.fetchEnrollmentById(enrollmentId),
    ...options,
  });
}

/**
 * 3. Hooks d'Écriture (Mutations)
 */

export function useCreateEnrollment(
  options?: Partial<UseMutationOptions<Enrollment, Error, EnrollmentCreate>>,
) {
  return useMutation({
    mutationKey: enrollmentKeys.mutations.create(),
    mutationFn: (data: EnrollmentCreate) =>
      enrollmentApi.createEnrollment(data),
    ...options,
  });
}

export function useCreateQuickEnrollment(
  options?: Partial<
    UseMutationOptions<Enrollment, Error, EnrollmentQuickCreate>
  >,
) {
  return useMutation({
    mutationKey: enrollmentKeys.mutations.quickCreate(),
    mutationFn: (data: EnrollmentQuickCreate) =>
      enrollmentApi.createQuickEnrollment(data),
    ...options,
  });
}

export function useUpdateEnrollment(
  options?: Partial<
    UseMutationOptions<Enrollment, Error, QueryUpdatePayload<EnrollmentUpdate>>
  >,
) {
  return useMutation({
    mutationKey: enrollmentKeys.mutations.update(),
    mutationFn: ({ data, id }: QueryUpdatePayload<EnrollmentUpdate>) =>
      enrollmentApi.updateEnrollment(id, data),
    ...options,
  });
}

export function useDeleteEnrollment(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: enrollmentKeys.mutations.delete(),
    mutationFn: (id: string) => enrollmentApi.deleteEnrollment(id),
    ...options,
  });
}
