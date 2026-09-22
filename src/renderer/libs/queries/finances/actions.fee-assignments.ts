import { useCallback, useState } from "react";
import {
  useCreateFeeAssignment,
  useBulkCreateFeeAssignment,
  useUpdateFeeAssignment,
  useUpdateAmountByAssignments,
  useUpdateAmountByClassrooms,
  useDeleteFeeAssignment,
  markAsPaid,
  exemptFromFee,
} from "./finances";
import { useFormBaseNotify, useFormBase } from "../base";
import { notifier, withNotifications } from "@/renderer/libs/notifications";
import type {
  ExemptFromFee as ExemptFromFeePayload,
  FeeAssignment,
  FeeAssignmentCreate,
  FeeAssignmentUpdate,
  FeeBulkAssignmentData,
  MarkAsPaid as MarkAsPaidPayload,
  UpdateAmountByAssignments,
  UpdateAmountByClassrooms,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { CURRENCY_OPTIONS } from "@/packages/@core/data-access/db/options";
import { queryClient } from "../providers";

const CREATE_FEE_ASSIGNMENT_NOTIFICATIONS = {
  success: {
    title: "Attribution créée",
    description: "L'attribution de frais a été enregistrée avec succès.",
  },
  error: {
    title: "Erreur de création",
    description: "Impossible de créer l'attribution de frais.",
  },
};

const BULK_CREATE_FEE_ASSIGNMENT_NOTIFICATIONS = {
  success: {
    title: "Facturation collective réussie",
    description:
      "Les lignes de frais ont été propagées au lot d'élèves sélectionné.",
  },
  error: {
    title: "Erreur de facturation collective",
    description: "Échec lors de l'assignation collective des frais.",
  },
};

const UPDATE_FEE_ASSIGNMENT_NOTIFICATIONS = {
  success: {
    title: "Attribution mise à jour",
    description: "L'attribution a été modifiée avec succès.",
  },
  error: {
    title: "Erreur de mise à jour",
    description: "Échec de la mise à jour de l'attribution.",
  },
};

const UPDATE_AMOUNT_BY_ASSIGNMENTS_NOTIFICATIONS = {
  success: {
    title: "Montants mis à jour",
    description:
      "Les montants des attributions sélectionnées ont été modifiés.",
  },
  error: {
    title: "Erreur de mise à jour",
    description: "Impossible de mettre à jour les montants des attributions.",
  },
};

const UPDATE_AMOUNT_BY_CLASSROOMS_NOTIFICATIONS = {
  success: {
    title: "Montants des classes mis à jour",
    description: "Les montants pour les classes ciblées ont été mis à jour.",
  },
  error: {
    title: "Erreur de mise à jour",
    description: "Impossible de mettre à jour les montants par classe.",
  },
};

const MARK_AS_PAID_NOTIFICATIONS = {
  success: {
    title: "Paiement enregistré",
    description: "L'attribution a été marquée comme payée.",
  },
  error: {
    title: "Erreur de traitement",
    description: "Impossible d'enregistrer le paiement de l'attribution.",
  },
};

const EXEMPT_FROM_FEE_NOTIFICATIONS = {
  success: {
    title: "Exemption accordée",
    description: "L'élève a été exempté des frais spécifiés.",
  },
  error: {
    title: "Erreur d'exemption",
    description: "Impossible d'appliquer l'exemption de frais.",
  },
};

/**
 * Submits a payment status update and displays feedback notifications.
 * @param payload - Data required to mark a fee assignment as paid.
 */
export async function markAsPaidForm(
  payload: MarkAsPaidPayload,
): Promise<void> {
  try {
    await markAsPaid(payload);
    queryClient.invalidateQueries({ queryKey: ["fin"] });
    notifier.success(MARK_AS_PAID_NOTIFICATIONS.success);
  } catch (error) {
    notifier.error(MARK_AS_PAID_NOTIFICATIONS.error);
    throw error;
  }
}

/**
 * Submits a fee exemption request and displays feedback notifications.
 * @param payload - Data required to exempt an assignment from fees.
 */
export async function exemptFromFeeForm(
  payload: ExemptFromFeePayload,
): Promise<void> {
  try {
    await exemptFromFee(payload);
    queryClient.invalidateQueries({ queryKey: ["fin"] });
    notifier.success(EXEMPT_FROM_FEE_NOTIFICATIONS.success);
  } catch (error) {
    notifier.error(EXEMPT_FROM_FEE_NOTIFICATIONS.error);
    throw error;
  }
}

/**
 * Builds deletion notifications based on student context.
 * @param studentName - Optional student name to customize the success message.
 * @returns Notification object containing success titles and descriptions.
 */
const getDeleteFeeAssignmentNotifications = (studentName?: string) => ({
  success: {
    title: "Attribution supprimée",
    description: studentName
      ? `L'attribution de ${studentName} a été supprimée.`
      : "L'attribution de frais a été supprimée.",
  },
  error: {
    title: "Erreur de suppression",
    description: "Impossible de supprimer l'attribution de frais.",
  },
});

/**
 * Helper hook to handle repetitive search input states.
 * @returns Object containing search query state, updater function, and empty defaults.
 */
function useSearchInputState() {
  const [searchQuery, setSearchQuery] = useState("");
  return {
    searchQuery,
    setSearchQuery,
    isSearching: false,
    options: [],
  };
}

/**
 * Custom hook for managing individual fee assignment creation.
 * @param config - Optional base mutation configuration.
 * @returns Form state and submission handlers bound to the creation mutation.
 */
export function useCreateFeeAssignmentForm(
  config?: BaseMutationConfig<FeeAssignment>,
) {
  const mutation = useCreateFeeAssignment();
  return useFormBaseNotify<
    FeeAssignmentCreate,
    FeeAssignmentCreate,
    FeeAssignment
  >({
    mutation,
    config,
    getNotifications: () => CREATE_FEE_ASSIGNMENT_NOTIFICATIONS,
    adaptData: (data) => data,
  });
}

/**
 * Custom hook for managing bulk fee assignment creation for multiple students.
 * @param config - Optional base mutation configuration.
 * @returns Combined form state, search handlers, and bulk creation mutation.
 */
export function useCreateBulkFeeAssignmentForm(
  config?: BaseMutationConfig<void>,
) {
  const mutation = useBulkCreateFeeAssignment();

  const feeConfigSearch = useSearchInputState();
  const scheduleSearch = useSearchInputState();
  const classroomSearch = useSearchInputState();
  const optionSearch = useSearchInputState();

  const formBase = useFormBaseNotify<
    FeeBulkAssignmentData,
    FeeBulkAssignmentData,
    void
  >({
    mutation,
    config,
    getNotifications: () => BULK_CREATE_FEE_ASSIGNMENT_NOTIFICATIONS,
    adaptData: (data) => data,
  });

  return {
    ...formBase,
    feeConfigSearch,
    scheduleSearch,
    classroomSearch,
    optionSearch,
  };
}

/**
 * Custom hook for updating an existing fee assignment.
 * @param config - Optional base mutation configuration.
 * @returns Form state and handlers bound to the update mutation.
 */
export function useUpdateFeeAssignmentForm(
  config?: BaseMutationConfig<FeeAssignment>,
) {
  const mutation = useUpdateFeeAssignment();
  return useFormBaseNotify<
    QueryUpdatePayload<FeeAssignmentUpdate>,
    { data: FeeAssignmentUpdate; id: string },
    FeeAssignment
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_FEE_ASSIGNMENT_NOTIFICATIONS,
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

/**
 * Custom hook for updating fee amounts across specific assignment IDs.
 * @param config - Optional base mutation configuration.
 * @returns Form state and currency options for updating assignment amounts.
 */
export function useUpdateAmountByAssignmentsForm(
  config?: BaseMutationConfig<FeeAssignment[]>,
) {
  const mutation = useUpdateAmountByAssignments();
  const base = useFormBaseNotify<
    UpdateAmountByAssignments,
    UpdateAmountByAssignments,
    FeeAssignment[]
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_AMOUNT_BY_ASSIGNMENTS_NOTIFICATIONS,
    adaptData: (data) => data,
  });

  return { currencyOptions: CURRENCY_OPTIONS, ...base };
}

/**
 * Custom hook for updating fee amounts across targeted classrooms.
 * @param config - Optional base mutation configuration.
 * @returns Form state and currency options for updating amounts by classrooms.
 */
export function useUpdateAmountByClassroomsForm(
  config?: BaseMutationConfig<FeeAssignment[]>,
) {
  const mutation = useUpdateAmountByClassrooms();
  const base = useFormBaseNotify<
    UpdateAmountByClassrooms,
    UpdateAmountByClassrooms,
    FeeAssignment[]
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_AMOUNT_BY_CLASSROOMS_NOTIFICATIONS,
    adaptData: (data) => data,
  });

  return { currencyOptions: CURRENCY_OPTIONS, ...base };
}

/**
 * Custom hook for deleting a fee assignment entry.
 * @param config - Optional base mutation configuration.
 * @returns Deletion callback function and current pending state.
 */
export function useDeleteFeeAssignmentForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteFeeAssignment();

  const deleteFeeAssignment = useCallback(
    (assignmentId: string, studentName?: string) => {
      mutation.mutate(
        assignmentId,
        withNotifications({
          notifications: getDeleteFeeAssignmentNotifications(studentName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    onDelete: deleteFeeAssignment,
    isDeleting: mutation.isPending,
  };
}
