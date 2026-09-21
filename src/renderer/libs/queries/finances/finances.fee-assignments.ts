import { useMutation, useSuspenseQuery } from "../base";
import { feeAssignment as feeAssignmentApi } from "@/renderer/libs/apis";
import type {
  FeeAssignmentCreate,
  FeeAssignmentFilter,
  FeeAssignmentUpdate,
  FeeBulkAssignmentData,
  UpdateAmountByAssignments,
  UpdateAmountByClassrooms,
  ExemptFromFee,
  MarkAsPaid,
} from "@/packages/@core/data-access/schema-validations";
import type { TQueryUpdate } from "../type";
import type { SelectOption } from "@/packages/@core/data-access/db/queries";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import type {
  FeeAssignment,
  FeeAssignmentDTO,
} from "@/packages/@core/data-access/db";
import { queryClient } from "../providers";

/**
 * Factory for React Query keys related to fee assignments.
 */
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
    bulkCreate: () => [...feeAssignmentKeys.all, "bulk-create"] as const,
    update: () => [...feeAssignmentKeys.all, "update"] as const,
    updateAmountByAssignments: () =>
      [...feeAssignmentKeys.all, "update-amount-by-assignments"] as const,
    updateAmountByClassrooms: () =>
      [...feeAssignmentKeys.all, "update-amount-by-classrooms"] as const,
    delete: () => [...feeAssignmentKeys.all, "delete"] as const,
  },
} as const;

// toogle actions

export async function markAsPaid(payload: MarkAsPaid) {
  return feeAssignmentApi.markAsPaid(payload);
}

export async function exemptFromFee(payload: ExemptFromFee) {
  return feeAssignmentApi.exemptFromFee(payload);
}

/* =========================================================================
   QUERIES (SUSPENSE)
   ========================================================================= */

/**
 * Suspense query hook to fetch filtered fee assignments.
 * @param params - Optional filters to refine the list result.
 * @param options - Additional suspense query configuration options.
 * @returns Suspense query result containing fee assignment DTOs.
 */
export function useGetFeeAssignments(
  params?: FeeAssignmentFilter,
  options?: Partial<UseSuspenseQueryOptions<FeeAssignmentDTO[]>>,
) {
  return useSuspenseQuery({
    queryKey: feeAssignmentKeys.lists(params),
    queryFn: () => feeAssignmentApi.fetchFeeAssignments(params),
    ...options,
  });
}

/**
 * Suspense query hook to fetch fee assignments formatted as select options.
 * @param params - Optional filters to refine options.
 * @param options - Additional suspense query configuration options.
 * @returns Suspense query result containing select options.
 */
export function useGetFeeAssignmentAsOptions(
  params?: FeeAssignmentFilter,
  options?: Partial<
    UseSuspenseQueryOptions<(SelectOption & FeeAssignmentDTO)[]>
  >,
) {
  return useSuspenseQuery({
    queryKey: feeAssignmentKeys.options(params),
    queryFn: () => feeAssignmentApi.fetchFeeAssignmentsAsOptions(params),
    ...options,
  });
}

/**
 * Suspense query hook to fetch a single fee assignment by identifier.
 * @param assignmentId - The target fee assignment unique ID.
 * @param options - Additional suspense query configuration options.
 * @returns Suspense query result containing the single fee assignment DTO.
 */
export function useGetFeeAssignmentById(
  assignmentId: string,
  options?: Partial<UseSuspenseQueryOptions<FeeAssignmentDTO>>,
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

/**
 * Mutation hook to create a single fee assignment.
 * @param options - Additional mutation configuration options.
 * @returns Mutation object for creating a fee assignment.
 */
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
 * Mutation hook to bulk create fee assignments for multiple targets.
 * @param options - Additional mutation configuration options.
 * @returns Mutation object for bulk creation.
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

/**
 * Mutation hook to update an existing fee assignment by ID.
 * @param options - Additional mutation configuration options.
 * @returns Mutation object for updating a fee assignment.
 */
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

/**
 * Mutation hook to update fee amounts by assignment IDs.
 * @param options - Additional mutation configuration options.
 * @returns Mutation object for updating amounts by assignments.
 */
export function useUpdateAmountByAssignments(
  options?: Partial<
    UseMutationOptions<FeeAssignment[], Error, UpdateAmountByAssignments>
  >,
) {
  return useMutation({
    mutationKey: feeAssignmentKeys.mutations.updateAmountByAssignments(),
    mutationFn: (payload) =>
      feeAssignmentApi.updateAmountByAssignments(payload),
    ...options,
  });
}

/**
 * Mutation hook to update fee amounts by classroom IDs.
 * @param options - Additional mutation configuration options.
 * @returns Mutation object for updating amounts by classrooms.
 */
export function useUpdateAmountByClassrooms(
  options?: Partial<
    UseMutationOptions<FeeAssignment[], Error, UpdateAmountByClassrooms>
  >,
) {
  return useMutation({
    mutationKey: feeAssignmentKeys.mutations.updateAmountByClassrooms(),
    mutationFn: (payload) => feeAssignmentApi.updateAmountByClassroom(payload),
    ...options,
  });
}

/**
 * Mutation hook to delete a fee assignment by identifier.
 * @param options - Additional mutation configuration options.
 * @returns Mutation object for deleting a fee assignment.
 */
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
