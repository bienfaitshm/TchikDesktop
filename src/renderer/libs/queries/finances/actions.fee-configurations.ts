import { useCallback } from "react";
import type { FieldValues } from "react-hook-form";
import type { FeeConfiguration } from "@/packages/@core/data-access/db";
import {
  CURRENCY_OPTIONS,
  SECTION_OPTIONS,
} from "@/packages/@core/data-access/db/options";
import type {
  FeeConfigurationCreate,
  FeeConfigurationUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import { useSearchClassrooms } from "@/renderer/libs/queries/classrooms";
import { useSearchOptions } from "@/renderer/libs/queries/options";
import type {
  BaseMutationConfig,
  QueryUpdatePayload,
  UseBaseParams,
} from "../base";
import { useFormBase, useFormBaseNotify } from "../base";
import {
  useCreateFeeConfiguration,
  useDeleteFeeConfiguration,
  useUpdateFeeConfiguration,
} from "./finances";
import { useSearchFeeTypeOptions } from "./helpers";

export type FeeConfigurationFormConfig = BaseMutationConfig<FeeConfiguration>;
export type FeeConfigurationFormData = FeeConfiguration;

export interface FeeConfigContextParams {
  schoolId: string;
  yearId: string;
}

const CREATE_FEE_CONFIG_NOTIFICATIONS = {
  success: {
    title: "Configuration créée",
    description: "La configuration de frais a été enregistrée.",
  },
  error: { title: "Erreur lors de la création de la configuration." },
};

const UPDATE_FEE_CONFIG_NOTIFICATIONS = {
  success: {
    title: "Configuration modifiée",
    description: "La configuration de frais a été mise à jour.",
  },
  error: { title: "Échec de la mise à jour de la configuration." },
};

/**
 * Builds deletion notifications for fee configurations.
 * @param configName - Optional configuration name to include in the toast message.
 * @returns Notification object for fee configuration deletion.
 */
const getDeleteFeeConfigNotifications = (configName?: string) => ({
  success: {
    title: "Configuration supprimée",
    description: configName
      ? `La configuration "${configName}" a été supprimée.`
      : "La configuration a été supprimée.",
  },
});

/**
 * Shared base hook centralizing search options and context bindings for fee configuration forms.
 * @template TFormData - The form input values structure.
 * @template TMutateInput - The variable structure expected by the mutation.
 * @template TReturnData - The response data type returned by the mutation.
 * @param params - Combined school context parameters and base mutation hook options.
 * @returns Form state, handlers, and option search states for UI selects.
 */
export const useFeeConfigBaseForm = <
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData,
>({
  schoolId,
  yearId,
  ...params
}: FeeConfigContextParams &
  UseBaseParams<TFormData, TMutateInput, TReturnData>) => {
  const classroomSearch = useSearchClassrooms({ schoolId });
  const optionSearch = useSearchOptions({ schoolId });
  const feeTypeSearch = useSearchFeeTypeOptions({ schoolId, yearId });

  const base = useFormBaseNotify<TFormData, TMutateInput, TReturnData>(params);

  return {
    currencyOptions: CURRENCY_OPTIONS,
    sectionOptions: SECTION_OPTIONS,
    feeTypeSearch,
    optionSearch,
    classroomSearch,
    ...base,
  };
};

/**
 * Form hook for creating new fee configurations.
 * @param context - Context parameters containing schoolId and yearId.
 * @param config - Optional base mutation configuration settings.
 * @returns Form handlers and option lists for configuration creation.
 */
export function useCreateFeeConfigurationForm(
  { schoolId, yearId }: FeeConfigContextParams,
  config?: FeeConfigurationFormConfig,
) {
  const mutation = useCreateFeeConfiguration();

  const adaptData = useCallback(
    (data: FeeConfigurationCreate) => ({ ...data, schoolId, yearId }),
    [schoolId, yearId],
  );

  return useFeeConfigBaseForm<
    FeeConfigurationCreate,
    FeeConfigurationCreate,
    FeeConfiguration
  >({
    schoolId,
    yearId,
    mutation,
    config,
    getNotifications: () => CREATE_FEE_CONFIG_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Form hook for modifying existing fee configurations.
 * @param context - Context parameters containing schoolId and yearId.
 * @param config - Optional base mutation configuration settings.
 * @returns Form handlers and option lists for configuration modification.
 */
export function useUpdateFeeConfigurationForm(
  { schoolId, yearId }: FeeConfigContextParams,
  config?: BaseMutationConfig<FeeConfigurationUpdate>,
) {
  const mutation = useUpdateFeeConfiguration();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<FeeConfigurationUpdate>) => ({
      data,
      id,
    }),
    [],
  );

  return useFeeConfigBaseForm<
    QueryUpdatePayload<FeeConfigurationUpdate>,
    { data: FeeConfigurationUpdate; id: string },
    FeeConfigurationUpdate
  >({
    schoolId,
    yearId,
    mutation,
    config,
    getNotifications: () => UPDATE_FEE_CONFIG_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Hook for executing fee configuration deletion.
 * @param config - Optional base mutation configuration settings.
 * @returns Object exposing deleteFeeConfiguration callback and pending status.
 */
export function useDeleteFeeConfigurationForm(
  config?: BaseMutationConfig<void>,
) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteFeeConfiguration();

  const deleteFeeConfiguration = useCallback(
    (feeConfigId: string, configName?: string) => {
      mutation.mutate(
        feeConfigId,
        withNotifications({
          notifications: getDeleteFeeConfigNotifications(configName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteFeeConfiguration,
    onDelete: deleteFeeConfiguration,
    isDeleting: mutation.isPending,
  };
}
