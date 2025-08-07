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

// Type definition for the dialog state, which is clean and descriptive.
type ClassroomDialogState = {
    isOpen: boolean;
    type: 'create' | 'edit';
    initialData?: Partial<ClassAttributes>;
}

// Reusable menu definitions for the data table actions.
const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];

// Hook that encapsulates all data fetching and mutation logic for classrooms.
const useClassroomManagement = ({ schoolId, yearId }: { schoolId: string; yearId: string }) => {
    const queryClient = useQueryClient();
    const { data: classrooms = [] } = useGetClassrooms(schoolId, yearId);
    const createMutation = useCreateClassroom();
    const updateMutation = useUpdateClassroom();
    const deleteMutation = useDeleteClassroom();

    // Helper function to invalidate the classroom cache, triggering a refetch.
    const invalidateClassroomsCache = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["GET_CLASSROOMS"] });
    }, [queryClient]);

    // Handler for creating a new classroom.
    const handleCreate = React.useCallback((values: FormValueType) => {
        createMutation.mutate(values, createMutationCallbacksWithNotifications({
            successMessageTitle: "La classe créé !",
            successMessageDescription: `La classe '${values.identifier}' a été ajoutée avec succès.`,
            errorMessageTitle: "Échec de la création de la classe.",
            onSuccess: invalidateClassroomsCache,
        }));
    }, [createMutation, invalidateClassroomsCache]);

    // Handler for updating an existing classroom.
    const handleUpdate = React.useCallback((classId: string, values: FormValueType) => {
        updateMutation.mutate({ classId, schoolId, data: values }, createMutationCallbacksWithNotifications({
            successMessageTitle: "La classe mis à jour !",
            successMessageDescription: `La classe '${values.identifier}' a été modifié avec succès.`,
            errorMessageTitle: "Échec de la mise à jour de la classe.",
            onSuccess: invalidateClassroomsCache,
        }));
    }, [updateMutation, schoolId, invalidateClassroomsCache]);

    // Handler for deleting a classroom.
    const handleDelete = React.useCallback((classId: string) => {
        deleteMutation.mutate({ classId, schoolId }, createMutationCallbacksWithNotifications({
            successMessageTitle: "La classe supprimé !",
            successMessageDescription: "La classe a été supprimé avec succès.",
            errorMessageTitle: "Échec de la suppression de la classe.",
            onSuccess: invalidateClassroomsCache,
        }));
    }, [deleteMutation, schoolId, invalidateClassroomsCache]);

    return {
        classrooms,
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    };
};

// Component for the classroom creation/edit dialog.
const ClassroomFormDialog = React.memo(({ state, onClose, onSubmit, isPending, schoolId, yearId }: {
    state: ClassroomDialogState;
    onClose: () => void;
    onSubmit: (values: FormValueType) => void;
    isPending: boolean;
    schoolId: string;
    yearId: string
}) => {
    // Fetch options for the form.
    const { data: options = [] } = useGetOptions(schoolId);

    const title = state.type === 'create' ? "Création de la classe" : "Modification de la classe";
    const description = state.type === 'create' ?
        "Remplissez les informations ci-dessous pour créer une nouvelle classe." :
        "Modifiez les informations de la classe sélectionnée.";
    const submitText = state.type === 'create' ? "Enregistrer" : "Modifier";

    const formattedOptions = React.useMemo(() => (
        options.map((option) => ({ label: option.optionName, value: option.optionId }))
    ), [options]);

    const initialValues = React.useMemo(() => (
        { ...state.initialData, yearId, schoolId }
    ), [state.initialData, yearId, schoolId]);

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
                            options={formattedOptions}
                            initialValues={initialValues}
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
});

// New, separate component for the data table.
const ClassroomTable = React.memo(({ classrooms, onAction, isDeleting, onOpenCreateDialog }: {
    classrooms: ClassAttributes[];
    onOpenCreateDialog(): void
    onAction: (key: string, item: ClassAttributes) => void;
    isDeleting?: boolean
}) => {
    const columns = React.useMemo(() => enhanceColumnsWithMenu({
        onPressMenu: onAction,
        columns: ClassroomColumns,
        menus: tableMenus,
    }), [onAction]);

    return (
        <DataTable
            data={classrooms}
            columns={columns}
            keyExtractor={(item) => item.schoolId}
        >
            <div className="flex items-center justify-end my-5">
                <div className="flex items-center gap-5">
                    <DataTableColumnFilter />
                    <Button size="sm" onClick={onOpenCreateDialog}>Ajouter un La classe</Button>
                </div>
            </div>
            {isDeleting && (
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
    )
})

type ClassroomManagementProps = {
    schoolId: string,
    yearId: string
}

// This component now focuses solely on state management and dialogs.
const ClassroomManagementPage: React.FC<ClassroomManagementProps> = ({ schoolId, yearId }) => {
    const {
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
        classrooms
    } = useClassroomManagement({ schoolId, yearId });

    const confirmDelete = useConfirmDeleteDialog<ClassAttributes>();

    const [dialogState, setDialogState] = React.useState<ClassroomDialogState>({
        isOpen: false,
        type: 'create',
    });

    // Corrections avec useCallback pour mémoriser les fonctions
    const openCreateDialog = React.useCallback(() => setDialogState({ isOpen: true, type: 'create' }), []);
    const openEditDialog = React.useCallback((item: ClassAttributes) => setDialogState({ isOpen: true, type: 'edit', initialData: item }), []);
    const closeDialog = React.useCallback(() => setDialogState({ isOpen: false, type: 'create' }), []);

    const handleAction = React.useCallback((key: string, item: ClassAttributes) => {
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
    }, [confirmDelete.onOpen, openEditDialog]);

    const onConfirmDelete = React.useCallback((item: ClassAttributes) => {
        handleDelete(item.schoolId);
        confirmDelete.onClose();
    }, [handleDelete, confirmDelete.onClose]);

    const onSubmitDialog = React.useCallback((values: FormValueType) => {
        if (dialogState.type === 'create') {
            handleCreate(values);
        } else if (dialogState.type === 'edit' && dialogState.initialData?.schoolId) {
            handleUpdate(dialogState.initialData.schoolId, values);
        }
        closeDialog();
    }, [dialogState, handleCreate, handleUpdate, closeDialog]);

    const isFormPending = dialogState.type === 'create' ? createMutation.isPending : updateMutation.isPending;

    return (
        <div className="my-10 mx-auto h-full container max-w-screen-lg">
            <div className="mb-6">
                <TypographyH3>Gestion des classes Scolaires</TypographyH3>
            </div>

            <ClassroomTable
                classrooms={classrooms}
                onAction={handleAction}
                onOpenCreateDialog={openCreateDialog}
                isDeleting={deleteMutation.isPending}
            />

            {/* Dialogs rendered at the root level for accessibility and proper overlay */}
            <ClassroomFormDialog
                schoolId={schoolId}
                yearId={yearId}
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
    // const { isSet, schoolId, yearId } = useApplicationConfigurationStore(s => s.getCurrentStudyYearSchool())
    // if (!isSet) return null
    // console.log("first")
    return (
        <ClassroomManagementPage schoolId={"schoolId"} yearId={"yearId"} />
    )
}

export default ClassroomPage;