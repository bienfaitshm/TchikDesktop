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
import { OptionForm, type OptionFormData as FormValueType } from "@/renderer/components/form/option-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import { OptionColumns } from "@/renderer/components/tables/columns.options";
import type { OptionAttributes } from "@/commons/types/models";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DialogConfirmDelete, useConfirmDeleteDialog } from "../components/dialog/dialog-delete";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { useCreateOption, useDeleteOption, useGetOptions, useUpdateOption } from "@/renderer/libs/queries/school";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { FormSubmitter } from "@/renderer/components/form/form-submiter"
import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";


type SchoolDialogState = {
    isOpen: boolean;
    type: 'create' | 'edit';
    initialData?: Partial<OptionAttributes>;
}

// --- Reusable Data Table Menu Definitions ---
const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];

// This hook encapsulates all the data fetching, mutation, and state management
// for the school management page, making the main component much cleaner.
const useOptionManagement = () => {
    const queryClient = useQueryClient();
    const schoolId = useApplicationConfigurationStore(store => store.currentSchool?.schoolId as string)
    const { data: schools = [], isLoading } = useGetOptions(schoolId);
    const createMutation = useCreateOption();
    const updateMutation = useUpdateOption();
    const deleteMutation = useDeleteOption();

    const invalidateSchoolsCache = () => {
        queryClient.invalidateQueries({ queryKey: ["GET_OPTIONS", schoolId] });
    };

    const handleCreate = (values: FormValueType) => {
        createMutation.mutate({ ...values, schoolId }, createMutationCallbacksWithNotifications({
            successMessageTitle: "Option créé !",
            successMessageDescription: `L'Option '${values.optionName}' a été ajouté avec succès.`,
            errorMessageTitle: "Échec de la création de l'Option.",
            onSuccess: invalidateSchoolsCache,
        }));
    };

    const handleUpdate = (optionId: string, values: FormValueType) => {
        updateMutation.mutate({ schoolId, optionId, data: values }, createMutationCallbacksWithNotifications({
            successMessageTitle: "Option mis à jour !",
            successMessageDescription: `L'Option '${values.optionName}' a été modifié avec succès.`,
            errorMessageTitle: "Échec de la mise à jour de l'Option.",
            onSuccess: invalidateSchoolsCache,
        }));
    };

    const handleDelete = (optionId: string) => {
        deleteMutation.mutate({ optionId, schoolId }, createMutationCallbacksWithNotifications({
            successMessageTitle: "Option supprimé !",
            successMessageDescription: "L'Option a été supprimé avec succès.",
            errorMessageTitle: "Échec de la suppression de l'Option.",
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

const OptionFormDialog = ({ state, onClose, onSubmit, isPending }: {
    state: SchoolDialogState;
    onClose: () => void;
    onSubmit: (values: FormValueType) => void;
    isPending: boolean;
}) => {
    const title = state.type === 'create' ? "Création de l'option" : "Modification de l'option";
    const description = state.type === 'create' ?
        "Remplissez les informations ci-dessous pour créer une nouvelle option." :
        "Modifiez les informations de l'Option sélectionné.";
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
                        <OptionForm initialValues={state.initialData} onSubmit={onSubmit} />
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
const OptionManagementPage = () => {
    const {
        schools,
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useOptionManagement();

    const confirmDelete = useConfirmDeleteDialog<OptionAttributes>();

    const [dialogState, setDialogState] = React.useState<SchoolDialogState>({
        isOpen: false,
        type: 'create',
    });

    const openCreateDialog = () => setDialogState({ isOpen: true, type: 'create' });
    const openEditDialog = (school: OptionAttributes) => setDialogState({ isOpen: true, type: 'edit', initialData: school });
    const closeDialog = () => setDialogState({ isOpen: false, type: 'create' });

    const handleAction = (key: string, item: OptionAttributes) => {
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

    const onConfirmDelete = (item: OptionAttributes) => {
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
                <TypographyH3>Gestion des options de l'établissement</TypographyH3>
            </div>

            <DataTable
                data={schools}
                columns={enhanceColumnsWithMenu({
                    onPressMenu: handleAction,
                    columns: OptionColumns,
                    menus: tableMenus,
                })}
                keyExtractor={(item) => item.optionId}
            >
                <div className="flex items-center justify-end my-5">
                    <div className="flex items-center gap-5">
                        <DataTableColumnFilter />
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="size-4" />
                            <span>Ajouter une option</span>
                        </Button>
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
            <OptionFormDialog
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

const OptionPage = () => {
    return (
        <Suspense>
            <OptionManagementPage />
        </Suspense>
    )
}

export default OptionPage;
