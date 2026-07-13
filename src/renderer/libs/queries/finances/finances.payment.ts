import { useMutation, useSuspenseQuery } from "../base";
import { payment as paymentApi } from "@/renderer/libs/apis";
import type {
  ClassroomPaymentFilterParams,
  AssignFeesToStudentPayload,
  ProcessStudentPaymentPayload,
} from "@/packages/@core/apis/clients/finances.payment";
import type { TableClassroomPaymentAssignment } from "@/packages/@core/data-access/db";
import type { StudentPayment } from "@/packages/@core/data-access/db/schemas";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export const paymentKeys = {
  all: ["payments"] as const,
  classroomTables: () => [...paymentKeys.all, "classroom-table"] as const,
  classroomTable: (params: ClassroomPaymentFilterParams) =>
    [...paymentKeys.classroomTables(), { params }] as const,
  mutations: {
    assignFees: () => [...paymentKeys.all, "assign-fees"] as const,
    processPayment: () => [...paymentKeys.all, "process-payment"] as const,
  },
} as const;

/**
 * Hook pour récupérer la matrice complète des assignations et paiements d'une classe (Suspense-ready)
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
 * Hook mutation pour assigner la structure de frais à un étudiant lors de son inscription active
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
 * Hook mutation central pour encaisser un versement étudiant au guichet
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
