import React, { useCallback, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { OptionForm, type OptionFormData } from "@/renderer/components/form/option-form"
import { useCreateOptionForm, useUpdateOptionForm, useDeleteOptionForm } from "@/renderer/components/form/option-form.actions"
import { ConfirmDeleteDialog } from "@/renderer/components/dialog/dialog-delete"


type CreateOptionDialogProps = {
    children: React.ReactNode
    defaultValues?: Partial<OptionFormData>
}

type UpdateOptionDialogProps = {
    children: React.ReactNode
    optionId: string
    initialData?: Partial<OptionFormData>
}

interface DeleteOptionDialogProps {
    optionId: string
    optionName: string
    renderTrigger: (params: { open: () => void }) => React.ReactNode
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

export const DeleteOptionDialog: React.FC<DeleteOptionDialogProps> = ({
    renderTrigger,
    optionId,
    optionName
}) => {
    const [isOpen, setIsOpen] = useState(false)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])

    const { deleteOption, isDeleting } = useDeleteOptionForm({
        onSuccess: close
    })

    const handleConfirm = useCallback(() => {
        deleteOption(optionId, optionName)
    }, [optionId, optionName, deleteOption])

    return (
        <>
            <ConfirmDeleteDialog
                isOpen={isOpen}
                onClose={close}
                onConfirm={handleConfirm}
                isLoading={isDeleting}
                title="Supprimer la filière"
                description="Tous les documents associés seront définitivement retirés."
                itemName={optionName}
            />

            {renderTrigger({ open })}
        </>
    )
}