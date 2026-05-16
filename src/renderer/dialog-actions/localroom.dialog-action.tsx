import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { LocalRoomForm } from "@/renderer/components/form/seatings/local-rooms-form";
import {
  useCreateLocalRoomForm,
  useDeleteLocalRoomForm,
  useUpdateLocalRoomForm,
  type LocalRoomFormConfig,
} from "@/renderer/components/form/seatings/local-rooms-form.actions";
import {
  ConfirmDeleteDialog,
  useConfirm,
} from "@/renderer/components/dialog/dialog-delete";
import type { TLocalRoomCreate as LocalRoomFormData } from "@/packages/@core/data-access/schema-validations";

export type LocalRoomDialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      LocalRoomFormConfig & {
        defaultValues?: Partial<LocalRoomFormData>;
      }
  >;

export const CreateLocalRoomDialog: React.FC<LocalRoomDialogProps> = ({
  children,
  defaultValues,
  ...config
}) => {
  const [open, setOpen] = useState(false);

  const { formId, onSubmit, isCreating } = useCreateLocalRoomForm({
    ...config,
    onSuccess: (data) => {
      config.onSuccess?.(data);
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Créer un local</DialogTitle>
          <DialogDescription>
            Configurez un nouveau local physique (salle, amphithéâtre) pour
            organiser vos sessions de placement.
          </DialogDescription>
        </DialogHeader>

        <LocalRoomForm
          formId={formId}
          onSubmit={onSubmit}
          initialValues={defaultValues}
        />

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <ButtonLoader form={formId} type="submit" isLoading={isCreating}>
            Enregistrer le local
          </ButtonLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface UpdateLocalRoomProps {
  localRoomId: string;
}

export const UpdateLocalRoomDialog: React.FC<
  LocalRoomDialogProps<UpdateLocalRoomProps>
> = ({ defaultValues, localRoomId, children, ...config }) => {
  const [open, setOpen] = useState(false);

  const { formId, isUpdating, onSubmit } = useUpdateLocalRoomForm({
    ...config,
    localRoomId,
    onSuccess: (data) => {
      config.onSuccess?.(data);
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            Modifier le local : {defaultValues?.name ?? ""}
          </DialogTitle>
          <DialogDescription>
            Modifiez la capacité ou les dimensions du local. Ces changements
            affecteront les futurs placements.
          </DialogDescription>
        </DialogHeader>

        <LocalRoomForm
          formId={formId}
          onSubmit={onSubmit}
          initialValues={defaultValues}
        />

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <ButtonLoader form={formId} type="submit" isLoading={isUpdating}>
            Mettre à jour
          </ButtonLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteLocalRoomProps {
  localRoomId: string;
  roomName: string;
}

export const DeleteLocalRoomDialog: React.FC<
  LocalRoomDialogProps<DeleteLocalRoomProps>
> = ({ children, localRoomId, roomName, ...config }) => {
  const { isOpen, onOpen, onClose } = useConfirm<string>();

  const { deleteLocalRoom, isDeleting } = useDeleteLocalRoomForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const handleConfirm = useCallback(async () => {
    try {
      await deleteLocalRoom(localRoomId, roomName);
    } catch (error) {
      console.error("Erreur lors de la suppression du local:", error);
    }
  }, [localRoomId, roomName, deleteLocalRoom]);

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onOpen(localRoomId);
    },
    [onOpen, localRoomId],
  );

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

      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleTriggerClick,
            disabled: isDeleting,
          })
        : children}
    </>
  );
};

DeleteLocalRoomDialog.displayName = "DeleteLocalRoomDialog";
