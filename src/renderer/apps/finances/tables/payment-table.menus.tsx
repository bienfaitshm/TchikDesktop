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

/**
 * Contextual properties passed down to individual fee schedule row items.
 */
export interface FeeTypeRowActionsProps {
  feeAssignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  mutationKey?: readonly unknown[];
}

const feeMenu = createMenuBuilder<FeeTypeRowActionsProps>();

/**
 * Contextual action menu configuration bound to fee schedule cells.
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
            totalAmount={feeAssignment.totalAmount}
            assignmentId={feeAssignment.assignmentId}
            amountPaid={feeAssignment.amountPaid}
            mutationKey={mutationKey}
            onSuccess={close}
          />
        ),
      )
      .disabled(
        ({ feeAssignment }) =>
          feeAssignment.amountPaid >= feeAssignment.totalAmount ||
          feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED,
      ),

    exempt: feeMenu
      .label("Exempter du paiement", ShieldOff)
      .toggle(
        ({ feeAssignment }) =>
          feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED,
        async ({ feeAssignment }, checked) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log(
            "Exemption toggled for:",
            feeAssignment.assignmentId,
            checked,
          );
        },
      )
      .disabled(
        ({ feeAssignment }) => feeAssignment.status === FEE_SCHEDULES_ENUM.PAID,
      )
      .hidden(
        ({ feeAssignment }) => feeAssignment.status === FEE_SCHEDULES_ENUM.PAID,
      ),

    markPaid: feeMenu
      .label(
        ({ feeAssignment }) =>
          feeAssignment.status === FEE_SCHEDULES_ENUM.UNPAID
            ? "Marquer comme payé"
            : "Payé",
        CheckCircle,
      )
      .action(async ({ feeAssignment }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Executed mark as paid for:", feeAssignment.assignmentId);
      })
      .hidden(
        ({ feeAssignment }) =>
          feeAssignment.status !== FEE_SCHEDULES_ENUM.UNPAID,
      ),

    changeAmount: feeMenu
      .label("Ajuster le montant à payer", Pencil)
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
            totalAmount={feeAssignment.totalAmount}
            assignmentId={feeAssignment.assignmentId}
            amountPaid={feeAssignment.amountPaid}
            mutationKey={mutationKey}
            onSuccess={close}
          />
        ),
      )
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
        <div className="flex items-center gap-2 p-2 bg-accent/50 hover:bg-accent rounded-md">
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
            ...props
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
      }) => (
        <UpdateAmountByAssignmentsDialog
          mutationKey={["fin"]}
          enrollmentIds={[enrollmentId]}
          schoolId={schoolId}
          assignments={[]}
          open={open}
          onOpenChange={onOpenChange}
        />
      ),
    ),
  },
  {
    trigger: () => <ButtonMenu />,
  },
);
