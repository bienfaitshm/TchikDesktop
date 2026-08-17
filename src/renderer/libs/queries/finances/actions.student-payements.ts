import { useCallback } from "react";
import type {
  StudentPayment,
  StudentPaymentCreate,
  StudentPaymentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase, useFormBaseNotify } from "../base";
import {
  useCreateStudentPayment,
  useUpdateStudentPayment,
  useDeleteStudentPayment,
} from "./finances";

const CREATE_STUDENT_PAYMENT_NOTIFICATIONS = {
  success: {
    title: "Paiement enregistré",
    description: "Le paiement a été pris en compte.",
  },
  error: { title: "Erreur lors de l'enregistrement du paiement." },
};

const UPDATE_STUDENT_PAYMENT_NOTIFICATIONS = {
  success: {
    title: "Paiement modifié",
    description: "Les détails du paiement ont été mis à jour.",
  },
  error: { title: "Échec de la modification du paiement." },
};

/**
 * Builds deletion notifications for student payments.
 * @param studentName - Optional student name to include in the toast message.
 * @returns Notification object for student payment deletion.
 */
const getDeleteStudentPaymentNotifications = (studentName?: string) => ({
  success: {
    title: "Paiement supprimé",
    description: studentName
      ? `Le paiement de ${studentName} a été annulé.`
      : "Le paiement a été supprimé.",
  },
});

/**
 * Form hook for recording a new student payment.
 * @param config - Optional base mutation configuration settings.
 * @returns Form state and handlers bound to the creation mutation.
 */
export function useCreateStudentPaymentForm(
  config?: BaseMutationConfig<StudentPayment>,
) {
  const mutation = useCreateStudentPayment();

  const adaptData = useCallback((data: StudentPaymentCreate) => data, []);

  return useFormBaseNotify<
    StudentPaymentCreate,
    StudentPaymentCreate,
    StudentPayment
  >({
    mutation,
    config,
    getNotifications: () => CREATE_STUDENT_PAYMENT_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Form hook for updating an existing student payment.
 * @param config - Optional base mutation configuration settings.
 * @returns Form state and handlers bound to the update mutation.
 */
export function useUpdateStudentPaymentForm(
  config?: BaseMutationConfig<StudentPaymentUpdate>,
) {
  const mutation = useUpdateStudentPayment();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<StudentPaymentUpdate>) => ({ data, id }),
    [],
  );

  return useFormBaseNotify<
    QueryUpdatePayload<StudentPaymentUpdate>,
    { data: StudentPaymentUpdate; id: string },
    StudentPaymentUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_STUDENT_PAYMENT_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Hook for executing student payment deletion operations.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing deletion callback and pending state.
 */
export function useDeleteStudentPaymentForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteStudentPayment();

  const deleteStudentPayment = useCallback(
    (paymentId: string, studentName?: string) => {
      mutation.mutate(
        paymentId,
        withNotifications({
          notifications: getDeleteStudentPaymentNotifications(studentName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteStudentPayment,
    onDelete: deleteStudentPayment,
    isDeleting: mutation.isPending,
  };
}
