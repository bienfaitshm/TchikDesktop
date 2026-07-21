import type { ReactNode } from "react";
import { StudentPaymentForm } from "@/renderer/apps/finances/forms/student-payment-form";
import {
  useCreateStudentPaymentForm,
  useDeleteStudentPaymentForm,
  type StudentPaymentFormConfig,
  type StudentPaymentFormData,
} from "@/renderer/libs/queries/finances";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";

export type StudentPaymentDialogProps = ActionDialogProps<
  StudentPaymentFormData,
  StudentPaymentFormConfig
>;

export type CreateStudentPaymentDialogProps = StudentPaymentDialogProps;

export type CancelStudentPaymentDialogProps = StudentPaymentDialogProps & {
  paymentId: string;
  receiptReference: string;
};

/**
 * Action dialog component for recording front-desk student fee payments.
 * @param props - Dialog properties containing initial form values and mutation callbacks.
 * @returns Rendered payment creation dialog component.
 */
export const CreateStudentPaymentDialog = createBaseActionDialog<
  CreateStudentPaymentDialogProps,
  ReturnType<typeof useCreateStudentPaymentForm>
>({
  title: "Percevoir un versement (Guichet)",
  description:
    "Saisissez les fonds remis par l'élève. Le reçu comptable sera généré dès validation.",
  useForm: useCreateStudentPaymentForm,
  form({
    formId,
    onSubmit,
    currencyOptions,
    paymentMethodOptions,
    assignmentSearch,
    defaultValues,
  }): ReactNode {
    return (
      <StudentPaymentForm
        formId={formId}
        onSubmit={onSubmit}
        currencyOptions={currencyOptions}
        paymentMethodOptions={paymentMethodOptions}
        assignmentSearch={assignmentSearch}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateStudentPaymentDialog.displayName = "CreateStudentPaymentDialog";

/**
 * Confirmation dialog component for canceling student payment receipts.
 * @returns Rendered delete confirmation dialog component.
 */
export const CancelStudentPaymentDialog = createDeleteActionDialog({
  title: "Annuler un reçu d'encaissement",
  description:
    "Le montant associé sera déduit du solde de la caisse et réappliqué comme dette due sur le compte de l'élève.",
  errorMessage: "Erreur lors de l'annulation du paiement :",
  useDeleteForm: useDeleteStudentPaymentForm,
});

CancelStudentPaymentDialog.displayName = "CancelStudentPaymentDialog";

/* Backward compatibility aliases */
export const StudentPaymentDialogCreateForm = CreateStudentPaymentDialog;
export const StudentPaymentDialogCancelForm = CancelStudentPaymentDialog;
