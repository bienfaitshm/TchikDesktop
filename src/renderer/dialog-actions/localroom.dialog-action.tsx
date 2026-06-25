import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { cloneElementWithProps } from "@/renderer/utils/react";
import { LocalRoomForm } from "@/renderer/components/form/seatings/local-rooms-form";
import {
  useCreateLocalRoomForm,
  useDeleteLocalRoomForm,
  useUpdateLocalRoomForm,
  type LocalRoomFormConfig,
  type LocalRoomFormData,
} from "@/renderer/libs/queries/seatings";
import { useConfirm } from "@/renderer/hooks/use-confirm";

export type LocalRoomDialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      LocalRoomFormConfig & {
        defaultValues?: Partial<LocalRoomFormData>;
      }
  >;

/* ==========================================================================
   1. CRÉATION
   ========================================================================== */
export const CreateLocalRoomDialog: React.FC<LocalRoomDialogProps> = ({
  children,
  defaultValues,
  ...config
}) => {
  const { formId, onSubmit, isSubmitting } = useCreateLocalRoomForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Créer un local"
      description="Configurez un nouveau local physique (salle, amphithéâtre) pour organiser vos sessions de placement."
      formId={formId}
      isLoading={isSubmitting}
    >
      <LocalRoomForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   2. MODIFICATION
   ========================================================================== */
interface UpdateLocalRoomProps {
  localroomId: string;
}

export const UpdateLocalRoomDialog: React.FC<
  LocalRoomDialogProps<UpdateLocalRoomProps>
> = ({ defaultValues, localroomId, children, ...config }) => {
  const { formId, isSubmitting, onSubmit } = useUpdateLocalRoomForm({
    ...config,
    localroomId,
  });

  return (
    <DialogForm
      trigger={children}
      title={`Modifier le local : ${defaultValues?.name ?? ""}`}
      description="Modifiez la capacité ou les dimensions du local. Ces changements affecteront les futurs placements."
      formId={formId}
      isLoading={isSubmitting}
    >
      <LocalRoomForm
        formId={formId}
        onSubmit={(value, helpers) =>
          onSubmit?.({ id: localroomId, data: value }, helpers as any)
        }
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   3. SUPPRESSION
   ========================================================================== */
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

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: localRoomId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteLocalRoom,
    actionArgs: [roomName],
    errorMessage: "Erreur lors de la suppression du local:",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={localRoomId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer le local"
        description="Attention : la suppression de ce local annulera toutes les assignations de places qui lui sont liées dans les sessions actives."
        itemName={roomName}
      />

      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};

DeleteLocalRoomDialog.displayName = "DeleteLocalRoomDialog";
