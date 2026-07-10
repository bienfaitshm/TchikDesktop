import * as React from "react";
import { DialogForm, DialogFormProps } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import { FeeConfigurationForm } from "@/renderer/apps/finances/forms/fee-configuration-form";

import {
  useCreateFeeConfigurationForm,
  useUpdateFeeConfigurationForm,
  useDeleteFeeConfigurationForm,
  type FeeConfigurationFormConfig,
  type FeeConfigurationFormData,
} from "@/renderer/libs/queries/finances";

export type FeeConfigDialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      Partial<DialogFormProps> &
      FeeConfigurationFormConfig & {
        defaultValues?: Partial<FeeConfigurationFormData>;
      }
  >;

/* ==========================================================================
   CREATE FEE CONFIGURATION
   ========================================================================== */
interface CreateFeeConfigProps {
  schoolId: string;
  yearId: string;
}

export const FeeConfigurationDialogCreateForm: React.FC<
  FeeConfigDialogProps<CreateFeeConfigProps>
> = ({
  schoolId,
  yearId,
  children,
  defaultValues,
  open,
  onOpenChange,
  ...config
}) => {
  const {
    formId,
    currencyOptions,
    sectionOptions,
    feeTypeSearch,
    optionSearch,
    classroomSearch,
    isSubmitting,
    onSubmit,
  } = useCreateFeeConfigurationForm({ schoolId, yearId }, config);

  return (
    <DialogForm
      trigger={children}
      title="Créer une structure tarifaire"
      description="Configurez une nouvelle grille de frais (montant, devise) appliquée à une cible spécifique."
      formId={formId}
      isLoading={isSubmitting}
      open={open}
      onOpenChange={onOpenChange}
    >
      <FeeConfigurationForm
        formId={formId}
        onSubmit={onSubmit}
        currencyOptions={currencyOptions}
        sectionOptions={sectionOptions}
        feeTypeSearch={feeTypeSearch}
        optionSearch={optionSearch}
        classroomSearch={classroomSearch}
        defaultValues={{ ...defaultValues, schoolId, yearId }}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   UPDATE FEE CONFIGURATION
   ========================================================================== */
interface UpdateFeeConfigProps {
  feeConfigId: string;
  schoolId: string;
  yearId: string;
}

export const FeeConfigurationDialogUpdateForm: React.FC<
  FeeConfigDialogProps<UpdateFeeConfigProps>
> = ({
  defaultValues,
  feeConfigId,
  children,
  schoolId,
  yearId,
  open,
  onOpenChange,
  ...config
}) => {
  const {
    formId,
    isSubmitting,
    onSubmit,
    currencyOptions,
    sectionOptions,
    feeTypeSearch,
    optionSearch,
    classroomSearch,
  } = useUpdateFeeConfigurationForm({ ...config, schoolId, yearId });

  return (
    <DialogForm
      trigger={children}
      title={`Modifier la grille : ${defaultValues?.name ?? ""}`}
      description="Modifiez les montants ou les cibles. Attention aux impacts sur les calculs de dettes d'élèves."
      formId={formId}
      isLoading={isSubmitting}
      open={open}
      onOpenChange={onOpenChange}
    >
      <FeeConfigurationForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit?.({ id: feeConfigId, data }, helpers as any)
        }
        currencyOptions={currencyOptions}
        sectionOptions={sectionOptions}
        feeTypeSearch={feeTypeSearch}
        optionSearch={optionSearch}
        classroomSearch={classroomSearch}
        defaultValues={{ ...defaultValues, schoolId, yearId }}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   DELETE FEE CONFIGURATION
   ========================================================================== */
interface DeleteFeeConfigProps {
  feeConfigId: string;
  name: string;
}

export const FeeConfigurationDialogDeleteForm: React.FC<
  FeeConfigDialogProps<DeleteFeeConfigProps>
> = ({ children, feeConfigId, name, ...config }) => {
  const { isOpen, onClose, onOpen } = useConfirm<string>();
  const { isDeleting, deleteFeeConfig } = useDeleteFeeConfigurationForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: feeConfigId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteFeeConfig,
    actionArgs: [name],
    errorMessage:
      "Erreur lors de la suppression de la configuration tarifaire :",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={feeConfigId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer la structure tarifaire"
        description="Cette action supprimera également les liaisons de frais pour l'ensemble des élèves rattachés à cette règle."
        itemName={name}
      />
      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};
