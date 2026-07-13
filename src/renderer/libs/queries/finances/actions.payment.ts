import type { StudentPayment } from "@/packages/@core/data-access/db/schemas";
import {
  CURRENCY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from "@/packages/@core/data-access/db/options";
import type {
  AssignFeesToStudentPayload,
  ProcessStudentPaymentPayload,
} from "@/packages/@core/apis/clients/finances.payment";
import type { BaseMutationConfig } from "../base";
import { useFormBaseNotify } from "../base";
import { useAssignFeesToStudent, useProcessStudentPayment } from "./finances";

export type AssignFeesFormConfig = BaseMutationConfig<void>;
export type ProcessPaymentFormConfig = BaseMutationConfig<StudentPayment>;

interface PaymentContextParams {
  schoolId: string;
  yearId: string;
}

/**
 * 1. Hook pour l'assignation de frais initiaux à un élève
 */
export function useAssignFeesToStudentForm(
  { schoolId, yearId }: PaymentContextParams,
  config?: AssignFeesFormConfig,
) {
  const mutation = useAssignFeesToStudent();

  return useFormBaseNotify<
    AssignFeesToStudentPayload,
    AssignFeesToStudentPayload,
    void
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Frais assignés",
        description: "La grille des frais applicables a été allouée à l'élève.",
      },
      error: { title: "Erreur lors de l'assignation des frais à l'élève." },
    }),
    adaptData: (data) => ({ ...data, schoolId, yearId }),
  });
}

/**
 * 2. Hook pour le traitement d'un encaissement au guichet (Formulaire de paiement)
 */
export function useProcessStudentPaymentForm(
  { schoolId, yearId }: PaymentContextParams,
  config?: ProcessPaymentFormConfig,
) {
  const mutation = useProcessStudentPayment();
  const base = useFormBaseNotify<
    ProcessStudentPaymentPayload,
    ProcessStudentPaymentPayload,
    StudentPayment
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Paiement enregistré",
        description:
          "Le reçu immuable a été généré et la dette a été mise à jour.",
      },
      error: { title: "Échec du traitement du versement au guichet." },
    }),
    adaptData: (data) => ({ ...data, schoolId, yearId }),
  });

  return {
    currencyOptions: CURRENCY_OPTIONS,
    paymentMethodOptions: PAYMENT_METHOD_OPTIONS,
    ...base,
  };
}
