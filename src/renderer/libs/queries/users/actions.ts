import { useCallback } from "react";
import type {
  UserCreate,
  UserUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
} from "@/renderer/libs/queries/users";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase, useFormBaseNotify } from "../base";

export type UserFormConfig<T = unknown> = BaseMutationConfig<T>;

const CREATE_USER_NOTIFICATIONS = {
  success: {
    title: "Élève inscrit !",
    description: "L'élève a été ajouté avec succès.",
  },
  error: {
    title: "Erreur d'inscription",
  },
};

const UPDATE_USER_NOTIFICATIONS = {
  success: {
    title: "Dossier mis à jour",
    description: "Les informations ont été modifiées.",
  },
  error: {
    title: "Modification échouée",
  },
};

/**
 * Builds notification configurations for user profile deletions.
 * @param userName - Optional name of the user being removed.
 * @returns Notification configuration object.
 */
const getDeleteUserNotifications = (userName?: string) => ({
  success: {
    title: "Élève supprimé",
    description: userName
      ? `Le profil de '${userName}' a été retiré de la base.`
      : "L'élève a été supprimé.",
  },
  error: {
    title: "Erreur de désinscription",
  },
});

/**
 * Custom form hook for creating user (student) profiles.
 * @param config - Optional base mutation configuration settings.
 * @returns Form state, submit handler, and pending status.
 */
export function useCreateUserForm(config?: BaseMutationConfig<UserCreate>) {
  const mutation = useCreateUser();

  const adaptData = useCallback((data: UserCreate) => data, []);

  return useFormBaseNotify<UserCreate, UserCreate, UserCreate>({
    mutation,
    config,
    getNotifications: () => CREATE_USER_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom form hook for updating existing user profiles.
 * @param config - Optional base mutation configuration settings for UserUpdate.
 * @returns Form state, submit handler, and pending status.
 */
export function useUpdateUserForm(config?: BaseMutationConfig<UserUpdate>) {
  const mutation = useUpdateUser();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<UserUpdate>) => ({ data, id }),
    [],
  );

  return useFormBaseNotify<
    QueryUpdatePayload<UserUpdate>,
    { data: UserUpdate; id: string },
    UserUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_USER_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom hook managing user profile deletion actions and pending state.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing the deleteUser callback and pending state.
 */
export function useDeleteUserForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteUser();

  const deleteUser = useCallback(
    (userId: string, userName?: string) => {
      mutation.mutate(
        userId,
        withNotifications({
          notifications: getDeleteUserNotifications(userName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteUser,
    isDeleting: mutation.isPending,
    onDelete: deleteUser,
  };
}
