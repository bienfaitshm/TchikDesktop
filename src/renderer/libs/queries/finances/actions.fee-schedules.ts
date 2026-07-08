import type { FeeSchedule } from "@/packages/@core/data-access/db";
import { useCallback } from "react";
import {
  useCreateFeeSchedule,
  useBulkCreateFeeSchedule,
  useUpdateFeeSchedule,
  useDeleteFeeSchedule,
  useGetFeeTypeAsOptions,
} from "./finances";
import { useFormBaseNotify, useFormBase } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  FeeScheduleBulkCreate,
  FeeScheduleCreate,
  FeeScheduleUpdate,
  FeeType,
} from "@/packages/@core/data-access/schema-validations";
import type {
  BaseMutationConfig,
  QueryUpdatePayload,
  UseBaseParams,
} from "../base";
import type { FieldValues } from "react-hook-form";

type SchoolID = Partial<Pick<FeeType, "schoolId">>;
type HookActionsParams<T = FeeSchedule> = SchoolID & BaseMutationConfig<T>;
export type FeeScheduleFormConfig<T = FeeSchedule> = BaseMutationConfig<T>;

/**
 * Hook de base partagé pour injecter les options de types de frais requis par les formulaires
 */
const useBaseFeeSchedule = <
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData = unknown,
>({
  schoolId,
  ...params
}: SchoolID & UseBaseParams<TFormData, TMutateInput, TReturnData>) => {
  const { data: feeTypeOptions = [] } = useGetFeeTypeAsOptions({
    where: { schoolId },
  });
  const form = useFormBaseNotify<TFormData, TMutateInput, TReturnData>(params);

  return { feeTypeOptions, ...form };
};

/**
 * Création unitaire
 */
export function useCreateFeeScheduleForm(config?: HookActionsParams) {
  const mutation = useCreateFeeSchedule();
  return useBaseFeeSchedule<FeeScheduleCreate, FeeScheduleCreate, FeeSchedule>({
    schoolId: config?.schoolId,
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Échéance ajoutée",
        description:
          "La nouvelle tranche d'échéancier a été enregistrée avec succès.",
      },
      error: { title: "Erreur lors de la création de l'échéance." },
    }),
    adaptData: (data) => data,
  });
}

/**
 * Création en masse (Bulk)
 */
export function useBulkCreateFeeScheduleForm(
  config?: HookActionsParams<FeeSchedule[]>,
) {
  const mutation = useBulkCreateFeeSchedule();
  return useBaseFeeSchedule<
    FeeScheduleBulkCreate,
    FeeScheduleBulkCreate,
    FeeSchedule[]
  >({
    mutation,
    config,
    schoolId: config?.schoolId,
    getNotifications: () => ({
      success: {
        title: "Échéances ajoutées",
        description:
          "Les tranches d'échéancier ont été enregistrées en masse avec succès.",
      },
      error: { title: "Erreur lors de la création en masse des échéances." },
    }),
    adaptData: (data) => data,
  });
}

/**
 * Modification d'une échéance
 */
export function useUpdateFeeScheduleForm(
  config?: BaseMutationConfig<FeeSchedule>,
) {
  const mutation = useUpdateFeeSchedule();

  return useBaseFeeSchedule<
    QueryUpdatePayload<FeeScheduleUpdate>,
    { data: FeeScheduleUpdate; id: string },
    FeeSchedule
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Échéance mise à jour",
        description: "Les détails de la tranche de paiement ont été modifiés.",
      },
      error: { title: "Échec de la mise à jour de l'échéance." },
    }),
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

/**
 * Suppression d'une échéance
 */
export function useDeleteFeeScheduleForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteFeeSchedule();

  const deleteFeeSchedule = useCallback(
    (scheduleId: string, installmentName?: string) => {
      mutation.mutate(
        scheduleId,
        withNotifications({
          notifications: {
            success: {
              title: "Échéance supprimée",
              description: installmentName
                ? `La tranche de versement "${installmentName}" a été retirée.`
                : "La tranche d'échéance a été retirée.",
            },
          },
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
    isDeleting: mutation.isPending,
  };
}
