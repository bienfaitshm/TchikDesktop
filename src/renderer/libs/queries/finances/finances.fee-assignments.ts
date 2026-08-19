import { useMutation, useSuspenseQuery } from "../base";
import { feeAssignment as feeAssignmentApi } from "@/renderer/libs/apis";
import type {
  FeeAssignment,
  FeeAssignmentCreate,
  FeeAssignmentFilter,
  FeeAssignmentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { TQueryUpdate } from "../type";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

type FeeBulkAssignmentData = any;
export const feeAssignmentKeys = {
  all: ["fin", "fee-assignments"] as const,
  lists: (params?: FeeAssignmentFilter) =>
    [...feeAssignmentKeys.all, "list", { params }] as const,
  options: (params?: FeeAssignmentFilter) =>
    [...feeAssignmentKeys.all, "options", { params }] as const,
  details: () => [...feeAssignmentKeys.all, "detail"] as const,
  detail: (id: string) => [...feeAssignmentKeys.details(), id] as const,
  mutations: {
    create: () => [...feeAssignmentKeys.all, "create"] as const,
    bulkCreate: () => [...feeAssignmentKeys.all, "bulk-create"] as const, // <-- NOUVELLE CLÉ COMPTABLE
    update: () => [...feeAssignmentKeys.all, "update"] as const,
    delete: () => [...feeAssignmentKeys.all, "delete"] as const,
  },
} as const;

/* =========================================================================
   QUERIES (SUSPENSE)
   ========================================================================= */

export function useGetFeeAssignments(
  params?: FeeAssignmentFilter,
  options?: Partial<UseSuspenseQueryOptions<FeeAssignment[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeAssignmentKeys.lists(params),
    queryFn: () => feeAssignmentApi.fetchFeeAssignments(params),
    ...options,
  });
}

export function useGetFeeAssignmentAsOptions(
  params?: FeeAssignmentFilter,
  options?: Partial<UseSuspenseQueryOptions<(SelectOption & FeeAssignment)[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeAssignmentKeys.options(params),
    queryFn: () => feeAssignmentApi.fetchFeeAssignmentsAsOptions(params),
    ...options,
  });
}

export function useGetFeeAssignmentById(
  assignmentId: string,
  options?: Partial<UseSuspenseQueryOptions<FeeAssignment>>,
) {
  return useSuspenseQuery({
    queryKey: feeAssignmentKeys.detail(assignmentId),
    queryFn: () => feeAssignmentApi.fetchFeeAssignmentById(assignmentId),
    ...options,
  });
}

/* =========================================================================
   MUTATIONS
   ========================================================================= */

export function useCreateFeeAssignment(
  options?: Partial<
    UseMutationOptions<FeeAssignment, Error, FeeAssignmentCreate>
  >,
) {
  return useMutation({
    mutationKey: feeAssignmentKeys.mutations.create(),
    mutationFn: (data) => feeAssignmentApi.createFeeAssignment(data),
    ...options,
  });
}

/**
 * Assigne collectivement des lignes de frais à un lot ciblé d'élèves
 */
export function useBulkCreateFeeAssignment(
  options?: Partial<UseMutationOptions<void, Error, FeeBulkAssignmentData>>,
) {
  return useMutation({
    mutationKey: feeAssignmentKeys.mutations.bulkCreate(),
    mutationFn: (data) => feeAssignmentApi.bulkCreateFeeAssignment(data),
    ...options,
  });
}

export function useUpdateFeeAssignment(
  options?: Partial<
    UseMutationOptions<FeeAssignment, Error, TQueryUpdate<FeeAssignmentUpdate>>
  >,
) {
  return useMutation({
    mutationKey: feeAssignmentKeys.mutations.update(),
    mutationFn: ({ data, id }) =>
      feeAssignmentApi.updateFeeAssignment(id, data),
    ...options,
  });
}

export function useDeleteFeeAssignment(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: feeAssignmentKeys.mutations.delete(),
    mutationFn: (assignmentId: string) =>
      feeAssignmentApi.deleteFeeAssignment(assignmentId),
    ...options,
  });
}
