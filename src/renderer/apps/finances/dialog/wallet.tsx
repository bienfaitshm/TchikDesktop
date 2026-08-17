import type { ReactNode } from "react";
import { WalletForm } from "@/renderer/apps/finances/forms/wallet-form";
import {
  useCreateWalletForm,
  useDeleteWalletForm,
  useUpdateWalletForm,
  type WalletFormConfig,
  type WalletFormData,
} from "@/renderer/libs/queries/finances";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "@/renderer/dialog-actions/base.dialog-actions";

export type WalletDialogProps = ActionDialogProps<
  WalletFormData,
  WalletFormConfig
>;

export type CreateWalletDialogProps = WalletDialogProps & {
  schoolId: string;
};

export type UpdateWalletDialogProps = WalletDialogProps & {
  walletId: string;
  schoolId: string;
  name?: string;
};

/**
 * Action dialog component for creating a new financial wallet.
 * @param props - Dialog properties containing school context and initial form values.
 * @returns Rendered creation dialog component.
 */
export const CreateWalletDialog = createBaseActionDialog<
  CreateWalletDialogProps,
  ReturnType<typeof useCreateWalletForm>
>({
  title: "Créer un portefeuille de caisse",
  description:
    "Ajoutez un nouveau compte ou une caisse physique pour percevoir les paiements.",
  useForm: useCreateWalletForm,
  form(
    { formId, onSubmit, currencyOptions, defaultValues },
    { schoolId },
  ): ReactNode {
    return (
      <WalletForm
        formId={formId}
        onSubmit={onSubmit}
        currencyOptions={currencyOptions}
        defaultValues={{ ...defaultValues, schoolId }}
      />
    );
  },
});

CreateWalletDialog.displayName = "CreateWalletDialog";

/**
 * Action dialog component for updating an existing financial wallet.
 * @param props - Dialog properties containing target walletId, schoolId, and initial form values.
 * @returns Rendered update dialog component.
 */
export const UpdateWalletDialog = createBaseActionDialog<
  UpdateWalletDialogProps,
  ReturnType<typeof useUpdateWalletForm>
>({
  title: ({ name, defaultValues }: UpdateWalletDialogProps) =>
    `Modifier la caisse : ${name ?? defaultValues?.name ?? ""}`,
  description: "Modifiez les informations de ce portefeuille comptable.",
  useForm: useUpdateWalletForm,
  form(
    { formId, onSubmit, currencyOptions, defaultValues },
    { walletId: id },
  ): ReactNode {
    return (
      <WalletForm
        formId={formId}
        onSubmit={(data, helpers) => onSubmit({ data, id }, helpers as any)}
        currencyOptions={currencyOptions}
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateWalletDialog.displayName = "UpdateWalletDialog";

/**
 * Action dialog component for confirming and executing financial wallet deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteWalletDialog = createDeleteActionDialog({
  title: "Supprimer le portefeuille de caisse",
  description:
    "Attention, cette action est irréversible. Toutes les écritures et soldes associés seront perdus.",
  errorMessage: "Erreur lors de la suppression de la caisse :",
  useDeleteForm: useDeleteWalletForm,
});

DeleteWalletDialog.displayName = "DeleteWalletDialog";

/* Backward compatibility aliases */
export const WalletDialogCreateForm = CreateWalletDialog;
export const WalletDialogUpdateForm = UpdateWalletDialog;
export const WalletDialogDeleteForm = DeleteWalletDialog;
