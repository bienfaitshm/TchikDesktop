import { useCallback } from "react";
import type { FieldValues } from "react-hook-form";
import type { FeeSchedule } from "@/packages/@core/data-access/db";
import type {
  FeeScheduleBulkCreate,
  FeeScheduleCreate,
  FeeScheduleUpdate,
  FeeType,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  BaseMutationConfig,
  QueryUpdatePayload,
  UseBaseParams,
} from "../base";
import { useFormBase, useFormBaseNotify } from "../base";
import {
  useBulkCreateFeeSchedule,
  useCreateFeeSchedule,
  useDeleteFeeSchedule,
  useGetFeeTypeAsOptions,
  useUpdateFeeSchedule,
} from "./finances";

type SchoolContext = Partial<Pick<FeeType, "schoolId">>;
export type HookActionsParams<T = FeeSchedule> = SchoolContext &
  BaseMutationConfig<T>;

const CREATE_FEE_SCHEDULE_NOTIFICATIONS = {
  success: {
    title: "Échéance ajoutée",
    description:
      "La nouvelle tranche d'échéancier a été enregistrée avec succès.",
  },
  error: { title: "Erreur lors de la création de l'échéance." },
};

const BULK_CREATE_FEE_SCHEDULE_NOTIFICATIONS = {
  success: {
    title: "Échéances ajoutées",
    description:
      "Les tranches d'échéancier ont été enregistrées en masse avec succès.",
  },
  error: { title: "Erreur lors de la création en masse des échéances." },
};

const UPDATE_FEE_SCHEDULE_NOTIFICATIONS = {
  success: {
    title: "Échéance mise à jour",
    description: "Les détails de la tranche de paiement ont été modifiés.",
  },
  error: { title: "Échec de la mise à jour de l'échéance." },
};

/**
 * Builds deletion notifications for fee schedules.
 * @param installmentName - Optional name of the installment being removed.
 * @returns Notification object for fee schedule deletion.
 */
const getDeleteFeeScheduleNotifications = (installmentName?: string) => ({
  success: {
    title: "Échéance supprimée",
    description: installmentName
      ? `La tranche de versement "${installmentName}" a été retirée.`
      : "La tranche d'échéance a été retirée.",
  },
});

/**
 * Shared base hook injecting fee type select options and binding base form state.
 * @template TFormData - The form input values structure.
 * @template TMutateInput - The mutation variable payload type.
 * @template TReturnData - The response data type returned by the mutation.
 * @param params - School context combined with base mutation parameters.
 * @returns Object containing fee type options and form state handlers.
 */
const useBaseFeeSchedule = <
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData = unknown,
>({
  schoolId,
  ...params
}: SchoolContext & UseBaseParams<TFormData, TMutateInput, TReturnData>) => {
  const { data: feeTypeOptions = [] } = useGetFeeTypeAsOptions({
    where: { feeTypes: { schoolId: { $eq: schoolId } } },
  });
  const form = useFormBaseNotify<TFormData, TMutateInput, TReturnData>(params);

  return { feeTypeOptions, ...form };
};

/**
 * Form hook for creating a single fee schedule.
 * @param config - Optional configuration and school context parameters.
 * @returns Form state and handlers bound to the single creation mutation.
 */
export function useCreateFeeScheduleForm(config?: HookActionsParams) {
  const mutation = useCreateFeeSchedule();

  const adaptData = useCallback((data: FeeScheduleCreate) => data, []);

  return useBaseFeeSchedule<FeeScheduleCreate, FeeScheduleCreate, FeeSchedule>({
    schoolId: config?.schoolId,
    mutation,
    config,
    getNotifications: () => CREATE_FEE_SCHEDULE_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Form hook for bulk creating fee schedules.
 * @param config - Optional configuration and school context parameters.
 * @returns Form state and handlers bound to the bulk creation mutation.
 */
export function useBulkCreateFeeScheduleForm(
  config?: HookActionsParams<FeeSchedule[]>,
) {
  const mutation = useBulkCreateFeeSchedule();

  const adaptData = useCallback((data: FeeScheduleBulkCreate) => data, []);

  return useBaseFeeSchedule<
    FeeScheduleBulkCreate,
    FeeScheduleBulkCreate,
    FeeSchedule[]
  >({
    mutation,
    config,
    schoolId: config?.schoolId,
    getNotifications: () => BULK_CREATE_FEE_SCHEDULE_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Form hook for updating an existing fee schedule.
 * @param config - Optional base mutation configuration settings.
 * @returns Form state and handlers bound to the update mutation.
 */
export function useUpdateFeeScheduleForm(
  config?: BaseMutationConfig<FeeScheduleUpdate>,
) {
  const mutation = useUpdateFeeSchedule();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<FeeScheduleUpdate>) => ({ data, id }),
    [],
  );

  return useBaseFeeSchedule<
    QueryUpdatePayload<FeeScheduleUpdate>,
    { data: FeeScheduleUpdate; id: string },
    FeeScheduleUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_FEE_SCHEDULE_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Hook for executing fee schedule deletion.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing deletion trigger and pending state indicator.
 */
export function useDeleteFeeScheduleForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteFeeSchedule();

  const deleteFeeSchedule = useCallback(
    (scheduleId: string, installmentName?: string) => {
      mutation.mutate(
        scheduleId,
        withNotifications({
          notifications: getDeleteFeeScheduleNotifications(installmentName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteFeeSchedule,
    onDelete: deleteFeeSchedule,
    isDeleting: mutation.isPending,
  };
}
