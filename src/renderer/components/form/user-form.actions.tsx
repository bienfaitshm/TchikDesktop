import { useCallback, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { useCreateUser, useDeleteUser, useUpdateUser } from "@/renderer/libs/queries/account";
import { TQueryUpdate } from "@/renderer/libs/queries/type";
import type { TUserCreate as UserFormData } from "@/packages/@core/data-access/schema-validations";
import type { BaseFormProps } from "./base-form";

interface UseUserFormConfig {
    mutationKeys?: unknown[];
    onSuccess?: (data?: any) => void;
}

/**
 * Abstraction de base pour la gestion des formulaires Élèves
 */
function useUserFormBase(config?: UseUserFormConfig) {
    const formId = useId();
    const queryClient = useQueryClient();

    const handleSuccess = useCallback(
        (data: any) => {
            if (config?.mutationKeys) {
                queryClient.invalidateQueries({ queryKey: config.mutationKeys });
            }
            config?.onSuccess?.(data);
        },
        [queryClient, config]
    );

    return { formId, handleSuccess };
}

/**
 * Hook pour l'INSCRIPTION (Création) d'un élève
 */
export function useCreateUserForm(config?: UseUserFormConfig) {
    const { formId, handleSuccess } = useUserFormBase(config);
    const mutation = useCreateUser();

    const createUser: BaseFormProps<UserFormData>["onSubmit"] = useCallback(
        (data, helpers) => {
            mutation.mutate(
                data,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Élève inscrit !",
                    successMessageDescription: `L'élève '${data.lastName} ${data.firstName}' a été ajouté avec succès.`,
                    errorMessageTitle: "Erreur d'inscription",
                    onSuccess: (res) => {
                        handleSuccess(res);
                        helpers?.reset?.();
                    },
                })
            );
        },
        [mutation, handleSuccess]
    );

    return { formId, createUser, isCreating: mutation.isPending };
}

/**
 * Hook pour la MISE À JOUR du dossier élève
 */
export function useUpdateUserForm(config?: UseUserFormConfig) {
    const { formId, handleSuccess } = useUserFormBase(config);
    const mutation = useUpdateUser();

    const updateUser: BaseFormProps<TQueryUpdate<UserFormData>>["onSubmit"] = useCallback(
        ({ data, id }, helpers) => {
            mutation.mutate(
                { data, id },
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Dossier mis à jour",
                    successMessageDescription: `Les informations de '${data.lastName}' ont été modifiées.`,
                    errorMessageTitle: "Modification échouée",
                    onSuccess: (res) => {
                        handleSuccess(res);
                        helpers?.reset?.();
                    },
                })
            );
        },
        [mutation, handleSuccess]
    );

    return { formId, updateUser, isUpdating: mutation.isPending };
}

/**
 * Hook pour la DÉSINCRIPTION (Suppression) d'un élève
 */
export function useDeleteUserForm(config?: UseUserFormConfig) {
    const mutation = useDeleteUser();

    const deleteUser = useCallback(
        (userId: string, userName?: string) => {
            mutation.mutate(
                userId,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Élève supprimé",
                    successMessageDescription: userName
                        ? `Le profil de '${userName}' a été retiré de la base.`
                        : "L'élève a été supprimé.",
                    onSuccess: () => config?.onSuccess?.()
                })
            );
        },
        [mutation, config]
    );

    return { deleteUser, isDeleting: mutation.isPending };
}