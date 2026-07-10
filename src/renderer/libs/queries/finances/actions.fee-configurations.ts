import { useCallback, useMemo } from "react";
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
import { FieldValues } from "react-hook-form";

export type FeeConfigurationFormConfig = BaseMutationConfig<FeeConfiguration>;
export type FeeConfigurationFormData = FeeConfigurationCreate;

interface FeeConfigContextParams {
  schoolId: string;
  yearId: string;
}

/**
 * 1. Hook de Base partagé (Shared Form Context)
 * Centralise la récupération des options de recherche pour les formulaires (Simple & Bulk)
 */
export const useFeeConfigBaseForm = <
  TFormData extends FieldValues,
  TReturnData,
>({
  schoolId,
  yearId,
  ...params
}: FeeConfigContextParams &
  UseBaseParams<TFormData, TFormData, TReturnData>) => {
  const schoolFilter = useMemo(
    () => ({ filters: { where: { schoolId } } }),
    [schoolId],
  );
  const feeTypeFilter = useMemo(
    () => ({ filters: { where: { schoolId, yearId } } }),
    [schoolId, yearId],
  );

  const classroomSearch = useSearchClassrooms(schoolFilter);
  const optionSearch = useSearchOptions(schoolFilter);
  const feeTypeSearch = useSearchFeeTypeOptions(feeTypeFilter);

  const base = useFormBaseNotify<TFormData, TFormData, TReturnData>(params);

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
 * 2. Hook pour la Création (Unitaire ou Bulk)
 */
export function useCreateFeeConfigurationForm(
  // Ajout des identifiants nécessaires au contexte
  { schoolId, yearId }: FeeConfigContextParams,
  config?: FeeConfigurationFormConfig,
) {
  const mutation = useCreateFeeConfiguration();

  // Utilisation du hook de base unifié
  return useFeeConfigBaseForm<FeeConfigurationCreate, FeeConfiguration>({
    schoolId,
    yearId,
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Configuration créée",
        description: "La configuration de frais a été enregistrée.",
      },
      error: { title: "Erreur lors de la création de la configuration." },
    }),
    adaptData: (data) => ({ ...data, schoolId, yearId }),
  });
}

/**
 * 3. Hook pour la Modification
 */
export function useUpdateFeeConfigurationForm(
  { schoolId, yearId }: FeeConfigContextParams,
  config?: FeeConfigurationFormConfig,
) {
  const mutation = useUpdateFeeConfiguration();

  return useFeeConfigBaseForm<
    QueryUpdatePayload<FeeConfigurationUpdate>,
    FeeConfiguration
  >({
    schoolId,
    yearId,
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Configuration modifiée",
        description: "La configuration de frais a été mise à jour.",
      },
      error: { title: "Échec de la mise à jour de la configuration." },
    }),
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

/**
 * 4. Hook pour la Suppression
 */
export function useDeleteFeeConfigurationForm(
  config?: BaseMutationConfig<void>,
) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteFeeConfiguration();

  const deleteFeeConfiguration = useCallback(
    (feeConfigId: string, configName?: string) => {
      mutation.mutate(
        feeConfigId,
        withNotifications({
          notifications: {
            success: {
              title: "Configuration supprimée",
              description: configName
                ? `La configuration "${configName}" a été supprimée.`
                : "La configuration a été supprimée.",
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
    deleteFeeConfiguration,
    isDeleting: mutation.isPending,
  };
}
