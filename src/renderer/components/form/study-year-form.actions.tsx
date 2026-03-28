
import { useCreateStudyYear } from "@/renderer/libs/queries/school";
import type { StudyYearFormData } from "@/renderer/components/form/study-year-form";
import React, { useId } from "react";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";

type UseCreateStudyYearFormParams = {
    onSuccess?(data: StudyYearFormData): void
}
export function useCreateStudyYearForm(params?: UseCreateStudyYearFormParams) {
    const formId = useId()
    const mutation = useCreateStudyYear();

    const onSubmit = React.useCallback(
        (values: StudyYearFormData) => {
            mutation.mutate(values,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Année scolaire créée !",
                    successMessageDescription: `L'année scolaire '${values.yearName}' a été ajoutée avec succès.`,
                    errorMessageTitle: "Échec de la création de l'année scolaire.",
                    onSuccess: params?.onSuccess
                })
            );
        },
        [,]
    );

    return { formId, onSubmit, mutation }
}