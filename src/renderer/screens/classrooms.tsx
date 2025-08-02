import React from "react";
import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableColumnFilter,
} from "@/renderer/components/tables/data-table";
import { TypographyH3, TypographySmall } from "@/renderer/components/ui/typography";
import { ClassroomForm, type ClassroomFormData as FormValueType } from "@/renderer/components/form/classroom-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import { ClassroomColumns } from "@/renderer/components/tables/columns.classroom";
import type { ClassAttributes } from "@/camons/types/models";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import { Pencil, Trash2 } from "lucide-react";
import { DialogConfirmDelete, useConfirmDeleteDialog } from "../components/dialog/dialog-delete";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { FormSubmitter } from "@/renderer/components/form/form-submiter"
import { useCreateClassroom, useDeleteClassroom, useGetClassrooms, useGetOptions, useUpdateClassroom } from "@/renderer/libs/queries/school";
import { useApplicationConfigurationStore } from "../libs/stores/app-store";

type SchoolDialogState = {
    isOpen: boolean;
    type: 'create' | 'edit';
    initialData?: Partial<ClassAttributes>;
}

// --- Reusable Data Table Menu Definitions ---
const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];


const useGetCurrentYearSchool = () => {
    return useApplicationConfigurationStore(store => ({
        schoolId: store.currentSchool?.schoolId as string,
        yearId: store.currentStudyYear?.yearId as string
    }))
}

// This hook encapsulates all the data fetching, mutation, and state management
// for the school management page, making the main component much cleaner.
const useClassroomManagement = () => {
    const queryClient = useQueryClient();
    const { schoolId, yearId } = useGetCurrentYearSchool()
    const { data: schools = [], isLoading } = useGetClassrooms(schoolId, yearId);
    const createMutation = useCreateClassroom();
    const updateMutation = useUpdateClassroom();
    const deleteMutation = useDeleteClassroom();

    const invalidateSchoolsCache = () => {
        queryClient.invalidateQueries({ queryKey: ["GET_CLASSROOMS"] });
    };

    const handleCreate = (values: FormValueType) => {
        createMutation.mutate(values, createMutationCallbacksWithNotifications({
            successMessageTitle: "La classe créé !",
            successMessageDescription: `La classe '${values.identifier}' a été ajoutée avec succès.`,
            errorMessageTitle: "Échec de la création de la classe.",
            onSuccess: invalidateSchoolsCache,
        }));
    };

    const handleUpdate = (classId: string, values: FormValueType) => {
        updateMutation.mutate({ classId, schoolId, data: values }, createMutationCallbacksWithNotifications({
            successMessageTitle: "La classe mis à jour !",
            successMessageDescription: `La classe '${values.identifier}' a été modifié avec succès.`,
            errorMessageTitle: "Échec de la mise à jour de la classe.",
            onSuccess: invalidateSchoolsCache,
        }));
    };

    const handleDelete = (classId: string) => {
        deleteMutation.mutate({ classId, schoolId }, createMutationCallbacksWithNotifications({
            successMessageTitle: "La classe supprimé !",
            successMessageDescription: "La classe a été supprimé avec succès.",
            errorMessageTitle: "Échec de la suppression de la classe.",
            onSuccess: invalidateSchoolsCache,
        }));
    };

    return {
        schools,
        isLoading,
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    };
};

