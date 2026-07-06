import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import { FeeTypeForm } from "@/renderer/apps/finances/forms/fee-type-form";

import {
  useCreateFeeTypeForm,
  useUpdateFeeTypeForm,
  useDeleteFeeTypeForm,
  type FeeTypeFormConfig,
  type FeeTypeFormData,
} from "@/renderer/libs/queries/finances";

export type FeeTypeDialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      FeeTypeFormConfig & {
        defaultValues?: Partial<FeeTypeFormData>;
      }
  >;

/* ==========================================================================
   CREATE FEE TYPE
   ========================================================================== */
interface CreateFeeTypeProps {
  schoolId: string;
  yearId: string;
}

export const FeeTypeDialogCreateForm: React.FC<
  FeeTypeDialogProps<CreateFeeTypeProps>
> = ({ schoolId, yearId, children, defaultValues, ...config }) => {
  const { formId, walletSearch, isSubmitting, onSubmit } = useCreateFeeTypeForm(
    { schoolId, yearId },
    config,
  );

  return (
    <DialogForm
      trigger={children}
      title="Créer un type de frais"
      description="Définissez un nouveau type de frais (ex: Minerval) et associez-le à une caisse réceptrice."
      formId={formId}
      isLoading={isSubmitting}
    >
      <FeeTypeForm
        formId={formId}
        onSubmit={onSubmit}
        walletSearch={walletSearch}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   UPDATE FEE TYPE
   ========================================================================== */
interface UpdateFeeTypeProps {
  feeTypeId: string;
}

export const FeeTypeDialogUpdateForm: React.FC<
  FeeTypeDialogProps<UpdateFeeTypeProps>
> = ({ defaultValues, feeTypeId, children, ...config }) => {
  const { formId, isSubmitting, onSubmit, walletSearch } = useUpdateFeeTypeForm(
    {
      ...config,
      feeTypeId,
    },
  );

  return (
    <DialogForm
      trigger={children}
      title={`Modifier le type de frais : ${defaultValues?.name ?? ""}`}
      description="Ajustez le nom ou le portefeuille de destination par défaut."
      formId={formId}
      isLoading={isSubmitting}
    >
      <FeeTypeForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit?.({ id: feeTypeId, data }, helpers as any)
        }
        walletSearch={walletSearch}
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
> = ({ children, feeTypeId, name, ...config }) => {
  const { isOpen, onClose, onOpen } = useConfirm<string>();
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
