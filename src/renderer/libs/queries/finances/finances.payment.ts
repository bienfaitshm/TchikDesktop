import { useMutation, useSuspenseQuery } from "../base";
import { payment as paymentApi } from "@/renderer/libs/apis";
import type {
  ClassroomPaymentFilterParams,
  AssignFeesToStudentPayload,
  ProcessStudentPaymentPayload,
} from "@/packages/@core/apis/clients/finances.payment";
import type { TableClassroomPaymentAssignment } from "@/packages/@core/data-access/db/queries";
import type { StudentPayment } from "@/packages/@core/data-access/db/schemas";
import type {
  UseMutationOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import React from "react";
import type { ProgressPayload } from "@/packages/electron-ipc-rest/ipc.client";

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

export function useOnClassroomSyncProgress() {
  const [progress, setProgress] = React.useState<ProgressPayload | null>(null);

  React.useEffect(() => {
    // 1. Abonnement
    const unsubscribe = paymentApi.onClassroomSyncProgress((data) => {
      setProgress(data);
    });

    // 2. Nettoyage lors du démontage du composant
    return () => {
      unsubscribe();
    };
  }, []);

  // Permet à l'UI de remettre la progression à null (ex: fermer le modal ou la notification)
  const resetProgress = React.useCallback(() => {
    setProgress(null);
  }, []);

  return { progress, resetProgress };
}