const ClassroomFormDialog = ({ state, onClose, onSubmit, isPending }: {
    state: SchoolDialogState;
    onClose: () => void;
    onSubmit: (values: FormValueType) => void;
    isPending: boolean;
}) => {
    const { schoolId, yearId } = useGetCurrentYearSchool()
    const { data: options = [] } = useGetOptions(schoolId)

    const title = state.type === 'create' ? "Création de la classe" : "Modification de la classe";
    const description = state.type === 'create' ?
        "Remplissez les informations ci-dessous pour créer une nouvelle classe." :
        "Modifiez les informations de la classe sélectionnée.";
    const submitText = state.type === 'create' ? "Enregistrer" : "Modifier";


    return (
        <Dialog open={state.isOpen} onOpenChange={onClose}>
            <FormSubmitter>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <FormSubmitter.Wrapper>
                        <ClassroomForm
                            options={options.map((option) => ({ label: option.optionName, value: option.optionId }))}
                            initialValues={{ ...state.initialData, yearId, schoolId }}
                            onSubmit={onSubmit}
                        />
                    </FormSubmitter.Wrapper>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>Annuler</Button>
                        <FormSubmitter.Trigger asChild>
                            <ButtonLoader
                                size="sm"
                                isLoading={isPending}
                                disabled={isPending}
                                isLoadingText="Enregistrement ..."
                            >
                                {submitText}
                            </ButtonLoader>
                        </FormSubmitter.Trigger>
                    </DialogFooter>
                </DialogContent>
            </FormSubmitter>
        </Dialog>
    );
};

// --- Main Page Component ---
const ClassroomManagementPage = () => {
    const {
        schools,
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useClassroomManagement();

    const confirmDelete = useConfirmDeleteDialog<ClassAttributes>();

    const [dialogState, setDialogState] = React.useState<SchoolDialogState>({
        isOpen: false,
        type: 'create',
    });

    const openCreateDialog = () => setDialogState({ isOpen: true, type: 'create' });
    const openEditDialog = (school: ClassAttributes) => setDialogState({ isOpen: true, type: 'edit', initialData: school });
    const closeDialog = () => setDialogState({ isOpen: false, type: 'create' });

    const handleAction = (key: string, item: ClassAttributes) => {
        switch (key) {
            case "edit":
                openEditDialog(item);
                break;
            case "delete":
                confirmDelete.onOpen(item);
                break;
            default:
                console.warn(`Unknown action key: ${key}`);
        }
    };

    const onConfirmDelete = (item: ClassAttributes) => {
        handleDelete(item.schoolId);
        confirmDelete.onClose();
    };

    const onSubmitDialog = (values: FormValueType) => {
        console.log("submit dialog", values)
        if (dialogState.type === 'create') {
            handleCreate(values);
        } else if (dialogState.type === 'edit' && dialogState.initialData?.schoolId) {
            handleUpdate(dialogState.initialData.schoolId, values);
        }
        closeDialog();
    };

    const isFormPending = dialogState.type === 'create' ? createMutation.isPending : updateMutation.isPending;

    return (
        <div className="my-10 mx-auto h-full container max-w-screen-lg">
            <div className="mb-6">
                <TypographyH3>Gestion des La classes Scolaires</TypographyH3>
            </div>

            <DataTable
                data={schools}
                columns={enhanceColumnsWithMenu({
                    onPressMenu: handleAction,
                    columns: ClassroomColumns,
                    menus: tableMenus,
                })}
                keyExtractor={(item) => item.schoolId}
            >
                <div className="flex items-center justify-end my-5">
                    <div className="flex items-center gap-5">
                        <DataTableColumnFilter />
                        <Button size="sm" onClick={openCreateDialog}>Ajouter un La classe</Button>
                    </div>
                </div>
                {deleteMutation.isPending && (
                    <div className="py-1 px-5 my-1 bg-red-400/30 rounded-md">
                        <TypographySmall>Suppression en cours....</TypographySmall>
                    </div>
                )}
                <DataTableContent>
                    <DataContentHead />
                    <DataContentBody />
                </DataTableContent>
                <DataTablePagination />
            </DataTable>

            {/* Dialogs rendered at the root level for accessibility and proper overlay */}
            <ClassroomFormDialog
                state={dialogState}
                onClose={closeDialog}
                onSubmit={onSubmitDialog}
                isPending={isFormPending}
            />
            <DialogConfirmDelete
                item={confirmDelete.item}
                open={confirmDelete.open}
                onClose={confirmDelete.onClose}
                onConfirm={onConfirmDelete}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};

const ClassroomPage = () => {
    return (
        <Suspense>
            <ClassroomManagementPage />
        </Suspense>
    )
}

export default ClassroomPage;
