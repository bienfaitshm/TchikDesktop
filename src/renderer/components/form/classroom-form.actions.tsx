import { useCallback, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { useCreateClassroom, useUpdateClassroom, useDeleteClassroom } from "@/renderer/libs/queries/classroom";
import { createSuggestion, type ClassroomFormData } from "./classroom-form.utils";
import type { TQueryUpdate } from "@/renderer/libs/queries/type";
import type { BaseFormProps } from "./base-form"
/**
 * Options de configuration pour les hooks de formulaire de salle de classe.
 */
export interface UseClassroomFormOptions {
    mutationKeys?: unknown[];
    onSuccess?: (data?: ClassroomFormData) => void;
}

/**
 * Hook interne partagé (Private Pattern) pour respecter le principe DRY.
 * Centralise la gestion des suggestions et des invalidations de cache.
 */
function useBaseClassroomForm(schoolId: string, options?: UseClassroomFormOptions) {
    const formId = useId();
    const queryClient = useQueryClient();
    const { options: selectItems, data: rawOptions } = useGetOptionAsOptions(schoolId);

    const generateSuggestion = useCallback(
        (optionId: string, currentName: string) => {
            if (!rawOptions) return null;
            return createSuggestion(rawOptions, optionId, currentName);
        },
        [rawOptions]
    );

    const handleMutationSuccess = useCallback(
        (data: ClassroomFormData) => {
            if (options?.mutationKeys) {
                queryClient.invalidateQueries({ queryKey: options.mutationKeys });
            }
            options?.onSuccess?.(data);
        },
        [queryClient, options]
    );

    return {
        formId,
        selectItems,
        rawOptions,
        generateSuggestion,
        handleMutationSuccess,
    };
}

/**
 * Hook pour la CRÉATION d'une salle de classe.
 */
export function useCreateClassroomForm(schoolId: string, options?: UseClassroomFormOptions) {
    const base = useBaseClassroomForm(schoolId, options);
    const mutation = useCreateClassroom();

    const onSubmit: BaseFormProps<ClassroomFormData>["onSubmit"] = useCallback(
        (data, helpers) => {
            mutation.mutate(
                data,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Salle de classe créée !",
                    successMessageDescription: `La salle '${data.identifier}' a été ajoutée avec succès.`,
                    errorMessageTitle: "Échec de la création.",
                    onSuccess: (data) => {
                        base.handleMutationSuccess(data)
                        helpers.reset?.()
                    },
                })
            );
        },
        [mutation, base.handleMutationSuccess]
    );

    return { ...base, onSubmit, isLoading: mutation.isPending };
}

/**
 * Hook pour la MISE À JOUR d'une salle de classe.
 */
export function useUpdateClassroomForm(schoolId: string, options?: UseClassroomFormOptions) {
    const base = useBaseClassroomForm(schoolId, options);
    const mutation = useUpdateClassroom();

    const onSubmit: BaseFormProps<TQueryUpdate<ClassroomFormData>>["onSubmit"] = useCallback(
        ({ data, id }, helpers) => {
            mutation.mutate(
                { data, id },
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Salle de classe mise à jour !",
                    successMessageDescription: `Les modifications de '${data.identifier}' ont été enregistrées.`,
                    errorMessageTitle: "Échec de la mise à jour.",
                    onSuccess: (data) => {
                        base.handleMutationSuccess(data);
                        helpers.reset?.()
                    },
                })
            );
        },
        [mutation, base.handleMutationSuccess]
    );

    return { ...base, onSubmit, isLoading: mutation.isPending };
}

/**
 * Hook pour la SUPPRESSION d'une salle de classe.
 */
export function useDeleteClassroomForm(options?: UseClassroomFormOptions) {
    const mutation = useDeleteClassroom();

    const onSubmit = useCallback(
        (classId: string, identifier?: string) => {
            mutation.mutate(
                classId,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Salle de classe supprimée",
                    successMessageDescription: identifier
                        ? `La salle '${identifier}' a été définitivement retirée.`
                        : "La salle de classe a été supprimée avec succès.",
                    errorMessageTitle: "Erreur de suppression",
                    errorMessageDescription: "Impossible de supprimer la salle. Elle est peut-être liée à d'autres données.",
                    onSuccess: () => options?.onSuccess?.()
                })
            );
        },
        [mutation, options?.onSuccess]
    );

    return {
        isLoading: mutation.isPending,
        onSubmit
    };
}