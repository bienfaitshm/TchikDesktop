import { TypographyH4 } from "@/renderer/components/ui/typography";
import { useNavigate } from "react-router";

import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { StudyYearForm } from "@/renderer/components/form/study-year-form";
import { useCreateStudyYearForm } from "@/renderer/components/form/study-year-form.actions"

import { ButtonLoader } from "@/renderer/components/form/button-loader";
import React from "react";
import { Button } from "@/renderer/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TStudyYearAttributes } from "@/packages/@core/data-access/schema-validations";

export const useStudyYearNavigationAndSelection = () => {
    const navigate = useNavigate();
    const setCurrentStudyYear = useApplicationConfigurationStore(
        (store) => store.setCurrentStudyYear
    );

    return React.useCallback(
        (studyYear: TStudyYearAttributes) => {
            setCurrentStudyYear(studyYear);
            navigate(`/`)
        },
        []
    );
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
    const currentSchoolId = useApplicationConfigurationStore(
        (store) => store.currentSchool?.schoolId
    );
    const setCurrentStudyYearAndNavigate = useStudyYearNavigationAndSelection();
    const { formId, mutation, onSubmit } = useCreateStudyYearForm({
        onSuccess(data) {
            setCurrentStudyYearAndNavigate(data as TStudyYearAttributes)
        },
    })


    if (!currentSchoolId) {
        return (
            <div className="text-center p-6 text-red-600">
                <TypographyH4>Erreur : Aucun établissement sélectionné.</TypographyH4>
                <p className="mt-2 text-muted-foreground">
                    Veuillez retourner à la page de sélection des établissements pour en choisir un.
                </p>
                <Button onClick={() => navigate(-1)} className="mt-4">
                    Retour à la sélection des établissements
                </Button>
            </div>
        );
    }



    return (
        <div>
            <StudyYearForm formId={formId} initialValues={{ schoolId: currentSchoolId }} onSubmit={onSubmit} />
            <div className="flex justify-end pt-4">
                <ButtonLoader
                    type="submit"
                    form={formId}
                    isLoading={mutation.isPending}
                    disabled={mutation.isPending}
                >
                    Enregistrer l'année scolaire
                </ButtonLoader>
            </div>
        </div>
    );
};

/**
 * @component NewStudyYearConfigurationPage
 * @description This page serves as the interface for creating a new academic/study year
 * within the application. It provides a clear heading and an option to navigate back.
 * @returns {JSX.Element} The rendered page for new study year creation.
 *
 * @example
 * // This component would typically be a route in your application, e.g.:
 * ```tsx
 * // In your router configuration:
 * <Route path="/configuration/school/:schoolId/new-study-year" element={<NewStudyYearConfigurationPage />} />
 * ```
 */
export const NewStudyYearConfigurationPage: React.FC = () => {
    const navigate = useNavigate();
    const currentSchool = useApplicationConfigurationStore(store => store.currentSchool);

    return (
        <div>
            <div className="space-y-5">
                <div className="flex items-center gap-5">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <TypographyH4 className="mb-0 text-center md:text-left">
                        Créer une nouvelle année scolaire pour {currentSchool?.name || "l'établissement sélectionné"}.
                    </TypographyH4>
                </div>
                <StudyYearCreationForm />
            </div>
        </div>
    );
};