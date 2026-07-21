import type { ReactNode } from "react";
import { FeeConfigurationForm } from "@/renderer/apps/finances/forms/fee-configuration-form";
import {
  useCreateFeeConfigurationForm,
  useDeleteFeeConfigurationForm,
  useUpdateFeeConfigurationForm,
  type FeeConfigurationFormConfig,
  type FeeConfigurationFormData,
} from "@/renderer/libs/queries/finances";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";

export type FeeConfigDialogProps = ActionDialogProps<
  FeeConfigurationFormData,
  FeeConfigurationFormConfig
> & {
  schoolId: string;
  yearId: string;
};

export type CreateFeeConfigurationDialogProps = FeeConfigDialogProps;

export type UpdateFeeConfigurationDialogProps = FeeConfigDialogProps & {
  feeConfigId: string;
  name?: string;
};

/**
 * Action dialog component for creating a new fee configuration.
 * @param props - Dialog properties containing school and academic year context.
 * @returns Rendered creation dialog component.
 */
export const CreateFeeConfigurationDialog = createBaseActionDialog<
  CreateFeeConfigurationDialogProps,
  ReturnType<typeof useCreateFeeConfigurationForm>
>({
  title: "Créer une structure tarifaire",
  description:
    "Configurez une nouvelle grille de frais (montant, devise) appliquée à une cible spécifique.",
  useForm: (config) =>
    useCreateFeeConfigurationForm(
      { schoolId: config.schoolId, yearId: config.yearId },
      config,
    ),
  form({
    formId,
    onSubmit,
    currencyOptions,
    sectionOptions,
    feeTypeSearch,
    optionSearch,
    classroomSearch,
    defaultValues,
  }): ReactNode {
    return (
      <FeeConfigurationForm
        formId={formId}
        onSubmit={onSubmit}
        currencyOptions={currencyOptions}
        sectionOptions={sectionOptions}
        feeTypeSearch={feeTypeSearch}
        optionSearch={optionSearch}
        classroomSearch={classroomSearch}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateFeeConfigurationDialog.displayName = "CreateFeeConfigurationDialog";

/**
 * Action dialog component for updating an existing fee configuration.
 * @param props - Dialog properties containing target feeConfigId and context.
 * @returns Rendered update dialog component.
 */
export const UpdateFeeConfigurationDialog = createBaseActionDialog<
  UpdateFeeConfigurationDialogProps,
  ReturnType<typeof useUpdateFeeConfigurationForm>
>({
  title: ({ name, defaultValues }: UpdateFeeConfigurationDialogProps) =>
    `Modifier la grille : ${name ?? defaultValues?.name ?? ""}`,
  description:
    "Modifiez les montants ou les cibles. Attention aux impacts sur les calculs de dettes d'élèves.",
  useForm: (config) =>
    useUpdateFeeConfigurationForm({
      ...config,
      schoolId: config.schoolId,
      yearId: config.yearId,
    }),
  form({
    formId,
    onSubmit,
    currencyOptions,
    sectionOptions,
    feeTypeSearch,
    optionSearch,
    classroomSearch,
    defaultValues,
  }): ReactNode {
    return (
      <FeeConfigurationForm
        formId={formId}
        onSubmit={onSubmit}
        currencyOptions={currencyOptions}
        sectionOptions={sectionOptions}
        feeTypeSearch={feeTypeSearch}
        optionSearch={optionSearch}
        classroomSearch={classroomSearch}
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateFeeConfigurationDialog.displayName = "UpdateFeeConfigurationDialog";

/**
 * Action dialog component for confirming and executing fee configuration deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteFeeConfigurationDialog = createDeleteActionDialog({
  title: "Supprimer la structure tarifaire",
  description:
    "Cette action supprimera également les liaisons de frais pour l'ensemble des élèves rattachés à cette règle.",
  errorMessage: "Erreur lors de la suppression de la configuration tarifaire :",
  useDeleteForm: useDeleteFeeConfigurationForm,
});

DeleteFeeConfigurationDialog.displayName = "DeleteFeeConfigurationDialog";

/* Backward compatibility aliases */
export const FeeConfigurationDialogCreateForm = CreateFeeConfigurationDialog;
export const FeeConfigurationDialogUpdateForm = UpdateFeeConfigurationDialog;
export const FeeConfigurationDialogDeleteForm = DeleteFeeConfigurationDialog;
