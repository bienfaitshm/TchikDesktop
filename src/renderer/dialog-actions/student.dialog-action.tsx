import type { ReactNode } from "react";
import type { UserCreate } from "@/packages/@core/data-access/schema-validations";
import { BaseUserForm } from "@/renderer/components/form/user-form";
import {
  useCreateUserForm,
  useDeleteUserForm,
  useUpdateUserForm,
  type UserFormConfig,
} from "@/renderer/libs/queries/users";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";

export type UserDialogProps = ActionDialogProps<UserCreate, UserFormConfig>;

export type CreateUserDialogProps = UserDialogProps;

export type UpdateUserDialogProps = UserDialogProps & {
  userId: string;
  fullName?: string;
};

/**
 * Action dialog component for enrolling a new user or student.
 * @param props - Dialog properties containing initial form values and callbacks.
 * @returns Rendered creation dialog component.
 */
export const CreateUserDialog = createBaseActionDialog<
  CreateUserDialogProps,
  ReturnType<typeof useCreateUserForm>
>({
  title: "Inscrire un nouvel élève",
  description:
    "Renseignez les informations d'identité et les coordonnées pour créer le dossier scolaire.",
  useForm: useCreateUserForm,
  form({ formId, onSubmit, defaultValues }): ReactNode {
    return (
      <BaseUserForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateUserDialog.displayName = "CreateUserDialog";

/**
 * Action dialog component for updating an existing user or student profile.
 * @param props - Dialog properties containing target userId and initial form values.
 * @returns Rendered update dialog component.
 */
export const UpdateUserDialog = createBaseActionDialog<
  UpdateUserDialogProps,
  ReturnType<typeof useUpdateUserForm>
>({
  title: ({ fullName }: UpdateUserDialogProps) =>
    `Modifier le profil${fullName ? ` : ${fullName}` : ""}`,
  description:
    "Mettez à jour les informations du dossier. Les modifications sont instantanées.",
  useForm: useUpdateUserForm,
  form({ formId, onSubmit, defaultValues }): ReactNode {
    return (
      <BaseUserForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateUserDialog.displayName = "UpdateUserDialog";

/**
 * Action dialog component for confirming and executing user or student deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteUserDialog = createDeleteActionDialog({
  title: "Supprimer le dossier élève",
  description:
    "Cette action est irréversible. Toutes les notes, absences et données liées à cet élève seront perdues.",
  errorMessage: "Erreur lors de la suppression du dossier élève:",
  useDeleteForm: useDeleteUserForm,
});

DeleteUserDialog.displayName = "DeleteUserDialog";

/* Component aliases for backward compatibility */
export const CreateStudentDialog = CreateUserDialog;
export const UpdateStudentDialog = UpdateUserDialog;
export const DeleteStudentDialog = DeleteUserDialog;
