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

// Tes types de Props
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

// 1. Initialiser le builder typé pour ces Props spécifiques
const menu = createMenuBuilder<FeeTypeRowActionsProps>();

// 2. Définition propre avec la syntaxe exacte demandée
export const CellAction = menu.build(
  {
    infos: menu
      .label("Détails de l'échéance", Info)
      .dialog(({ feeAssignment }) => (
        <PaymentDetailDialog assignment={feeAssignment} />
      )),

    viewHistory: menu
      .label("Historique des paiements", Eye)
      .dialog(({ feeAssignment }) => (
        <PaymentHistoryDialog assignmentId={feeAssignment.assignmentId} />
      )),

    pay: menu
      .label("Enregistrer un paiement", CreditCard)
      .dialog(({ yearId, schoolId, feeAssignment, mutationKey }, close) => (
        <SavePaymentDialog
          yearId={yearId}
          schoolId={schoolId}
          totalAmount={feeAssignment.totalAmount}
          assignmentId={feeAssignment.assignmentId}
          amountPaid={feeAssignment.amountPaid}
          mutationKey={mutationKey}
          onSuccess={close} // Se ferme automatiquement !
        />
      ))
      .disabled(
        ({ feeAssignment }) =>
          feeAssignment.amountPaid >= feeAssignment.totalAmount,
      )
      .separator("after"),

    detail: menu
      .label("Lien Externe", ExternalLink)
      .link(({ schoolId }) => `/schools/${schoolId}/details`),

    status: menu.label("Activer la ligne").toggle(
      ({ feeAssignment }) => feeAssignment.isPaid,
      (_, checked) => console.log("Nouveau statut:", checked),
    ),

    delete: menu
      .label("Supprimer", Trash2)
      .action(({ feeAssignment }) =>
        console.log("Supprimer", feeAssignment.assignmentId),
      )
      .destructive()
      .shortcut("⌘⌫")
      .hidden(({ feeAssignment }) => feeAssignment.isLocked),
  },
  {
    // Trigger optionnel par défaut
    trigger: (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Menu d'actions de paiement"
        className="opacity-0 group-hover/cell:opacity-100 focus-visible:opacity-100 transition-opacity"
      >
        <MoreVerticalIcon data-icon="inline-start" />
      </Button>
    ),
  },
);
