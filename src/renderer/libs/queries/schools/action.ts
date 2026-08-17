import { useCallback } from "react";
import type {
  SchoolCreate,
  SchoolUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase, useFormBaseNotify } from "../base";
import { useCreateSchool, useDeleteSchool, useUpdateSchool } from "./school";
import type { School } from "@/packages/@core/data-access/db";

export type SchoolFormConfig = BaseMutationConfig<School>;

const CREATE_SCHOOL_NOTIFICATIONS = {
  success: {
    title: "Établissement créé !",
    description: "L'établissement a été ajouté avec succès.",
  },
  error: {
    title: "Échec de la création.",
  },
};

const UPDATE_SCHOOL_NOTIFICATIONS = {
  success: {
    title: "Établissement mis à jour !",
    description: "Les modifications ont été enregistrées.",
  },
  error: {
    title: "Échec de la mise à jour.",
  },
};

/**
 * Builds notification configurations for school deletions.
 * @param schoolName - Optional name of the school being removed.
 * @returns Notification configuration object.
 */
const getDeleteSchoolNotifications = (schoolName?: string) => ({
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
});

/**
 * Custom form hook for creating school entities.
 * @param config - Optional base mutation configuration settings.
 * @returns Form state, submit handler, and pending status.
 */
export function useCreateSchoolForm(config?: SchoolFormConfig) {
  const mutation = useCreateSchool();

  const adaptData = useCallback((data: SchoolCreate) => data, []);

  return useFormBaseNotify<SchoolCreate, SchoolCreate, School>({
    mutation,
    config,
    getNotifications: () => CREATE_SCHOOL_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom form hook for updating existing school entities.
 * @param config - Optional base mutation configuration settings for SchoolUpdate.
 * @returns Form state, submit handler, and pending status.
 */
export function useUpdateSchoolForm(config?: BaseMutationConfig<SchoolUpdate>) {
  const mutation = useUpdateSchool();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<SchoolUpdate>) => ({ data, id }),
    [],
  );

  return useFormBaseNotify<
    QueryUpdatePayload<SchoolUpdate>,
    { data: SchoolUpdate; id: string },
    SchoolUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_SCHOOL_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom hook managing school deletion actions and pending state.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing the delete callback and pending state.
 */
export function useDeleteSchoolForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteSchool();

  const onDelete = useCallback(
    (schoolId: string, schoolName?: string) => {
      mutation.mutate(
        schoolId,
        withNotifications({
          notifications: getDeleteSchoolNotifications(schoolName),
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
