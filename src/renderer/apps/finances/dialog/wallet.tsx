import * as React from "react";
import { DialogForm, DialogFormProps } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import { WalletForm } from "@/renderer/apps/finances/forms/wallet-form";
import {
  useCreateWalletForm,
  useUpdateWalletForm,
  useDeleteWalletForm,
  type WalletFormConfig,
  type WalletFormData,
} from "@/renderer/libs/queries/finances";

export type WalletDialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      Partial<DialogFormProps> &
      WalletFormConfig & {
        defaultValues?: Partial<WalletFormData>;
      }
  >;

/* ==========================================================================
   CREATE WALLET
   ========================================================================== */
interface CreateWalletProps {
  schoolId: string;
}

export const WalletDialogCreateForm: React.FC<
  WalletDialogProps<CreateWalletProps>
> = ({ schoolId, children, defaultValues, open, onOpenChange, ...config }) => {
  const { formId, currencyOptions, isSubmitting, onSubmit } =
    useCreateWalletForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Créer un portefeuille de caisse"
      description="Ajoutez un nouveau compte ou une caisse physique pour percevoir les paiements."
      formId={formId}
      isLoading={isSubmitting}
      open={open}
      onOpenChange={onOpenChange}
    >
      <WalletForm
        formId={formId}
        onSubmit={onSubmit}
        currencyOptions={currencyOptions}
        defaultValues={{ ...defaultValues, schoolId }}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   UPDATE WALLET
   ========================================================================== */
interface UpdateWalletProps {
  schoolId: string;
  walletId: string;
}

export const WalletDialogUpdateForm: React.FC<
  WalletDialogProps<UpdateWalletProps>
> = ({
  defaultValues,
  walletId,
  schoolId,
  open,
  onOpenChange,
  children,
  ...config
}) => {
  const { formId, isSubmitting, onSubmit, currencyOptions } =
    useUpdateWalletForm(config);

  return (
    <DialogForm
      trigger={children}
      title={`Modifier la caisse : ${defaultValues?.name ?? ""}`}
      description="Modifiez les informations de ce portefeuille comptable."
      formId={formId}
      isLoading={isSubmitting}
      open={open}
      onOpenChange={onOpenChange}
    >
      <WalletForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit?.({ id: walletId, data }, helpers as any)
        }
        currencyOptions={currencyOptions}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   DELETE WALLET
   ========================================================================== */
interface DeleteWalletProps {
  walletId: string;
  name: string;
}

export const WalletDialogDeleteForm: React.FC<
  WalletDialogProps<DeleteWalletProps>
> = ({ children, walletId, name, open, onOpenChange, ...config }) => {
  const { isOpen, onClose, onOpen } = useConfirm<string>({
    open,
    onOpenChange,
  });
  const { isDeleting, deleteWallet } = useDeleteWalletForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: walletId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteWallet,
    actionArgs: [name],
    errorMessage: "Erreur lors de la suppression de la caisse :",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={walletId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer le portefeuille de caisse"
        description="Attention, cette action est irréversible. Toutes les écritures et soldes associés seront perdus."
        itemName={name}
      />
      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};
