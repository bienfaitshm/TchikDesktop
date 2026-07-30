import React from "react";
import { useNavigate } from "react-router";
import { useConfigActions } from "@/renderer/libs/stores/app-store";
import { SchoolForm } from "@/renderer/components/form/school-form";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import type { School } from "@/packages/@core/data-access/db";
import { useCreateSchoolForm } from "@/renderer/libs/queries/schools";
import { ConfigHeader } from "./config.header";
import { APP_ROUTES } from "@/renderer/constants";

export const useSchoolNavigationAndSelection = () => {
  const navigate = useNavigate();
  const configActions = useConfigActions();

  return React.useCallback(
    (school: School) => {
      configActions.setCurrentSchool(school);
      navigate(APP_ROUTES.CONFIGURATION.SCHOOL_YEAR);
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
      setCurrentSchoolAndNavigate(data);
    },
  });

  return (
    <div className="w-full space-y-6 mt-4">
      <SchoolForm formId={formId} onSubmit={onSubmit} />
      <div className="flex justify-end pt-4">
        <LoadingButton
          size="sm"
          type="submit"
          form={formId}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Enregistrer l'établissement
        </LoadingButton>
      </div>
    </div>
  );
};

export const ConfigCreateSchoolPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <ConfigHeader
        showBackButton
        title="Creer l'établissement sur lequel vous souhaitez travailler."
      />
      <div className="mt-10">
        <SchoolCreationForm />
      </div>
    </div>
  );
};
