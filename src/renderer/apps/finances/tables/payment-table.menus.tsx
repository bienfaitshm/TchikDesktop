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
  UpdateAmountDialog,
} from "../dialog";
import type {
  AssignmentTableOfClassroom,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import { FEE_SCHEDULES_ENUM } from "@/packages/@core/data-access/db/options";

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
    trigger: defaultMenuTrigger,
  },
);

const rowMenu = createMenuBuilder<AssignmentTableOfClassroom>();

/**
 * Menu contextuel d'actions pour chaque ligne du tableau (niveau élève).
 */
export const RowAction = rowMenu.build(
  {
    viewStudentProfile: rowMenu
      .label("Fiche de l'élève", ExternalLink)
      .link(({ enrollmentId }) => `/schools/${enrollmentId}/details`),
    changeAmount: rowMenu
      .label("Ajuster le montant à payer", Pencil)
      .dialog(({ props, open, onOpenChange, close }) => (
        <UpdateAmountDialog open={open} onOpenChange={onOpenChange} />
      ))
      .separator("after"),
  },
  {
    trigger: defaultMenuTrigger,
  },
);
