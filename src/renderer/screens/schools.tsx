import React, { useCallback, useMemo } from "react";
import { SchoolForm, type SchoolFormData as FormValueType } from "@/renderer/components/form/school-form";
import { SchoolColumns } from "@/renderer/components/tables/columns.school";
import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableToolbar,
} from "@/renderer/components/tables/data-table";
import { TypographyH3 } from "@/renderer/components/ui/typography";
import type { TSchool } from "@/commons/types/models";
import { useSchoolManagement } from "@/renderer/hooks/query.mangements";
import { createMenuActionManager } from "@/renderer/utils/handle-action";
import { useGetSchools } from "@/renderer/libs/queries/school";
import {
    TableActionManager,
    useTableAction,
} from "@/renderer/components/dialog/dialog.table-action";
import { MUTATION_ACTION } from "@/commons/constants/enum";



const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];



export const SchoolsPage: React.FC = ({ }) => {

    const {
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useSchoolManagement()


    const { data: schools = [] } = useGetSchools();
    const tableAction = useTableAction<TSchool>();
    const onConfirmDelete = useCallback(
        (item: TSchool) => {
            handleDelete(item.schoolId, item.name, () => {
                tableAction.onClose();
            });
        },
        [handleDelete, tableAction]
    );


    const handleFormSubmit = useCallback(
        ({ data, type, initialData }: { data: FormValueType, type: MUTATION_ACTION, initialData?: TSchool }) => {
            if (type === MUTATION_ACTION.CREATE) {
                handleCreate(data, data.name, () => {
                    tableAction.onClose();
                });
            } else if (type === MUTATION_ACTION.EDIT && initialData) {
                handleUpdate(initialData.schoolId, data, data.name, () => {
                    tableAction.onClose();
                });
            }
        },
        [handleCreate, handleUpdate, tableAction]
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
            enhanceColumnsWithMenu<TSchool>({
                menus,
                onPressMenu,
                columns: SchoolColumns,
            }),
        [menus, onPressMenu]
    );


    const isActionLoading =
        updateMutation.isPending || createMutation.isPending || deleteMutation.isPending;

    return (
        <div className="my-10 mx-auto h-full container max-w-screen-lg">
            <DataTable<TSchool>
                data={schools}
                columns={enhancedColumns}
                keyExtractor={(item) => item.schoolId}
            >
                <DataTableToolbar className="justify-between">
                    <TypographyH3>Gestion des écoles</TypographyH3>
                    <Button size="sm" className="rounded-full" onClick={tableAction.onCreate}>
                        <Plus className="size-4" />
                        <span>Ajouter une école</span>
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
                itemName="école"
                isLoading={isActionLoading}
                onConfirmDelete={onConfirmDelete as any}
                onFormSubmit={handleFormSubmit as any}
                renderForm={({ initialData, onSubmit }: any) => (
                    <SchoolForm onSubmit={onSubmit} initialValues={initialData} />
                ) as any}
            />
        </div>
    );
};