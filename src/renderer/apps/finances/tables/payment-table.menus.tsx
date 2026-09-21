import {
  Info,
  CreditCard,
  History,
  ShieldOff,
  Pencil,
  FileText,
  CheckCircle,
  BadgePercent,
} from "lucide-react";
import { createMenuBuilder } from "@/components/menus/more-menus";
import {
  SavePaymentDialog,
  PaymentHistoryDialog,
  PaymentDetailDialog,
  UpdateAmountByAssignmentsDialog,
} from "../dialog";
import type {
  AssignmentTableOfClassroom,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import {
  FEE_SCHEDULES_ENUM,
  getFeeScheduleLabel,
} from "@/packages/@core/data-access/db/options";
import { cn } from "@/renderer/utils";
import { STATUS_INDICATORS } from "../components/payment-legend-colors";
import { formatCurrency } from "@/packages/currency";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";
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
 * Checks whether a fee assignment is in read-only mode (already paid or total amount is zero).
 * @param feeAssignment - The target fee assignment entity.
 * @returns True if no modification actions should be allowed.
 */
export function isReadOnlyAssignment(feeAssignment: FeeAssignment): boolean {
  return (
    feeAssignment.status === FEE_SCHEDULES_ENUM.PAID ||
    feeAssignment.totalAmount === 0
  );
}

/**
 * Determines whether a new payment can be registered for a fee assignment.
 * Forbidden if the total amount is zero, status is already paid, or status is exempted.
 * @param feeAssignment - The target fee assignment entity.
 * @returns True if payment registration should be allowed.
 */
export function canPayFeeAssignment(feeAssignment: FeeAssignment): boolean {
  if (isReadOnlyAssignment(feeAssignment)) return false;
  if (feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED) return false;
  return !isFullyPaid(feeAssignment);
}

/**
 * Determines whether a student can be exempted from a fee assignment.
 * Exemption is forbidden if any payment advance has been made, total amount is zero, or status is paid/exempted.
 * @param feeAssignment - The target fee assignment entity.
 * @returns True if fee exemption should be allowed.
 */
export function canExemptFeeAssignment(feeAssignment: FeeAssignment): boolean {
  if (isReadOnlyAssignment(feeAssignment)) return false;
  if (feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED) return false;
  return feeAssignment.amountPaid === 0;
}

/**
 * Determines whether a fee assignment can be manually marked as paid.
 * Forbidden if total amount is zero, status is paid, or status is exempted.
 * @param feeAssignment - The target fee assignment entity.
 * @returns True if marking as paid should be allowed.
 */
export function canMarkFeeAssignmentAsPaid(
  feeAssignment: FeeAssignment,
): boolean {
  if (isReadOnlyAssignment(feeAssignment)) return false;
  if (feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED) return false;
  return feeAssignment.amountPaid > 0;
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

/**
 * Contextual action menu configuration bound to individual fee schedule cells.
 */
export const CellAction = feeMenu.build(
  {
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
          feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED,
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
        ({ feeAssignment }) => feeAssignment.status === FEE_SCHEDULES_ENUM.PAID,
        async ({ feeAssignment }) => {
          await markAsPaidForm({
            amountConverted:
              feeAssignment.totalAmount - feeAssignment.amountPaid,
            assignmentId: feeAssignment.assignmentId,
            totalAmount: feeAssignment.totalAmount,
          });
        },
      )
      .disabled(
        ({ feeAssignment }) => !canMarkFeeAssignmentAsPaid(feeAssignment),
      )
      .hidden(
        ({ feeAssignment }) => !canMarkFeeAssignmentAsPaid(feeAssignment),
      ),

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

    consultationGroup: feeMenu
      .label("Consultation & Historique", Info)
      .submenu({
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
  },
  {
    trigger: ({ feeAssignment }) => {
      const statusLabel = getFeeScheduleLabel(feeAssignment.status);
      return (
        <div className="flex items-center justify-end bg-accent/50 gap-2 p-2 hover:bg-accent rounded-md">
          <span
            className={cn(
              "font-mono text-xs font-medium tabular-nums text-foreground",
              feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED &&
                "line-through",
            )}
          >
            {formatCurrency(feeAssignment.amountPaid, feeAssignment.currency)}
          </span>

          <span
            title={statusLabel}
            aria-label={`Statut : ${statusLabel}`}
            className={cn(
              "size-2 rounded-full shrink-0 ring-2 ring-background transition-transform group-hover/cell:scale-110",
              STATUS_INDICATORS[feeAssignment.status],
            )}
          />
        </div>
      );
    },
  },
);

const rowMenu = createMenuBuilder<{ assign: AssignmentTableOfClassroom }>();

/**
 * Contextual action menu configuration bound to student row records.
 */
export const RowAction = rowMenu.build(
  {
    editProdeo: rowMenu
      .label("Accorder le statut Pro Deo", BadgePercent)
      .dialog(
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
  },
  {
    trigger: () => <ButtonMenu />,
  },
);
