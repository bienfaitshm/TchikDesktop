import { useMutation, useSuspenseQuery } from "../base";
import { payment as paymentApi } from "@/renderer/libs/apis";
import type {
  ClassroomPaymentFilterParams,
  AssignFeesToStudentPayload,
  ProcessStudentPaymentPayload,
} from "@/packages/@core/apis/clients/finances.payment";
import type {
  StudentPaymentTable,
  TableClassroomPaymentAssignment,
} from "@/packages/@core/data-access/db/queries";
import type { StudentPayment } from "@/packages/@core/data-access/db/schemas";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import React from "react";
import type { ProgressPayload } from "@/packages/electron-ipc-rest/ipc.client";

import { Ticket } from "@/packages/@core/data-access/schema-validations/other";

/**
 * Query key factory for payment operations cache management.
 */
export const paymentKeys = {
  all: ["payments"] as const,
  classroomTables: () => [...paymentKeys.all, "classroom-table"] as const,
  classroomTable: (params: ClassroomPaymentFilterParams) =>
    [...paymentKeys.classroomTables(), { params }] as const,
  studentOverviews: () => [...paymentKeys.all, "student-overview"] as const,
  studentOverview: (enrollmentId: string) =>
    [...paymentKeys.studentOverviews(), enrollmentId] as const,
  mutations: {
    assignFees: () => [...paymentKeys.all, "assign-fees"] as const,
    processPayment: () => [...paymentKeys.all, "process-payment"] as const,
    printTicket: () => [...paymentKeys.all, "print-ticket"] as const,
  },
} as const;

/**
 * Suspense query hook to fetch the complete classroom assignment and payment matrix table.
 * @param params - Filter parameters containing school, year, and class identifiers.
 * @param options - Additional options for the suspense query.
 * @returns Suspense query result containing the classroom payment assignment table.
 */
export function useGetClassroomAssignmentTable(
  params: ClassroomPaymentFilterParams,
  options?: Partial<UseSuspenseQueryOptions<TableClassroomPaymentAssignment[]>>,
) {
  return useSuspenseQuery({
    queryKey: paymentKeys.classroomTable(params),
    queryFn: () => paymentApi.fetchClassroomAssignmentTable(params),
    ...options,
  });
}

/**
 * Suspense query hook to retrieve detailed payment overview for a specific student.
 * @param enrollmentId - Unique identifier for the student enrollment.
 * @param options - Additional options for the suspense query.
 * @returns Suspense query result containing the student payment table.
 */
export function useGetStudentPaymentOverview(
  enrollmentId: string,
  options?: Partial<UseSuspenseQueryOptions<StudentPaymentTable>>,
) {
  return useSuspenseQuery({
    queryKey: paymentKeys.studentOverview(enrollmentId),
    queryFn: () => paymentApi.getStudentPaymentOverview(enrollmentId),
    ...options,
  });
}

/**
 * Mutation hook to assign initial fee structures to a student upon active enrollment.
 * @param options - Mutation options for callback and execution handling.
 * @returns Mutation controls for assigning student fees.
 */
export function useAssignFeesToStudent(
  options?: Partial<
    UseMutationOptions<void, Error, AssignFeesToStudentPayload>
  >,
) {
  return useMutation({
    mutationKey: paymentKeys.mutations.assignFees(),
    mutationFn: (data) => paymentApi.assignFeesToStudent(data),
    ...options,
  });
}

/**
 * Central mutation hook to process counter student payment transactions.
 * @param options - Mutation options for callback and execution handling.
 * @returns Mutation controls for processing student payments.
 */
export function useProcessStudentPayment(
  options?: Partial<
    UseMutationOptions<StudentPayment, Error, ProcessStudentPaymentPayload>
  >,
) {
  return useMutation({
    mutationKey: paymentKeys.mutations.processPayment(),
    mutationFn: (data) => paymentApi.processStudentPayment(data),
    ...options,
  });
}

/**
 * Hook to subscribe to real-time classroom synchronization progress updates.
 * @returns Object containing current progress state and a reset callback.
 */
export function useOnClassroomSyncProgress() {
  const [progress, setProgress] = React.useState<ProgressPayload | null>(null);

  React.useEffect(() => {
    const unsubscribe = paymentApi.onClassroomSyncProgress((data) => {
      setProgress(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const resetProgress = React.useCallback(() => {
    setProgress(null);
  }, []);

  return { progress, resetProgress };
}

export function usePrintTicket(
  options?: Partial<UseMutationOptions<Ticket, Error, Ticket>>,
) {
  return useMutation({
    mutationKey: paymentKeys.mutations.printTicket(),
    mutationFn: (data) => paymentApi.printTicket(data),
    ...options,
  });
}
