import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import { BaseUserForm } from "@/renderer/components/form/user-form";
import {
  useCreateUserForm,
  useUpdateUserForm,
  useDeleteUserForm,
  type UserFormConfig,
} from "@/renderer/libs/queries/users";
import type { UserCreate } from "@/packages/@core/data-access/schema-validations";

export type DialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      UserFormConfig & {
        defaultValues?: Partial<UserCreate>;
      }
  >;

/* ==========================================================================
   1. INSCRIPTION (CRÉATION)
   ========================================================================== */
export const CreateStudentDialog: React.FC<DialogProps> = ({
  children,
  defaultValues,
  ...config
}) => {
  const { formId, onSubmit, isSubmitting } = useCreateUserForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Inscrire un nouvel élève"
      description="Renseignez les informations d'identité et les coordonnées pour créer le dossier scolaire."
      formId={formId}
      isLoading={isSubmitting}
    >
      <BaseUserForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

type UpdateStudentDialogProps = {
  studentId: string;
  fullName?: string;
};

export const UpdateStudentDialog: React.FC<
  UpdateStudentDialogProps & DialogProps
> = ({ defaultValues, studentId, fullName, children, ...config }) => {
  const { formId, isSubmitting, onSubmit } = useUpdateUserForm(config);

  return (
    <DialogForm
      trigger={children}
      title={`Modifier le profil ${fullName ? ` : ${fullName}` : ""}`}
      description="Mettez à jour les informations du dossier. Les modifications sont instantanées."
      formId={formId}
      isLoading={isSubmitting}
    >
      <BaseUserForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit({ id: studentId, data }, helpers as any)
        }
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

interface DeleteStudentDialogProps {
  children:
    | React.ReactNode
    | ((props: {
        onOpen: (e: React.MouseEvent) => void;
        isLoading: boolean;
      }) => React.ReactNode);
  studentId: string;
  studentName: string;
}

export const DeleteStudentDialog: React.FC<
  DeleteStudentDialogProps & DialogProps
> = ({ children, studentId, studentName, ...config }) => {
  const { isOpen, onOpen, onClose } = useConfirm<string>();

  const { deleteUser, isDeleting } = useDeleteUserForm({
    ...config,
    onSuccess: (data) => {
      config?.onSuccess?.(data);
      onClose();
    },
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: studentId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteUser,
    actionArgs: [studentName],
    errorMessage: "Erreur lors de la suppression du dossier élève:",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={studentId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer le dossier élève"
        description="Cette action est irréversible. Toutes les notes, absences et données liées à cet élève seront perdues."
        itemName={studentName}
      />

      {typeof children === "function"
        ? children({ onOpen: handleTriggerClick, isLoading: isDeleting })
        : cloneElementWithProps(children, {
            onClick: handleTriggerClick,
            disabled: isDeleting,
          })}
    </>
  );
};

DeleteStudentDialog.displayName = "DeleteStudentDialog";
