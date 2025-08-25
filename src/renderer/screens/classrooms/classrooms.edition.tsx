import React, { useEffect } from "react";
import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
} from "@/renderer/components/tables/data-table";
import { ClassroomForm, type ClassroomFormData as FormValueType } from "@/renderer/components/form/classroom-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import { ClassroomColumns } from "@/renderer/components/tables/columns.classroom";
import type { ClassAttributes } from "@/commons/types/models";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import { Pencil, Trash2 } from "lucide-react";
import { DialogConfirmDelete, useConfirmDeleteDialog } from "@/renderer/components/dialog/dialog-delete";

import { FormSubmitter } from "@/renderer/components/form/form-submiter"
import { WithSchoolAndYearId } from "@/commons/types/services";
import { MUTATION_ACTION } from "@/commons/constants/enum";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { withCurrentConfig } from "@/renderer/hooks/with-application-config";
import { useClassroomManagement } from "@/renderer/hooks/query.mangements";
import { useGetClassroomAsOptions } from "@/renderer/hooks/data-as-options";
import { ButtonLoader } from "@/renderer/components/form/button-loader";

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

type ClassroomFormDialogProps = {
    open: boolean;
    info: DialogDescription;
    onClose: () => void;
    onSubmit: (values: FormValueType) => void;
    isPending: boolean;
    initialValues?: Partial<FormValueType>
}
const ClassroomFormDialog: React.FC<WithSchoolAndYearId<ClassroomFormDialogProps>> = ({ open, schoolId, yearId, info, initialValues, isPending, onClose, onSubmit }) => {
    const options = useGetClassroomAsOptions({ schoolId, yearId })

    useEffect(() => {
        if (!open) {
            document.body.style.pointerEvents = "auto";
        }
        return () => {
            document.body.style.pointerEvents = "auto";
        };
    }, [open]);

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
                            options={options}
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

const ClassroomTable: React.FC<WithSchoolAndYearId<ClassroomTableProps>> = ({ schoolId, yearId, onAction }) => {
    const { data: classrooms = [] } = useGetClassrooms({ schoolId, yearId, params: {} })
    const columns = React.useMemo(() => enhanceColumnsWithMenu({
        onPressMenu: onAction,
        columns: ClassroomColumns,
        menus: tableMenus,
    }), [onAction]);
    return (
        <DataTable
            data={classrooms}
            columns={columns}
            keyExtractor={(item) => `${item.classId}`}
        >
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
    } = useClassroomManagement();

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
        handleDelete(item.classId as string, item.identifier);
        confirmDelete.onClose();
    }, [handleDelete, confirmDelete.onClose]);

    const onSubmitDialog = React.useCallback((values: FormValueType) => {
        if (dialogState.type === MUTATION_ACTION.CREATE) {
            handleCreate(values, values.identifier);
        } else if (dialogState.type === MUTATION_ACTION.EDIT && dialogState.initialData?.classId) {
            handleUpdate(dialogState.initialData?.classId, values, values.identifier);
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
        <div >
            <ClassroomFormDialog
                initialValues={dialogState.initialData}
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
        <div className="mt-6">
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

export const ClassroomTables = withCurrentConfig(ClassroomManagement)
