import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  StudentPayment,
  FeeAssignment,
} from "@/packages/@core/data-access/db/schemas";
import type {
  FeeConfigurationDTO,
  TableClassroomPaymentAssignment,
} from "@/packages/@core/data-access/db/queries";
import type { CancelPaymentResult } from "@/packages/@core/data-access/db";
import {
  CURRENCY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from "@/packages/@core/data-access/db/options";
import type {
  AssignFeesToStudentPayload,
  ProcessStudentPaymentPayload,
  CancelStudentPaymentPayload,
} from "@/packages/@core/apis/clients/finances.payment";
import type { BaseMutationConfig } from "../base";
import { useFormBaseNotify } from "../base";
import {
  paymentKeys,
  useAssignFeesToStudent,
  useProcessStudentPayment,
  useCancelStudentPayment,
} from "./finances";

export type ReturnPaymentProcessData = FeeAssignment & {
  payment: StudentPayment;
  feeConfig: FeeConfigurationDTO;
};

export type AssignFeesFormConfig = BaseMutationConfig<void>;
export type ProcessPaymentFormConfig = {
  process?: "fast";
} & BaseMutationConfig<ReturnPaymentProcessData>;
export type CancelPaymentFormConfig = BaseMutationConfig<CancelPaymentResult>;

export interface PaymentContextParams {
  schoolId: string;
  yearId: string;
}

const ASSIGN_FEES_NOTIFICATIONS = {
  success: {
    title: "Frais assignés",
    description: "La grille des frais applicables a été allouée à l'élève.",
  },
  error: { title: "Erreur lors de l'assignation des frais à l'élève." },
};

const PROCESS_PAYMENT_NOTIFICATIONS = {
  success: {
    title: "Paiement enregistré",
    description: "Le reçu immuable a été généré et la dette a été mise à jour.",
  },
  error: { title: "Échec du traitement du versement au guichet." },
};

const CANCEL_PAYMENT_NOTIFICATIONS = {
  success: {
    title: "Paiement annulé",
    description: "La transaction a été annulée avec succès.",
  },
  error: { title: "Échec de l'annulation du paiement." },
};

/**
 * Form hook for assigning initial fee schedules to a student.
 * @param context - Parameters containing schoolId and yearId.
 * @param config - Optional base mutation configuration.
 * @returns Form state and handlers bound to the fee assignment mutation.
 */
export function useAssignFeesToStudentForm(
  { schoolId, yearId }: PaymentContextParams,
  config?: AssignFeesFormConfig,
) {
  const mutation = useAssignFeesToStudent();

  const adaptData = useCallback(
    (data: AssignFeesToStudentPayload) => ({ ...data, schoolId, yearId }),
    [schoolId, yearId],
  );

  return useFormBaseNotify<
    AssignFeesToStudentPayload,
    AssignFeesToStudentPayload,
    void
  >({
    mutation,
    config,
    getNotifications: () => ASSIGN_FEES_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom hook returning mutation configuration that optimistically updates the payment table query cache.
 * @param config - Optional base mutation configuration.
 * @returns ProcessPaymentFormConfig object containing the augmented onSuccess callback.
 */
export function useUpdateTableClassroomPayment(
  config?: ProcessPaymentFormConfig,
): ProcessPaymentFormConfig {
  const queryClient = useQueryClient();

  return {
    ...config,
    onSuccess: (responseData) => {
      const { feeConfig, payment, ...data } = responseData;
      const targetCacheKey = config?.mutationKey;
      if (config?.process === "fast" && !targetCacheKey) {
        queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      }

      if (targetCacheKey && config.process !== "fast") {
        queryClient.setQueryData<TableClassroomPaymentAssignment[]>(
          targetCacheKey,
          (oldCache) => {
            if (!oldCache) return undefined;

            return oldCache.map((assignment) => {
              if (assignment.feeTypeId !== feeConfig.feeTypeId) {
                return assignment;
              }

              return {
                ...assignment,
                table: {
                  ...assignment.table,
                  body: assignment.table.body.map((row) => {
                    if (row.enrollmentId !== data.enrollmentId) {
                      return row;
                    }

                    return {
                      ...row,
                      payments: {
                        ...row.payments,
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

      if (config?.onSuccess) {
        config.onSuccess(responseData);
      }
    },
  };
}

/**
 * Form hook for processing student payment transactions at counter.
 * @param context - Parameters containing schoolId, yearId and other configurations.
 * @returns Form state, handlers, and payment select field options.
 */
export function useProcessStudentPaymentForm({
  schoolId,
  yearId,
  ...config
}: PaymentContextParams & ProcessPaymentFormConfig) {
  const mutation = useProcessStudentPayment();
  const innerConfig = useUpdateTableClassroomPayment(config);

  const adaptData = useCallback(
    (data: ProcessStudentPaymentPayload) => ({ ...data, schoolId, yearId }),
    [schoolId, yearId],
  );

  const base = useFormBaseNotify<
    ProcessStudentPaymentPayload,
    ProcessStudentPaymentPayload,
    ReturnPaymentProcessData
  >({
    mutation,
    config: innerConfig,
    getNotifications: () => PROCESS_PAYMENT_NOTIFICATIONS,
    adaptData,
  });

  return {
    currencyOptions: CURRENCY_OPTIONS,
    paymentMethodOptions: PAYMENT_METHOD_OPTIONS,
    ...base,
  };
}

/**
 * Form hook for cancelling an existing student payment transaction.
 * @param config - Optional base mutation configuration.
 * @returns Form state and handlers bound to the cancellation mutation.
 */
export function useCancelStudentPaymentForm(config?: CancelPaymentFormConfig) {
  const mutation = useCancelStudentPayment();
  const queryClient = useQueryClient();

  const augmentedConfig: CancelPaymentFormConfig = {
    ...config,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      if (config?.onSuccess) {
        config.onSuccess(data);
      }
    },
  };

  return useFormBaseNotify<
    CancelStudentPaymentPayload,
    CancelStudentPaymentPayload,
    CancelPaymentResult
  >({
    mutation,
    config: augmentedConfig,
    getNotifications: () => CANCEL_PAYMENT_NOTIFICATIONS,
  });
}
