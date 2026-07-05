import { useCallback } from "react";
import {
  useCreateStudentPayment,
  useUpdateStudentPayment,
  useDeleteStudentPayment,
} from "./finances";
import { useFormBaseNotify } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  StudentPayment,
  StudentPaymentCreate,
  StudentPaymentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase } from "../base";

export function useCreateStudentPaymentForm(
  config?: BaseMutationConfig<StudentPayment>,
) {
  const mutation = useCreateStudentPayment();
  return useFormBaseNotify<StudentPaymentCreate, StudentPaymentCreate>({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Paiement enregistré",
        description: "Le paiement a été pris en compte.",
      },
      error: { title: "Erreur lors de l'enregistrement du paiement." },
    }),
    adaptData: (data) => data,
  });
}

export function useUpdateStudentPaymentForm(
  config?: BaseMutationConfig<StudentPayment>,
) {
  const mutation = useUpdateStudentPayment();
  return useFormBaseNotify<
    QueryUpdatePayload<StudentPaymentUpdate>,
    { data: StudentPaymentUpdate; id: string }
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Paiement modifié",
        description: "Les détails du paiement ont été mis à jour.",
      },
      error: { title: "Échec de la modification du paiement." },
    }),
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

export function useDeleteStudentPaymentForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteStudentPayment();

  const deleteStudentPayment = useCallback(
    (paymentId: string, studentName?: string) => {
      mutation.mutate(
        paymentId,
        withNotifications({
          notifications: {
            success: {
              title: "Paiement supprimé",
              description: studentName
                ? `Le paiement de ${studentName} a été annulé.`
                : "Le paiement a été supprimé.",
            },
          },
          onSuccess: () => {
            notifyAndInvalidate(undefined as void);
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteStudentPayment,
    isDeleting: mutation.isPending,
  };
}
