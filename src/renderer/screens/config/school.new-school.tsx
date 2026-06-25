import React from "react";
import { useNavigate } from "react-router";
import { useConfigActions } from "@/renderer/libs/stores/app-store";
import { SchoolForm } from "@/renderer/components/form/school-form";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import type { School } from "@/packages/@core/data-access/db/schemas";
import { useCreateSchoolForm } from "@/renderer/libs/queries/schools";
import { ConfigHeader } from "./config.header";

export const useSchoolNavigationAndSelection = () => {
  const navigate = useNavigate();
  const configActions = useConfigActions();

  return React.useCallback(
    (school: School) => {
      configActions.setCurrentSchool(school);
      navigate(`/configuration/school-year`);
    },
    [configActions, navigate],
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
  const { isSubmitting, formId, onSubmit } = useCreateSchoolForm({
    onSuccess(data) {
      setCurrentSchoolAndNavigate(data as School);
    },
  });

  return (
    <div>
      <SchoolForm formId={formId} onSubmit={onSubmit} />
      <div className="flex justify-end pt-4">
        <ButtonLoader
          type="submit"
          form={formId}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Enregistrer l'établissement
        </ButtonLoader>
      </div>
    </div>
  );
};

export const ConfigCreateSchoolPage: React.FC = () => {
  return (
    <div className="space-y-5">
      <ConfigHeader
        showBackButton
        title="Creer l'établissement sur lequel vous souhaitez travailler."
      />
      <SchoolCreationForm />
    </div>
  );
};
