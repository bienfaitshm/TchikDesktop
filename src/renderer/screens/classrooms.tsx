import React from "react";
import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableColumnFilter,
} from "@/renderer/components/tables/data-table";
import { TypographyH3 } from "@/renderer/components/ui/typography";
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
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { FormSubmitter } from "@/renderer/components/form/form-submiter"
import { useCreateClassroom, useDeleteClassroom, useGetClassrooms, useGetOptions, useUpdateClassroom } from "@/renderer/libs/queries/school";
import { useGetCurrentYearSchool } from "../libs/stores/app-store";
import { WithSchoolAndYearId } from "@/camons/types/services";
import { MUTATION_ACTION } from "@/camons/constants/enum";

type DialogDescription = {
    title: string;
    description: string;
    submitText: string;

}
type TDialogTextInfos = Record<MUTATION_ACTION, DialogDescription>



type ClassroomDialogState = {
    isOpen: boolean;
    type: MUTATION_ACTION;
    initialData?: Partial<ClassAttributes>;
}

// consts

const DIALOG_TEXT_INFOS: TDialogTextInfos = {
    [MUTATION_ACTION.CREATE]: {
        title: "Création de la classe",
        description: "Remplissez les informations ci-dessous pour créer une nouvelle classe.",
        submitText: "Enregistrer"
    },
    [MUTATION_ACTION.EDIT]: {
        title: "Modification de la classe",
        description: "Modifiez les informations de la classe sélectionnée.",
        submitText: "Modifier"
    },
}
const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];

const useClassroomManagement = ({ schoolId }: WithSchoolAndYearId<{}>) => {
    const queryClient = useQueryClient();
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
    const handleUpdate = React.useCallback((classId: string, values: Partial<FormValueType>) => {
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
            onError(error) {
                console.log("Error===>", error)
            },
        }));
    }, [deleteMutation, schoolId, invalidateClassroomsCache]);

    return {
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    };
};

type ClassroomFormDialogProps = {
    open: boolean;
    info: DialogDescription;
    onClose: () => void;
    onSubmit: (values: FormValueType) => void;
    isPending: boolean;
    initialValues?: FormValueType
}
const ClassroomFormDialog: React.FC<WithSchoolAndYearId<ClassroomFormDialogProps>> = ({ open, schoolId, yearId, info, initialValues, isPending, onClose, onSubmit }) => {
    const { data: options = [] } = useGetOptions(schoolId);

    const formattedOptions = React.useMemo(() => (
        options.map((option) => ({ label: option.optionName, value: option.optionId }))
    ), [options]);


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <FormSubmitter>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{info.title}</DialogTitle>
                        <DialogDescription>{info.description}</DialogDescription>
                    </DialogHeader>
                    <FormSubmitter.Wrapper>
                        <ClassroomForm
                            options={formattedOptions}
                            initialValues={{ ...initialValues, yearId, schoolId }}
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
                                {info.submitText}
                            </ButtonLoader>
                        </FormSubmitter.Trigger>
                    </DialogFooter>
                </DialogContent>
            </FormSubmitter>
        </Dialog>
    );
};




type ClassroomTableProps = {
    onOpenCreateDialog(): void
    onAction: (key: string, item: ClassAttributes) => void;
}

const ClassroomTable: React.FC<WithSchoolAndYearId<ClassroomTableProps>> = ({ schoolId, yearId, onAction, onOpenCreateDialog }) => {
    const { data: classrooms = [] } = useGetClassrooms(schoolId, yearId)
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
            <DataTableContent>
                <DataContentHead />
                <DataContentBody />
            </DataTableContent>
            <DataTablePagination />
        </DataTable>
    )

}

type FormManagementDialogRef = {
    openCreateDialog(): void;
    openEditDialog(item: ClassAttributes): void;
    openDeleteDialog(item: ClassAttributes): void;
}
const FormManagementDialog = React.forwardRef<FormManagementDialogRef, Required<WithSchoolAndYearId<{}>>>(({ schoolId, yearId }, ref) => {
    const {
        createMutation,
        updateMutation,
        deleteMutation,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useClassroomManagement({ schoolId, yearId });

    const [dialogState, setDialogState] = React.useState<ClassroomDialogState>({
        isOpen: false,
        type: MUTATION_ACTION.CREATE,
    });

    const isFormPending = React.useMemo(() => dialogState.type === MUTATION_ACTION.CREATE ? createMutation.isPending : updateMutation.isPending, [])
    const confirmDelete = useConfirmDeleteDialog<ClassAttributes>();
    const openCreateDialog = React.useCallback(() => setDialogState({ isOpen: true, type: MUTATION_ACTION.CREATE }), []);
    const openEditDialog = React.useCallback((item: ClassAttributes) => setDialogState({ isOpen: true, type: MUTATION_ACTION.EDIT, initialData: item }), []);
    const closeDialog = React.useCallback(() => setDialogState({ isOpen: false, type: MUTATION_ACTION.CREATE }), []);

    const onConfirmDelete = React.useCallback((item: ClassAttributes) => {
        handleDelete(item.schoolId);
        confirmDelete.onClose();
    }, [handleDelete, confirmDelete.onClose]);

    const onSubmitDialog = React.useCallback((values: FormValueType) => {
        if (dialogState.type === MUTATION_ACTION.CREATE) {
            handleCreate(values);
        } else if (dialogState.type === MUTATION_ACTION.EDIT && dialogState.initialData?.schoolId) {
            handleUpdate(dialogState.initialData.schoolId, values);
        }
        closeDialog();
    }, [dialogState, handleCreate, handleUpdate, closeDialog]);

    React.useImperativeHandle(ref, () => ({
        openCreateDialog,
        openEditDialog,
        openDeleteDialog(item) {
            confirmDelete.onOpen(item)
        },
    }), [openCreateDialog, openEditDialog])
    return (
        <div>
            <ClassroomFormDialog
                open={dialogState.isOpen}
                info={DIALOG_TEXT_INFOS[dialogState.type]}
                schoolId={schoolId}
                yearId={yearId}
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
    )
})

FormManagementDialog.displayName = "FormManagementDialog"


const ClassroomManagement: React.FC<Required<WithSchoolAndYearId<{}>>> = ({ schoolId, yearId }) => {
    console.log("ClassroomManagement")
    const formManagementDialogRef = React.useRef<FormManagementDialogRef | null>(null)

    const handleAction = React.useCallback((key: string, item: ClassAttributes) => {
        switch (key) {
            case "edit":
                formManagementDialogRef.current?.openEditDialog(item)
                break;
            case "delete":
                formManagementDialogRef.current?.openDeleteDialog(item)
                break;
            default:
                console.warn(`Unknown action key: ${key}`);
        }
    }, [formManagementDialogRef]);
    return (
        <div className="my-10 mx-auto h-full container max-w-screen-lg">
            <div className="mb-6">
                <TypographyH3>Gestion des classes Scolaires</TypographyH3>
            </div>
            <ClassroomTable
                schoolId={schoolId}
                yearId={yearId}
                onAction={handleAction}
                onOpenCreateDialog={() => formManagementDialogRef.current?.openCreateDialog()}
            />
            <div>
                <FormManagementDialog
                    ref={formManagementDialogRef}
                    schoolId={schoolId}
                    yearId={yearId}
                />
            </div>
        </div>
    )
}

const ClassroomPage = () => {
    console.log("ClassroomPage")
    const { schoolId, yearId } = useGetCurrentYearSchool()
    if (!schoolId && !yearId) {
        return null;
    }
    return <ClassroomManagement schoolId={schoolId} yearId={yearId} />
}

export default ClassroomPage;