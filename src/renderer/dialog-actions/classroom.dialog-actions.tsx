import React from "react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { ClassroomForm, type ClassroomFormData } from "@/renderer/components/form/classroom-form"
import { useCreateClassroomForm, useUpdateClassroomForm, useDeleteClassroomForm, type UseClassroomFormOptions } from "@/renderer/components/form/classroom-form.actions"
import { ConfirmDeleteDialog, useConfirm } from "@/renderer/components/dialog/dialog-delete"
import { PropsWithChildren } from "react"

type DialogCreateFormProps = {
    schoolId: string,
    defaultValues?: Partial<ClassroomFormData>,
    options?: Partial<UseClassroomFormOptions>
}

export const ClassroomDialogCreateForm: React.FC<PropsWithChildren<DialogCreateFormProps>> = ({ schoolId, children, defaultValues, options }) => {
    const { formId, generateSuggestion, isLoading, onSubmit, selectItems } = useCreateClassroomForm(schoolId, options)

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Créer une salle de classe</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations ci-dessous pour ajouter une nouvelle salle à votre établissement.
                    </DialogDescription>
                </DialogHeader>

                <ClassroomForm
                    formId={formId}
                    onSubmit={onSubmit}
                    onGenerateSuggestion={generateSuggestion}
                    options={selectItems}
                    initialValues={defaultValues}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isLoading}>
                        Enregistrer
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


type DialogUpdateFormProps = {
    schoolId: string;
    classId: string;
    defaultValues?: Partial<ClassroomFormData>;
    options?: Partial<UseClassroomFormOptions>
}

export const ClassroomDialogUpdateForm: React.FC<PropsWithChildren<DialogUpdateFormProps>> = ({ defaultValues, classId, schoolId, children, options }) => {
    const { formId, isLoading, onSubmit, selectItems, generateSuggestion } = useUpdateClassroomForm(schoolId, options)

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Modifier la salle : {defaultValues?.identifier}</DialogTitle>
                    <DialogDescription>
                        Modifiez les détails de la salle de classe. Les changements seront appliqués immédiatement après l'enregistrement.
                    </DialogDescription>
                </DialogHeader>

                <ClassroomForm
                    formId={formId}
                    onSubmit={(values, helpers) => onSubmit({ data: values, id: classId }, helpers)}
                    onGenerateSuggestion={generateSuggestion}
                    options={selectItems}
                    initialValues={defaultValues}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isLoading}>
                        Mettre à jour
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface ClassroomDialogDeleteProps {
    classId: string
    identifier: string
    children: (props: { onOpen: () => void; isLoading: boolean }) => React.ReactNode
}

export const ClassroomDialogDeleteForm: React.FC<ClassroomDialogDeleteProps> = ({
    children,
    classId,
    identifier,
}) => {
    const { isOpen, onClose, onOpen } = useConfirm<string>()

    const { isLoading, onSubmit } = useDeleteClassroomForm({
        onSuccess: () => {
            onClose()
        },
    })

    const handleConfirm = React.useCallback(async () => {
        await onSubmit(classId, identifier)
    }, [classId, identifier, onSubmit])

    return (
        <>
            <ConfirmDeleteDialog
                item={classId}
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirm}
                isLoading={isLoading}
                title="Supprimer la salle de classe"
                description="Tous les documents, membres et emplois du temps associés seront définitivement retirés de la base de données."
                itemName={identifier}
            />
            {children({
                onOpen: () => onOpen(classId),
                isLoading
            })}
        </>
    )
}

ClassroomDialogDeleteForm.displayName = "ClassroomDialogDeleteForm"