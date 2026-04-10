import React from "react"
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
import { QuickEnrollmentForm, type QuickEnrollmentFormData } from "@/renderer/components/form/quick-enrolement-form"
import { EnrollmentForm, type EnrollmentFormData } from "@/renderer/components/form/enrollment-form"
import {
    useCreateEnrolementForm,
    useUpdateEnrolementForm,
    useDeleteEnrolementForm,
    useCreateQuickEnrolementForm
} from "@/renderer/components/form/enrolement-form.actions"
import { ConfirmDeleteDialog, useConfirm } from "@/renderer/components/dialog/dialog-delete"
import { useGetClassroomAsOptions, useGetUsersAsOptions } from "@/renderer/hooks/data-as-options"
import { USER_ROLE_ENUM as ROLE } from "@/packages/@core/data-access/db/enum"

type SchoolYearId = { schoolId: string; yearId: string };

type CreateEnrollmentDialogProps = {
    children: React.ReactNode
    defaultValues?: Partial<EnrollmentFormData>
}

type QuickCreateEnrollmentDialogProps = {
    children: React.ReactNode
    defaultValues?: Partial<QuickEnrollmentFormData>
}

type UpdateEnrollmentDialogProps = {
    children: React.ReactNode
    enrollmentId: string
    initialData?: Partial<EnrollmentFormData>
}

interface DeleteEnrollmentDialogProps {
    children: (props: { onOpen: () => void; isLoading: boolean }) => React.ReactNode
    enrollmentId: string
    studentName: string
}


/**
 * Dialogue : Inscription Rapide (Quick Create)
 */
export const QuickCreateEnrollmentDialog: React.FC<QuickCreateEnrollmentDialogProps & SchoolYearId> = ({ children, defaultValues, schoolId, yearId }) => {
    const { formId, onSubmit, isSubmitting } = useCreateQuickEnrolementForm()
    const classrooms = useGetClassroomAsOptions({ where: { schoolId, yearId } })
    return (
        <Dialog modal>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]"
                onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
                onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Nouvelle Inscription Rapide</DialogTitle>
                    <DialogDescription>
                        Identifiez l'élève et sa classe pour un enrôlement immédiat.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <QuickEnrollmentForm formId={formId} onSubmit={onSubmit} initialValues={defaultValues} classrooms={classrooms} />
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={isSubmitting}>Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isSubmitting} aria-label="Confirmer l'inscription rapide">
                        Inscrire l'élève
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * Dialogue : Inscription Complète (Create)
 */
export const CreateEnrollmentDialog: React.FC<CreateEnrollmentDialogProps & SchoolYearId> = ({ children, defaultValues, schoolId, yearId }) => {
    const { formId, onSubmit, isSubmitting } = useCreateEnrolementForm()
    const classrooms = useGetClassroomAsOptions({ where: { schoolId, yearId } })
    const students = useGetUsersAsOptions({ where: { schoolId, role: ROLE.STUDENT } }, { labelFormat: "short" })
    return (
        <Dialog modal>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]"
                onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
                onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Dossier d'Inscription</DialogTitle>
                    <DialogDescription>
                        Remplissez le formulaire complet pour procéder à l'enrôlement de l'élève.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <EnrollmentForm formId={formId} onSubmit={onSubmit} initialValues={defaultValues} classrooms={classrooms} students={students} />
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={isSubmitting}>Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isSubmitting} aria-label="Soumettre le dossier d'inscription">
                        Valider l'inscription
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * Dialogue : Modification (Update)
 */
export const UpdateEnrollmentDialog: React.FC<UpdateEnrollmentDialogProps & SchoolYearId> = ({ initialData, enrollmentId, children, schoolId, yearId }) => {
    const { formId, isSubmitting, onSubmit } = useUpdateEnrolementForm()
    const students = useGetUsersAsOptions({ where: { schoolId, role: ROLE.STUDENT } }, { labelFormat: "short" })
    const classrooms = useGetClassroomAsOptions({ where: { schoolId, yearId } })

    return (
        <Dialog modal>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]"
                onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
                onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Modifier l'Inscription</DialogTitle>
                    <DialogDescription>
                        Mettez à jour les informations de l'élève pour l'année scolaire en cours.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <EnrollmentForm
                        type="update"
                        formId={formId}
                        onSubmit={(data, helpers) => onSubmit({ id: enrollmentId, data }, helpers)}
                        initialValues={initialData}
                        students={students}
                        classrooms={classrooms}
                    />
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={isSubmitting}>Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isSubmitting} aria-label="Enregistrer les modifications de l'inscription">
                        Mettre à jour
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * Dialogue : Suppression (Delete)
 */
export const DeleteEnrollmentDialog: React.FC<DeleteEnrollmentDialogProps> = ({
    children,
    enrollmentId,
    studentName,
}) => {
    const { isOpen, onOpen, onClose } = useConfirm<string>()
    const { deleteEnrolement, isDeleting } = useDeleteEnrolementForm({ onSuccess: onClose })

    const handleConfirm = React.useCallback(async () => {
        await deleteEnrolement(enrollmentId, studentName)
    }, [enrollmentId, studentName, deleteEnrolement])

    return (
        <>
            <ConfirmDeleteDialog
                item={enrollmentId}
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirm}
                isLoading={isDeleting}
                title="Supprimer l'inscription"
                description="Attention : Cette action est irréversible. L'élève sera désinscrit et ses données d'enrôlement supprimées."
                itemName={studentName}
            />

            {children({
                onOpen: () => onOpen(enrollmentId),
                isLoading: isDeleting
            })}
        </>
    )
}

DeleteEnrollmentDialog.displayName = "DeleteEnrollmentDialog"