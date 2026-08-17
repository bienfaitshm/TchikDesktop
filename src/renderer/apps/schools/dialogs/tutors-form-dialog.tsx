import type { ReactNode } from "react";
import {
  useCreateTutorForm,
  useDeleteTutorForm,
  useUpdateTutorForm,
  type TutorFormConfig,
  type TutorFormData,
} from "@/renderer/libs/queries/tutors";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "@/renderer/dialog-actions/base.dialog-actions";
import { wrapUpdateFunc } from "@/renderer/libs/queries/base";
import { TutorForm } from "../forms/tutor-form";

/**
 * Base properties required for tutor action dialog components.
 */
export type BaseTutorDialogProps = ActionDialogProps<
  TutorFormData,
  TutorFormConfig
> & {
  schoolId: string;
};

/**
 * Properties for the create tutor action dialog component.
 */
export type CreateTutorDialogProps = BaseTutorDialogProps;

/**
 * Properties for the update tutor action dialog component.
 */
export type UpdateTutorDialogProps = BaseTutorDialogProps & {
  tutorId: string;
  tutorName?: string;
};

/**
 * Action dialog component for registering a new tutor record.
 * @param props - Dialog options containing school context and form callbacks.
 * @returns Rendered tutor creation dialog component.
 */
export const CreateTutorDialog = createBaseActionDialog<
  CreateTutorDialogProps,
  ReturnType<typeof useCreateTutorForm>
>({
  title: "Créer un tuteur",
  description:
    "Renseignez les informations d'identité et de contact pour enregistrer un nouveau tuteur.",
  useForm: useCreateTutorForm,
  form({ onSubmit, defaultValues, formId }): ReactNode {
    return (
      <TutorForm
        formId={formId}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    );
  },
});

CreateTutorDialog.displayName = "CreateTutorDialog";

/**
 * Action dialog component for updating an existing tutor's information.
 * @param props - Dialog options containing target tutorId, tutorName, and school context.
 * @returns Rendered tutor update dialog component.
 */
export const UpdateTutorDialog = createBaseActionDialog<
  UpdateTutorDialogProps,
  ReturnType<typeof useUpdateTutorForm>
>({
  title: ({ tutorName }: UpdateTutorDialogProps) =>
    `Modifier le tuteur : ${tutorName ?? ""}`,
  description:
    "Modifiez les coordonnées et les informations personnelles du tuteur.",
  useForm: useUpdateTutorForm,
  form({ onSubmit, defaultValues, formId }, { tutorId }): ReactNode {
    return (
      <TutorForm
        formId={formId}
        defaultValues={defaultValues}
        onSubmit={wrapUpdateFunc(onSubmit, tutorId)}
      />
    );
  },
});

UpdateTutorDialog.displayName = "UpdateTutorDialog";

/**
 * Action dialog component for confirming and executing tutor record deletion.
 * @returns Rendered tutor deletion confirmation dialog component.
 */
export const DeleteTutorDialog = createDeleteActionDialog({
  title: "Supprimer le tuteur",
  description:
    "Cette action supprimera définitivement le profil du tuteur. Assurez-vous qu'aucun élève n'y reste rattaché sans alternatif.",
  errorMessage: "Erreur lors de la suppression du tuteur :",
  useDeleteForm: useDeleteTutorForm,
});

DeleteTutorDialog.displayName = "DeleteTutorDialog";

/* Backward compatibility aliases */
export const TutorDialogCreateForm = CreateTutorDialog;
export const TutorDialogUpdateForm = UpdateTutorDialog;
export const TutorDialogDeleteForm = DeleteTutorDialog;
