import { createMenuBuilder } from "./action-menu-builder";
import {
  Info,
  CreditCard,
  Trash2,
  Eye,
  ExternalLink,
  MoreVerticalIcon,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";

export interface FeeAssignment {
  assignmentId: string;
  totalAmount: number;
  amountPaid: number;
  isPaid: boolean;
  isLocked: boolean;
}

export interface FeeTypeRowActionsProps {
  feeAssignment: FeeAssignment;
  schoolId: string;
  yearId: string;
  mutationKey?: readonly unknown[];
}

const menu = createMenuBuilder<FeeTypeRowActionsProps>();

/**
 * Configures the payment row actions dropdown cell component.
 * @returns The executable component bound to row context.
 */
export const CellAction = menu.build(
  {
    infos: menu
      .label("Payment Details", Info)
      .dialog(({ feeAssignment }) => (
        <PaymentDetailDialog assignment={feeAssignment} />
      )),

    viewHistory: menu
      .label("Payment History", Eye)
      .dialog(({ feeAssignment }) => (
        <PaymentHistoryDialog assignmentId={feeAssignment.assignmentId} />
      )),

    pay: menu
      .label("Record Payment", CreditCard)
      .dialog(({ yearId, schoolId, feeAssignment, mutationKey, close }) => (
        <SavePaymentDialog
          yearId={yearId}
          schoolId={schoolId}
          totalAmount={feeAssignment.totalAmount}
          assignmentId={feeAssignment.assignmentId}
          amountPaid={feeAssignment.amountPaid}
          mutationKey={mutationKey}
          onSuccess={close}
        />
      ))
      .disabled(
        ({ feeAssignment }) =>
          feeAssignment.amountPaid >= feeAssignment.totalAmount,
      )
      .separator("after"),

    detail: menu
      .label("External Link", ExternalLink)
      .link(({ schoolId }) => `/schools/${schoolId}/details`),

    status: menu.label("Activate Row").toggle(
      ({ feeAssignment }) => feeAssignment.isPaid,
      (_, checked) => console.log("New status:", checked),
    ),

    delete: menu
      .label("Delete", Trash2)
      .action(({ feeAssignment }) =>
        console.log("Deleted", feeAssignment.assignmentId),
      )
      .destructive()
      .shortcut("⌘⌫")
      .hidden(({ feeAssignment }) => feeAssignment.isLocked),
  },
  {
    trigger: (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Payment action menu"
        className="opacity-0 group-hover/cell:opacity-100 focus-visible:opacity-100 transition-opacity"
      >
        <MoreVerticalIcon data-icon="inline-start" />
      </Button>
    ),
  },
);
