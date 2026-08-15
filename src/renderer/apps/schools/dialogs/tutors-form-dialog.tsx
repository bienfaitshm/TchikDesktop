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

import { TutorForm } from "../forms/tutor-form";

export type FeeConfigDialogProps = ActionDialogProps<
  TutorFormData,
  TutorFormConfig
> & {
  schoolId: string;
  yearId: string;
};

export type CreateTutorDialogProps = FeeConfigDialogProps;

export type UpdateTutorDialogProps = FeeConfigDialogProps & {
  feeConfigId: string;
  name?: string;
};

/**
 * Action dialog component for creating a new fee configuration.
 * @param props - Dialog properties containing school and academic year context.
 * @returns Rendered creation dialog component.
 */
export const CreateTutorDialog = createBaseActionDialog<
  CreateTutorDialogProps,
  ReturnType<typeof useCreateTutorForm>
>({
  title: "Créer une structure tarifaire",
  description:
    "Configurez une nouvelle grille de frais (montant, devise) appliquée à une cible spécifique.",
  useForm: (config) =>
    useCreateTutorForm(
      { schoolId: config?.schoolId!, yearId: config?.yearId! },
      config,
    ),
  form(): ReactNode {
    // TODO: complete
    return <div>Form here</div>;
  },
});

CreateTutorDialog.displayName = "CreateTutorDialog";

/**
 * Action dialog component for updating an existing fee configuration.
 * @param props - Dialog properties containing target feeConfigId and context.
 * @returns Rendered update dialog component.
 */
export const UpdateTutorDialog = createBaseActionDialog<
  UpdateTutorDialogProps,
  ReturnType<typeof useUpdateTutorForm>
>({
  title: ({ name, defaultValues }: UpdateTutorDialogProps) =>
    `Modifier la grille : ${name ?? defaultValues?.name ?? ""}`,
  description:
    "Modifiez les montants ou les cibles. Attention aux impacts sur les calculs de dettes d'élèves.",
  useForm: (config) =>
    useUpdateTutorForm(
      { schoolId: config?.schoolId!, yearId: config?.yearId! },
      config,
    ),
  form(): ReactNode {
    // TODO: complete
    return <TutorForm />;
  },
});

UpdateTutorDialog.displayName = "UpdateTutorDialog";

/**
 * Action dialog component for confirming and executing fee configuration deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteTutorDialog = createDeleteActionDialog({
  title: "Supprimer la structure tarifaire",
  description:
    "Cette action supprimera également les liaisons de frais pour l'ensemble des élèves rattachés à cette règle.",
  errorMessage: "Erreur lors de la suppression de la configuration tarifaire :",
  useDeleteForm: useDeleteTutorForm,
});

DeleteTutorDialog.displayName = "DeleteTutorDialog";

/* Backward compatibility aliases */
export const TutorDialogCreateForm = CreateTutorDialog;
export const TutorDialogUpdateForm = UpdateTutorDialog;
export const TutorDialogDeleteForm = DeleteTutorDialog;
