import { useCallback, useState } from "react";
import {
  useCreateFeeSchedule,
  useUpdateFeeSchedule,
  useDeleteFeeSchedule,
  useGetFeeSchedulesAsOptions,
} from "./finances";
import { useFormBaseNotify, useFormBase } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  FeeSchedule,
  FeeScheduleCreate,
  FeeScheduleUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";

/* ==========================================================================
   1. HOOK CRÉATION ÉCHÉANCE (FEE SCHEDULE)
   ========================================================================== */
export function useCreateFeeScheduleForm(
  config?: BaseMutationConfig<FeeSchedule>,
) {
  const mutation = useCreateFeeSchedule();

  // État local pour la recherche asynchrone du Type de Frais parent via le ComboboxSearch
  const [searchQuery, setSearchQuery] = useState("");

  // On récupère les options filtrées (tu as aussi la possibilité d'utiliser ton hook dédié aux feeTypes ici)
  const { data: options = [], isLoading: isSearching } =
    useGetFeeSchedulesAsOptions();

  const formBase = useFormBaseNotify<FeeScheduleCreate, FeeScheduleCreate>({
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

  return {
    ...formBase,
    feeTypeSearch: {
      searchQuery,
      setSearchQuery,
      isSearching,
      options: options.map((opt) => ({ label: opt.label, value: opt.value })),
    },
  };
}

/* ==========================================================================
   2. HOOK MODIFICATION ÉCHÉANCE (FEE SCHEDULE)
   ========================================================================== */
export function useUpdateFeeScheduleForm(
  config?: BaseMutationConfig<FeeSchedule>,
) {
  const mutation = useUpdateFeeSchedule();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: options = [], isLoading: isSearching } =
    useGetFeeSchedulesAsOptions();

  const formBase = useFormBaseNotify<
    QueryUpdatePayload<FeeScheduleUpdate>,
    { data: FeeScheduleUpdate; id: string }
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

  return {
    ...formBase,
    feeTypeSearch: {
      searchQuery,
      setSearchQuery,
      isSearching,
      options: options.map((opt) => ({ label: opt.label, value: opt.value })),
    },
  };
}

/* ==========================================================================
   3. HOOK SUPPRESSION ÉCHÉANCE (FEE SCHEDULE)
   ========================================================================== */
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
            notifyAndInvalidate(undefined as void);
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
