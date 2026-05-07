import  { useId, useCallback } from "react";
import { 
    useCreateStudyYear, 
    useUpdateStudyYear, 
    useDeleteStudyYear 
} from "@/renderer/libs/queries/school";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import type { StudyYearFormData } from "@/renderer/components/form/study-year-form";

type StudyYearFormOptions = {
    onSuccess?(data?: any): void;
};

/**
 * Hook pour la CRÉATION d'une année scolaire
 */
export function useCreateStudyYearForm(options?: StudyYearFormOptions) {
    const formId = useId();
    const mutation = useCreateStudyYear();

    const onSubmit = useCallback(
        (values: StudyYearFormData) => {
            mutation.mutate(
                values,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Année scolaire créée !",
                    successMessageDescription: `L'année scolaire '${values.yearName}' a été ajoutée avec succès.`,
                    errorMessageTitle: "Échec de la création.",
                    onSuccess: options?.onSuccess
                })
            );
        },
        [mutation, options]
    );

    return { formId, onSubmit, mutation, isLoading: mutation.isPending };
}

/**
 * Hook pour la MISE À JOUR d'une année scolaire
 */
export function useUpdateStudyYearForm(options?: StudyYearFormOptions) {
    const formId = useId();
    const mutation = useUpdateStudyYear();

    const onSubmit = useCallback(
        ({ id, data }: { id: string; data: StudyYearFormData }) => {
            mutation.mutate(
                { id, data },
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Année scolaire mise à jour !",
                    successMessageDescription: `Les modifications de '${data.yearName}' ont été enregistrées.`,
                    errorMessageTitle: "Échec de la mise à jour.",
                    onSuccess: options?.onSuccess
                })
            );
        },
        [mutation, options]
    );

    return { formId, onSubmit, mutation, isLoading: mutation.isPending };
}

/**
 * Hook pour la SUPPRESSION d'une année scolaire
 */
export function useDeleteStudyYearForm(options?: StudyYearFormOptions) {
    const mutation = useDeleteStudyYear();

    const onSubmit = useCallback(
        (id: string, yearName?: string) => {
            mutation.mutate(
                id,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Année scolaire supprimée",
                    successMessageDescription: yearName
                        ? `L'année '${yearName}' a été retirée.`
                        : "L'année scolaire a été supprimée.",
                    errorMessageTitle: "Erreur de suppression",
                    onSuccess: options?.onSuccess
                })
            );
        },
        [mutation, options]
    );

    return {
        onSubmit,
        isLoading: mutation.isPending
    };
}