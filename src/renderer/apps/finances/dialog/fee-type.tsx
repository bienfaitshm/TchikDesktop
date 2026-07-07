import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
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
import type {
  FeeTypeCreate,
  FeeTypeBulkCreate,
} from "@/packages/@core/data-access/schema-validations";

import {
  ButtonInsertMultipleToggle,
  useButtonInsertToggle,
} from "@/renderer/components/buttons/button-insert-multiple-toogle";

export type FeeTypeDialogProps<
  TExtraProps extends Record<string, any> = {},
  DefaultValue = FeeTypeCreate,
> = React.PropsWithChildren<
  TExtraProps &
    FeeTypeFormConfig & {
      defaultValues?: Partial<DefaultValue>;
    }
>;

type SchoolConfig = Pick<FeeTypeCreate, "schoolId">;

/* ==========================================================================
   CREATE FEE TYPE
   ========================================================================== */
interface CreateFeeTypeProps {}

export const FeeTypeDialogCreateForm: React.FC<
  FeeTypeDialogProps<CreateFeeTypeProps & SchoolConfig>
> = ({ schoolId, yearId, children, defaultValues, ...config }) => {
  // 1. Gestion de l'état d'affichage (Unitaire vs Bulk)
  const { pressed, onPressedChange } = useButtonInsertToggle();

  // 2. Initialisation inconditionnelle des deux formulaires (Règle des Hooks)
  const bulkFormState = useBulkCreateFeeTypeForm({ schoolId, ...config });
  const singleFormState = useCreateFeeTypeForm({ schoolId, ...config });

  // 3. 🌟 STRATÉGIE SENIOR : Sélection dynamique de l'état du formulaire actif
  const { formId, isSubmitting, onSubmit, options } = pressed
    ? bulkFormState
    : singleFormState;

  return (
    <DialogForm
      trigger={children}
      title="Créer un type de frais"
      description="Définissez un nouveau type de frais (ex: Minerval) et associez-le à une caisse réceptrice."
      formId={formId}
      isLoading={isSubmitting}
    >
      {/* Bouton de bascule d'insertion */}
      <ButtonInsertMultipleToggle
        pressed={pressed}
        onPressedChange={onPressedChange}
      />

      {/* Rendu conditionnel du bon formulaire avec les données injectées du hook actif */}
      {pressed ? (
        <FeeTypeBulkForm
          formId={formId}
          onSubmit={onSubmit}
          walletsOptions={options}
          // defaultValues={defaultValues}
        />
      ) : (
        <FeeTypeForm
          formId={formId}
          onSubmit={onSubmit}
          walletsOptions={options}
          defaultValues={defaultValues}
        />
      )}
    </DialogForm>
  );
};

FeeTypeDialogCreateForm.displayName = "FeeTypeDialogCreateForm";
/* ==========================================================================
   UPDATE FEE TYPE
   ========================================================================== */
interface UpdateFeeTypeProps {
  feeTypeId: string;
}

export const FeeTypeDialogUpdateForm: React.FC<
  FeeTypeDialogProps<UpdateFeeTypeProps & SchoolConfig>
> = ({ defaultValues, feeTypeId, schoolId, children, ...config }) => {
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
