
import { StudyYearForm, type StudyYearFormData as FormValueType } from "@/renderer/components/form/study-year-form";
import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Suspense } from "@/renderer/libs/queries/suspense";

import React, { useCallback, useMemo } from "react";
import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableToolbar,
} from "@/renderer/components/tables/data-table";
import { TypographyH3 } from "@/renderer/components/ui/typography";
import { StudyYearColumns } from "@/renderer/components/tables/columns.study-years";
import type { TStudyYear } from "@/commons/types/models";
import { useStudyYearManagement } from "@/renderer/hooks/query.mangements";
import { withCurrentConfig } from "@/renderer/hooks/with-application-config";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { createMenuActionManager } from "@/renderer/utils/handle-action";
import { useGetStudyYears } from "@/renderer/libs/queries/school";
import {
    TableActionManager,
    useTableAction,
} from "@/renderer/components/dialog/dialog.table-action";
import { MUTATION_ACTION } from "@/commons/constants/enum";



const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];



const StudyYearManagementPage: React.FC<WithSchoolAndYearId> = ({ schoolId }) => {

    const {
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useStudyYearManagement();


    const { data: studyYears = [] } = useGetStudyYears(schoolId);
    const tableAction = useTableAction<TStudyYear>();
    const onConfirmDelete = useCallback(
        (item: TStudyYear) => {
            handleDelete(item.yearId, item.yearName, () => {
                tableAction.onClose();
            });
        },
        [handleDelete, tableAction]
    );


    const handleFormSubmit = useCallback(
        ({ data, type, initialData }: { data: FormValueType, type: MUTATION_ACTION, initialData?: TStudyYear }) => {
            if (type === MUTATION_ACTION.CREATE) {
                handleCreate(data, data.yearName, () => {
                    tableAction.onClose();
                });
            } else if (type === MUTATION_ACTION.EDIT && initialData) {
                handleUpdate(initialData.yearId, data, data.yearName, () => {
                    tableAction.onClose();
                });
            }
        },
        [handleCreate, handleUpdate, schoolId, tableAction]
    );





    const { menus, handleMenusAction: onPressMenu } = useMemo(
        () =>
            createMenuActionManager(tableMenus, {
                edit: tableAction.onUpdate,
                delete: tableAction.onDelete,
            }),
        [tableAction.onUpdate, tableAction.onDelete]
    );



    const enhancedColumns = useMemo(
        () =>
            enhanceColumnsWithMenu<TStudyYear>({
                menus,
                onPressMenu,
                columns: StudyYearColumns,
            }),
        [menus, onPressMenu]
    );


    const isActionLoading =
        updateMutation.isPending || createMutation.isPending || deleteMutation.isPending;

    return (
        <div className="my-10 mx-auto h-full container max-w-screen-lg">
            <DataTable<TStudyYear>
                data={studyYears}
                columns={enhancedColumns}
                keyExtractor={(item) => item.yearId}
            >
                <DataTableToolbar className="justify-between">
                    <TypographyH3>Gestion des années scolaire</TypographyH3>
                    <Button size="sm" className="rounded-full" onClick={tableAction.onCreate}>
                        <Plus className="size-4" />
                        <span>Ajouter une année scolaire</span>
                    </Button>
                </DataTableToolbar>
                <DataTableContent>
                    <DataContentHead />
                    <DataContentBody />
                </DataTableContent>
                <DataTablePagination />
            </DataTable>

            {/* Les dialogues sont rendus au niveau racine pour une meilleure accessibilité et superposition */}
            <TableActionManager
                ref={tableAction.tableActionRef}
                itemName="année scolaire"
                isLoading={isActionLoading}
                onConfirmDelete={onConfirmDelete as any}
                onFormSubmit={handleFormSubmit as any}
                renderForm={({ initialData, onSubmit }: any) => (
                    <StudyYearForm onSubmit={onSubmit} initialValues={{ ...initialData, schoolId }} />
                ) as any}
            />
        </div>
    );
};

const SttudyYear: React.FC<WithSchoolAndYearId> = (props) => {
    return (
        <Suspense>
            <StudyYearManagementPage {...props} />
        </Suspense>
    );
};

export const StudyYearsPage = withCurrentConfig(SttudyYear);
