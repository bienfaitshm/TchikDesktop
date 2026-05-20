import React, { useCallback } from "react"
import { 
    Dialog, DialogClose, DialogContent, DialogFooter, 
    DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { StudyYearForm, type StudyYearFormData } from "@/renderer/components/form/study-year-form"
import { useCreateStudyYearForm, useUpdateStudyYearForm, useDeleteStudyYearForm } from "@/renderer/components/form/study-year-form.actions"
import { ConfirmDeleteDialog, useConfirm } from "@/renderer/components/dialog/dialog-delete"

/**
 * DIALOG DE CRÉATION
 */
type CreateStudyYearDialogProps = {
    children: React.ReactNode
    defaultValues?: Partial<StudyYearFormData>
}

export const CreateStudyYearDialog: React.FC<CreateStudyYearDialogProps> = ({ children, defaultValues }) => {
    const { formId, onSubmit, isLoading } = useCreateStudyYearForm()

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Nouvelle année scolaire</DialogTitle>
                    <DialogDescription>
                        Configurez une nouvelle période scolaire (ex: 2023-2024).
                    </DialogDescription>
                </DialogHeader>

                <StudyYearForm
                    formId={formId}
                    onSubmit={onSubmit}
                    initialValues={defaultValues}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isLoading}>
                        Créer l'année
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * DIALOG DE MISE À JOUR
 */
type UpdateStudyYearDialogProps = {
    children: React.ReactNode
    studyYearId: string
    initialData?: Partial<StudyYearFormData>
}

export const UpdateStudyYearDialog: React.FC<UpdateStudyYearDialogProps> = ({ initialData, studyYearId, children }) => {
    const { formId, isLoading, onSubmit } = useUpdateStudyYearForm()

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Modifier l'année scolaire</DialogTitle>
                    <DialogDescription>
                        Modifiez les dates ou l'intitulé de l'année scolaire.
                    </DialogDescription>
                </DialogHeader>

                <StudyYearForm
                    formId={formId}
                    onSubmit={(data) => onSubmit({ id: studyYearId, data })}
                    initialValues={initialData}
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

/**
 * DIALOG DE SUPPRESSION
 */
interface DeleteStudyYearDialogProps {
    children: (props: { onOpen: () => void; isLoading: boolean }) => React.ReactNode
    studyYearId: string
    yearName: string
}

export const DeleteStudyYearDialog: React.FC<DeleteStudyYearDialogProps> = ({
    children,
    studyYearId,
    yearName,
}) => {
    const { isOpen, onOpen, onClose } = useConfirm<string>()

    const { onSubmit: deleteStudyYear, isLoading } = useDeleteStudyYearForm({
        onSuccess: onClose,
    })

    const handleConfirm = useCallback(async () => {
        await deleteStudyYear(studyYearId, yearName)
    }, [studyYearId, yearName, deleteStudyYear])

    return (
        <>
            <ConfirmDeleteDialog
                item={studyYearId}
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirm}
                isLoading={isLoading}
                title="Supprimer l'année scolaire"
                description={`Êtes-vous sûr de vouloir supprimer l'année ${yearName} ? Cela pourrait affecter les inscriptions liées.`}
                itemName={yearName}
            />

            {children({
                onOpen: () => onOpen(studyYearId),
                isLoading: isLoading
            })}
        </>
    )
}

DeleteStudyYearDialog.displayName = "DeleteStudyYearDialog"