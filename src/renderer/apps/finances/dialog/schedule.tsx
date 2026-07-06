import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import { FeeScheduleForm } from "@/renderer/apps/finances/forms/fee-schedule-form";
import {
  useCreateFeeScheduleForm,
  useUpdateFeeScheduleForm,
  useDeleteFeeScheduleForm,
  type FeeScheduleFormConfig,
  type FeeScheduleFormData,
} from "@/renderer/libs/queries/finances";

export type FeeScheduleDialogProps<
  TExtraProps extends Record<string, any> = {},
> = React.PropsWithChildren<
  TExtraProps &
    FeeScheduleFormConfig & {
      defaultValues?: Partial<FeeScheduleFormData>;
    }
>;

/* ==========================================================================
   CREATE FEE SCHEDULE
   ========================================================================== */
export const FeeScheduleDialogCreateForm: React.FC<
  FeeScheduleDialogProps<{}>
> = ({ children, defaultValues, ...config }) => {
  const { formId, feeTypeSearch, isSubmitting, onSubmit } =
    useCreateFeeScheduleForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Ajouter une échéance de paiement"
      description="Créez un point de passage obligatoire ou une tranche d'appel de fonds temporelle."
      formId={formId}
      isLoading={isSubmitting}
    >
      <FeeScheduleForm
        formId={formId}
        onSubmit={onSubmit}
        feeTypeSearch={feeTypeSearch}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   UPDATE FEE SCHEDULE
   ========================================================================== */
interface UpdateFeeScheduleProps {
  scheduleId: string;
}

export const FeeScheduleDialogUpdateForm: React.FC<
  FeeScheduleDialogProps<UpdateFeeScheduleProps>
> = ({ defaultValues, scheduleId, children, ...config }) => {
  const { formId, isSubmitting, onSubmit, feeTypeSearch } =
    useUpdateFeeScheduleForm({
      ...config,
      scheduleId,
    });

  return (
    <DialogForm
      trigger={children}
      title={`Modifier l'échéance : ${defaultValues?.installmentName ?? ""}`}
      description="Modifiez les termes ou renommez l'intitulé de la tranche de paiement."
      formId={formId}
      isLoading={isSubmitting}
    >
      <FeeScheduleForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit?.({ id: scheduleId, data }, helpers as any)
        }
        feeTypeSearch={feeTypeSearch}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   DELETE FEE SCHEDULE
   ========================================================================== */
interface DeleteFeeScheduleProps {
  scheduleId: string;
  installmentName: string;
}

export const FeeScheduleDialogDeleteForm: React.FC<
  FeeScheduleDialogProps<DeleteFeeScheduleProps>
> = ({ children, scheduleId, installmentName, ...config }) => {
  const { isOpen, onClose, onOpen } = useConfirm<string>();
  const { isDeleting, deleteFeeSchedule } = useDeleteFeeScheduleForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: scheduleId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteFeeSchedule,
    actionArgs: [installmentName],
    errorMessage: "Erreur lors de la suppression de l'échéance :",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={scheduleId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer la tranche d'échéance"
        description="Supprimer cette tranche supprimera l'obligation financière correspondante chez tous les élèves assignés."
        itemName={installmentName}
      />
      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};
