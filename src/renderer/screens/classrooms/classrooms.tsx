import type { TClassroomAttributes as TClassroom } from "@/packages/@core/data-access/schema-validations"
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import React, { useMemo } from "react";
import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableToolbar,
    TableFacetedFilterItem,
} from "@/renderer/components/tables/data-table";
import { Button } from "@/renderer/components/ui/button";
import { ClassroomColumns } from "@/renderer/components/tables/columns.classroom";
import { Plus } from "lucide-react";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { withSchoolConfig } from "@/renderer/hooks/with-application-config";
import {
    ClassroomDialogCreateForm,
    ClassroomDialogDeleteForm,
    ClassroomDialogUpdateForm
} from "@/renderer/dialog-actions/classroom.dialog-actions"

import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import {
    ActionContainer,
    ActionTileCopy,
    ActionTileDelete,
    ActionTileEdit,
    ActionTileDetail
} from "@/renderer/components/tables/data-table.action-tiles";
import { Link } from "react-router";
import { UseClassroomFormOptions } from "@/renderer/components/form/classroom-form.actions";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options"
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";

type TWithSchoolAndYear = Pick<TClassroom, "schoolId" | "yearId">


const ClassroomRowActions: React.FC<{
    classroom: TClassroom;
    schoolId: string;
    yearId: string;
    options?: UseClassroomFormOptions
}> = ({ classroom, schoolId, yearId, options }) => {
    const defaultValues = useMemo(() => ({ ...classroom, yearId }), [classroom, yearId]);

    return (
        <ActionContainer>
            {/* Navigation vers le détail */}
            <Link to={`/classrooms/${classroom.classId}/students`} className="contents">
                <ActionTileDetail />
            </Link>

            {/* Modification */}
            <ClassroomDialogUpdateForm
                classId={classroom.classId}
                schoolId={schoolId}
                defaultValues={defaultValues}
                options={options}
            >
                <ActionTileEdit />
            </ClassroomDialogUpdateForm>

            {/* Duplication (Create avec valeurs existantes) */}
            <ClassroomDialogCreateForm
                schoolId={schoolId}
                defaultValues={defaultValues}
                options={options}
            >
                <ActionTileCopy />
            </ClassroomDialogCreateForm>

            {/* Suppression avec confirmation */}
            <ClassroomDialogDeleteForm
                classId={classroom.classId}
                identifier={classroom.identifier}
            >
                {({ onOpen }) => <ActionTileDelete onClick={onOpen} />}
            </ClassroomDialogDeleteForm>
        </ActionContainer>
    );
};


const ClassroomManagementPage: React.FC<TWithSchoolAndYear> = ({ schoolId, yearId }) => {
    const { options } = useGetOptionAsOptions(schoolId)
    const { data: classrooms = [], queryKey } = useGetClassrooms({ where: { schoolId, yearId } });
    console.log(classrooms)
    return (
        <main className="my-10 mx-auto h-full container max-w-screen-2xl space-y-6 py-10">
            <section className="flex items-center justify-between">
                <header className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des classes</h1>
                    <p className="text-sm text-muted-foreground">
                        Administrez les salles.
                    </p>
                </header>

                <ClassroomDialogCreateForm
                    schoolId={schoolId}
                    defaultValues={{ yearId, schoolId }}
                    options={{ mutationKeys: queryKey }}
                >
                    <Button size="sm" className="rounded-full">
                        <Plus className="size-4 mr-2" />
                        <span>Ajouter une classe</span>
                    </Button>
                </ClassroomDialogCreateForm>
            </section>
            <DataTable<TClassroom>
                data={classrooms}
                columns={ClassroomColumns}
                keyExtractor={(item) => item.classId}
            >
                <DataTableToolbar searchColumn="identifier">
                    <TableFacetedFilterItem
                        title="Section"
                        columnId="section"
                        options={SECTION_OPTIONS}
                    />
                    <TableFacetedFilterItem
                        title="Option"
                        columnId="optionId"
                        options={options}
                    />

                </DataTableToolbar>

                <Suspense fallback={<div className="h-64 w-full animate-pulse bg-muted/20 rounded-lg" />}>
                    <DataTableContent>
                        <DataContentHead />
                        <DataContentBody<TClassroom>>
                            {(props) => (
                                <ExpandableRow
                                    row={props.row as any}
                                    renderDetail={
                                        <ClassroomRowActions
                                            classroom={props.row.original}
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
                </Suspense>
            </DataTable>
        </main>
    );
};

/**
 * Wrapper avec Suspense pour gérer le chargement initial de la page.
 */
const Classroom: React.FC<TWithSchoolAndYear> = (props) => {
    console.log("classrooms", props)

    return (
        <Suspense>
            <ClassroomManagementPage {...props} />
        </Suspense>
    );
};

export const ClassroomPage = withSchoolConfig(Classroom);