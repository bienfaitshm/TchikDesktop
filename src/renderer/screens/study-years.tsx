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
import { StudyYearForm, type StudyYearFormData as FormValueType } from "@/renderer/components/form/study-year-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import { StudyYearColumns } from "@/renderer/components/tables/columns.study-years";
import type { StudyYearAttributes } from "@/camons/types/services";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DialogConfirmDelete, useConfirmDeleteDialog } from "../components/dialog/dialog-delete";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { FormSubmitter } from "@/renderer/components/form/form-submiter"
import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { useCreateStudyYear, useDeleteStudyYear, useGetStudyYears, useUpdateStudyYear } from "@/renderer/libs/queries/school";

type SchoolDialogState = {
    isOpen: boolean;
    type: 'create' | 'edit';
    initialData?: Partial<StudyYearAttributes>;
}

// --- Reusable Data Table Menu Definitions ---
const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];

// This hook encapsulates all the data fetching, mutation, and state management
// for the school management page, making the main component much cleaner.
const useStudyYearManagement = () => {
    const queryClient = useQueryClient();
    const schoolId = useApplicationConfigurationStore(store => store.currentSchool?.schoolId as string)
    const { data: studyYears = [], isLoading } = useGetStudyYears(schoolId);
    const createMutation = useCreateStudyYear();
    const updateMutation = useUpdateStudyYear();
    const deleteMutation = useDeleteStudyYear();

    const invalidateStudyYearsCache = () => {
        queryClient.invalidateQueries({ queryKey: ["GET_STUDY_YEARS", schoolId] });
    };

    const handleCreate = (values: FormValueType) => {
        createMutation.mutate({ ...values, schoolId }, createMutationCallbacksWithNotifications({
            successMessageTitle: "L'année scolaire créé !",
            successMessageDescription: `L'année scolaire'${values.yearName}' a été ajoutée avec succès.`,
            errorMessageTitle: "Échec de la création de l'année scolaire",
            onSuccess: invalidateStudyYearsCache,
        }));
    };

    const handleUpdate = (yearId: string, values: FormValueType) => {
        updateMutation.mutate({ schoolId, studyYearId: yearId, data: values }, createMutationCallbacksWithNotifications({
            successMessageTitle: "L'année scolaire mis à jour !",
            successMessageDescription: `L'année scolaire '${values.yearName}' a été modifiée avec succès.`,
            errorMessageTitle: "Échec de la mise à jour de l'année scolaire",
            onSuccess: invalidateStudyYearsCache,
        }));
    };

    const handleDelete = (studyYearId: string) => {
        deleteMutation.mutate({ studyYearId, schoolId }, createMutationCallbacksWithNotifications({
            successMessageTitle: "L'année scolaire supprimé !",
            successMessageDescription: "L'année scolaire a été supprimée avec succès.",
            errorMessageTitle: "Échec de la suppression de l'année scolaire",
            onSuccess: invalidateStudyYearsCache,
        }));
    };

    return {
        studyYears,
        isLoading,
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    };
};

const StudyYearFormDialog = ({ state, onClose, onSubmit, isPending }: {
    state: SchoolDialogState;
    onClose: () => void;
    onSubmit: (values: FormValueType) => void;
    isPending: boolean;
}) => {
    const schoolId = useApplicationConfigurationStore(store => store.currentSchool?.schoolId as string)

    const title = state.type === 'create' ? "Création de l'année scolaire" : "Modification de l'année scolaire";
    const description = state.type === 'create' ?
        "Remplissez les informations ci-dessous pour créer une nouvelle année scolaire." :
        "Modifiez les informations de l'année scolaire sélectionnée.";
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
                        <StudyYearForm initialValues={{ ...state.initialData, schoolId }} onSubmit={onSubmit} />
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
const StudyYearManagementPage = () => {
    const {
        studyYears,
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useStudyYearManagement();

    const confirmDelete = useConfirmDeleteDialog<StudyYearAttributes>();

    const [dialogState, setDialogState] = React.useState<SchoolDialogState>({
        isOpen: false,
        type: 'create',
    });

    const openCreateDialog = () => setDialogState({ isOpen: true, type: 'create' });
    const openEditDialog = (school: StudyYearAttributes) => setDialogState({ isOpen: true, type: 'edit', initialData: school });
    const closeDialog = () => setDialogState({ isOpen: false, type: 'create' });

    const handleAction = (key: string, item: StudyYearAttributes) => {
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

    const onConfirmDelete = (item: StudyYearAttributes) => {
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
                <TypographyH3>Gestion des années scolaire</TypographyH3>
            </div>

            <DataTable
                data={studyYears}
                columns={enhanceColumnsWithMenu({
                    onPressMenu: handleAction,
                    columns: StudyYearColumns,
                    menus: tableMenus,
                })}
                keyExtractor={(item) => item.yearId}
            >
                <div className="flex items-center justify-end my-5">
                    <div className="flex items-center gap-5">
                        <DataTableColumnFilter />
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="size-4" />
                            <span>Ajouter une année scolaire</span>
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
            <StudyYearFormDialog
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

const StudyYearsPage = () => {
    return (
        <Suspense>
            <StudyYearManagementPage />
        </Suspense>
    )
}

export default StudyYearsPage;
