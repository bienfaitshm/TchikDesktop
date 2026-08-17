import type { ReactNode } from "react";
import type { FeeAssignment } from "@/packages/@core/data-access/db";
import { formatCurrency } from "@/packages/currency";
import { Button } from "@/renderer/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import { Suspense } from "@/renderer/libs/queries/suspense";
import {
  useProcessStudentPaymentForm,
  type ProcessPaymentFormConfig,
} from "@/renderer/libs/queries/finances";
import { cn } from "@/renderer/utils";

import { PaymentAssignHistory } from "../contents/payment-assign-history.content";
import { PaymentProcessForm } from "../forms/payment-process-form";
import {
  createBaseActionDialog,
  type ActionDialogProps,
} from "@/renderer/dialog-actions/base.dialog-actions";

export interface PaymentHistoryDialogProps extends Partial<
  React.ComponentProps<typeof Dialog>
> {
  assignmentId: string;
}

export interface PaymentDetailDialogProps extends Partial<
  React.ComponentProps<typeof Dialog>
> {
  assignment: FeeAssignment;
}

export interface DetailRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export type SavePaymentDialogProps = ActionDialogProps<
  unknown,
  ProcessPaymentFormConfig
> & {
  schoolId: string;
  yearId: string;
  assignmentId: string;
  totalAmount?: number;
  amountPaid?: number;
};

/**
 * Modal dialog component displaying the payment history of a fee assignment.
 * @param props - Dialog properties including the target assignment identifier.
 * @returns Rendered payment history dialog component.
 */
export const PaymentHistoryDialog: React.FC<PaymentHistoryDialogProps> = ({
  assignmentId,
  ...props
}) => (
  <Dialog {...props}>
    <DialogContent className="sm:max-w-106.25">
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

/**
 * Helper component rendering a labeled key-value pair for financial breakdowns.
 * @param props - Row label, formatted value, and optional custom styling class.
 * @returns Rendered detail row element.
 */
const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  valueClassName,
}) => (
  <div className="flex justify-between items-center border-b border-border/40 pb-2 last:border-b-0">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className={cn("font-mono font-medium", valueClassName)}>{value}</span>
  </div>
);

/**
 * Modal dialog component rendering fee assignment financial details and remaining balances.
 * @param props - Dialog properties including the target FeeAssignment entity.
 * @returns Rendered payment detail dialog component.
 */
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

/**
 * Action dialog component for processing student fee payments.
 * @param props - Dialog properties including target assignment, school, and year context.
 * @returns Rendered save payment dialog component.
 */
export const SavePaymentDialog = createBaseActionDialog<
  SavePaymentDialogProps,
  ReturnType<typeof useProcessStudentPaymentForm>
>({
  title: "Enregistrer un paiement",
  description:
    "Saisissez le montant perçu et le mode de règlement pour mettre à jour le solde.",
  submitText: "Enregistrer le paiement",
  useForm: useProcessStudentPaymentForm,
  form(
    { formId, onSubmit, currencyOptions, paymentMethodOptions, defaultValues },
    { schoolId, yearId, assignmentId, totalAmount, amountPaid },
  ): ReactNode {
    return (
      <PaymentProcessForm
        formId={formId}
        currencyOptions={currencyOptions}
        paymentMethodOptions={paymentMethodOptions}
        onSubmit={onSubmit}
        totalAmount={totalAmount}
        amountPaid={amountPaid}
        defaultValues={{ ...defaultValues, schoolId, yearId, assignmentId }}
      />
    );
  },
});

SavePaymentDialog.displayName = "SavePaymentDialog";
