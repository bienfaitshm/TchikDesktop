import type { TClassroomAttributes as TClassroom } from "@/packages/@core/data-access/schema-validations"
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import React from "react";
import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableToolbar,
} from "@/renderer/components/tables/data-table";
import { Button } from "@/renderer/components/ui/button";
import { ClassroomColumns } from "@/renderer/components/tables/columns.classroom";
import { Plus } from "lucide-react";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { withSchoolConfig } from "@/renderer/hooks/with-application-config";
import { ClassroomDialogCreateForm, ClassroomDialogDeleteForm, ClassroomDialogUpdateForm } from "@/renderer/dialog-actions/classroom.dialog-actions"

import { ExpandableRow } from "@/renderer/components/tables/data-table.components";
import { ActionGrid, ActionTileCopy, ActionTileDelete, ActionTileEdit, ActionTileDetail } from "@/renderer/components/tables/data-table.action-tiles";
import { Link } from "react-router";

type TWithSchoolAndYear = Pick<TClassroom, "schoolId" | "yearId">


const ClassroomManagementPage: React.FC<TWithSchoolAndYear> = ({ schoolId, yearId }) => {
    const { data: classrooms = [], } = useGetClassrooms({ schoolId, yearId });
    return (
        <div className="my-10 mx-auto h-full container max-w-screen-2xl">
            <DataTable<TClassroom>
                data={classrooms}
                columns={ClassroomColumns}
                keyExtractor={(item) => item.classId}
            >
                <DataTableToolbar className="justify-between">
                    <ClassroomDialogCreateForm schooldId={schoolId} defaultValues={{ yearId }}>
                        <Button size="sm" className="rounded-full">
                            <Plus className="size-4" />
                            <span>Ajouter une classe</span>
                        </Button>
                    </ClassroomDialogCreateForm>
                </DataTableToolbar>
                <Suspense>
                    <DataTableContent>
                        <DataContentHead isCollapsible />
                        <DataContentBody<TClassroom>>
                            {(props) => <ExpandableRow {...props} detailContent={
                                <>
                                    <ActionGrid>
                                        <Link to={`/classrooms/${props.row.original.classId}/students`} className="w-full contents">
                                            <ActionTileDetail />
                                        </Link>
                                        <ClassroomDialogUpdateForm schoolId={schoolId} defaultValues={{ ...props.row.original, yearId, }}>
                                            <ActionTileEdit />
                                        </ClassroomDialogUpdateForm>
                                        <ClassroomDialogCreateForm
                                            schooldId={schoolId}
                                            defaultValues={{
                                                ...props.row.original,
                                                yearId,
                                            }}
                                        >
                                            <ActionTileCopy />
                                        </ClassroomDialogCreateForm>
                                        <ClassroomDialogDeleteForm
                                            classId={props.row.original.classId}
                                            identifier={props.row.original.identifier}
                                        >{({ onOpen }) => (
                                            <ActionTileDelete onClick={onOpen} />
                                        )}</ClassroomDialogDeleteForm>
                                    </ActionGrid>
                                </>
                            } />}
                        </DataContentBody>
                    </DataTableContent>
                    <DataTablePagination />
                </Suspense>
            </DataTable>
        </div>
    );
};

const Classroom: React.FC<TWithSchoolAndYear> = (props) => {
    return (
        <Suspense>
            <ClassroomManagementPage {...props} />
        </Suspense>
    );
};


export const ClassroomPage = withSchoolConfig(Classroom);
