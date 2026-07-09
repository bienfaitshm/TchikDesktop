import * as React from "react";
import { DialogForm, DialogFormProps } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import {
  FeeTypeForm,
  FeeTypeBulkForm,
} from "@/renderer/apps/finances/forms/fee-type-form";

import {
  useCreateFeeTypeForm,
  useBulkCreateFeeTypeForm,
  useUpdateFeeTypeForm,
  useDeleteFeeTypeForm,
  type FeeTypeFormConfig,
} from "@/renderer/libs/queries/finances";
import type { FeeTypeCreate } from "@/packages/@core/data-access/schema-validations";

import {
  ButtonInsertMultipleToggle,
  useButtonInsertToggle,
} from "@/renderer/components/buttons/button-insert-multiple-toogle";

export type FeeTypeDialogProps<
  TExtraProps extends Record<string, any> = {},
  DefaultValue = FeeTypeCreate,
> = React.PropsWithChildren<
  TExtraProps &
    Partial<DialogFormProps> &
    FeeTypeFormConfig & {
      defaultValues?: Partial<DefaultValue>;
    }
>;

type SchoolConfig = Pick<FeeTypeCreate, "schoolId">;

interface CreateFeeTypeProps {}

export const FeeTypeDialogCreateForm: React.FC<
  FeeTypeDialogProps<CreateFeeTypeProps & SchoolConfig>
> = ({ schoolId, children, defaultValues, onOpenChange, open, ...config }) => {
  const { pressed, onPressedChange } = useButtonInsertToggle();

  const bulkFormState = useBulkCreateFeeTypeForm({ schoolId, ...config });
  const singleFormState = useCreateFeeTypeForm({ schoolId, ...config });

  const { formId, options, isSubmitting } = pressed
    ? bulkFormState
    : singleFormState;

  return (
    <DialogForm
      trigger={children}
      title="Créer un type de frais"
      description="Définissez un nouveau type de frais (ex: Minerval) et associez-le à une caisse réceptrice."
      formId={formId}
      isLoading={isSubmitting}
      onOpenChange={onOpenChange}
      open={open}
    >
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
    </DialogForm>
  );
};

FeeTypeDialogCreateForm.displayName = "FeeTypeDialogCreateForm";

interface UpdateFeeTypeProps {
  feeTypeId: string;
}

export const FeeTypeDialogUpdateForm: React.FC<
  FeeTypeDialogProps<UpdateFeeTypeProps & SchoolConfig>
> = ({
  defaultValues,
  feeTypeId,
  schoolId,
  children,
  onOpenChange,
  open,
  ...config
}) => {
  const { formId, isSubmitting, onSubmit, options } = useUpdateFeeTypeForm({
    ...config,
    schoolId,
  });

  return (
    <DialogForm
      trigger={children}
      title={`Modifier le type de frais : ${defaultValues?.name ?? ""}`}
      description="Ajustez le nom ou le portefeuille de destination par défaut."
      formId={formId}
      isLoading={isSubmitting}
      onOpenChange={onOpenChange}
      open={open}
    >
      <FeeTypeForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit?.({ id: feeTypeId, data }, helpers as any)
        }
        walletsOptions={options}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   DELETE FEE TYPE
   ========================================================================== */
interface DeleteFeeTypeProps {
  feeTypeId: string;
  name: string;
}

export const FeeTypeDialogDeleteForm: React.FC<
  FeeTypeDialogProps<DeleteFeeTypeProps>
> = ({ children, feeTypeId, name, onOpenChange, open, ...config }) => {
  const { isOpen, onClose, onOpen } = useConfirm<string>({
    open,
    onOpenChange,
  });
  const { isDeleting, deleteFeeType } = useDeleteFeeTypeForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: feeTypeId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteFeeType,
    actionArgs: [name],
    errorMessage: "Erreur lors de la suppression du type de frais :",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={feeTypeId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer le type de frais"
        description="La suppression entraînera la suppression en cascade de toutes ses tranches horaires et grilles tarifaires associées."
        itemName={name}
      />
      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};
