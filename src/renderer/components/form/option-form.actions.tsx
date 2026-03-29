import { useCallback, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { useCreateOption, useDeleteOption, useUpdateOption } from "@/renderer/libs/queries/option";
import { TQueryUpdate } from "@/renderer/libs/queries/type";
import type { TOptionCreate as OptionFormData } from "@/packages/@core/data-access/schema-validations";

interface UseOptionFormConfig {
    mutationKeys?: unknown[];
    onSuccess?: (data?: OptionFormData) => void;
}

/**
 * Hook interne pour la logique partagée des formulaires d'Option.
 */
function useOptionFormBase(config?: UseOptionFormConfig) {
    const formId = useId();
    const queryClient = useQueryClient();

    const notifyAndInvalidate = useCallback(
        (data: OptionFormData) => {
            if (config?.mutationKeys) {
                queryClient.invalidateQueries({ queryKey: config.mutationKeys });
            }
            config?.onSuccess?.(data);
        },
        [queryClient, config]
    );

    return {
        formId,
        notifyAndInvalidate,
    };
}

/**
 * Hook pour la CRÉATION d'une option.
 */
export function useCreateOptionForm(config?: UseOptionFormConfig) {
    const { formId, notifyAndInvalidate } = useOptionFormBase(config);
    const mutation = useCreateOption();

    const createOption = useCallback(
        (data: OptionFormData) => {
            mutation.mutate(
                data,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Filière créée !",
                    successMessageDescription: `La filière '${data.optionName}' a été ajoutée.`,
                    errorMessageTitle: "Échec de la création.",
                    onSuccess: notifyAndInvalidate,
                })
            );
        },
        [mutation, notifyAndInvalidate]
    );

    return { formId, createOption, isCreating: mutation.isPending };
}

/**
 * Hook pour la MISE À JOUR d'une option.
 */
export function useUpdateOptionForm(config?: UseOptionFormConfig) {
    const { formId, notifyAndInvalidate } = useOptionFormBase(config);
    const mutation = useUpdateOption();

    const updateOption = useCallback(
        ({ data, id }: TQueryUpdate<OptionFormData>) => {
            mutation.mutate(
                { data, id },
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Filière mise à jour !",
                    successMessageDescription: `Les modifications de '${data.optionName}' ont été enregistrées.`,
                    errorMessageTitle: "Échec de la mise à jour.",
                    onSuccess: notifyAndInvalidate,
                })
            );
        },
        [mutation, notifyAndInvalidate]
    );

    return { formId, updateOption, isUpdating: mutation.isPending };
}

/**
 * Hook pour la SUPPRESSION d'une option.
 */
export function useDeleteOptionForm(config?: UseOptionFormConfig) {
    const mutation = useDeleteOption();

    const deleteOption = useCallback(
        (optionId: string, optionName?: string) => {
            mutation.mutate(
                optionId,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Filière supprimée",
                    successMessageDescription: optionName
                        ? `La filière '${optionName}' a été retirée.`
                        : "La filière a été supprimée.",
                    onSuccess: () => config?.onSuccess?.()
                })
            );
        },
        [mutation, config]
    );

    return { deleteOption, isDeleting: mutation.isPending };
}