import React from "react";
import { useNavigate } from "react-router";
import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { SchoolForm } from "@/renderer/components/form/school-form";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import type { TSchoolAttributes } from "@/packages/@core/data-access/schema-validations";
import { useCreateSchoolForm } from "@/renderer/components/form/school-form.actions";
import { ConfigHeader } from "./config.header";



export const useSchoolNavigationAndSelection = () => {
    const navigate = useNavigate();
    const setCurrentSchool = useApplicationConfigurationStore(
        (store) => store.setCurrentSchool
    );

    return React.useCallback(
        (school: TSchoolAttributes) => {
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
    const { mutation, formId, onSubmit } = useCreateSchoolForm({
        onSuccess(data) {
            setCurrentSchoolAndNavigate(data as TSchoolAttributes)
        },
    })

    return (
        <div>
            <SchoolForm formId={formId} onSubmit={onSubmit} />
            <div className="flex justify-end pt-4">
                <ButtonLoader
                    type="submit"
                    form={formId}
                    isLoading={mutation.isPending}
                    disabled={mutation.isPending}
                >
                    Enregistrer l'établissement
                </ButtonLoader>
            </div>
        </div>
    );
};

export const SchoolConfigurationNewSchoolScreen: React.FC = () => {
    return (
        <div className="space-y-5">
            <ConfigHeader showBackButton title="Creer l'établissement sur lequel vous souhaitez travailler." />
            <SchoolCreationForm />
        </div>
    )
}