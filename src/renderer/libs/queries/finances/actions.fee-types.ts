import { useCallback } from "react";
import {
  useCreateFeeType,
  useUpdateFeeType,
  useDeleteFeeType,
} from "./finances";

import { useFormBaseNotify } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  FeeType,
  FeeTypeCreate,
  FeeTypeUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase } from "../base";

export function useCreateFeeTypeForm(config?: BaseMutationConfig<FeeType>) {
  const mutation = useCreateFeeType();
  return useFormBaseNotify<FeeTypeCreate, FeeTypeCreate>({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Type de frais créé",
        description: "Le nouveau type de frais a été enregistré.",
      },
      error: { title: "Erreur lors de la création du type de frais." },
    }),
    adaptData: (data) => data,
  });
}

export function useUpdateFeeTypeForm(config?: BaseMutationConfig<FeeType>) {
  const mutation = useUpdateFeeType();
  return useFormBaseNotify<
    QueryUpdatePayload<FeeTypeUpdate>,
    { data: FeeTypeUpdate; id: string }
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Type de frais mis à jour",
        description: "Le type de frais a été modifié avec succès.",
      },
      error: { title: "Échec de la mise à jour du type de frais." },
    }),
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

export function useDeleteFeeTypeForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteFeeType();

  const deleteFeeType = useCallback(
    (feeTypeId: string, feeTypeName?: string) => {
      mutation.mutate(
        feeTypeId,
        withNotifications({
          notifications: {
            success: {
              title: "Type de frais supprimé",
              description: feeTypeName
                ? `Le type de frais "${feeTypeName}" a été supprimé.`
                : "Le type de frais a été supprimé.",
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
    deleteFeeType,
    isDeleting: mutation.isPending,
  };
}
