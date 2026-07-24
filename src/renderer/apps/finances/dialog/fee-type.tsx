import type { ReactNode } from "react";
import type { FeeTypeCreate } from "@/packages/@core/data-access/schema-validations";
import {
  FeeTypeBulkForm,
  FeeTypeForm,
} from "@/renderer/apps/finances/forms/fee-type-form";
import {
  ButtonInsertMultipleToggle,
  useButtonInsertToggle,
} from "@/renderer/components/buttons/button-insert-multiple-toogle";
import {
  useBulkCreateFeeTypeForm,
  useCreateFeeTypeForm,
  useDeleteFeeTypeForm,
  useUpdateFeeTypeForm,
  type FeeTypeFormConfig,
} from "@/renderer/libs/queries/finances";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "@/renderer/dialog-actions/base.dialog-actions";

export type FeeTypeDialogProps = ActionDialogProps<
  FeeTypeCreate,
  FeeTypeFormConfig
> & {
  schoolId: string;
};

export type CreateFeeTypeDialogProps = FeeTypeDialogProps;

export type UpdateFeeTypeDialogProps = FeeTypeDialogProps & {
  feeTypeId: string;
  name?: string;
};

/**
 * Custom form hook wrapper enabling toggleable single/bulk creation modes for fee types.
 * @param config - Target school and dialog configuration properties.
 * @returns Form state, handlers, and toggle state for single or bulk operations.
 */
function useCreateFeeTypeFormManager(config: CreateFeeTypeDialogProps) {
  const { pressed, onPressedChange } = useButtonInsertToggle();
  const bulkFormState = useBulkCreateFeeTypeForm({
    ...config,
    schoolId: config.schoolId,
  });
  const singleFormState = useCreateFeeTypeForm({
    ...config,
    schoolId: config.schoolId,
  });

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
 * Action dialog component supporting both single and bulk creation of fee types.
 * @param props - Dialog properties including school identifier and initial values.
 * @returns Rendered creation dialog component.
 */
export const CreateFeeTypeDialog = createBaseActionDialog<
  CreateFeeTypeDialogProps,
  ReturnType<typeof useCreateFeeTypeFormManager>
>({
  title: "Créer un type de frais",
  description:
    "Définissez un nouveau type de frais (ex: Minerval) et associez-le à une caisse réceptrice.",
  useForm: useCreateFeeTypeFormManager,
  form({
    formId,
    options,
    pressed,
    onPressedChange,
    bulkFormState,
    singleFormState,
    defaultValues,
  }): ReactNode {
    return (
      <>
        <ButtonInsertMultipleToggle
          pressed={pressed}
          onPressedChange={onPressedChange}
        />

        {pressed ? (
          <FeeTypeBulkForm
            formId={formId}
            onSubmit={bulkFormState.onSubmit}
            walletsOptions={options}
            defaultValues={defaultValues}
          />
        ) : (
          <FeeTypeForm
            formId={formId}
            onSubmit={singleFormState.onSubmit}
            walletsOptions={options}
            defaultValues={defaultValues}
          />
        )}
      </>
    );
  },
});

CreateFeeTypeDialog.displayName = "CreateFeeTypeDialog";

/**
 * Action dialog component for updating an existing fee type record.
 * @param props - Dialog properties containing target feeTypeId and school context.
 * @returns Rendered update dialog component.
 */
export const UpdateFeeTypeDialog = createBaseActionDialog<
  UpdateFeeTypeDialogProps,
  ReturnType<typeof useUpdateFeeTypeForm>
>({
  title: ({ name, defaultValues }: UpdateFeeTypeDialogProps) =>
    `Modifier le type de frais : ${name ?? defaultValues?.name ?? ""}`,
  description: "Ajustez le nom ou le portefeuille de destination par défaut.",
  useForm: (config) =>
    useUpdateFeeTypeForm({
      ...config,
      schoolId: config?.schoolId!,
    }),
  form(
    { formId, onSubmit, options, defaultValues },
    { feeTypeId: id },
  ): ReactNode {
    return (
      <FeeTypeForm
        formId={formId}
        onSubmit={(data, helpers) => onSubmit({ data, id }, helpers as any)}
        walletsOptions={options}
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateFeeTypeDialog.displayName = "UpdateFeeTypeDialog";

/**
 * Action dialog component for confirming and executing fee type deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteFeeTypeDialog = createDeleteActionDialog({
  title: "Supprimer le type de frais",
  description:
    "La suppression entraînera la suppression en cascade de toutes ses tranches horaires et grilles tarifaires associées.",
  errorMessage: "Erreur lors de la suppression du type de frais :",
  useDeleteForm: useDeleteFeeTypeForm,
});

DeleteFeeTypeDialog.displayName = "DeleteFeeTypeDialog";

/* Backward compatibility aliases */
export const FeeTypeDialogCreateForm = CreateFeeTypeDialog;
export const FeeTypeDialogUpdateForm = UpdateFeeTypeDialog;
export const FeeTypeDialogDeleteForm = DeleteFeeTypeDialog;
