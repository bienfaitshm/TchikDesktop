import { useCallback, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { useCreateClassroom, useUpdateClassroom } from "@/renderer/libs/queries/classroom";
import { createSuggestion, type ClassroomFormData } from "./classroom-form.utils";
import { TQueryUpdate } from "@/renderer/libs/queries/type";

/**
 * Options de configuration pour les hooks de formulaire de salle de classe.
 */
interface UseClassroomFormOptions {
    mutationKeys?: unknown[];
    onSuccess?: (data: ClassroomFormData) => void;
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

    const onSubmit = useCallback(
        (data: ClassroomFormData) => {
            mutation.mutate(
                data,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Salle de classe créée !",
                    successMessageDescription: `La salle '${data.identifier}' a été ajoutée avec succès.`,
                    errorMessageTitle: "Échec de la création.",
                    onSuccess: base.handleMutationSuccess,
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

    const onSubmit = useCallback(
        ({ data, id }: TQueryUpdate<ClassroomFormData>) => {
            mutation.mutate(
                { data, id },
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Salle de classe mise à jour !",
                    successMessageDescription: `Les modifications de '${data.identifier}' ont été enregistrées.`,
                    errorMessageTitle: "Échec de la mise à jour.",
                    onSuccess: base.handleMutationSuccess,
                })
            );
        },
        [mutation, base.handleMutationSuccess]
    );

    return { ...base, onSubmit, isLoading: mutation.isPending };
}