import {
  Info,
  CreditCard,
  ExternalLink,
  MoreVertical,
  History,
  ShieldOff,
  Pencil,
  FileText,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
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

/**
 * Propriétés transmises aux actions de ligne des échéances de frais.
 */
export interface FeeTypeRowActionsProps {
  feeAssignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  mutationKey?: readonly unknown[];
}

/**
 * Bouton déclencheur standard pour les menus contextuels de tableau.
 */
export const defaultMenuTrigger = (
  <Button
    variant="ghost"
    size="icon-sm"
    aria-label="Menu d'actions"
    className="opacity-0 group-hover/cell:opacity-100 focus-visible:opacity-100 transition-opacity"
  >
    <MoreVertical className="h-4 w-4 text-muted-foreground" />
  </Button>
);

const feeMenu = createMenuBuilder<FeeTypeRowActionsProps>();

/**
 * Menu contextuel d'actions pour chaque cellule d'échéance/frais.
 */
export const CellAction = feeMenu.build(
  {
    pay: feeMenu
      .label("Enregistrer un paiement", CreditCard)
      .dialog(({ props, open, onOpenChange, close }) => (
        <SavePaymentDialog
          open={open}
          onOpenChange={onOpenChange}
          schoolId={props.schoolId}
          yearId={props.yearId}
          totalAmount={props.feeAssignment.totalAmount}
          assignmentId={props.feeAssignment.assignmentId}
          amountPaid={props.feeAssignment.amountPaid}
          mutationKey={props.mutationKey}
          onSuccess={close}
        />
      ))
      .disabled(
        ({ feeAssignment }) =>
          feeAssignment.amountPaid >= feeAssignment.totalAmount ||
          feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED,
      ),

    exempt: feeMenu
      .label("Exempter du paiement", ShieldOff)
      .toggle(
        (props) => props.feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED,
        (props) => {
          console.log(
            "Toggle exemption pour :",
            props.feeAssignment.assignmentId,
          );
        },
      )
      .disabled(
        ({ feeAssignment }) => feeAssignment.status === FEE_SCHEDULES_ENUM.PAID,
      ),

    changeAmount: feeMenu
      .label("Ajuster le montant à payer", Pencil)
      .dialog(({ props, open, onOpenChange, close }) => (
        <SavePaymentDialog
          open={open}
          onOpenChange={onOpenChange}
          schoolId={props.schoolId}
          yearId={props.yearId}
          totalAmount={props.feeAssignment.totalAmount}
          assignmentId={props.feeAssignment.assignmentId}
          amountPaid={props.feeAssignment.amountPaid}
          mutationKey={props.mutationKey}
          onSuccess={close}
        />
      ))
      .separator("after"),

    consultationGroup: feeMenu
      .submenu("Consultation & Historique", Info)
      .submenu({
        details: feeMenu
          .label("Détails de l'échéance", FileText)
          .dialog(({ props, open, onOpenChange }) => (
            <PaymentDetailDialog
              open={open}
              onOpenChange={onOpenChange}
              assignment={props.feeAssignment}
            />
          )),

        viewHistory: feeMenu
          .label("Historique des paiements", History)
          .dialog(({ props, open, onOpenChange }) => (
            <PaymentHistoryDialog
              open={open}
              onOpenChange={onOpenChange}
              assignmentId={props.feeAssignment.assignmentId}
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

const rowMenu = createMenuBuilder<AssignmentTableOfClassroom>();

/**
 * Menu contextuel d'actions pour chaque ligne du tableau (niveau élève).
 */
export const RowAction = rowMenu.build(
  {
    // viewStudentProfile: rowMenu
    //   .label("Fiche de l'élève", ExternalLink)
    //   .link(({ enrollmentId }) => `/schools/${enrollmentId}/details`),
    changeAmount: rowMenu
      .label("Ajuster le montant à payer", Pencil)
      .dialog(
        ({
          props: { payments, enrollmentId, schoolId },
          open,
          onOpenChange,
        }) => (
          <UpdateAmountByAssignmentsDialog
            mutationKey={["fin"]}
            enrollmentIds={[enrollmentId]}
            schoolId={schoolId}
            assignments={Object.entries(payments || {})
              .map((item) => item[1])
              .filter((i) => !!i)}
            open={open}
            onOpenChange={onOpenChange}
          />
        ),
      ),
  },
  {
    trigger: () => defaultMenuTrigger,
  },
);
