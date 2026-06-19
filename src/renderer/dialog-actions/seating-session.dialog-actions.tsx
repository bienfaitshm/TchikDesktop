import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
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

export type SeatingSessionDialogProps<
  TExtraProps extends Record<string, any> = {},
> = React.PropsWithChildren<
  TExtraProps &
    SeatingSessionFormConfig & {
      defaultValues?: Partial<SeatingSessionData>;
    }
>;

/* ==========================================================================
   1. CRÉATION
   ========================================================================== */
export const CreateSeatingSessionDialog: React.FC<
  SeatingSessionDialogProps
> = ({ children, defaultValues, ...config }) => {
  const { formId, isSubmitting, onSubmit } =
    useCreateSeatingSessionForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Nouvelle session de mise en place"
      description="Configurez une nouvelle session d'examen ou de concours."
      formId={formId}
      isLoading={isSubmitting}
    >
      <SeatingSessionForm
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
export const UpdateSeatingSessionDialog: React.FC<
  SeatingSessionDialogProps<{ seatingSessionId: string }>
> = ({ defaultValues, seatingSessionId, children, ...config }) => {
  const { formId, isSubmitting, onSubmit } = useUpdateSeatingSessionForm({
    ...config,
    sessionId: seatingSessionId,
  });

  return (
    <DialogForm
      trigger={children}
      title="Modifier la session"
      description={`Mettez à jour les paramètres de la session "${defaultValues?.sessionName ?? ""}".`}
      formId={formId}
      isLoading={isSubmitting}
    >
      <SeatingSessionForm
        formId={formId}
        onSubmit={(value, helpers) =>
          onSubmit?.({ id: seatingSessionId, data: value }, helpers as any)
        }
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   3. SUPPRESSION
   ========================================================================== */
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

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: seatingSessionId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteSeatingSession,
    actionArgs: [seatingSessionName],
    errorMessage: "Erreur lors de la suppression de la session:",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={seatingSessionId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer la session ?"
        description="Cette action est irréversible. Toutes les assignations de places et les plans de salle liés à cette session seront définitivement perdus."
        itemName={seatingSessionName}
      />

      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};

DeleteSeatingSessionDialog.displayName = "DeleteSeatingSessionDialog";
