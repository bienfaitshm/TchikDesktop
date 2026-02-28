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
import { useGetSchools } from "@/renderer/libs/queries/school";
import { Suspense as DataSuspense } from "@/renderer/libs/queries/suspense";

import React from "react";
import { SchoolCreationForm, useSchoolNavigationAndSelection } from "./school.new-school";
import { ConfigHeader } from "./config.header";


/**
 * @component SchoolListDisplayTable
 * @description Displays a table of available schools. If no schools are found, it prompts
 * the user to create a new one by rendering the `SchoolCreationForm`.
 * Each table row is clickable, allowing users to select a school and navigate to its
 * dedicated configuration page.
 * @returns {JSX.Element} The table of schools or the creation form.
 */
const SchoolListDisplayTable: React.FC = () => {
    const setCurrentSchoolAndNavigate = useSchoolNavigationAndSelection();
    const { data: schools, error } = useGetSchools();
    console.log({ error })
    if (schools.length === 0) {
        return (
            <div className="p-4">
                <TypographyH4 className="mb-6 text-center md:text-left">
                    Aucun établissement trouvé. Veuillez en créer un pour commencer.
                </TypographyH4>
                <SchoolCreationForm />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ConfigHeader title=" Veuillez choisir l'établissement sur lequel vous souhaitez travailler." />
            <Table>
                <TableCaption>
                    Liste des établissements enregistrés. <Link className="text-blue-600 hover:underline text-sm" to="/configuration/school/new">Ajouter un nouvel établissement</Link>
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead className="w-[250px]">Nom de l'établissement</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead className="text-right">Adresse physique</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schools.map((school) => (
                        <TableRow
                            key={school.schoolId}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setCurrentSchoolAndNavigate(school)}
                        >
                            <TableCell className="font-medium">{school.schoolId}</TableCell>
                            <TableCell>{school.name}</TableCell>
                            <TableCell>{school.town}</TableCell>
                            <TableCell className="text-right">{school.adress}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};



/**
 * @component SchoolConfigurationScreen
 * @description This main page component orchestrates the display of either a list of existing
 * schools or a form to create a new school, depending on the data availability.
 * It uses React Suspense to manage loading states for the school data.
 * @returns {JSX.Element} The rendered school configuration interface.
 */
export const SchoolConfigurationScreen: React.FC = () => {
    return (
        <DataSuspense fallback={<div className="text-center py-8">Chargement des données...</div>}>
            <SchoolListDisplayTable />
        </DataSuspense>
    );
};