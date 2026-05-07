import { useCallback, useId } from "react";
import { useCreateSchool, useDeleteSchool, useUpdateSchool } from "@/renderer/libs/queries/school";
import type { SchoolFormData } from "@/renderer/components/form/school-form";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";

/**
 * Types partagés pour les options des formulaires School
 */
type SchoolFormOptions = {
    onSuccess?(data?: any): void;
};

/**
 * Hook pour la CRÉATION d'un établissement.
 */
export function useCreateSchoolForm(options?: SchoolFormOptions) {
    const formId = useId();
    const mutation = useCreateSchool();

    const onSubmit = useCallback(
        (values: SchoolFormData) => {
            mutation.mutate(
                values,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Établissement créé !",
                    successMessageDescription: `L'établissement '${values.name}' a été ajouté avec succès.`,
                    errorMessageTitle: "Échec de la création.",
                    onSuccess: options?.onSuccess,
                })
            );
        },
        [mutation, options]
    );

    return { formId, onSubmit, mutation, isLoading: mutation.isPending };
}

/**
 * Hook pour la MISE À JOUR d'un établissement.
 */
export function useUpdateSchoolForm(options?: SchoolFormOptions) {
    const formId = useId();
    const mutation = useUpdateSchool();

    const onSubmit = useCallback(
        ({ id, data }: { id: string; data: SchoolFormData }) => {
            mutation.mutate(
                { id, data },
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Établissement mis à jour !",
                    successMessageDescription: `Les modifications pour '${data.name}' ont été enregistrées.`,
                    errorMessageTitle: "Échec de la mise à jour.",
                    onSuccess: options?.onSuccess,
                })
            );
        },
        [mutation, options]
    );

    return { formId, onSubmit, mutation, isLoading: mutation.isPending };
}

/**
 * Hook pour la SUPPRESSION d'un établissement.
 */
export function useDeleteSchoolForm(options?: SchoolFormOptions) {
    const mutation = useDeleteSchool();

    const onSubmit = useCallback(
        (schoolId: string, schoolName?: string) => {
            mutation.mutate(
                schoolId,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Établissement supprimé",
                    successMessageDescription: schoolName
                        ? `L'établissement '${schoolName}' a été définitivement retiré.`
                        : "L'établissement a été supprimé avec succès.",
                    errorMessageTitle: "Erreur de suppression",
                    errorMessageDescription: "Impossible de supprimer l'établissement. Vérifiez s'il est lié à d'autres données.",
                    onSuccess: options?.onSuccess
                })
            );
        },
        [mutation, options]
    );

    return {
        onSubmit,
        isLoading: mutation.isPending,
        mutation
    };
}