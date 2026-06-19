import { useCallback } from "react";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
} from "@/renderer/libs/queries/users";
import type {
  UserCreate,
  UserUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  type BaseFormProps,
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
} from "../base";

export type UserFormConfig = BaseMutationConfig<any>;

/**
 * Hook pour l'INSCRIPTION (Création) d'un élève.
 */
export function useCreateUserForm(config?: UserFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useCreateUser();

  const onSubmit: BaseFormProps<UserCreate>["onSubmit"] = useCallback(
    (data, helpers) => {
      mutation.mutate(
        data,
        withNotifications({
          notifications: {
            success: {
              title: "Élève inscrit !",
              description: `L'élève '${data.lastName} ${data.firstName}' a été ajouté avec succès.`,
            },
            error: {
              title: "Erreur d'inscription",
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
 * Hook pour la MISE À JOUR du dossier élève.
 */
export function useUpdateUserForm(config?: UserFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useUpdateUser();

  const onSubmit: BaseFormProps<QueryUpdatePayload<UserUpdate>>["onSubmit"] =
    useCallback(
      ({ data, id }, helpers) => {
        mutation.mutate(
          { data, id },
          withNotifications({
            notifications: {
              success: {
                title: "Dossier mis à jour",
                description: `Les informations de '${data.lastName}' ont été modifiées.`,
              },
              error: {
                title: "Modification échouée",
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
 * Hook pour la DÉSINCRIPTION (Suppression) d'un élève.
 */
export function useDeleteUserForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteUser();

  const deleteUser = useCallback(
    (userId: string, userName?: string) => {
      mutation.mutate(
        userId,
        withNotifications({
          notifications: {
            success: {
              title: "Élève supprimé",
              description: userName
                ? `Le profil de '${userName}' a été retiré de la base.`
                : "L'élève a été supprimé.",
            },
            error: {
              title: "Erreur de désinscription",
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
    deleteUser,
    isDeleting: mutation.isPending,
  };
}
