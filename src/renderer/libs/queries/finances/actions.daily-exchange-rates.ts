import { useCallback } from "react";
import {
  useCreateDailyExchangeRate,
  useUpdateDailyExchangeRate,
  useDeleteDailyExchangeRate,
} from "./finances";
import { useFormBaseNotify, useFormBase } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  DailyExchangeRate,
  DailyExchangeRateCreate,
  DailyExchangeRateUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";

const CREATE_EXCHANGE_RATE_NOTIFICATIONS = {
  success: {
    title: "Taux de change enregistré",
    description: "Le taux de change quotidien a été ajouté.",
  },
  error: { title: "Erreur lors de l'ajout du taux de change." },
};

const UPDATE_EXCHANGE_RATE_NOTIFICATIONS = {
  success: {
    title: "Taux de change mis à jour",
    description: "Le taux a été modifié.",
  },
  error: { title: "Échec de la mise à jour du taux de change." },
};

/**
 * Creates notification options for daily exchange rate deletion.
 * @param date - Optional date string to display in the notification body.
 * @returns Notification configuration object.
 */
const getDeleteNotifications = (date?: string) => ({
  success: {
    title: "Taux supprimé",
    description: date
      ? `Le taux du ${date} a été supprimé.`
      : "Le taux de change a été supprimé.",
  },
});

/**
 * Hook managing the creation form state and mutation for daily exchange rates.
 * @param config - Optional base mutation configuration settings.
 * @returns Form configuration object bound to the creation mutation.
 */
export function useCreateDailyExchangeRateForm(
  config?: BaseMutationConfig<DailyExchangeRate>,
) {
  const mutation = useCreateDailyExchangeRate();
  return useFormBaseNotify<
    DailyExchangeRateCreate,
    DailyExchangeRateCreate,
    DailyExchangeRate
  >({
    mutation,
    config,
    getNotifications: () => CREATE_EXCHANGE_RATE_NOTIFICATIONS,
    adaptData: (data) => data,
  });
}

/**
 * Hook managing the update form state and mutation for daily exchange rates.
 * @param config - Optional base mutation configuration settings.
 * @returns Form configuration object bound to the update mutation.
 */
export function useUpdateDailyExchangeRateForm(
  config?: BaseMutationConfig<DailyExchangeRateUpdate>,
) {
  const mutation = useUpdateDailyExchangeRate();
  return useFormBaseNotify<
    QueryUpdatePayload<DailyExchangeRateUpdate>,
    { data: DailyExchangeRateUpdate; id: string },
    DailyExchangeRateUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_EXCHANGE_RATE_NOTIFICATIONS,
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

/**
 * Hook managing exchange rate deletion actions and loading status.
 * @param config - Optional base mutation configuration settings.
 * @returns Object exposing deletion function and pending state.
 */
export function useDeleteDailyExchangeRateForm(
  config?: BaseMutationConfig<void>,
) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteDailyExchangeRate();

  const onDelete = useCallback(
    (rateId: string, date?: string) => {
      mutation.mutate(
        rateId,
        withNotifications({
          notifications: getDeleteNotifications(date),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    onDelete,
    isDeleting: mutation.isPending,
  };
}
