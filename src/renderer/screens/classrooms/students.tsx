"use client";

import { useMemo } from "react";
import { useParams } from "react-router";
import { UserPlus, Zap, Edit2, UserPen } from "lucide-react";

import { GENDER_OPTIONS, STUDENT_STATUS_OPTIONS } from "@/packages/@core/data-access/db/options";
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
import { useGetEnrollments } from "@/renderer/libs/queries/enrolement";
import { useGetClassroomById } from "@/renderer/libs/queries/classroom";
import { ButtonSheetStudentStat } from "./students.stat";
import { withSchoolConfig } from "@/renderer/hooks/with-application-config";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import { ActionContainer, ActionTileDelete, ActionTileDetail, ActionTile } from "@/renderer/components/tables/data-table.action-tiles";
import {
    CreateEnrollmentDialog,
    QuickCreateEnrollmentDialog,
    DeleteEnrollmentDialog,
    UpdateEnrollmentDialog
} from "@/renderer/dialog-actions/enrolement.dialog-actions";
import { UpdateStudentDialog } from "@/renderer/dialog-actions/student.dialog-action";

import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { enhanceColumnsExpandable } from "@/renderer/components/tables/columns";
import { Separator } from "@/renderer/components/ui/separator";
import { Badge } from "@/renderer/components/ui/badge";
import type { BaseFormConfig } from "@/renderer/dialog-actions/base.dialog-actions";
import { ButtonDialogDocumentExport } from "@/renderer/components/dialog/dialog-document-expoter";

const enrolementStudentColumns = enhanceColumnsExpandable(StudentColumns);

/** * ACTIONS : Rafraîchies avec un design plus compact 
 */
const EnrollementActions = ({ enrolement, schoolId, yearId, options }: {
    schoolId: string;
    yearId: string;
    options?: BaseFormConfig
    enrolement: TEnrolement,

}) => {
    const { student, enrolementId, studentId, ...restValue } = enrolement;
    const initialData = useMemo(() => ({ ...restValue, schoolId, yearId, enrolementId }), [restValue, schoolId, yearId, enrolementId]);

    return (
        <ActionContainer className="bg-muted/30 p-4 rounded-lg border-dashed border-2">
            <ActionTileDetail />
            <UpdateStudentDialog studentId={studentId} initialData={student} {...options}>
                <ActionTile icon={UserPen} label="Profil" description="Modifier l'identité de l'élève" />
            </UpdateStudentDialog>
            <UpdateEnrollmentDialog
                initialData={initialData}
                fullName={student.fullName}
                enrollmentId={enrolementId}
                schoolId={schoolId}
                yearId={yearId}
                {...options}
            >
                <ActionTile icon={Edit2} label="Gérer l'inscription" description="Modifier le statut, gérer les transferts ou signaler un abandon." />
            </UpdateEnrollmentDialog>
            <DeleteEnrollmentDialog enrollmentId={enrolementId} studentName={student.fullName} {...options}>
                {({ onOpen }) => <ActionTileDelete onClick={onOpen} />}
            </DeleteEnrollmentDialog>
        </ActionContainer>
    );
};

/**
 * HEADER : Design "Modern Dashboard"
 */
const ClassroomHeader = ({ classId, schoolId, yearId, studentsCount = 0 }: { classId: string, schoolId: string, yearId: string, studentsCount?: number }) => {
    const { data: classroom, isLoading } = useGetClassroomById(classId);
    const defaultValues = useMemo(() => ({ schoolId, yearId, classroomId: classId }), [schoolId, yearId, classId]);

    if (isLoading) return <HeaderSkeleton />;

    return (
        <div className="space-y-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight">{classroom?.identifier}</h1>
                        <Badge variant="secondary" className="font-mono">
                            {studentsCount} Élèves
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs mt-1 uppercase tracking-wider font-medium">
                        Liste des élèves inscrits dans cette classe.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <QuickCreateEnrollmentDialog schoolId={schoolId} yearId={yearId} defaultValues={defaultValues}>
                        <Button variant="ghost" size="sm" className="gap-2 hover:bg-background shadow-none">
                            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span>Ajout rapide d’élève</span>
                        </Button>
                    </QuickCreateEnrollmentDialog>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <CreateEnrollmentDialog schoolId={schoolId} yearId={yearId} defaultValues={defaultValues}>
                        <Button size="sm" className="gap-2 shadow-sm">
                            <UserPlus className="h-4 w-4" />
                            <span>Nouvelle Inscription</span>
                        </Button>
                    </CreateEnrollmentDialog>
                </div>
            </div>
        </div>
    );
};

/**
 * MAIN PAGE : Utilisation de l'espace optimisée
 */
const StudentListContent = ({ schoolId, yearId }: any) => {
    const { classroomId } = useParams();
    const { data: students = [], queryKey } = useGetEnrollments({
        where: { schoolId, yearId, classroomId: classroomId! }
    });

    return (
        <div className="min-h-screen">
            <div className="container space-y-4 mx-auto px-6 max-w-[1600px]">
                {/* Header Section */}
                <ClassroomHeader
                    studentsCount={students.length}
                    classId={classroomId as string}
                    yearId={yearId}
                    schoolId={schoolId}
                />

                {/* Statistics & Export Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 flex items-center gap-4">
                        <ButtonSheetStudentStat students={students} />
                        <ButtonDialogDocumentExport />
                    </div>
                </div>
                <Separator />
                {/* Table Section */}
                <div className="overflow-hidden">
                    <DataTable
                        data={students}
                        columns={enrolementStudentColumns}
                        keyExtractor={(s: any) => s.enrolementId}
                    >
                        <DataTableToolbar searchColumn="student_fullName" className="flex-wrap gap-4">
                            <TableFacetedFilterItem columnId="student_gender" title="Sexe" options={GENDER_OPTIONS} />
                            <TableFacetedFilterItem columnId="status" title="Statut" options={STUDENT_STATUS_OPTIONS} />
                        </DataTableToolbar>
                        <DataTableContent>
                            <DataContentHead className="bg-muted/10" />
                            <DataContentBody>
                                {({ row }) => (
                                    <ExpandableRow
                                        row={row as any}
                                        className="hover:bg-muted/5 transition-colors cursor-pointer"
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
                </div>
            </div>
        </div>
    );
};

const HeaderSkeleton = () => (
    <div className="space-y-4 py-4">
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-40" />
            </div>
        </div>
    </div>
);

export const StudentsOfClassrrom = withSchoolConfig(StudentListContent);