import { useCallback, useState } from "react";
import {
  useCreateFeeAssignment,
  useBulkCreateFeeAssignment,
  useUpdateFeeAssignment,
  useDeleteFeeAssignment,
} from "./finances";
import { useFormBaseNotify, useFormBase } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  FeeAssignment,
  FeeAssignmentCreate,
  FeeAssignmentUpdate,
  FeeBulkAssignmentData,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";

const CREATE_FEE_ASSIGNMENT_NOTIFICATIONS = {
  success: {
    title: "Attribution créée",
    description: "L'attribution de frais a été enregistrée.",
  },
  error: { title: "Erreur lors de la création de l'attribution." },
};

const BULK_CREATE_FEE_ASSIGNMENT_NOTIFICATIONS = {
  success: {
    title: "Facturation collective réussie",
    description:
      "Les lignes de frais ont été propagées au lot d'élèves sélectionné.",
  },
  error: { title: "Erreur lors de l'assignation collective des frais." },
};

const UPDATE_FEE_ASSIGNMENT_NOTIFICATIONS = {
  success: {
    title: "Attribution mise à jour",
    description: "L'attribution a été modifiée avec succès.",
  },
  error: { title: "Échec de la mise à jour de l'attribution." },
};

/**
 * Builds deletion notifications based on student context.
 * @param studentName - Optional student name to customize the success message.
 * @returns Notification object for the deletion action.
 */
const getDeleteFeeAssignmentNotifications = (studentName?: string) => ({
  success: {
    title: "Attribution supprimée",
    description: studentName
      ? `L'attribution de ${studentName} a été supprimée.`
      : "L'attribution a été supprimée.",
  },
});

/**
 * Custom hook for managing individual fee assignment creation.
 * @param config - Optional base mutation configuration.
 * @returns Form state and handlers bound to the creation mutation.
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
 * @returns Combined form state and search handlers for multi-select inputs.
 */
export function useCreateBulkFeeAssignmentForm(
  config?: BaseMutationConfig<void>,
) {
  const mutation = useBulkCreateFeeAssignment();

  const [configSearch, setConfigSearch] = useState("");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [classroomSearch, setClassroomSearch] = useState("");
  const [optionSearch, setOptionSearch] = useState("");

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
    feeConfigSearch: {
      searchQuery: configSearch,
      setSearchQuery: setConfigSearch,
      isSearching: false,
      options: [],
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

/**
 * Custom hook for updating an existing fee assignment.
 * @param config - Optional base mutation configuration.
 * @returns Form state and handlers bound to the update mutation.
 */
export function useUpdateFeeAssignmentForm(
  config?: BaseMutationConfig<FeeAssignmentUpdate>,
) {
  const mutation = useUpdateFeeAssignment();
  return useFormBaseNotify<
    QueryUpdatePayload<FeeAssignmentUpdate>,
    { data: FeeAssignmentUpdate; id: string },
    FeeAssignmentUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_FEE_ASSIGNMENT_NOTIFICATIONS,
    adaptData: ({ data, id }) => ({ data, id }),
  });
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
