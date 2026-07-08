import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import {
  FeeScheduleBulkForm,
  FeeScheduleForm,
} from "@/renderer/apps/finances/forms/fee-schedule-form";
import {
  useCreateFeeScheduleForm,
  useBulkCreateFeeScheduleForm,
  useUpdateFeeScheduleForm,
  useDeleteFeeScheduleForm,
  type FeeScheduleFormConfig,
} from "@/renderer/libs/queries/finances";
import {
  ButtonInsertMultipleToggle,
  useButtonInsertToggle,
} from "@/renderer/components/buttons/button-insert-multiple-toogle";
import type { FeeScheduleCreate } from "@/packages/@core/data-access/schema-validations";

export type FeeScheduleDialogProps<
  TExtraProps extends Record<string, any> = {},
> = React.PropsWithChildren<
  TExtraProps &
    FeeScheduleFormConfig & {
      defaultValues?: Partial<FeeScheduleCreate>;
    }
>;

/* ==========================================================================
   CREATE FEE SCHEDULE (UNITAIRE)
   ========================================================================== */
export const FeeScheduleDialogCreateForm: React.FC<
  FeeScheduleDialogProps<{}>
> = ({ children, defaultValues, ...config }) => {
  const { formId, feeTypeOptions, isSubmitting, onSubmit } =
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
        feeTypeOptions={feeTypeOptions}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   CREATE MULTIPLE FEE SCHEDULES (DYNAMIC TOGGLE)
   ========================================================================== */
interface CreateBulkToggleProps {
  schoolId: string;
}

export const FeeScheduleDialogBulkToggleForm: React.FC<
  FeeScheduleDialogProps<CreateBulkToggleProps>
> = ({ schoolId, children, defaultValues, ...config }) => {
  // 1. Gestion de l'état de bascule (Unitaire vs Masse)
  const { pressed, onPressedChange } = useButtonInsertToggle();

  // 2. Initialisation inconditionnelle des hooks (Règle des Hooks respectée !)
  const bulkFormState = useBulkCreateFeeScheduleForm({ schoolId, ...config });
  const singleFormState = useCreateFeeScheduleForm({ schoolId, ...config });

  const { formId, isSubmitting, onSubmit, feeTypeOptions } = pressed
    ? bulkFormState
    : singleFormState;

  console.log(feeTypeOptions);
  return (
    <DialogForm
      trigger={children}
      title={pressed ? "Créer des échéances en masse" : "Créer une échéance"}
      description="Configurez une ou plusieurs tranches de paiement pour vos frais scolaires."
      formId={formId}
      isLoading={isSubmitting}
    >
      <div className="mb-4 flex justify-end">
        <ButtonInsertMultipleToggle
          pressed={pressed}
          onPressedChange={onPressedChange}
        />
      </div>

      {pressed ? (
        <FeeScheduleBulkForm
          formId={formId}
          onSubmit={onSubmit}
          feeTypeOptions={feeTypeOptions}
          defaultValues={defaultValues}
        />
      ) : (
        <FeeScheduleForm
          formId={formId}
          onSubmit={onSubmit}
          feeTypeOptions={feeTypeOptions}
          defaultValues={defaultValues}
        />
      )}
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
  const { formId, isSubmitting, onSubmit, feeTypeOptions } =
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
      {/* Utilisation du bon sous-composant CreateForm ou équivalent Update */}
      <FeeScheduleForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit?.({ id: scheduleId, data }, helpers as any)
        }
        feeTypeOptions={feeTypeOptions}
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
