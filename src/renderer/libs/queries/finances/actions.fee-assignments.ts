import { useCallback, useState } from "react";
import {
  useCreateFeeAssignment,
  useBulkCreateFeeAssignment, // <-- IMPORTÉ POUR LE TRAITEMENT PAR LOT
  useUpdateFeeAssignment,
  useDeleteFeeAssignment,
} from "./finances";
import { useFormBaseNotify } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  FeeAssignment,
  FeeAssignmentCreate,
  FeeAssignmentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase } from "../base";

/* ==========================================================================
   1. ASSIGNATION UNITAIRE (CRÉATION)
   ========================================================================== */
export function useCreateFeeAssignmentForm(
  config?: BaseMutationConfig<FeeAssignment>,
) {
  const mutation = useCreateFeeAssignment();
  return useFormBaseNotify<FeeAssignmentCreate, FeeAssignmentCreate>({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Attribution créée",
        description: "L'attribution de frais a été enregistrée.",
      },
      error: { title: "Erreur lors de la création de l'attribution." },
    }),
    adaptData: (data) => data,
  });
}

/* ==========================================================================
   2. ASSIGNATION DE MASSE / BULK (NOUVEAU)
   ========================================================================== */
export function useCreateBulkFeeAssignmentForm(
  config?: BaseMutationConfig<void>,
) {
  const mutation = useBulkCreateFeeAssignment();

  // États locaux requis par les différents ComboboxSearch du formulaire Bulk
  const [configSearch, setConfigSearch] = useState("");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [classroomSearch, setClassroomSearch] = useState("");
  const [optionSearch, setOptionSearch] = useState("");

  const formBase = useFormBaseNotify<
    FeeBulkAssignmentData,
    FeeBulkAssignmentData
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Facturation collective réussie",
        description:
          "Les lignes de frais ont été propagées au lot d'élèves sélectionné.",
      },
      error: { title: "Erreur lors de l'assignation collective des frais." },
    }),
    adaptData: (data) => data,
  });

  return {
    ...formBase,
    // Injection des structures de recherche attendues par les boutons de sélection asynchrone
    feeConfigSearch: {
      searchQuery: configSearch,
      setSearchQuery: setConfigSearch,
      isSearching: false, // Relier au flag isLoading de tes requêtes d'options si nécessaire
      options: [], // Charger via tes hooks d'options (ex: useGetFeeConfigurationAsOptions)
    },
    scheduleSearch: {
      searchQuery: scheduleSearch,
      setSearchQuery: setScheduleSearch,
      isSearching: false,
      options: [],
    },
    classroomSearch: {
      searchQuery: classroomSearch,
      setSearchQuery: setClassroomSearch,
      isSearching: false,
      options: [],
    },
    optionSearch: {
      searchQuery: optionSearch,
      setSearchQuery: setOptionSearch,
      isSearching: false,
      options: [],
    },
  };
}

/* ==========================================================================
   3. ATTRIBUTION (MODIFICATION)
   ========================================================================== */
export function useUpdateFeeAssignmentForm(
  config?: BaseMutationConfig<FeeAssignment>,
) {
  const mutation = useUpdateFeeAssignment();
  return useFormBaseNotify<
    QueryUpdatePayload<FeeAssignmentUpdate>,
    { data: FeeAssignmentUpdate; id: string }
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Attribution mise à jour",
        description: "L'attribution a été modifiée avec succès.",
      },
      error: { title: "Échec de la mise à jour de l'attribution." },
    }),
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

/* ==========================================================================
   4. ATTRIBUTION (SUPPRESSION)
   ========================================================================== */
export function useDeleteFeeAssignmentForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteFeeAssignment();

  const deleteFeeAssignment = useCallback(
    (assignmentId: string, studentName?: string) => {
      mutation.mutate(
        assignmentId,
        withNotifications({
          notifications: {
            success: {
              title: "Attribution supprimée",
              description: studentName
                ? `L'attribution de ${studentName} a été supprimée.`
                : "L'attribution a été supprimée.",
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
    deleteFeeAssignment,
    isDeleting: mutation.isPending,
  };
}
