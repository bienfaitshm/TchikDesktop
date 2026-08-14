import type {
  TutorCreate,
  TutorUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  useCreateTutor,
  useDeleteTutor,
  useUpdateTutor,
} from "@/renderer/libs/queries/tutors";
import type { BaseMutationConfig } from "../base";
import {
  useFormBaseCreate,
  useFormBaseDelete,
  useFormBaseUpdate,
} from "../base";

/** Base mutation configuration type for tutor form hooks. */
export type TutorFormConfig<T = unknown> = BaseMutationConfig<T>;
export type TutorFormData = unknown;

const CREATE_TUTOR_NOTIFICATIONS = {
  success: {
    title: "Tuteur inscrit !",
    description: "Le tuteur a été ajouté avec succès.",
  },
  error: {
    title: "Erreur d'inscription",
  },
};

const UPDATE_TUTOR_NOTIFICATIONS = {
  success: {
    title: "Fiche mise à jour",
    description: "Les informations ont été modifiées.",
  },
  error: {
    title: "Modification échouée",
  },
};

/**
 * Builds notification configurations for tutor profile deletions.
 * @param tutorName - Optional display name of the tutor being removed.
 * @returns Object containing formatted success and error notification text.
 */
const getDeleteTutorNotifications = (tutorName?: string) => ({
  success: {
    title: "Tuteur supprimé",
    description: tutorName
      ? `Le profil de '${tutorName}' a été retiré de la base.`
      : "Le tuteur a été supprimé.",
  },
  error: {
    title: "Erreur de suppression",
  },
});

/**
 * Custom form hook for creating tutor profiles.
 * @param config - Optional mutation configuration settings for creation.
 * @returns Form state handlers, submit callback, and pending state.
 */
export function useCreateTutorForm(config?: BaseMutationConfig<TutorCreate>) {
  return useFormBaseCreate({
    config,
    useCreate: useCreateTutor,
    notification: CREATE_TUTOR_NOTIFICATIONS,
  });
}

/**
 * Custom form hook for updating existing tutor profiles.
 * @param config - Optional mutation configuration settings for update.
 * @returns Form state handlers, submit callback, and pending state.
 */
export function useUpdateTutorForm(config?: BaseMutationConfig<TutorUpdate>) {
  return useFormBaseUpdate({
    useUpdate: useUpdateTutor,
    config,
    notification: UPDATE_TUTOR_NOTIFICATIONS,
  });
}

/**
 * Custom hook managing tutor profile deletion.
 * @param config - Optional mutation configuration settings for deletion.
 * @returns Object containing the deletion callback and pending state.
 */
export function useDeleteTutorForm(config?: BaseMutationConfig<void>) {
  return useFormBaseDelete({
    useDelete: useDeleteTutor,
    config,
    getNotifications: getDeleteTutorNotifications,
  });
}
