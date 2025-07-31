import { TypographyH4 } from "@/renderer/components/ui/typography";
import { useNavigate } from "react-router";
import { useCreateStudyYear } from "@/renderer/libs/queries/school";

import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { StudyYearForm, type StudyYearFormData } from "@/renderer/components/form/study-year-form";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import React from "react";
import type { StudyYearAttributes } from "@/camons/types/models";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { Button } from "@/renderer/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * @function useStudyYearNavigationAndSelection
 * @description A custom hook that encapsulates the logic for navigating to a relevant page
 * after a study year operation and setting the newly selected/created study year
 * in the global application configuration store.
 * @returns {(studyYear: StudyYearAttributes) => void} A function that takes `StudyYearAttributes` and
 * performs the necessary state update and navigation.
 */
export const useStudyYearNavigationAndSelection = () => {
    const navigate = useNavigate();
    const setCurrentStudyYear = useApplicationConfigurationStore(
        (store) => store.setCurrentStudyYear
    );
    const currentSchoolId = useApplicationConfigurationStore(
        (store) => store.currentSchool?.schoolId
    );

    return React.useCallback(
        (studyYear: StudyYearAttributes) => {
            setCurrentStudyYear(studyYear);
            navigate(`/`)
        },
        [setCurrentStudyYear, navigate, currentSchoolId]
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
    const mutation = useCreateStudyYear();

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

    const onSubmit = React.useCallback(
        (values: StudyYearFormData) => {
            console.log("StudyYearFormData", values)
            mutation.mutate(
                { data: values, schoolId: currentSchoolId }, // Pass schoolId from store
                createMutationCallbacksWithNotifications({
                    successMessageTitle: "Année scolaire créée !",
                    successMessageDescription: `L'année scolaire '${values.yearName}' a été ajoutée avec succès.`,
                    errorMessageTitle: "Échec de la création de l'année scolaire.",
                    onSuccess(data) {
                        // Assuming 'data' from useCreateStudyYear is StudyYearAttributes
                        setCurrentStudyYearAndNavigate(data as StudyYearAttributes);
                    },
                })
            );
        },
        [mutation, setCurrentStudyYearAndNavigate, currentSchoolId]
    );

    return (
        <div >
            {/* <TypographyH4 className="mb-4 text-center">
                Créer une nouvelle année scolaire
            </TypographyH4> */}
            <StudyYearForm initialValues={{ schoolId: currentSchoolId }} onSubmit={onSubmit}>
                <div className="flex justify-end pt-4">
                    <ButtonLoader
                        isLoading={mutation.isPending}
                        disabled={mutation.isPending}
                    >
                        Enregistrer l'année scolaire
                    </ButtonLoader>
                </div>
            </StudyYearForm>
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