import React, { useCallback } from "react"
import { 
    Dialog, DialogClose, DialogContent, DialogFooter, 
    DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { SchoolForm, type SchoolFormData } from "@/renderer/components/form/school-form"
import { useCreateSchoolForm, useUpdateSchoolForm, useDeleteSchoolForm } from "@/renderer/components/form/school-form.actions"
import { ConfirmDeleteDialog, useConfirm } from "@/renderer/components/dialog/dialog-delete"


type CreateSchoolDialogProps = {
    children: React.ReactNode
    defaultValues?: Partial<SchoolFormData>
}

export const CreateSchoolDialog: React.FC<CreateSchoolDialogProps> = ({ children, defaultValues }) => {
    const { formId, onSubmit, isLoading } = useCreateSchoolForm()

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Nouvel établissement</DialogTitle>
                    <DialogDescription>
                        Renseignez les détails pour configurer votre établissement scolaire.
                    </DialogDescription>
                </DialogHeader>

                <SchoolForm
                    formId={formId}
                    onSubmit={onSubmit}
                    initialValues={defaultValues}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isLoading}>
                        Créer l'établissement
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * DIALOG DE MISE À JOUR
 */
type UpdateSchoolDialogProps = {
    children: React.ReactNode
    schoolId: string
    initialData?: Partial<SchoolFormData>
}

export const UpdateSchoolDialog: React.FC<UpdateSchoolDialogProps> = ({ initialData, schoolId, children }) => {
    const { formId, isLoading, onSubmit } = useUpdateSchoolForm()

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Modifier l'établissement</DialogTitle>
                    <DialogDescription>
                        Mettez à jour les informations de {initialData?.name || "l'établissement"}.
                    </DialogDescription>
                </DialogHeader>

                <SchoolForm
                    formId={formId}
                    onSubmit={(data) => onSubmit({ id: schoolId, data })}
                    initialValues={initialData}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isLoading}>
                        Enregistrer les modifications
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


interface DeleteSchoolDialogProps {
    children: (props: { onOpen: () => void; isLoading: boolean }) => React.ReactNode
    schoolId: string
    schoolName: string
}

export const DeleteSchoolDialog: React.FC<DeleteSchoolDialogProps> = ({
    children,
    schoolId,
    schoolName,
}) => {
    const { isOpen, onOpen, onClose } = useConfirm<string>()

    const { onSubmit: deleteSchool, isLoading } = useDeleteSchoolForm({
        onSuccess: onClose,
    })

    const handleConfirm = useCallback(async () => {
        await deleteSchool(schoolId, schoolName)
    }, [schoolId, schoolName, deleteSchool])

    return (
        <>
            <ConfirmDeleteDialog
                item={schoolId}
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirm}
                isLoading={isLoading}
                title="Supprimer l'établissement"
                description="Attention : cette action est irréversible. Toutes les données liées (élèves, classes, années) seront impactées."
                itemName={schoolName}
            />
            {children({
                onOpen: () => onOpen(schoolId),
                isLoading: isLoading
            })}
        </>
    )
}

DeleteSchoolDialog.displayName = "DeleteSchoolDialog"