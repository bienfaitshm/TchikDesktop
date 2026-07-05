import { useCallback } from "react";
import {
  useCreateDailyExchangeRate,
  useUpdateDailyExchangeRate,
  useDeleteDailyExchangeRate,
} from "./finances";
import { useFormBaseNotify } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  DailyExchangeRate,
  DailyExchangeRateCreate,
  DailyExchangeRateUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase } from "../base";

export function useCreateDailyExchangeRateForm(
  config?: BaseMutationConfig<DailyExchangeRate>,
) {
  const mutation = useCreateDailyExchangeRate();
  return useFormBaseNotify<DailyExchangeRateCreate, DailyExchangeRateCreate>({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Taux de change enregistré",
        description: "Le taux de change quotidien a été ajouté.",
      },
      error: { title: "Erreur lors de l'ajout du taux de change." },
    }),
    adaptData: (data) => data,
  });
}

export function useUpdateDailyExchangeRateForm(
  config?: BaseMutationConfig<DailyExchangeRate>,
) {
  const mutation = useUpdateDailyExchangeRate();
  return useFormBaseNotify<
    QueryUpdatePayload<DailyExchangeRateUpdate>,
    { data: DailyExchangeRateUpdate; id: string }
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Taux de change mis à jour",
        description: "Le taux a été modifié.",
      },
      error: { title: "Échec de la mise à jour du taux de change." },
    }),
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

export function useDeleteDailyExchangeRateForm(
  config?: BaseMutationConfig<void>,
) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteDailyExchangeRate();

  const deleteDailyExchangeRate = useCallback(
    (rateId: string, date?: string) => {
      mutation.mutate(
        rateId,
        withNotifications({
          notifications: {
            success: {
              title: "Taux supprimé",
              description: date
                ? `Le taux du ${date} a été supprimé.`
                : "Le taux de change a été supprimé.",
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
    deleteDailyExchangeRate,
    isDeleting: mutation.isPending,
  };
}
