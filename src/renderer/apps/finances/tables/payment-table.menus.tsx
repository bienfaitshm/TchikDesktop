import {
  Info,
  CreditCard,
  History,
  ShieldOff,
  Pencil,
  FileText,
  CheckCircle,
  BadgePercent,
  TrashIcon,
} from "lucide-react";
import { createMenuBuilder } from "@/components/menus/more-menus";
import {
  SavePaymentDialog,
  PaymentHistoryDialog,
  PaymentDetailDialog,
  UpdateAmountByAssignmentsDialog,
  DeleteFeeAssignment,
} from "../dialog";
import type {
  AssignmentTableOfClassroom,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import { FEE_SCHEDULE_STATUS_ENUM } from "@/packages/@core/data-access/db/options";
import { MarkStudentAsProDeoDialog } from "../../schools/dialogs/enrollment.dialog";
import {
  markAsPaidForm,
  exemptFromFeeForm,
} from "@/renderer/libs/queries/finances";

/**
 * Contextual properties passed down to individual fee schedule row items.
 */
export interface FeeTypeRowActionsProps {
  feeAssignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  mutationKey?: readonly unknown[];
}

/**
 * Checks whether a fee assignment has been fully paid.
 * @param feeAssignment - The target fee assignment entity.
 * @returns True if the paid amount meets or exceeds the total amount.
 */
export function isFullyPaid(feeAssignment: FeeAssignment): boolean {
  return feeAssignment.amountPaid >= feeAssignment.totalAmount;
}

/**
 * Checks whether a fee assignment is in read-only mode.
 * @param feeAssignment - The target fee assignment entity.
 * @returns True if no modification actions should be allowed.
 */
export function isReadOnlyAssignment(feeAssignment: FeeAssignment): boolean {
  return (
    feeAssignment.status === FEE_SCHEDULE_STATUS_ENUM.PAID ||
    feeAssignment.totalAmount === 0
  );
}

/**
 * Determines whether a new payment can be registered for a fee assignment.
 * @param feeAssignment - The target fee assignment entity.
 * @returns True if payment registration is allowed.
 */
export function canPayFeeAssignment(feeAssignment: FeeAssignment): boolean {
  if (isReadOnlyAssignment(feeAssignment)) return false;
  if (feeAssignment.status === FEE_SCHEDULE_STATUS_ENUM.EXEMPTED) return false;
  return !isFullyPaid(feeAssignment);
}

/**
 * Determines whether a fee assignment can be exempted or un-exempted.
 * @param feeAssignment - The target fee assignment entity.
 * @returns True if exemption modification is allowed.
 */
export function canExemptFeeAssignment(feeAssignment: FeeAssignment): boolean {
  if (
    isReadOnlyAssignment(feeAssignment) &&
    feeAssignment.status !== FEE_SCHEDULE_STATUS_ENUM.EXEMPTED
  ) {
    return false;
  }
  return feeAssignment.amountPaid === 0;
}

/**
 * Determines whether a fee assignment can be marked as fully paid.
 * @param feeAssignment - The target fee assignment entity.
 * @returns True if marking as paid is allowed.
 */
export function canMarkFeeAssignmentAsPaid(
  feeAssignment: FeeAssignment,
): boolean {
  if (isReadOnlyAssignment(feeAssignment)) return false;
  if (feeAssignment.status === FEE_SCHEDULE_STATUS_ENUM.EXEMPTED) return false;
  return !isFullyPaid(feeAssignment);
}

/**
 * Extracts a flattened list of valid fee assignments from a payment mapping dictionary.
 * @param payments - Record mapping of fee schedules or undefined.
 * @returns Array of valid fee assignment entities.
 */
export function extractAssignmentsFromPayments(
  payments?: Record<string, FeeAssignment | null | undefined>,
): FeeAssignment[] {
  if (!payments) return [];
  return Object.values(payments).filter(
    (assignment): assignment is FeeAssignment => Boolean(assignment),
  );
}

const feeMenu = createMenuBuilder<FeeTypeRowActionsProps>();

export const PaymentAction = feeMenu.build({
  pay: feeMenu
    .label("Enregistrer un paiement", CreditCard)
    .dialog(
      ({
        props: { schoolId, yearId, feeAssignment, mutationKey },
        open,
        onOpenChange,
        close,
      }) => (
        <SavePaymentDialog
          open={open}
          onOpenChange={onOpenChange}
          schoolId={schoolId}
          yearId={yearId}
          defaultValues={{}}
          totalAmount={feeAssignment.totalAmount}
          assignmentId={feeAssignment.assignmentId}
          amountPaid={feeAssignment.amountPaid}
          mutationKey={mutationKey}
          onSuccess={close}
        />
      ),
    )
    .disabled(({ feeAssignment }) => !canPayFeeAssignment(feeAssignment))
    .hidden(({ feeAssignment }) => !canPayFeeAssignment(feeAssignment)),

  exempt: feeMenu
    .label("Exempter du paiement", ShieldOff)
    .toggle(
      ({ feeAssignment }) =>
        feeAssignment.status === FEE_SCHEDULE_STATUS_ENUM.EXEMPTED,
      async ({ feeAssignment, schoolId }) => {
        await exemptFromFeeForm({
          assignmentIds: [feeAssignment.assignmentId],
          schoolId,
          studentEnrollmentIds: [feeAssignment.enrollmentId],
        });
      },
    )
    .disabled(({ feeAssignment }) => !canExemptFeeAssignment(feeAssignment))
    .hidden(({ feeAssignment }) => !canExemptFeeAssignment(feeAssignment)),

  markPaid: feeMenu
    .label(
      ({ feeAssignment }) =>
        feeAssignment.amountPaid > 0
          ? "Solder le reste à payer"
          : "Marquer comme payé",
      CheckCircle,
    )
    .toggle(
      ({ feeAssignment }) =>
        feeAssignment.status === FEE_SCHEDULE_STATUS_ENUM.PAID,
      async ({ feeAssignment }) => {
        await markAsPaidForm({
          amountConverted: feeAssignment.amountPaid,
          assignmentId: feeAssignment.assignmentId,
          totalAmount: feeAssignment.totalAmount,
        });
      },
    )
    .disabled(({ feeAssignment }) => !canMarkFeeAssignmentAsPaid(feeAssignment))
    .hidden(({ feeAssignment }) => !canMarkFeeAssignmentAsPaid(feeAssignment)),

  changeAmount: feeMenu
    .label("Ajuster le montant à payer", Pencil)
    .dialog(({ props: { schoolId, feeAssignment }, open, onOpenChange }) => (
      <UpdateAmountByAssignmentsDialog
        mutationKey={["fin"]}
        enrollmentIds={[feeAssignment.enrollmentId]}
        schoolId={schoolId}
        assignments={[feeAssignment]}
        open={open}
        onOpenChange={onOpenChange}
      />
    ))
    .disabled(({ feeAssignment }) => isReadOnlyAssignment(feeAssignment))
    .hidden(({ feeAssignment }) => isReadOnlyAssignment(feeAssignment))
    .separator("after"),

  consultationGroup: feeMenu.label("Consultation & Historique", Info).submenu({
    details: feeMenu
      .label("Détails de l'échéance", FileText)
      .dialog(({ props: { feeAssignment }, open, onOpenChange }) => (
        <PaymentDetailDialog
          open={open}
          onOpenChange={onOpenChange}
          assignment={feeAssignment}
        />
      )),

    viewHistory: feeMenu
      .label("Historique des paiements", History)
      .dialog(({ props: { feeAssignment }, open, onOpenChange }) => (
        <PaymentHistoryDialog
          open={open}
          onOpenChange={onOpenChange}
          assignmentId={feeAssignment.assignmentId}
        />
      )),
  }),

  delete: feeMenu
    .label("Supprimer l'assignation", TrashIcon)
    .dialog(({ onOpenChange, open, props: { feeAssignment, mutationKey } }) => (
      <DeleteFeeAssignment
        open={open}
        onOpenChange={onOpenChange}
        id={feeAssignment.assignmentId}
        mutationKey={mutationKey}
      />
    ))
    .separator("before")
    .destructive(),
});

const rowMenu = createMenuBuilder<{ assign: AssignmentTableOfClassroom }>();

export const RowAction = rowMenu.build({
  editProdeo: rowMenu.label("Accorder le statut Pro Deo", BadgePercent).dialog(
    ({
      props: {
        assign: { student, schoolId, enrollmentId },
      },
      open,
      onOpenChange,
    }) => {
      const computedFullName = [student.firstName, student.lastName]
        .filter(Boolean)
        .join(" ");

      return (
        <MarkStudentAsProDeoDialog
          schoolId={schoolId}
          fullName={computedFullName}
          enrollmentId={enrollmentId}
          mutationKey={["fin"]}
          onOpenChange={onOpenChange}
          open={open}
        />
      );
    },
  ),

  changeAmount: rowMenu.label("Ajuster le montant à payer", Pencil).dialog(
    ({
      props: {
        assign: { payments, enrollmentId, schoolId },
      },
      open,
      onOpenChange,
    }) => {
      const assignments = extractAssignmentsFromPayments(payments);
      return (
        <UpdateAmountByAssignmentsDialog
          mutationKey={["fin"]}
          enrollmentIds={[enrollmentId]}
          schoolId={schoolId}
          assignments={assignments}
          open={open}
          onOpenChange={onOpenChange}
        />
      );
    },
  ),
});
