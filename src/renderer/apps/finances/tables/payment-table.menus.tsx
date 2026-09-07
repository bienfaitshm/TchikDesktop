import { createMenuBuilder } from "@/components/menus/more-menus";
import {
  Info,
  CreditCard,
  Trash2,
  ExternalLink,
  MoreVerticalIcon,
  Eye,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
  SavePaymentDialog,
  PaymentHistoryDialog,
  PaymentDetailDialog,
} from "../dialog";
import type {
  AssignmentTableOfClassroom,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import { FEE_SCHEDULES_ENUM } from "@/packages/@core/data-access/db/options";

/**
 * Properties passed to the fee assignment row action handlers and dialogs.
 */
export interface FeeTypeRowActionsProps {
  feeAssignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  mutationKey?: readonly unknown[];
}

/**
 * Shared trigger button element for table row context menus.
 */
export const defaultMenuTrigger = (
  <Button
    variant="ghost"
    size="icon-sm"
    aria-label="Table row actions menu"
    className="opacity-0 group-hover/cell:opacity-100 focus-visible:opacity-100 transition-opacity"
  >
    <MoreVerticalIcon data-icon="inline-start" />
  </Button>
);

const feeMenu = createMenuBuilder<FeeTypeRowActionsProps>();

/**
 * Contextual action menu component for fee assignment table rows.
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
          feeAssignment.amountPaid >= feeAssignment.totalAmount,
      ),
    exampt: feeMenu
      .label("Exempter du paiement")
      .toggle(
        (value) => value.feeAssignment.status === FEE_SCHEDULES_ENUM.EXEMPTED,
        (props) => {
          console.log(props);
        },
      )
      .disabled(
        (props) => props.feeAssignment.status === FEE_SCHEDULES_ENUM.PAID,
      ),
    changeAmount: feeMenu
      .label("Changer le montant a payer", CreditCard)
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
          .label("Détails de l'échéance", Info)
          .dialog(({ props, open, onOpenChange }) => (
            <PaymentDetailDialog
              open={open}
              onOpenChange={onOpenChange}
              assignment={props.feeAssignment}
            />
          )),

        viewHistory: feeMenu
          .label("Historique des paiements", Eye)
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
    trigger: defaultMenuTrigger,
  },
);

const rowMenu = createMenuBuilder<AssignmentTableOfClassroom>();

/**
 * Contextual action menu component for classroom assignment table rows.
 */
export const RowAction = rowMenu.build(
  {
    externalLink: rowMenu
      .label("Lien Externe", ExternalLink)
      .link(({ enrollmentId }) => `/schools/${enrollmentId}/details`),
  },
  {
    trigger: defaultMenuTrigger,
  },
);
