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

export type ReturnPaymentProcessData = FeeAssignment & {
  payment: StudentPayment;
  feeConfig: FeeConfigurationDTO;
};

export type AssignFeesFormConfig = BaseMutationConfig<void>;
export type ProcessPaymentFormConfig =
  BaseMutationConfig<ReturnPaymentProcessData>;

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

/**
 * Form hook for assigning initial fee schedules to a student.
 * @param context - Context parameters containing schoolId and yearId.
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
    onSuccess: (responseData) => {
      const { feeConfig, payment, ...data } = responseData;
      const targetCacheKey = config?.mutationKey;

      if (targetCacheKey) {
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
 * @param context - Context parameters containing schoolId and yearId.
 * @param userConfig - Optional base mutation configuration.
 * @returns Form state, handlers, and payment select field options.
 */
export function useProcessStudentPaymentForm(
  { schoolId, yearId }: PaymentContextParams,
  userConfig?: ProcessPaymentFormConfig,
) {
  const mutation = useProcessStudentPayment();
  const config = useUpdateTableClassroomPayment(userConfig);

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
    config,
    getNotifications: () => PROCESS_PAYMENT_NOTIFICATIONS,
    adaptData,
  });

  return {
    currencyOptions: CURRENCY_OPTIONS,
    paymentMethodOptions: PAYMENT_METHOD_OPTIONS,
    ...base,
  };
}
