import type { ReactNode } from "react";
import type {
  EnrollmentCreate,
  EnrollmentQuickCreate,
} from "@/packages/@core/data-access/schema-validations";
import {
  EnrollmentForm,
  QuickEnrollmentForm,
} from "@/renderer/components/form";
import {
  useCreateQuickEnrollmentForm,
  useDeleteEnrollmentForm,
  useUpdateEnrollmentForm,
  type EnrollmentFormConfig,
  type EnrollmentFormContext,
} from "@/renderer/libs/queries/enrollments";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";

export type EnrollmentDialogProps = ActionDialogProps<
  EnrollmentCreate | EnrollmentQuickCreate,
  EnrollmentFormConfig
> &
  EnrollmentFormContext;

export type CreateEnrollmentDialogProps = EnrollmentDialogProps;

export type UpdateEnrollmentDialogProps = EnrollmentDialogProps & {
  enrollmentId: string;
  fullName?: string;
};

/**
 * Action dialog component for creating a new student enrollment record.
 * @param props - Dialog properties containing school and academic year context.
 * @returns Rendered enrollment creation dialog component.
 */
export const CreateEnrollmentDialog = createBaseActionDialog<
  CreateEnrollmentDialogProps,
  ReturnType<typeof useCreateQuickEnrollmentForm>
>({
  title: "Dossier d'Inscription",
  description:
    "Remplissez le formulaire complet pour procéder à l'enrôlement de l'élève.",
  submitText: "Valider l'inscription",
  useForm: (config) =>
    useCreateQuickEnrollmentForm(config, {
      schoolId: config.schoolId,
      yearId: config.yearId,
    }),
  form({
    formId,
    onSubmit,
    searchClassroom,
    searchUser,
    defaultValues,
  }): ReactNode {
    return (
      <div className="py-4">
        <QuickEnrollmentForm
          formId={formId}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          classrooms={searchClassroom}
          students={searchUser}
        />
      </div>
    );
  },
});

CreateEnrollmentDialog.displayName = "CreateEnrollmentDialog";

/**
 * Action dialog component for updating an existing student enrollment record.
 * @param props - Dialog properties containing target enrollmentId and student name.
 * @returns Rendered enrollment update dialog component.
 */
export const UpdateEnrollmentDialog = createBaseActionDialog<
  UpdateEnrollmentDialogProps,
  ReturnType<typeof useUpdateEnrollmentForm>
>({
  title: ({ fullName }: UpdateEnrollmentDialogProps) =>
    `Modifier l'Inscription${fullName ? ` de ${fullName}` : ""}`,
  description:
    "Mettez à jour les informations de l'élève pour l'année scolaire en cours.",
  submitText: "Mettre à jour",
  useForm: (config) =>
    useUpdateEnrollmentForm(config, {
      schoolId: config.schoolId,
      yearId: config.yearId,
    }),
  form({ formId, onSubmit, searchClassroom, defaultValues }): ReactNode {
    return (
      <div className="py-4">
        <EnrollmentForm
          formId={formId}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          classrooms={searchClassroom.options}
        />
      </div>
    );
  },
});

UpdateEnrollmentDialog.displayName = "UpdateEnrollmentDialog";

/**
 * Action dialog component for confirming and executing student enrollment deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteEnrollmentDialog = createDeleteActionDialog({
  title: "Supprimer l'inscription",
  description:
    "Attention : Cette action est irréversible. L'élève sera désinscrit et ses données d'enrôlement supprimées.",
  errorMessage: "Erreur lors de la suppression de l'inscription:",
  useDeleteForm: useDeleteEnrollmentForm,
});

DeleteEnrollmentDialog.displayName = "DeleteEnrollmentDialog";
