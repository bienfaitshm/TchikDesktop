import { ClassroomForm, type ClassroomFormData as FormValueType } from "@/renderer/components/form/classroom-form";
import type { TClassroom } from "@/commons/types/models";

import { MUTATION_ACTION } from "@/commons/constants/enum";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { useClassroomManagement } from "@/renderer/hooks/query.mangements";
import React, { useCallback, useMemo, useState } from "react";
import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableToolbar,
} from "@/renderer/components/tables/data-table";
import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import { ClassroomColumns } from "@/renderer/components/tables/columns.classroom";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import { LayoutGrid, ListTodo, Pencil, Plus, Trash2 } from "lucide-react";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { withCurrentConfig } from "@/renderer/hooks/with-application-config";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { createMenuActionManager } from "@/renderer/utils/handle-action";
import {
    TableActionManager,
    useTableAction,
} from "@/renderer/components/dialog/dialog.table-action";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/renderer/components/ui/tabs";
import { ClassroomListOrGroup } from "./classrooms.view";



const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];


const ClassroomManagementPage: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    // Gère l'état du mode d'affichage : 'list' pour la vue normale, 'edit' pour le mode édition.
    const [viewMode, setViewMode] = useState<"list" | "edit">("list");
    const {
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useClassroomManagement();


    const { data: classrooms = [] } = useGetClassrooms({ schoolId, yearId });
    const options = useGetOptionAsOptions(schoolId)

    const tableAction = useTableAction<TClassroom>();
    const onConfirmDelete = useCallback(
        (item: TClassroom) => {
            handleDelete(item.classId, item.identifier, () => {
                tableAction.onClose();
            });
        },
        [handleDelete, tableAction]
    );


    const handleFormSubmit = useCallback(
        ({ data, type, initialData }: { data: FormValueType, type: MUTATION_ACTION, initialData?: TClassroom }) => {
            if (type === MUTATION_ACTION.CREATE) {
                handleCreate(data, data.identifier, () => {
                    tableAction.onClose();
                });
            } else if (type === MUTATION_ACTION.EDIT && initialData) {

                handleUpdate(initialData.classId, data, data.identifier, () => {

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
            enhanceColumnsWithMenu<TClassroom>({
                menus,
                onPressMenu,
                columns: ClassroomColumns,
            }),
        [menus, onPressMenu]
    );


    const isActionLoading =
        updateMutation.isPending || createMutation.isPending || deleteMutation.isPending;

    return (
        <div className="my-10 mx-auto h-full container max-w-screen-lg">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "edit")}>
                {/* Contenu de l'onglet "Vue Liste" */}

                <DataTable<TClassroom>
                    data={classrooms}
                    columns={enhancedColumns}
                    keyExtractor={(item) => item.classId}
                >
                    <DataTableToolbar className="justify-between">
                        <TabsList className="grid w-fit grid-cols-2 p-0 h-auto bg-transparent border-b rounded-none shadow-none"> {/* Styles modifiés ici */}
                            <TabsTrigger
                                value="list"
                                className="flex items-center gap-2 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none shadow-none text-muted-foreground hover:text-foreground pb-2 pt-0" // Styles modifiés ici
                            >
                                <ListTodo className="size-4" /> {/* Icône pour le mode Liste */}
                                <span>Vue Liste</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="edit"
                                className="flex items-center gap-2 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none shadow-none text-muted-foreground hover:text-foreground pb-2 pt-0" // Styles modifiés ici
                            >
                                <LayoutGrid className="size-4" /> {/* Icône pour le mode Édition */}
                                <span>Mode Édition</span>
                            </TabsTrigger>
                        </TabsList>

                        <Button size="sm" className="rounded-full" onClick={tableAction.onCreate}>
                            <Plus className="size-4" />
                            <span>Ajouter une classe</span>
                        </Button>
                    </DataTableToolbar>
                    <Suspense>
                        <TabsContent value="list" className="mt-0"> {/* mt-0 pour annuler la marge par défaut des TabsContent */}
                            {/* Affiche la vue des sections de classes */}
                            <ClassroomListOrGroup classrooms={classrooms} isGroupedView />
                        </TabsContent>
                        {/* Contenu de l'onglet "Mode Édition" */}
                        <TabsContent value="edit" className="mt-0"> {/* mt-0 pour annuler la marge par défaut des TabsContent */}
                            {/* Affiche les tables d'édition des classes */}
                            <DataTableContent>
                                <DataContentHead />
                                <DataContentBody />
                            </DataTableContent>
                            <DataTablePagination />
                        </TabsContent>
                    </Suspense>

                </DataTable>

            </Tabs>

            {/* Les dialogues sont rendus au niveau racine pour une meilleure accessibilité et superposition */}
            <TableActionManager
                ref={tableAction.tableActionRef}
                itemName="Classe"
                isLoading={isActionLoading}
                onConfirmDelete={onConfirmDelete as any}
                onFormSubmit={handleFormSubmit as any}
                renderForm={(({ initialData, onSubmit }: { initialData?: FormValueType, onSubmit?(value: FormValueType): void }) => {
                    return (
                        <ClassroomForm
                            options={options}
                            onSubmit={onSubmit}
                            initialValues={{ ...initialData, schoolId, yearId }}
                        />
                    )
                }) as any}
            />
        </div>
    );
};

const Classroom: React.FC<WithSchoolAndYearId> = (props) => {
    return (
        <Suspense>
            <ClassroomManagementPage {...props} />
        </Suspense>
    );
};


export const ClassroomPage = withCurrentConfig(Classroom);
