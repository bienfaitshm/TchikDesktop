"use client";

import React from "react";
import { useParams } from "react-router"; // Assurez-vous d'utiliser react-router-dom
import { Plus } from "lucide-react";

import {
    DataTable,
    DataTableColumnFilter,
    DataTableContent,
    DataContentHead,
    DataContentBody,
    DataTablePagination,
    DataTableToolbar, // Supposons que votre DataTable offre un composant Toolbar ou que vous le créez.
} from "@/renderer/components/tables";
import { Button } from "@/renderer/components/ui/button";
import { StudentColumns } from "@/renderer/components/tables/columns.students";
import { TypographyH2 } from "@/renderer/components/ui/typography";
import { useGetEnrollments } from "@/renderer/libs/queries/enrolement";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { useGetClassroom } from "@/renderer/libs/queries/classroom";

import { DataRefresher } from "@/renderer/providers/refrecher";
import { QuickEnrollmentDialogForm } from "./students.dialog-form";
import { StudentDetailSheet, useStudentDetailSheet } from "./students.detail-sheet";
import { ButtonDataExport } from "@/renderer/components/sheets/export-button";
import { ButtonSheetStudentStat } from "./students.stat";
import { Suspense } from "@/renderer/libs/queries/suspense"; // Assurez-vous que ce composant gère bien le fallback de chargement
import { withCurrentConfig } from "@/renderer/hooks/with-application-config";

// Composants Shadcn UI supplémentaires nécessaires (si non déjà installés)
import { Card, CardContent, CardHeader } from "@/renderer/components/ui/card";
import { Skeleton } from "@/renderer/components/ui/skeleton"; // Pour un meilleur état de chargement

/**
 * Composant d'en-tête de la page de la classe.
 * Affiche le nom de la classe et gère son chargement.
 * Utilise un Skeleton pour une meilleure expérience utilisateur pendant le chargement.
 */
const ClassroomHeader: React.FC<{ classId: string }> = ({ classId }) => {
    // `useGetClassroom` devrait être enveloppé par Suspense pour gérer le chargement ou utiliser un état de chargement interne.
    // Pour un comportement "pro", on suppose que Suspense gérera l'état de chargement en amont,
    // ou que le hook lui-même pourrait retourner un isLoading.
    const { data: classroom, isLoading } = useGetClassroom(classId);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
        );
    }

    return (
        <header className="py-4">
            <TypographyH2 className="uppercase font-bold mb-1 tracking-tight text-3xl">
                {classroom?.identifier || "Nom de la classe inconnu"}
            </TypographyH2>
            <p className="text-sm text-muted-foreground">
                Liste des élèves inscrits dans cette classe.
            </p>
        </header>
    );
};

/**
 * Composant principal affichant la liste des élèves pour une classe spécifique.
 * Il récupère les données des élèves et gère les interactions (détails, ajout, export, stats).
 * Ce composant est enveloppé par `withCurrentConfig` pour obtenir `schoolId` et `yearId`.
 */
const StudentListContent: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const { classroomId } = useParams<{ classroomId: string }>();
    // Assurez-vous que classroomId est toujours une chaîne valide ici,
    // car il provient de useParams et est nécessaire pour les requêtes.
    const currentClassroomId = classroomId as string;

    const { sheetRef, showStudentInfos } = useStudentDetailSheet();
    const { data: students = [], refetch } = useGetEnrollments({
        schoolId,
        yearId,
        params: { classroomId: currentClassroomId },
    });

    return (
        <DataRefresher onDataChange={refetch}>
            <Card className="p-0 overflow-hidden border-none bg-background text-card-foreground shadow-none">
                <CardHeader className="py-4 px-6 border-b">
                    <Suspense fallback={<ClassroomHeader classId={currentClassroomId} />}>
                        {/* L'en-tête de la classe, qui peut charger ses propres données */}
                        <ClassroomHeader classId={currentClassroomId} />
                    </Suspense>
                </CardHeader>
                <CardContent className="pt-6 pb-4 px-6">
                    {/* Barre d'outils de la table : filtres et actions */}
                    <DataTableToolbar>
                        <DataTableColumnFilter />
                        <div className="flex items-center gap-3 ml-auto">
                            {/* Le bouton d'exportation des données */}
                            <ButtonDataExport data={students} fileName={`eleves_${currentClassroomId}`} />
                            {/* Le bouton pour les statistiques des élèves */}
                            <ButtonSheetStudentStat students={students} />
                            {/* Formulaire d'inscription rapide d'un nouvel élève */}
                            <QuickEnrollmentDialogForm
                                classId={currentClassroomId}
                                schoolId={schoolId}
                                yearId={yearId}
                            >
                                <Button size="sm" className="flex items-center gap-2">
                                    <Plus className="size-4" />
                                    <span>Nouvel élève</span>
                                </Button>
                            </QuickEnrollmentDialogForm>
                        </div>
                    </DataTableToolbar>

                    {/* La table des données des élèves */}
                    <div className="my-4">
                        <DataTable
                            data={students}
                            columns={StudentColumns}
                            keyExtractor={(student: any) => `${student.enrolementId}`}

                        >
                            <DataTableContent>
                                <DataContentHead />
                                {/* Le clic sur une ligne ouvre la feuille de détails de l'élève */}
                                <DataContentBody
                                    onClick={(row) => {
                                        showStudentInfos(row.original);
                                    }}
                                />
                            </DataTableContent>
                            <DataTablePagination />
                        </DataTable>
                    </div>
                </CardContent>
            </Card>

            {/* La feuille de détails de l'élève, toujours présente mais cachée jusqu'à l'ouverture */}
            <StudentDetailSheet ref={sheetRef} schoolId={schoolId} yearId={yearId} />
        </DataRefresher>
    );
};

// Exporte le composant StudentListContent enveloppé dans le HOC withCurrentConfig.
// Cela assure que `schoolId` et `yearId` sont injectés ou qu'un message de configuration est affiché.
export const StudentsOfClassrrom = withCurrentConfig(StudentListContent);
