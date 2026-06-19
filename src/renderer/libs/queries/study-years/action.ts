import { useCallback } from "react";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  useCreateStudyYear,
  useUpdateStudyYear,
  useDeleteStudyYear,
} from "./study-year";
import type {
  StudyYear,
  StudyYearCreate,
  StudyYearUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  type BaseFormProps,
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
} from "../base";

export type SchoolFormData = StudyYearCreate;

export type StudyYearFormConfig = BaseMutationConfig<StudyYear>;

/**
 * Hook pour la CRÉATION d'une année scolaire
 */
export function useCreateStudyYearForm(config?: StudyYearFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useCreateStudyYear();

  const onSubmit: BaseFormProps<StudyYearCreate>["onSubmit"] = useCallback(
    (data, helpers) => {
      mutation.mutate(
        data,
        withNotifications({
          notifications: {
            success: {
              title: "Année scolaire créée !",
              description: `L'année scolaire '${data.yearName}' a été ajoutée avec succès.`,
            },
            error: {
              title: "Échec de la création.",
            },
          },
          onSuccess: (res) => {
            notifyAndInvalidate(res);
            helpers.reset();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
  };
}

/**
 * Hook pour la MISE À JOUR d'une année scolaire
 */
export function useUpdateStudyYearForm(config?: StudyYearFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useUpdateStudyYear();

  const onSubmit: BaseFormProps<
    QueryUpdatePayload<StudyYearUpdate>
  >["onSubmit"] = useCallback(
    ({ data, id }, helpers) => {
      mutation.mutate(
        { data, id },
        withNotifications({
          notifications: {
            success: {
              title: "Année scolaire mise à jour !",
              description: `Les modifications de '${data.yearName}' ont été enregistrées.`,
            },
            error: {
              title: "Échec de la mise à jour.",
            },
          },
          onSuccess: (res) => {
            notifyAndInvalidate(res);
            helpers.reset();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
  };
}

/**
 * Hook pour la SUPPRESSION d'une année scolaire
 */
export function useDeleteStudyYearForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteStudyYear();

  const deleteStudyYear = useCallback(
    (id: string, yearName?: string) => {
      mutation.mutate(
        id,
        withNotifications({
          notifications: {
            success: {
              title: "Année scolaire supprimée",
              description: yearName
                ? `L'année '${yearName}' a été retirée.`
                : "L'année scolaire a été supprimée.",
            },
            error: {
              title: "Erreur de suppression",
            },
          },
          onSuccess: () => {
            // Signalement propre via le flux d'invalidation centralisé
            notifyAndInvalidate(undefined as void);
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteStudyYear,
    isDeleting: mutation.isPending,
  };
}
