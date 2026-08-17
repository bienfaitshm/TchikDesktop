import type { ReactNode } from "react";
import type { FeeScheduleCreate } from "@/packages/@core/data-access/schema-validations";
import {
  FeeScheduleBulkForm,
  FeeScheduleForm,
} from "@/renderer/apps/finances/forms/fee-schedule-form";
import {
  ButtonInsertMultipleToggle,
  useButtonInsertToggle,
} from "@/renderer/components/buttons/button-insert-multiple-toogle";
import {
  useBulkCreateFeeScheduleForm,
  useCreateFeeScheduleForm,
  useDeleteFeeScheduleForm,
  useUpdateFeeScheduleForm,
  type FeeScheduleFormConfig,
} from "@/renderer/libs/queries/finances";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "@/renderer/dialog-actions/base.dialog-actions";

export type FeeScheduleDialogProps = ActionDialogProps<
  FeeScheduleCreate,
  FeeScheduleFormConfig
>;

export type CreateFeeScheduleDialogProps = FeeScheduleDialogProps;

export type CreateBulkFeeScheduleDialogProps = FeeScheduleDialogProps & {
  schoolId: string;
};

export type UpdateFeeScheduleDialogProps = FeeScheduleDialogProps & {
  scheduleId: string;
  installmentName?: string;
};

/**
 * Custom form hook wrapper enabling toggleable single/bulk creation modes for fee schedules.
 * @param config - Target school and dialog configuration properties.
 * @returns Form state, handlers, and toggle state for single or bulk operations.
 */
function useCreateFeeScheduleFormManager(
  config: CreateBulkFeeScheduleDialogProps,
) {
  const { pressed, onPressedChange } = useButtonInsertToggle();
  const bulkFormState = useBulkCreateFeeScheduleForm({
    schoolId: config.schoolId,
    ...config,
  });
  const singleFormState = useCreateFeeScheduleForm(config);

  const activeFormState = pressed ? bulkFormState : singleFormState;

  return {
    ...activeFormState,
    pressed,
    onPressedChange,
    bulkFormState,
    singleFormState,
  };
}

/**
 * Action dialog component for creating a single fee schedule entry.
 * @param props - Dialog properties containing initial form values and mutation callbacks.
 * @returns Rendered creation dialog component.
 */
export const CreateFeeScheduleDialog = createBaseActionDialog<
  CreateFeeScheduleDialogProps,
  ReturnType<typeof useCreateFeeScheduleForm>
>({
  title: "Ajouter une échéance de paiement",
  description:
    "Créez un point de passage obligatoire ou une tranche d'appel de fonds temporelle.",
  useForm: useCreateFeeScheduleForm,
  form({ formId, onSubmit, feeTypeOptions, defaultValues }): ReactNode {
    return (
      <FeeScheduleForm
        formId={formId}
        onSubmit={onSubmit}
        feeTypeOptions={feeTypeOptions}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateFeeScheduleDialog.displayName = "CreateFeeScheduleDialog";

/**
 * Action dialog component supporting dynamic toggle between single and bulk fee schedule creation.
 * @param props - Dialog properties including school identifier and configuration.
 * @returns Rendered bulk creation dialog component.
 */
export const CreateBulkFeeScheduleDialog = createBaseActionDialog<
  CreateBulkFeeScheduleDialogProps,
  ReturnType<typeof useCreateFeeScheduleFormManager>
>({
  title: ({ pressed }: { pressed?: boolean }) =>
    pressed ? "Créer des échéances en masse" : "Créer une échéance",
  description:
    "Configurez une ou plusieurs tranches de paiement pour vos frais scolaires.",
  useForm: useCreateFeeScheduleFormManager,
  form({
    formId,
    feeTypeOptions,
    pressed,
    onPressedChange,
    bulkFormState,
    singleFormState,
    defaultValues,
  }): ReactNode {
    return (
      <>
        <div className="mb-4 flex justify-end">
          <ButtonInsertMultipleToggle
            pressed={pressed}
            onPressedChange={onPressedChange}
          />
        </div>

        {pressed ? (
          <FeeScheduleBulkForm
            formId={formId}
            onSubmit={bulkFormState.onSubmit}
            feeTypeOptions={feeTypeOptions}
            defaultValues={defaultValues}
          />
        ) : (
          <FeeScheduleForm
            formId={formId}
            onSubmit={singleFormState.onSubmit}
            feeTypeOptions={feeTypeOptions}
            defaultValues={defaultValues}
          />
        )}
      </>
    );
  },
});

CreateBulkFeeScheduleDialog.displayName = "CreateBulkFeeScheduleDialog";

/**
 * Action dialog component for updating an existing fee schedule record.
 * @param props - Dialog properties containing target scheduleId and initial values.
 * @returns Rendered update dialog component.
 */
export const UpdateFeeScheduleDialog = createBaseActionDialog<
  UpdateFeeScheduleDialogProps,
  ReturnType<typeof useUpdateFeeScheduleForm>
>({
  title: ({ installmentName, defaultValues }: UpdateFeeScheduleDialogProps) =>
    `Modifier l'échéance : ${installmentName ?? defaultValues?.installmentName ?? ""}`,
  description:
    "Modifiez les termes ou renommez l'intitulé de la tranche de paiement.",
  useForm: useUpdateFeeScheduleForm,
  form(
    { formId, onSubmit, feeTypeOptions, defaultValues },
    { scheduleId: id },
  ): ReactNode {
    return (
      <FeeScheduleForm
        formId={formId}
        onSubmit={(data, helpers) => onSubmit({ data, id }, helpers as any)}
        feeTypeOptions={feeTypeOptions}
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateFeeScheduleDialog.displayName = "UpdateFeeScheduleDialog";

/**
 * Action dialog component for confirming and executing fee schedule deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteFeeScheduleDialog = createDeleteActionDialog({
  title: "Supprimer la tranche d'échéance",
  description:
    "Supprimer cette tranche supprimera l'obligation financière correspondante chez tous les élèves assignés.",
  errorMessage: "Erreur lors de la suppression de l'échéance :",
  useDeleteForm: useDeleteFeeScheduleForm,
});

DeleteFeeScheduleDialog.displayName = "DeleteFeeScheduleDialog";

/* Backward compatibility aliases */
export const FeeScheduleDialogCreateForm = CreateFeeScheduleDialog;
export const FeeScheduleDialogBulkToggleForm = CreateBulkFeeScheduleDialog;
export const FeeScheduleDialogUpdateForm = UpdateFeeScheduleDialog;
export const FeeScheduleDialogDeleteForm = DeleteFeeScheduleDialog;
