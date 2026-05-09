import React, { useState } from "react"
import { 
    Dialog, 
    DialogClose, 
    DialogContent, 
    DialogFooter, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { SeatingSessionForm } from "@/renderer/components/form/seating-sessin-form"
import { 
    useCreateSeatingSessionForm, 
    useDeleteSeatingSessionForm, 
    useUpdateSeatingSessionForm 
} from "@/renderer/components/form/seating-sessin-form.actions"
import { ConfirmDeleteDialog, useConfirm } from "@/renderer/components/dialog/dialog-delete"
import type { SeatingSessionData } from "@/renderer/components/form/seating-sessin-form.actions"

type CreateSeatingSessionDialogProps = {
    children: React.ReactNode
    defaultValues?: Partial<SeatingSessionData>
}

export const CreateSeatingSessionDialog: React.FC<CreateSeatingSessionDialogProps> = ({ children, defaultValues }) => {
    const [open, setOpen] = useState(false)
    
    const { formId, isLoading, onSubmit } = useCreateSeatingSessionForm({
        onSuccess: () => setOpen(false)
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Nouvelle session de mise en place</DialogTitle>
                    <DialogDescription>
                        Configurez une nouvelle session d'examen ou de concours.
                    </DialogDescription>
                </DialogHeader>

                <SeatingSessionForm
                    formId={formId}
                    onSubmit={onSubmit}
                    initialValues={defaultValues}
                />

                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isLoading}>
                        Créer la session
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

type UpdateSeatingSessionDialogProps = {
    children: React.ReactNode
    seatingSessionId: string
    initialData?: Partial<SeatingSessionData>
}

export const UpdateSeatingSessionDialog: React.FC<UpdateSeatingSessionDialogProps> = ({ initialData, seatingSessionId, children }) => {
    const [open, setOpen] = useState(false)
    
    const { formId, isLoading, onSubmit } = useUpdateSeatingSessionForm({
        onSuccess: () => setOpen(false)
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Modifier la session</DialogTitle>
                    <DialogDescription>
                        Mettez à jour les paramètres de la session "{initialData?.sessionName}".
                    </DialogDescription>
                </DialogHeader>

                <SeatingSessionForm
                    formId={formId}
                    onSubmit={(data, helpers) => onSubmit({ id: seatingSessionId, data }, helpers)}
                    initialValues={initialData}
                />

                <DialogFooter className="gap-2 sm:gap-0">
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

interface DeleteSeatingSessionDialogProps {
    children: (props: { onOpen: () => void; isLoading: boolean }) => React.ReactNode
    seatingSessionId: string
    seatingSessionName: string
}

export const DeleteSeatingSessionDialog: React.FC<DeleteSeatingSessionDialogProps> = ({
    children,
    seatingSessionId,
    seatingSessionName,
}) => {
    const { isOpen, onOpen, onClose } = useConfirm<string>()

    const { deleteSeatingSession, isDeleting } = useDeleteSeatingSessionForm({
        onSuccess: onClose,
    })

    const handleConfirm = React.useCallback(async () => {
        try {
            await deleteSeatingSession(seatingSessionId, seatingSessionName)
        } catch (error) {
            console.error("Erreur lors de la suppression:", error)
        }
    }, [seatingSessionId, seatingSessionName, deleteSeatingSession])

    return (
        <>
            <ConfirmDeleteDialog
                item={seatingSessionId}
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirm}
                isLoading={isDeleting}
                title="Supprimer la session ?"
                description="Cette action est irréversible. Toutes les assignations de places et les plans de salle liés à cette session seront perdus."
                itemName={seatingSessionName}
            />

            {children({
                onOpen: () => onOpen(seatingSessionId),
                isLoading: isDeleting
            })}
        </>
    )
}