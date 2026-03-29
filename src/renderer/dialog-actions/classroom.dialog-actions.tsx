import React, { useCallback } from "react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { ClassroomForm, type ClassroomFormData } from "@/renderer/components/form/classroom-form"
import { useCreateClassroomForm, useUpdateClassroomForm, useDeleteClassroomForm } from "@/renderer/components/form/classroom-form.actions"
import { ConfirmDeleteDialog } from "@/renderer/components/dialog/dialog-delete"
import { PropsWithChildren } from "react"

type DialogCreateFormProps = {
    schooldId: string,
    defaultValues?: Partial<ClassroomFormData>
}

export const ClassroomDialogCreateForm: React.FC<PropsWithChildren<DialogCreateFormProps>> = ({ schooldId, children, defaultValues }) => {
    const { formId, generateSuggestion, isLoading, onSubmit, selectItems } = useCreateClassroomForm(schooldId)

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
    defaultValues?: Partial<ClassroomFormData>;
}

export const ClassroomDialogUpdateForm: React.FC<PropsWithChildren<DialogUpdateFormProps>> = ({ defaultValues, schoolId, children }) => {
    const { formId, isLoading, onSubmit, selectItems, generateSuggestion } = useUpdateClassroomForm(schoolId)

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
                    onSubmit={() => onSubmit}
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
    children: (params: { onOpen: () => void }) => React.ReactNode
}

export const ClassroomDialogDeleteForm: React.FC<ClassroomDialogDeleteProps> = ({
    children,
    classId,
    identifier
}) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const onOpen = useCallback(() => setIsOpen(true), [])
    const onClose = useCallback(() => setIsOpen(false), [])

    const { isLoading, onSubmit } = useDeleteClassroomForm({
        onSuccess: onClose
    })

    const handleConfirm = useCallback(() => {
        onSubmit(classId, identifier)
    }, [classId, identifier, onSubmit])

    return (
        <>
            <ConfirmDeleteDialog
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirm}
                isLoading={isLoading}
                title="Supprimer la salle de classe"
                description={`Tous les documents et emplois du temps associés seront définitivement retirés.`}
                itemName={identifier}
            />

            {/* Pattern Render Props pour le déclencheur (Trigger) */}
            {children({ onOpen })}
        </>
    )
}