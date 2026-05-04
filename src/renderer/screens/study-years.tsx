
import { StudyYearForm, type StudyYearFormData as FormValueType } from "@/renderer/components/form/study-year-form";
import { Button } from "@/renderer/components/ui/button";
import { Plus } from "lucide-react";

import { useCallback, } from "react";
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
import { useStudyYearManagement } from "@/renderer/hooks/query.mangements";
import { useGetStudyYears } from "@/renderer/libs/queries/school";
import {
    TableActionManager,
    useTableAction,
} from "@/renderer/components/dialog/dialog.table-action";
import type { TStudyYear } from "@/packages/@core/data-access/db/schemas/types";
import { MUTATION_ACTION_ENUM } from "@/packages/@core/data-access/db/enum";
import { useSchoolContext } from "../hooks/app-config-router";




export const StudyYearPage = () => {
    const { schoolId } = useSchoolContext();

    const {
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useStudyYearManagement();


    const { data: studyYears = [] } = useGetStudyYears({ where: { schoolId } });
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
        ({ data, type, initialData }: { data: FormValueType, type: MUTATION_ACTION_ENUM, initialData?: TStudyYear }) => {
            if (type === MUTATION_ACTION_ENUM.CREATE) {
                handleCreate(data, data.yearName, () => {
                    tableAction.onClose();
                });
            } else if (type === MUTATION_ACTION_ENUM.EDIT && initialData) {
                handleUpdate(initialData.yearId, data, data.yearName, () => {
                    tableAction.onClose();
                });
            }
        },
        [handleCreate, handleUpdate, schoolId, tableAction]
    );




    const isActionLoading =
        updateMutation.isPending || createMutation.isPending || deleteMutation.isPending;

    return (
        <div className="my-10 mx-auto h-full container max-w-screen-lg">
            <DataTable<TStudyYear>
                data={studyYears}
                columns={StudyYearColumns}
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
