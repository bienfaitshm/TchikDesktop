import type {
  StudentPayment,
  FeeAssignment,
} from "@/packages/@core/data-access/db/schemas";
import type {
  FeeConfigurationDTO,
  TableClassroomPaymentAssignment,
} from "@/packages/@core/data-access/db/queries";
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
import { useQueryClient } from "@tanstack/react-query";

export type ReturnPayementProcessData = FeeAssignment & {
  payment: StudentPayment;
  feeConfig: FeeConfigurationDTO;
};
export type AssignFeesFormConfig = BaseMutationConfig<void>;
export type ProcessPaymentFormConfig =
  BaseMutationConfig<ReturnPayementProcessData>;

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

export function useUpdateTableClassroomPayment(
  config?: ProcessPaymentFormConfig,
): ProcessPaymentFormConfig {
  const queryClient = useQueryClient();

  return {
    onSuccess: (responseData) => {
      const { feeConfig, payment, ...data } = responseData;
      // 1. Destructuration propre des données renvoyées par l'API
      console.log(
        "[Payement process] updating classroom payment table",
        responseData,
        { feeConfig, payment, data },
      );

      // ⚠️ ATTENTION SÉMANTIQUE :
      // On met généralement à jour une "queryKey" et non une "mutationKey" dans le cache.
      // Assurez-vous que config.mutationKey est bien la clé de votre useQuery cible.
      const targetCacheKey = config?.mutationKey;

      if (targetCacheKey) {
        // 2. Utilisation du générique sur setQueryData pour un meilleur typage
        queryClient.setQueryData<TableClassroomPaymentAssignment[]>(
          targetCacheKey,
          (oldCache) => {
            // Si le cache est vide ou non initialisé, on retourne undefined
            // pour ne pas créer un tableau vide factice.
            if (!oldCache) return undefined;

            return oldCache.map((assignment) => {
              // 3. Early return : réduit l'indentation et facilite la lecture
              if (assignment.feeTypeId !== feeConfig.feeTypeId) {
                return assignment;
              }

              return {
                ...assignment,
                table: {
                  ...assignment.table,
                  body: assignment.table.body.map((row) => {
                    // Early return pour les lignes non concernées
                    if (row.enrollmentId !== data.enrollmentId) {
                      return row;
                    }

                    return {
                      ...row,
                      payments: {
                        ...row.payments,
                        // 4. Éviter le 'as string'. L'utilisation de String() est plus sûre
                        // si scheduleId s'avère être un nombre ou undefined.
                        [String(data.scheduleId)]: responseData,
                      },
                    };
                  }),
                },
              };
            });
          },
        );
      }

      // 5. PRÉSERVATION DES CALLBACKS :
      // Si un onSuccess a été passé dans la 'config' initiale, il ne faut pas l'écraser,
      // il faut l'exécuter après avoir mis à jour le cache.
      if (config?.onSuccess) {
        config.onSuccess(responseData);
      }
    },
  };
}

/**
 * 2. Hook pour le traitement d'un encaissement au guichet (Formulaire de paiement)
 */
export function useProcessStudentPaymentForm(
  { schoolId, yearId }: PaymentContextParams,
  _config?: ProcessPaymentFormConfig,
) {
  const mutation = useProcessStudentPayment();
  const config = useUpdateTableClassroomPayment(_config);
  const base = useFormBaseNotify<
    ProcessStudentPaymentPayload,
    ProcessStudentPaymentPayload,
    ReturnPayementProcessData
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
