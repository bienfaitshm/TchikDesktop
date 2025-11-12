"use client";

import React from "react";
import { useParams } from "react-router";
import { Plus } from "lucide-react";

import {
    DataTable,
    DataTableColumnFilter,
    DataTableContent,
    DataContentHead,
    DataContentBody,
    DataTablePagination,
    DataTableToolbar,
} from "@/renderer/components/tables";
import { Button } from "@/renderer/components/ui/button";
import { StudentColumns } from "@/renderer/components/tables/columns.students";
import { TypographyH2, TypographySmall } from "@/renderer/components/ui/typography";
import { useGetEnrollments } from "@/renderer/libs/queries/enrolement";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { useGetClassroom } from "@/renderer/libs/queries/classroom";
import { ButtonDataExport } from "@/renderer/components/sheets/export-button";
import { ButtonSheetStudentStat } from "./students.stat";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { withCurrentConfig } from "@/renderer/hooks/with-application-config";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import { EnrollmentDialog } from "@/renderer/components/dialog/quick-enrollment-dialog-form";
import { StudentDetailsCard } from "@/renderer/components/student-details-infos";
import { DataSheetViewer, useDataSheetViewer } from "@/renderer/components/sheets/sheet-viewer"

/**
 * Composant d'en-tête de la page de la classe.
 * Affiche le nom de la classe et gère son chargement.
 * Utilise un Skeleton pour une meilleure expérience utilisateur pendant le chargement.
 */
const ClassroomHeader: React.FC<{ classId: string }> = ({ classId }) => {
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
        <header className="">
            <TypographyH2 className="uppercase font-bold mb-0 pb-0 tracking-tight text-xl">
                {classroom?.identifier || "Nom de la classe inconnu"}
            </TypographyH2>
            <p className="text-xs text-muted-foreground">
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
    const currentClassroomId = classroomId as string;

    const { sheetRef, showDetails } = useDataSheetViewer<any>();
    const { data: students = [], refetch } = useGetEnrollments({
        schoolId,
        yearId,
        params: { classroomId: currentClassroomId },
    });

    return (
        <>
            <div className="overflow-hidden bg-background">
                <div className="pt-6 pb-4 px-6">
                    {/* Barre d'outils de la table : filtres et actions */}
                    <Suspense fallback={<TypographySmall>Chargement...</TypographySmall>}>
                        {/* L'en-tête de la classe, qui peut charger ses propres données */}
                        <ClassroomHeader classId={currentClassroomId} />
                    </Suspense>
                    {/* La table des données des élèves */}
                    <div className="my-4">
                        <DataTable
                            data={students}
                            columns={StudentColumns}
                            keyExtractor={(student: any) => `${student.enrolementId}`}

                        >
                            <DataTableToolbar>
                                <DataTableColumnFilter />
                                <div className="flex items-center gap-3 ml-auto">
                                    {/* Le bouton d'exportation des données */}
                                    <ButtonDataExport currentClassroom={classroomId} />
                                    {/* Le bouton pour les statistiques des élèves */}
                                    <ButtonSheetStudentStat students={students} />
                                    {/* Formulaire d'inscription rapide d'un nouvel élève */}
                                    <Suspense fallback={<Button size="sm" disabled>Chargement...</Button>}>
                                        <EnrollmentDialog
                                            schoolId={schoolId}
                                            yearId={yearId}
                                            initialValues={{ classroomId: currentClassroomId }}
                                            dialogDescription="Inscription et ajout de l'élève dans la salle ouverte"
                                            onSuccess={refetch}
                                        >
                                            <Button size="sm" className="flex items-center gap-2">
                                                <Plus className="size-4" />
                                                <span>Nouvel élève</span>
                                            </Button>
                                        </EnrollmentDialog>
                                    </Suspense>
                                </div>
                            </DataTableToolbar>
                            <DataTableContent>
                                <DataContentHead />
                                {/* Le clic sur une ligne ouvre la feuille de détails de l'élève */}
                                <DataContentBody
                                    onClick={(row) => {
                                        showDetails(row.original)
                                    }}
                                />
                            </DataTableContent>
                            <DataTablePagination />
                        </DataTable>
                    </div>
                </div>
            </div>

            {/* La feuille de détails de l'élève, toujours présente mais cachée jusqu'à l'ouverture */}
            <DataSheetViewer ref={sheetRef}>
                {student => <StudentDetailsCard data={student} schoolId={schoolId} yearId={yearId as string} onRefresh={refetch} />}
            </DataSheetViewer>
        </>
    );
};

// Exporte le composant StudentListContent enveloppé dans le HOC withCurrentConfig.
// Cela assure que `schoolId` et `yearId` sont injectés ou qu'un message de configuration est affiché.
export const StudentsOfClassrrom = withCurrentConfig(StudentListContent);
