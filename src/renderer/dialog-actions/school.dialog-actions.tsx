import type { ReactNode } from "react";
import {
  SchoolForm,
  type SchoolFormData,
} from "@/renderer/components/form/school-form";
import {
  useCreateSchoolForm,
  useDeleteSchoolForm,
  useUpdateSchoolForm,
  type SchoolFormConfig,
} from "@/renderer/libs/queries/schools";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";

export type SchoolDialogProps = ActionDialogProps<
  SchoolFormData,
  SchoolFormConfig
>;

export type UpdateSchoolDialogProps = SchoolDialogProps & {
  schoolId: string;
  name?: string;
};

/**
 * Action dialog component for creating a new school entity.
 * @param props - Dialog properties containing initial values and callbacks.
 * @returns Rendered creation dialog component.
 */
export const CreateSchoolDialog = createBaseActionDialog<
  SchoolDialogProps,
  ReturnType<typeof useCreateSchoolForm>
>({
  title: "Nouvel établissement",
  description:
    "Renseignez les détails pour configurer votre établissement scolaire.",
  useForm: useCreateSchoolForm,
  form({ formId, onSubmit, defaultValues }): ReactNode {
    return (
      <SchoolForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateSchoolDialog.displayName = "CreateSchoolDialog";

/**
 * Action dialog component for updating an existing school record.
 * @param props - Dialog properties containing target schoolId and initial values.
 * @returns Rendered update dialog component.
 */
export const UpdateSchoolDialog = createBaseActionDialog<
  UpdateSchoolDialogProps,
  ReturnType<typeof useUpdateSchoolForm>
>({
  title: "Modifier l'établissement",
  description: ({ name }: UpdateSchoolDialogProps) =>
    `Mettez à jour les informations de ${name || "l'établissement"}.`,
  useForm: useUpdateSchoolForm,
  form({ formId, onSubmit, defaultValues }): ReactNode {
    return (
      <SchoolForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateSchoolDialog.displayName = "UpdateSchoolDialog";

/**
 * Action dialog component for confirming and executing school deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteSchoolDialog = createDeleteActionDialog({
  title: "Supprimer l'établissement",
  description:
    "Attention : cette action est irréversible. Toutes les données liées (élèves, classes) seront définitivement supprimées.",
  errorMessage: "Erreur lors de la suppression de l'établissement:",
  useDeleteForm: useDeleteSchoolForm,
});

DeleteSchoolDialog.displayName = "DeleteSchoolDialog";
