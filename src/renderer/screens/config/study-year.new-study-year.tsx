import { TypographyH4 } from "@/renderer/components/ui/typography";
import { useNavigate } from "react-router";

import {
  useCurrentConfig,
  useConfigActions,
} from "@/renderer/libs/stores/app-store";
import { StudyYearForm } from "@/renderer/components/form/study-year-form";
import { useCreateStudyYearForm } from "@/renderer/libs/queries/study-years";

import { ButtonLoader } from "@/renderer/components/form/button-loader";
import React from "react";
import { Button } from "@/renderer/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { StudyYear } from "@/packages/@core/data-access/schema-validations";

export const useStudyYearNavigationAndSelection = () => {
  const navigate = useNavigate();
  const configActions = useConfigActions();

  return React.useCallback((studyYear: StudyYear) => {
    configActions.setCurrentStudyYear(studyYear);
    navigate(`/`);
  }, []);
};

/**
 * @component StudyYearCreationForm
 * @description A component that renders a form for creating a new academic/study year.
 * Upon successful creation, it sets the newly created study year as the current one
 * in the application store and navigates to the relevant configuration page.
 * It requires a `schoolId` from the global store to associate the new study year.
 * @returns {JSX.Element} The study year creation form.
 */
export const StudyYearCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const { schoolId: currentSchoolId } = useCurrentConfig();
  const setCurrentStudyYearAndNavigate = useStudyYearNavigationAndSelection();
  const { formId, isSubmitting, onSubmit } = useCreateStudyYearForm({
    onSuccess(data) {
      setCurrentStudyYearAndNavigate(data as StudyYear);
    },
  });

  if (!currentSchoolId) {
    return (
      <div className="text-center p-6 text-red-600">
        <TypographyH4>Erreur : Aucun établissement sélectionné.</TypographyH4>
        <p className="mt-2 text-muted-foreground">
          Veuillez retourner à la page de sélection des établissements pour en
          choisir un.
        </p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Retour à la sélection des établissements
        </Button>
      </div>
    );
  }

  return (
    <div>
      <StudyYearForm
        formId={formId}
        initialValues={{ schoolId: currentSchoolId }}
        onSubmit={onSubmit}
      />
      <div className="flex justify-end pt-4">
        <ButtonLoader
          type="submit"
          form={formId}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Enregistrer l'année scolaire
        </ButtonLoader>
      </div>
    </div>
  );
};

export const NewStudyYearConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { school: currentSchool } = useCurrentConfig();

  return (
    <div>
      <div className="space-y-5">
        <div className="flex items-center gap-5">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <TypographyH4 className="mb-0 text-center md:text-left">
            Créer une nouvelle année scolaire pour{" "}
            {currentSchool?.name || "l'établissement sélectionné"}.
          </TypographyH4>
        </div>
        <StudyYearCreationForm />
      </div>
    </div>
  );
};
