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
import {
  SeatingSessionForm,
  type SeatingSessionData,
} from "@/renderer/components/form/seatings/seating-session-form";
import {
  useCreateSeatingSessionForm,
  useDeleteSeatingSessionForm,
  useUpdateSeatingSessionForm,
  type SeatingSessionFormConfig,
} from "@/renderer/libs/queries/seatings/seating-session.actions";
import {
  ConfirmDeleteDialog,
  useConfirm,
} from "@/renderer/components/dialog/dialog-delete";

export type SeatingSessionDialogProps<
  TExtraProps extends Record<string, any> = {},
> = React.PropsWithChildren<
  TExtraProps &
    SeatingSessionFormConfig & {
      defaultValues?: Partial<SeatingSessionData>;
    }
>;

export const CreateSeatingSessionDialog: React.FC<
  SeatingSessionDialogProps
> = ({ children, defaultValues, ...config }) => {
  const { formId, isCreating, onSubmit } = useCreateSeatingSessionForm(config);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
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
          <ButtonLoader form={formId} type="submit" isLoading={isCreating}>
            Créer la session
          </ButtonLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const UpdateSeatingSessionDialog: React.FC<
  SeatingSessionDialogProps<{ seatingSessionId: string }>
> = ({ defaultValues, seatingSessionId, children, ...config }) => {
  const [open, setOpen] = useState(false);

  const { formId, isUpdating, onSubmit } = useUpdateSeatingSessionForm({
    ...config,
    sessionId: seatingSessionId,
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
          <DialogTitle>Modifier la session</DialogTitle>
          <DialogDescription>
            Mettez à jour les paramètres de la session "
            {defaultValues?.sessionName ?? ""}".
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
          <ButtonLoader form={formId} type="submit" isLoading={isUpdating}>
            Enregistrer les modifications
          </ButtonLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteSeatingSessionProps {
  seatingSessionId: string;
  seatingSessionName: string;
}

export const DeleteSeatingSessionDialog: React.FC<
  SeatingSessionDialogProps<DeleteSeatingSessionProps>
> = ({ children, seatingSessionId, seatingSessionName, ...config }) => {
  const { isOpen, onOpen, onClose } = useConfirm<string>();

  const { deleteSeatingSession, isDeleting } = useDeleteSeatingSessionForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const handleConfirm = useCallback(async () => {
    try {
      await deleteSeatingSession(seatingSessionId, seatingSessionName);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }, [seatingSessionId, seatingSessionName, deleteSeatingSession]);

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onOpen(seatingSessionId);
    },
    [onOpen, seatingSessionId],
  );

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

      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleTriggerClick,
            disabled: isDeleting,
          })
        : children}
    </>
  );
};

DeleteSeatingSessionDialog.displayName = "DeleteSeatingSessionDialog";
