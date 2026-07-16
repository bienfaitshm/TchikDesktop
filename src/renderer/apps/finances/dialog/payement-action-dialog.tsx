import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogClose,
} from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ProcessPaymentFormConfig,
  useProcessStudentPaymentForm,
} from "@/renderer/libs/queries/finances";
import { PaymentProcessForm } from "../forms/payment-process-form";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { PaymentAssignHistory } from "../contents/payment-assign-hisotry.content";
import type { FeeAssignment } from "@/packages/@core/data-access/db";
import { formatCurrency } from "@/packages/currency";
import { cn } from "@/renderer/utils";
import { Skeleton } from "@/renderer/components/ui/skeleton";

type DialogProps = Partial<React.ComponentProps<typeof Dialog>> & {
  children?: React.ReactNode;
  schoolId?: string;
  yearId?: string;
  assignmentId: string;
};
/* ==========================================================================
   1. HISTORIQUE DES PAIEMENTS
   ========================================================================== */
interface PaymentHistoryDialogProps extends Partial<
  React.ComponentProps<typeof Dialog>
> {
  assignmentId: string;
}

export const PaymentHistoryDialog: React.FC<PaymentHistoryDialogProps> = ({
  assignmentId,
  ...props
}) => (
  <Dialog {...props}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-base font-semibold tracking-tight">
          Historique des paiements
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Liste chronologique des versements effectués pour cette échéance.
        </DialogDescription>
      </DialogHeader>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <PaymentAssignHistory assignmentId={assignmentId} />
      </Suspense>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary" size="sm" className="h-8 text-xs">
            Fermer
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ==========================================================================
   2. DÉTAILS DE L’ÉCHÉANCE
   ========================================================================== */
interface PaymentDetailDialogProps extends Partial<
  React.ComponentProps<typeof Dialog>
> {
  assignment: FeeAssignment;
}

export const PaymentDetailDialog: React.FC<PaymentDetailDialogProps> = ({
  assignment,
  ...props
}) => {
  const remaining = assignment.totalAmount - assignment.amountPaid;
  const remainingColor =
    remaining > 0
      ? "text-rose-600 dark:text-rose-500"
      : "text-emerald-600 dark:text-emerald-500";

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Détails de l’échéance
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Vue d’ensemble de la situation de cette assignation financière.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3.5 text-sm">
          <DetailRow
            label="Montant total"
            value={formatCurrency(assignment.totalAmount)}
          />
          <DetailRow
            label="Montant payé"
            value={formatCurrency(assignment.amountPaid)}
            valueClassName="text-emerald-600 dark:text-emerald-500"
          />
          <DetailRow
            label="Reste à recouvrer"
            value={formatCurrency(remaining)}
            valueClassName={remainingColor}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" size="sm" className="h-8 text-xs">
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Petit composant utilitaire local
const DetailRow: React.FC<{
  label: string;
  value: string;
  valueClassName?: string;
}> = ({ label, value, valueClassName }) => (
  <div className="flex justify-between items-center border-b border-border/40 pb-2 last:border-b-0">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className={cn("font-mono font-medium", valueClassName)}>{value}</span>
  </div>
);

/* ==========================================================================
   3. ENREGISTRER UN PAIEMENT (DIALOGFORM + HOOK FORM)
   ========================================================================== */
export const SavePaymentDialog: React.FC<
  DialogProps & {
    assignmentId: string;
    schoolId: string;
    yearId: string;
    totalAmount?: number;
  } & ProcessPaymentFormConfig
> = ({
  assignmentId,
  schoolId,
  yearId,
  totalAmount,
  mutationKey,
  onSuccess,
  ...props
}) => {
  const {
    currencyOptions,
    formId,
    isSubmitting,
    paymentMethodOptions,
    onSubmit,
  } = useProcessStudentPaymentForm(
    { schoolId, yearId },
    { mutationKey, onSuccess },
  );

  return (
    <DialogForm
      formId={formId}
      title="Enregistrer un paiement"
      description="Saisissez le montant perçu et le mode de règlement pour mettre à jour le solde."
      submitText={isSubmitting ? "Traitement..." : "Enregistrer le paiement"}
      {...props}
    >
      <PaymentProcessForm
        formId={formId}
        currencyOptions={currencyOptions}
        paymentMethodOptions={paymentMethodOptions}
        onSubmit={onSubmit}
        totalAmount={totalAmount}
        defaultValues={{ schoolId, yearId, assignmentId }}
      />
    </DialogForm>
  );
};
