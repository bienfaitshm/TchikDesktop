"use client";

import React, { useMemo } from "react";
import { Link, useParams } from "react-router";
import { Plus, UserPlus, Zap, Edit2, User2 } from "lucide-react";

import { GENDER_OPTIONS, STUDENT_STATUS_OPTIONS } from "@/packages/@core/data-access/db/options"

import {
    DataTable,
    TableFacetedFilterItem,
    DataTableContent,
    DataContentHead,
    DataContentBody,
    DataTablePagination,
    DataTableToolbar,
} from "@/renderer/components/tables";
import { Button } from "@/renderer/components/ui/button";
import { StudentColumns, TEnrolement } from "@/renderer/components/tables/columns.students";
import { TypographyH2, TypographySmall } from "@/renderer/components/ui/typography";
import { useGetEnrollments } from "@/renderer/libs/queries/enrolement";
import { useGetClassroomById } from "@/renderer/libs/queries/classroom";
import { ButtonDataExport } from "@/renderer/components/sheets/export-button";
import { ButtonSheetStudentStat } from "./students.stat";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { withSchoolConfig } from "@/renderer/hooks/with-application-config";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import { ActionContainer, ActionTileDelete, ActionTileDetail, ActionTileEdit, ActionTile } from "@/renderer/components/tables/data-table.action-tiles";
import { CreateEnrollmentDialog, QuickCreateEnrollmentDialog, DeleteEnrollmentDialog, UpdateEnrollmentDialog } from "@/renderer/dialog-actions/enrolement.dialog-actions";
// import { } from "@/renderer/dialog-actions/"

import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { enhanceColumnsExpandable } from "@/renderer/components/tables/columns";
import { Separator } from "@/renderer/components/ui/separator";

const enrolementStudentColumns = enhanceColumnsExpandable(StudentColumns)

const EnrollementActions: React.FC<{
    schoolId: string;
    yearId: string;
    options?: any
    enrolement: TEnrolement
}> = ({ enrolement: { classroom, enrolementId, student, ...restValue }, schoolId, yearId, options }) => {
    const fullName = student.fullName
    const initialData = useMemo(() => ({ ...restValue, schoolId, yearId, enrolementId }), [restValue, yearId]);

    return (
        <ActionContainer>
            <ActionTileDetail />
            <ActionTile icon={User2} label="Modifier" description="Modifier les informations sur l'eleve" />
            {/* Modification */}
            <UpdateEnrollmentDialog
                initialData={initialData}
                fullName={fullName}
                enrollmentId={enrolementId}
                schoolId={schoolId}
                yearId={yearId}
            >
                <ActionTile icon={Edit2} label="Modifier" description="Modifier les informations sur l'inscription" />
            </UpdateEnrollmentDialog>

            {/* Suppression avec confirmation */}
            <DeleteEnrollmentDialog
                enrollmentId={enrolementId}
                studentName={fullName}
            >
                {({ onOpen }) => <ActionTileDelete onClick={onOpen} />}
            </DeleteEnrollmentDialog>
        </ActionContainer>
    );
};

/**
 * Composant d'en-tête de la page de la classe.
 * Affiche le nom de la classe et gère son chargement.
 * Utilise un Skeleton pour une meilleure expérience utilisateur pendant le chargement.
 */
const ClassroomHeader: React.FC<{ classId: string, schoolId: string, yearId: string, students?: any[] }> = ({ classId, schoolId, yearId, students = [] }) => {
    const { data: classroom, isLoading } = useGetClassroomById(classId);
    const defaultValues = React.useMemo(() => ({ schoolId, yearId, classroomId: classId }), [schoolId, yearId])

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
        );
    }

    return (

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-2">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">{classroom?.identifier || "Nom de la classe inconnu"}</h1>
                <p className="text-sm text-muted-foreground">
                    Liste des élèves inscrits dans cette classe.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Le bouton d'exportation des données */}
                <ButtonDataExport currentClassroom={classId} />
                {/* Le bouton pour les statistiques des élèves */}
                <ButtonSheetStudentStat students={students} />
                {/* Inscription Rapide : Style "Accent" pour l'urgence/vitesse */}
                <QuickCreateEnrollmentDialog schoolId={schoolId} yearId={yearId} defaultValues={defaultValues}>
                    <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                        <Zap className="h-4 w-4" />
                        <span>Inscription Rapide</span>
                    </Button>
                </QuickCreateEnrollmentDialog>

                {/* Inscription Complète : Bouton Principal */}
                <CreateEnrollmentDialog schoolId={schoolId} yearId={yearId} defaultValues={defaultValues}>
                    <Button className="gap-2 shadow-sm">
                        <UserPlus className="h-4 w-4" />
                        <span>Inscription Complète</span>
                    </Button>
                </CreateEnrollmentDialog>
            </div>
        </header>
    );
};



/**
 * Composant principal affichant la liste des élèves pour une classe spécifique.
 * Il récupère les données des élèves et gère les interactions (détails, ajout, export, stats).
 * Ce composant est enveloppé par `withSchoolConfig` pour obtenir `schoolId` et `yearId`.
 */
const StudentListContent: React.FC<any> = ({ schoolId, yearId }) => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const currentClassroomId = classroomId as string;
    const { data: students = [], queryKey } = useGetEnrollments({
        where: {
            schoolId,
            yearId,
            classroomId: currentClassroomId
        }
    });

    return (
        <>
            <div className="overflow-hidden bg-background">
                <div className="container mx-auto max-w-screen-xl px-4 sm:px-4">
                    {/* Barre d'outils de la table : filtres et actions */}
                    <Suspense fallback={<TypographySmall>Chargement...</TypographySmall>}>
                        <ClassroomHeader students={students} classId={currentClassroomId} yearId={yearId} schoolId={schoolId} />
                    </Suspense>
                    <Separator />
                    {/* La table des données des élèves */}
                    <main className="my-4">
                        <DataTable
                            data={students}
                            columns={enrolementStudentColumns}
                            keyExtractor={(student: any) => `${student.enrolementId}`}

                        >
                            <DataTableToolbar searchColumn="student_fullName">
                                <TableFacetedFilterItem columnId="student_gender" title="Sexe" options={GENDER_OPTIONS} />
                                <TableFacetedFilterItem columnId="status" title="Status" options={STUDENT_STATUS_OPTIONS} />
                            </DataTableToolbar>
                            <DataTableContent>
                                <DataContentHead />
                                {/* Le clic sur une ligne ouvre la feuille de détails de l'élève */}
                                <DataContentBody>
                                    {({ row }) => (
                                        <ExpandableRow
                                            row={row as any}
                                            renderDetail={
                                                <EnrollementActions
                                                    enrolement={row.original as any}
                                                    schoolId={schoolId}
                                                    yearId={yearId}
                                                    options={{ mutationKeys: queryKey }}
                                                />
                                            }
                                        />
                                    )}
                                </DataContentBody>
                            </DataTableContent>
                            <DataTablePagination />
                        </DataTable>
                    </main>
                </div>
            </div>


        </>
    );
};

export const StudentsOfClassrrom = withSchoolConfig(StudentListContent);
