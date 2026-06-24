import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import {
  OptionForm,
  type OptionFormData,
} from "@/renderer/components/form/option-form";
import {
  useCreateOptionForm,
  useUpdateOptionForm,
  useDeleteOptionForm,
  type OptionFormConfig,
} from "@/renderer/libs/queries/options";

export type OptionDialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      OptionFormConfig & {
        defaultValues?: Partial<OptionFormData>;
      }
  >;

/* ==========================================================================
   1. CRÉATION
   ========================================================================== */

export const CreateOptionDialog: React.FC<OptionDialogProps> = ({
  children,
  defaultValues,
  ...config
}) => {
  const { formId, onSubmit, isSubmitting } = useCreateOptionForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Créer une filière"
      description="Remplissez les informations ci-dessous pour ajouter une nouvelle filière à votre établissement."
      formId={formId}
      isLoading={isSubmitting}
    >
      <OptionForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   2. MODIFICATION
   ========================================================================== */
interface UpdateOptionProps {
  optionId: string;
}

export const UpdateOptionDialog: React.FC<
  OptionDialogProps<UpdateOptionProps>
> = ({ defaultValues, optionId, children, ...config }) => {
  const { formId, isSubmitting, onSubmit } = useUpdateOptionForm(config);

  const handleSubmit = React.useCallback(
    (data, helpers) =>
      onSubmit(
        { id: optionId, data },
        { reset: (updatedData) => helpers.reset(updatedData) },
      ),
    [onSubmit, optionId],
  );
  return (
    <DialogForm
      trigger={children}
      title={`Modifier la filière : ${defaultValues?.optionName ?? ""}`}
      description="Modifiez les détails de la filière. Les changements seront appliqués immédiatement."
      formId={formId}
      isLoading={isSubmitting}
    >
      <OptionForm
        formId={formId}
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   3. SUPPRESSION
   ========================================================================== */
interface DeleteOptionProps {
  optionId: string;
  optionName: string;
}

export const DeleteOptionDialog: React.FC<
  OptionDialogProps<DeleteOptionProps>
> = ({ children, optionId, optionName, ...config }) => {
  const { isOpen, onOpen, onClose } = useConfirm<string>();

  const { deleteOption, isDeleting } = useDeleteOptionForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: optionId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteOption,
    actionArgs: [optionName],
    errorMessage: "Erreur lors de la suppression de la filière:",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={optionId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer la filière"
        description="Attention : tous les documents et données associés à cette filière seront définitivement supprimés."
        itemName={optionName}
      />

      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};

DeleteOptionDialog.displayName = "DeleteOptionDialog";
