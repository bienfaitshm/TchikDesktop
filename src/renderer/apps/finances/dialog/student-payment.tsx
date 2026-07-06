import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import { StudentPaymentForm } from "@/renderer/apps/finances/forms/student-payment-form";

import {
  useCreateStudentPaymentForm,
  useDeleteStudentPaymentForm,
  type StudentPaymentFormConfig,
  type StudentPaymentFormData,
} from "@/renderer/libs/queries/finances";

export type StudentPaymentDialogProps<
  TExtraProps extends Record<string, any> = {},
> = React.PropsWithChildren<
  TExtraProps &
    StudentPaymentFormConfig & {
      defaultValues?: Partial<StudentPaymentFormData>;
    }
>;

/* ==========================================================================
   CREATE PAYMENT (ENCAISSEMENT GUICHET)
   ========================================================================== */
export const StudentPaymentDialogCreateForm: React.FC<
  StudentPaymentDialogProps<{}>
> = ({ children, defaultValues, ...config }) => {
  const {
    formId,
    currencyOptions,
    paymentMethodOptions,
    assignmentSearch,
    isSubmitting,
    onSubmit,
  } = useCreateStudentPaymentForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Percevoir un versement (Guichet)"
      description="Saisissez les fonds remis par l'élève. Le reçu comptable sera généré dès validation."
      formId={formId}
      isLoading={isSubmitting}
    >
      <StudentPaymentForm
        formId={formId}
        onSubmit={onSubmit}
        currencyOptions={currencyOptions}
        paymentMethodOptions={paymentMethodOptions}
        assignmentSearch={assignmentSearch}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   DELETE / CANCEL PAYMENT (ANNULATION DE REÇU)
   ========================================================================== */
interface CancelPaymentProps {
  paymentId: string;
  receiptReference: string; // Ex: "REC-2026-0094"
}

export const StudentPaymentDialogCancelForm: React.FC<
  StudentPaymentDialogProps<CancelPaymentProps>
> = ({ children, paymentId, receiptReference, ...config }) => {
  const { isOpen, onClose, onOpen } = useConfirm<string>();
  const { isDeleting, deleteStudentPayment } = useDeleteStudentPaymentForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: paymentId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteStudentPayment,
    actionArgs: [receiptReference],
    errorMessage: "Erreur lors de l'annulation du paiement :",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={paymentId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Annuler un reçu d'encaissement"
        description="Le montant associé sera déduit du solde de la caisse et réappliqué comme dette due sur le compte de l'élève."
        itemName={receiptReference}
      />
      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};
