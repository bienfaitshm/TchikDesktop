import { TypographyH4 } from "@/renderer/components/ui/typography";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/renderer/components/ui/table";
import { Link } from "react-router";
import { useGetStudyYears } from "@/renderer/libs/queries/school";
import { Suspense as DataSuspense } from "@/renderer/libs/queries/suspense";
import React from "react";
import { format } from "date-fns";

import { StudyYearCreationForm, useStudyYearNavigationAndSelection } from "./study-year.new-study-year";
import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { Button } from "@/renderer/components/ui/button";
import { ConfigHeader } from "./config.header";

/**
 * @interface StudyYearDataDisplay
 * @description Defines the expected structure for study year data retrieved for display.
 * Ensure this matches the actual type returned by your `useGetStudyYears` hook.
 * @property {string} yearId - Unique identifier for the study year.
 * @property {string} schoolId - ID of the associated school.
 * @property {string} yearName - The name of the academic year.
 * @property {Date | string} startDate - The start date of the study year.
 * @property {Date | string} endDate - The end date of the study year.
 */
interface StudyYearDataDisplay {
    yearId: string;
    schoolId: string;
    yearName: string;
    startDate: Date;
    endDate: Date;
}

/**
 * @component StudyYearListDisplayTable
 * @description Displays a table of available academic years for the currently selected school.
 * If no study years are found, it prompts the user to create a new one by rendering the `StudyYearCreationForm`.
 * Each table row is clickable, allowing users to select a study year and set it as the current context.
 * @returns {JSX.Element} The table of study years or the creation form.
 */
const StudyYearListDisplayTable: React.FC = () => {
    const setCurrentStudyYearAndNavigate = useStudyYearNavigationAndSelection();
    const currentSchool = useApplicationConfigurationStore((store) => store.currentSchool);

    if (!currentSchool?.schoolId) {
        return (
            <div className="p-6 text-center text-red-600">
                <TypographyH4>Aucun établissement sélectionné.</TypographyH4>
                <p className="mt-2 text-muted-foreground">
                    Veuillez choisir un établissement avant de gérer les années scolaires.
                </p>
                <Button asChild className="mt-4">
                    <Link to="/configuration">Sélectionner un établissement</Link>
                </Button>
            </div>
        );
    }

    const { data: studyYears, isError } = useGetStudyYears({ schoolId: currentSchool.schoolId });

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-red-600">
                <p className="font-semibold">Erreur lors du chargement des années scolaires.</p>
                <p className="text-sm text-muted-foreground">Veuillez réessayer ou contacter le support.</p>
            </div>
        );
    }

    if (studyYears.length === 0) {
        return (
            <div>
                <TypographyH4 className="mb-6 text-center md:text-left">
                    Aucune année scolaire trouvée pour cet établissement. Veuillez en créer une pour commencer.
                </TypographyH4>
                <StudyYearCreationForm />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ConfigHeader showBackButton title=" Veuillez choisir l'année scolaire sur laquelle vous souhaitez travailler." />
            <Table>
                <TableCaption>
                    <span>Liste des années scolaires enregistrées pour <b>{currentSchool.name}</b>.</span> {" "}
                    <Link to={`/configuration/school-year/new`} className="text-blue-600 hover:underline text-sm">
                        Ajouter une nouvelle année scolaire
                    </Link>
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID Année</TableHead> {/* Changed to Year ID */}
                        <TableHead className="w-[250px]">Nom de l'année scolaire</TableHead>
                        <TableHead>Date de début</TableHead>
                        <TableHead className="text-right">Date de fin</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {studyYears.map((studyYear: StudyYearDataDisplay) => (
                        <TableRow
                            key={studyYear.yearId}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setCurrentStudyYearAndNavigate(studyYear)}
                        >
                            <TableCell className="font-medium">{studyYear.yearId}</TableCell>
                            <TableCell>{studyYear.yearName}</TableCell>
                            <TableCell>{format(new Date(studyYear.startDate), "PPP")}</TableCell>
                            <TableCell className="text-right">{format(new Date(studyYear.endDate), "PPP")}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};



/**
 * @component StudyYearConfigurationScreen
 * @description This main page component orchestrates the display of either a list of existing
 * study years for the current school or a form to create a new one.
 * It uses React Suspense to manage loading states for the study year data.
 * @returns {JSX.Element} The rendered study year configuration interface.
 *
 * @example
 * ```tsx
 * // This component would typically be mounted at a route like /configuration/school/:schoolId/study-years
 * <Route path="/configuration/school/:schoolId/study-years" element={<StudyYearConfigurationScreen />} />
 * ```
 */
export const StudyYearConfigurationScreen: React.FC = () => {
    return (
        <div>
            <DataSuspense fallback={<div className="text-center py-8">Chargement des données des années scolaires...</div>}>
                <StudyYearListDisplayTable />
            </DataSuspense>
        </div>
    );
};