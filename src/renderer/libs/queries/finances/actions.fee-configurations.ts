import { useCallback } from "react";
import {
  useCreateFeeConfiguration,
  useUpdateFeeConfiguration,
  useDeleteFeeConfiguration,
} from "./finances";
import { useFormBaseNotify } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  FeeConfiguration,
  FeeConfigurationCreate,
  FeeConfigurationUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase } from "../base";

export function useCreateFeeConfigurationForm(
  config?: BaseMutationConfig<FeeConfiguration>,
) {
  const mutation = useCreateFeeConfiguration();
  return useFormBaseNotify<FeeConfigurationCreate, FeeConfigurationCreate>({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Configuration créée",
        description: "La configuration de frais a été enregistrée.",
      },
      error: { title: "Erreur lors de la création de la configuration." },
    }),
    adaptData: (data) => data,
  });
}

export function useUpdateFeeConfigurationForm(
  config?: BaseMutationConfig<FeeConfiguration>,
) {
  const mutation = useUpdateFeeConfiguration();
  return useFormBaseNotify<
    QueryUpdatePayload<FeeConfigurationUpdate>,
    { data: FeeConfigurationUpdate; id: string }
  >({
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
            notifyAndInvalidate(undefined as void);
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
