import React from "react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { OptionForm, type OptionFormData } from "@/renderer/components/form/option-form"
import { useCreateOptionForm, useUpdateOptionForm, useDeleteOptionForm } from "@/renderer/components/form/option-form.actions"
import { ConfirmDeleteDialog, useConfirm } from "@/renderer/components/dialog/dialog-delete"


type CreateOptionDialogProps = {
    children: React.ReactNode
    defaultValues?: Partial<OptionFormData>
}

type UpdateOptionDialogProps = {
    children: React.ReactNode
    optionId: string
    initialData?: Partial<OptionFormData>
}


export const CreateOptionDialog: React.FC<CreateOptionDialogProps> = ({ children, defaultValues }) => {
    const { formId, createOption, isCreating } = useCreateOptionForm()

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Créer une filière</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations ci-dessous pour ajouter une nouvelle filière à votre établissement.
                    </DialogDescription>
                </DialogHeader>

                <OptionForm
                    formId={formId}
                    onSubmit={createOption}
                    initialValues={defaultValues}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isCreating}>
                        Enregistrer
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const UpdateOptionDialog: React.FC<UpdateOptionDialogProps> = ({ initialData, optionId, children }) => {
    const { formId, isUpdating, updateOption } = useUpdateOptionForm()

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Modifier la filière : {initialData?.optionName}</DialogTitle>
                    <DialogDescription>
                        Modifiez les détails de la filière. Les changements seront appliqués immédiatement.
                    </DialogDescription>
                </DialogHeader>

                <OptionForm
                    formId={formId}
                    onSubmit={(data, helpers) => updateOption({ id: optionId, data }, helpers)}
                    initialValues={initialData}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isUpdating}>
                        Mettre à jour
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface DeleteOptionDialogProps {
    children: (props: { onOpen: () => void; isLoading: boolean }) => React.ReactNode
    optionId: string
    optionName: string
}

export const DeleteOptionDialog: React.FC<DeleteOptionDialogProps> = ({
    children,
    optionId,
    optionName,
}) => {
    const { isOpen, onOpen, onClose } = useConfirm<string>()

    const { deleteOption, isDeleting } = useDeleteOptionForm({
        onSuccess: onClose,
    })

    const handleConfirm = React.useCallback(async () => {
        await deleteOption(optionId, optionName)
    }, [optionId, optionName, deleteOption])

    return (
        <>
            <ConfirmDeleteDialog
                item={optionId}
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirm}
                isLoading={isDeleting}
                title="Supprimer la filière"
                description="Attention : tous les documents et données associés à cette filière seront définitivement supprimés."
                itemName={optionName}
            />

            {/* Exécution du render trigger avec les états nécessaires */}
            {children({
                onOpen: () => onOpen(optionId),
                isLoading: isDeleting
            })}
        </>
    )
}

DeleteOptionDialog.displayName = "DeleteOptionDialog"