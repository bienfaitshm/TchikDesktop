
import { useCreateSchool } from "@/renderer/libs/queries/school";
import type { SchoolFormData } from "@/renderer/components/form/school-form";
import React, { useId } from "react";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";

type UseCreateSchoolFormParams = {
    onSuccess?(data: SchoolFormData): void
}
export function useCreateSchoolForm(params?: UseCreateSchoolFormParams) {
    const formId = useId()
    const mutation = useCreateSchool();

    const onSubmit = React.useCallback(
        (values: SchoolFormData) => {
            mutation.mutate(
                values,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Établissement créé !",
                    successMessageDescription: `L'établissement '${values.name}' a été ajouté avec succès.`,
                    errorMessageTitle: "Échec de la création de l'établissement.",
                    onSuccess: params?.onSuccess,
                })
            );
        },
        [mutation, params?.onSuccess]
    );

    return { formId, onSubmit, mutation }
}