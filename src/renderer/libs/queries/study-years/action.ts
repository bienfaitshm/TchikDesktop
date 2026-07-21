import { useCallback } from "react";
import type {
  StudyYear,
  StudyYearCreate,
  StudyYearUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase, useFormBaseNotify } from "../base";
import {
  useCreateStudyYear,
  useDeleteStudyYear,
  useUpdateStudyYear,
} from "./study-year";

export type StudyYearFormData = StudyYearCreate;
export type StudyYearFormConfig = BaseMutationConfig<StudyYear>;

const CREATE_STUDY_YEAR_NOTIFICATIONS = {
  success: {
    title: "Année scolaire créée !",
    description: "L'année scolaire a été ajoutée avec succès.",
  },
  error: {
    title: "Échec de la création.",
  },
};

const UPDATE_STUDY_YEAR_NOTIFICATIONS = {
  success: {
    title: "Année scolaire mise à jour !",
    description: "Les modifications ont été enregistrées.",
  },
  error: {
    title: "Échec de la mise à jour.",
  },
};

/**
 * Builds notification configurations for study year deletions.
 * @param yearName - Optional name of the academic year being removed.
 * @returns Notification configuration object.
 */
const getDeleteStudyYearNotifications = (yearName?: string) => ({
  success: {
    title: "Année scolaire supprimée",
    description: yearName
      ? `L'année '${yearName}' a été retirée.`
      : "L'année scolaire a été supprimée.",
  },
  error: {
    title: "Erreur de suppression",
  },
});

/**
 * Custom form hook for creating academic study year entities.
 * @param config - Optional base mutation configuration settings.
 * @returns Form state, submit handler, and pending status.
 */
export function useCreateStudyYearForm(config?: StudyYearFormConfig) {
  const mutation = useCreateStudyYear();

  const adaptData = useCallback((data: StudyYearCreate) => data, []);

  return useFormBaseNotify<StudyYearCreate, StudyYearCreate, StudyYear>({
    mutation,
    config,
    getNotifications: () => CREATE_STUDY_YEAR_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom form hook for updating existing academic study year entities.
 * @param config - Optional base mutation configuration settings for StudyYearUpdate.
 * @returns Form state, submit handler, and pending status.
 */
export function useUpdateStudyYearForm(
  config?: BaseMutationConfig<StudyYearUpdate>,
) {
  const mutation = useUpdateStudyYear();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<StudyYearUpdate>) => ({ data, id }),
    [],
  );

  return useFormBaseNotify<
    QueryUpdatePayload<StudyYearUpdate>,
    { data: StudyYearUpdate; id: string },
    StudyYearUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_STUDY_YEAR_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom hook managing academic study year deletion actions and pending state.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing the delete callback and pending state.
 */
export function useDeleteStudyYearForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteStudyYear();

  const deleteStudyYear = useCallback(
    (id: string, yearName?: string) => {
      mutation.mutate(
        id,
        withNotifications({
          notifications: getDeleteStudyYearNotifications(yearName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteStudyYear,
    isDeleting: mutation.isPending,
    onDelete: deleteStudyYear,
  };
}
