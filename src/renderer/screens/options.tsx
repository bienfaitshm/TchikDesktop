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
import { OptionForm, type OptionFormData as FormValueType } from "@/renderer/components/form/option-form";
import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import { OptionColumns } from "@/renderer/components/tables/columns.options";
import type { TOption } from "@/commons/types/models";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { useOptionManagement } from "@/renderer/hooks/query.mangements";
import { withSchoolConfig } from "@/renderer/hooks/with-application-config";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { createMenuActionManager } from "@/renderer/utils/handle-action";
import { useGetOptions } from "@/renderer/libs/queries/option";
import {
    TableActionManager,
    useTableAction,
} from "@/renderer/components/dialog/dialog.table-action";
import { MUTATION_ACTION } from "@/commons/constants/enum";



const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];


const renderForm = ({ initialData, onSubmit }: { initialData?: FormValueType, onSubmit?(value: FormValueType): void }) => {
    return (
        <OptionForm
            onSubmit={onSubmit}
            initialValues={initialData}
        />
    )
}

const OptionManagementPage: React.FC<WithSchoolAndYearId> = ({ schoolId }) => {

    const {
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useOptionManagement();


    const { data: options = [] } = useGetOptions({ schoolId });
    const tableAction = useTableAction<TOption>();
    const onConfirmDelete = useCallback(
        (item: TOption) => {
            handleDelete(item.optionId, item.optionName, () => {
                tableAction.onClose();
            });
        },
        [handleDelete, tableAction]
    );


    const handleFormSubmit = useCallback(
        ({ data, type, initialData }: { data: FormValueType, type: MUTATION_ACTION, initialData?: TOption }) => {
            if (type === MUTATION_ACTION.CREATE) {

                handleCreate({ schoolId, ...data }, data.optionName, () => {

                    tableAction.onClose();
                });
            } else if (type === MUTATION_ACTION.EDIT && initialData) {

                handleUpdate(initialData.optionId, data, data.optionName, () => {

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
            enhanceColumnsWithMenu<TOption>({
                menus,
                onPressMenu,
                columns: OptionColumns,
            }),
        [menus, onPressMenu]
    );


    const isActionLoading =
        updateMutation.isPending || createMutation.isPending || deleteMutation.isPending;

    return (
        <div className="my-10 mx-auto h-full container max-w-screen-lg">
            <DataTable<TOption>
                data={options}
                columns={enhancedColumns}
                keyExtractor={(item) => item.optionId}
            >
                <DataTableToolbar className="justify-between">
                    <TypographyH3>Gestion des options de l'établissement</TypographyH3>
                    <Button size="sm" className="rounded-full" onClick={tableAction.onCreate}>
                        <Plus className="size-4" />
                        <span>Ajouter une option</span>
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
                itemName="option"
                isLoading={isActionLoading}
                onConfirmDelete={onConfirmDelete as any}
                onFormSubmit={handleFormSubmit as any}
                renderForm={renderForm as any}
            />
        </div>
    );
};

const Option: React.FC<WithSchoolAndYearId> = (props) => {
    return (
        <Suspense>
            <OptionManagementPage {...props} />
        </Suspense>
    );
};

export const OptionPage = withSchoolConfig(Option);