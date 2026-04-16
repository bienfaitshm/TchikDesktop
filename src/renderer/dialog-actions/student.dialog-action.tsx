import React from "react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { BaseUserForm, type UserCreateFormData } from "@/renderer/components/form/user-form"
import { useCreateUserForm, useDeleteUserForm, useUpdateUserForm } from "@/renderer/components/form/user-form.actions"
import { ConfirmDeleteDialog, useConfirm } from "@/renderer/components/dialog/dialog-delete"
import { UserPlus, UserCog } from "lucide-react"

type CreateStudentDialogProps = {
    children: React.ReactNode
    defaultValues?: Partial<UserCreateFormData>
}

type UpdateStudentDialogProps = {
    children: React.ReactNode
    studentId: string
    initialData?: Partial<UserCreateFormData>
}

// --- Création d'un élève ---
export const CreateStudentDialog: React.FC<CreateStudentDialogProps> = ({ children, defaultValues }) => {
    const { formId, createUser, isCreating } = useCreateUserForm()

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        <DialogTitle>Inscrire un nouvel élève</DialogTitle>
                    </div>
                    <DialogDescription>
                        Renseignez les informations d'identité et les coordonnées pour créer le dossier scolaire.
                    </DialogDescription>
                </DialogHeader>

                <BaseUserForm
                    formId={formId}
                    onSubmit={createUser}
                    initialValues={defaultValues}
                />

                <DialogFooter className="border-t pt-4">
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isCreating}>
                        Confirmer l'inscription
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// --- Modification d'un élève ---
export const UpdateStudentDialog: React.FC<UpdateStudentDialogProps> = ({ initialData, studentId, children }) => {
    const { formId, isUpdating, updateUser } = useUpdateUserForm()

    const studentFullName = `${initialData?.lastName} ${initialData?.firstName}`

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-primary" />
                        <DialogTitle>Modifier le profil : {studentFullName}</DialogTitle>
                    </div>
                    <DialogDescription>
                        Mettez à jour les informations du dossier. Les modifications sont instantanées.
                    </DialogDescription>
                </DialogHeader>

                <BaseUserForm
                    formId={formId}
                    onSubmit={(data, helpers) => updateUser({ id: studentId, data }, helpers)}
                    initialValues={initialData}
                />

                <DialogFooter className="border-t pt-4">
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isUpdating}>
                        Enregistrer les modifications
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// --- Suppression d'un élève ---
interface DeleteStudentDialogProps {
    children: (props: { onOpen: () => void; isLoading: boolean }) => React.ReactNode
    studentId: string
    studentName: string
}

export const DeleteStudentDialog: React.FC<DeleteStudentDialogProps> = ({
    children,
    studentId,
    studentName,
}) => {
    const { isOpen, onOpen, onClose } = useConfirm<string>()

    const { deleteUser, isDeleting } = useDeleteUserForm({
        onSuccess: onClose,
    })

    const handleConfirm = React.useCallback(async () => {
        await deleteUser(studentId, studentName)
    }, [studentId, studentName, deleteUser])

    return (
        <>
            <ConfirmDeleteDialog
                item={studentId}
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirm}
                isLoading={isDeleting}
                title="Supprimer le dossier élève"
                description="Cette action est irréversible. Toutes les notes, absences et données liées à cet élève seront perdues."
                itemName={studentName}
            />

            {children({
                onOpen: () => onOpen(studentId),
                isLoading: isDeleting
            })}
        </>
    )
}

DeleteStudentDialog.displayName = "DeleteStudentDialog"