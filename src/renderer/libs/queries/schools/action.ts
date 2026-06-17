import { useCallback } from "react";
import { useCreateSchool, useDeleteSchool, useUpdateSchool } from "./school";
import type {
  School,
  SchoolCreate,
  SchoolUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  type BaseFormProps,
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
} from "../base";

export type SchoolFormConfig = BaseMutationConfig<School>;

/**
 * Hook pour la CRÉATION d'un établissement.
 */
export function useCreateSchoolForm(config?: SchoolFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useCreateSchool();

  const onSubmit: BaseFormProps<SchoolCreate>["onSubmit"] = useCallback(
    (data, helpers) => {
      mutation.mutate(
        data,
        withNotifications({
          notifications: {
            success: {
              title: "Établissement créé !",
              description: `L'établissement '${data.name}' a été ajouté avec succès.`,
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
 * Hook pour la MISE À JOUR d'un établissement.
 */
export function useUpdateSchoolForm(config?: SchoolFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useUpdateSchool();

  const onSubmit: BaseFormProps<QueryUpdatePayload<SchoolUpdate>>["onSubmit"] =
    useCallback(
      ({ data, id }, helpers) => {
        mutation.mutate(
          { data, id },
          withNotifications({
            notifications: {
              success: {
                title: "Établissement mis à jour !",
                description: `Les modifications pour '${data.name}' ont été enregistrées.`,
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
 * Hook pour la SUPPRESSION d'un établissement.
 */
export function useDeleteSchoolForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteSchool();

  const deleteSchool = useCallback(
    (schoolId: string, schoolName?: string) => {
      mutation.mutate(
        schoolId,
        withNotifications({
          notifications: {
            success: {
              title: "Établissement supprimé",
              description: schoolName
                ? `L'établissement '${schoolName}' a été définitivement retiré.`
                : "L'établissement a été supprimé avec succès.",
            },
            error: {
              title: "Erreur de suppression",
              description:
                "Impossible de supprimer l'établissement. Vérifiez s'il est lié à d'autres données.",
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
    deleteSchool,
    isDeleting: mutation.isPending,
  };
}
