import { TypographyH4 } from "@/renderer/components/ui/typography";
import { useNavigate } from "react-router";
import { useCreateSchool } from "@/renderer/libs/queries/school";

import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { SchoolForm, type SchoolFormData } from "@/renderer/components/form/school-form";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import React from "react";
import type { SchoolAttributes } from "@/camons/types/models";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { Button } from "@/renderer/components/ui/button";
import { ArrowLeft } from "lucide-react";



/**
 * @function useSchoolNavigationAndSelection
 * @description A custom hook that encapsulates the logic for navigating to the school year configuration
 * page and setting the currently selected school in the global application store.
 * @returns {(school: SchoolAttributes) => void} A function that takes `SchoolAttributes` and
 * performs the necessary navigation and state update.
 */
export const useSchoolNavigationAndSelection = () => {
    const navigate = useNavigate();
    const setCurrentSchool = useApplicationConfigurationStore(
        (store) => store.setCurrentSchool
    );

    return React.useCallback(
        (school: SchoolAttributes) => {
            setCurrentSchool(school);
            navigate(`/configuration/school-year`);
        },
        [setCurrentSchool, navigate]
    );
};

/**
 * @component SchoolCreationForm
 * @description A component that renders a form for creating a new school.
 * Upon successful creation, it sets the newly created school as the current school
 * in the application store and navigates to its configuration page.
 * @returns {JSX.Element} The school creation form.
 */
export const SchoolCreationForm: React.FC = () => {
    const setCurrentSchoolAndNavigate = useSchoolNavigationAndSelection();
    const mutation = useCreateSchool();

    const onSubmit = React.useCallback(
        (values: SchoolFormData) => {
            mutation.mutate(
                values,
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Établissement créé !",
                    successMessageDescription: `L'établissement '${values.name}' a été ajouté avec succès.`,
                    errorMessageTitle: "Échec de la création de l'établissement.",
                    onSuccess(data) {
                        setCurrentSchoolAndNavigate(data as SchoolAttributes);
                    },
                })
            );
        },
        [mutation, setCurrentSchoolAndNavigate]
    );

    return (
        <div>
            <SchoolForm onSubmit={onSubmit}>
                <div className="flex justify-end pt-4"> {/* Added padding top */}
                    <ButtonLoader
                        isLoading={mutation.isPending}
                        disabled={mutation.isPending}
                    >
                        Enregistrer l'établissement
                    </ButtonLoader>
                </div>
            </SchoolForm>
        </div>
    );
};

export const SchoolConfigurationNewSchoolScreen: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-5">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft />
                </Button>
                <TypographyH4 className="mb-0 text-center md:text-left">
                    Creer l'établissement sur lequel vous souhaitez travailler.
                </TypographyH4>
            </div>
            <SchoolCreationForm />
        </div>
    )
}