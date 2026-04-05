import React from "react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog"
import { Button } from "@/renderer/components/ui/button"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { LocalRoomForm } from "@/renderer/components/form/seatings/local-rooms-form"
import { useCreateLocalRoomForm, useDeleteLocalRoomForm, useUpdateLocalRoomForm } from "@/renderer/components/form/seatings/local-rooms-form.actions"
import { ConfirmDeleteDialog, useConfirm } from "@/renderer/components/dialog/dialog-delete"
import type { TLocalRoomCreate as LocalRoomFormData } from "@/packages/@core/data-access/schema-validations"

type CreateLocalRoomDialogProps = {
    children: React.ReactNode
    defaultValues?: Partial<LocalRoomFormData>
}

type UpdateLocalRoomDialogProps = {
    children: React.ReactNode
    localRoomId: string
    initialData?: Partial<LocalRoomFormData>
}

/**
 * Dialogue pour la CRÉATION d'un local.
 */
export const CreateLocalRoomDialog: React.FC<CreateLocalRoomDialogProps> = ({ children, defaultValues }) => {
    const { formId, createLocalRoom, isCreating } = useCreateLocalRoomForm()

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Créer un local</DialogTitle>
                    <DialogDescription>
                        Configurez un nouveau local physique (salle, amphithéâtre) pour organiser vos sessions de placement.
                    </DialogDescription>
                </DialogHeader>

                <LocalRoomForm
                    formId={formId}
                    onSubmit={createLocalRoom}
                    initialValues={defaultValues}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <ButtonLoader form={formId} type="submit" isLoading={isCreating}>
                        Enregistrer le local
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * Dialogue pour la MODIFICATION d'un local.
 */
export const UpdateLocalRoomDialog: React.FC<UpdateLocalRoomDialogProps> = ({ initialData, localRoomId, children }) => {
    // Utilisation du hook réadapté pour les locaux
    const { formId, isUpdating, updateLocalRoom } = useUpdateLocalRoomForm()

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Modifier le local : {initialData?.name}</DialogTitle>
                    <DialogDescription>
                        Modifiez la capacité ou les dimensions du local. Ces changements affecteront les futurs placements.
                    </DialogDescription>
                </DialogHeader>

                <LocalRoomForm
                    formId={formId}
                    onSubmit={(data, helpers) => updateLocalRoom({ id: localRoomId, data }, helpers)}
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

interface DeleteLocalRoomDialogProps {
    children: (props: { onOpen: () => void; isLoading: boolean }) => React.ReactNode
    localRoomId: string
    roomName: string
}

/**
 * Dialogue de CONFIRMATION DE SUPPRESSION d'un local.
 */
export const DeleteLocalRoomDialog: React.FC<DeleteLocalRoomDialogProps> = ({
    children,
    localRoomId,
    roomName,
}) => {
    const { isOpen, onOpen, onClose } = useConfirm<string>()

    const { deleteLocalRoom, isDeleting } = useDeleteLocalRoomForm({
        onSuccess: onClose,
    })

    const handleConfirm = React.useCallback(async () => {
        await deleteLocalRoom(localRoomId, roomName)
    }, [localRoomId, roomName, deleteLocalRoom])

    return (
        <>
            <ConfirmDeleteDialog
                item={localRoomId}
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirm}
                isLoading={isDeleting}
                title="Supprimer le local"
                description="Attention : la suppression de ce local annulera toutes les assignations de places qui lui sont liées dans les sessions actives."
                itemName={roomName}
            />

            {children({
                onOpen: () => onOpen(localRoomId),
                isLoading: isDeleting
            })}
        </>
    )
}

DeleteLocalRoomDialog.displayName = "DeleteLocalRoomDialog"