import React from "react";
import { formatDate } from "@/packages/times";
import { useGetStudentPayments } from "@/renderer/libs/queries/finances";
import { Calendar, Receipt, Coins } from "lucide-react";
import { PAYMENT_METHOD_ENUM } from "@/packages/@core/data-access/db/options";
import { cn } from "@/renderer/utils";
import { formatCurrency } from "@/packages/currency";

import type { StudentPayment } from "@/packages/@core/data-access/db/schemas";

export type PaymentAssignHistoryProps = {
  assignmentId: string;
};

const PAYMENT_METHOD_CONFIG: Record<
  PAYMENT_METHOD_ENUM,
  { label: string; className: string }
> = {
  [PAYMENT_METHOD_ENUM.CASH]: {
    label: "Espèces",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  [PAYMENT_METHOD_ENUM.BANK]: {
    label: "Virement",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  [PAYMENT_METHOD_ENUM.MOBILE_MONEY]: {
    label: "Mobile Money",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

// Extraction d’un composant pour chaque ligne de paiement
const PaymentItem: React.FC<{ payment: StudentPayment }> = ({ payment }) => {
  const hasConversion = payment.amountReceived !== payment.amountConverted;
  const method = PAYMENT_METHOD_CONFIG[payment.paymentMethod] ?? {
    label: payment.paymentMethod,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex items-start justify-between border-b border-border/30 pb-3 text-sm last:border-0 last:pb-0 hover:bg-muted/5 rounded-md px-2 py-1 -mx-2 transition-colors">
      {/* Gauche : informations de la transaction */}
      <div className="flex gap-2.5 items-start">
        <div className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground border border-border/20">
          <Receipt className="size-4" />
        </div>
        <div>
          <div className="font-semibold flex items-center gap-1.5">
            Reçu #{payment.paymentId.slice(-6).toUpperCase()}
            {payment.transactionReference && (
              <span
                className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-30"
                title={payment.transactionReference}
              >
                {payment.transactionReference}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Calendar className="size-3" />
            {formatDate(payment.createdAt)}
          </div>
        </div>
      </div>

      {/* Droite : montants et méthode */}
      <div className="flex flex-col items-end gap-1">
        <span className="font-mono font-bold">
          {formatCurrency(payment.amountConverted)}
        </span>

        {hasConversion && (
          <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
            <Coins className="size-2.5" />
            Reçu : {formatCurrency(payment.amountReceived)}
          </span>
        )}

        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium",
            method.className,
          )}
        >
          {method.label}
        </span>
      </div>
    </div>
  );
};

// État de chargement (squelette)
const LoadingSkeleton = () => (
  <div className="py-4 space-y-3 animate-pulse">
    {[1, 2].map((n) => (
      <div
        key={n}
        className="flex items-center justify-between border-b border-border/40 pb-3"
      >
        <div className="flex gap-2.5 items-center">
          <div className="rounded-md bg-muted size-8" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        </div>
        <div className="space-y-1.5 flex flex-col items-end">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-3 w-10 bg-muted rounded" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed rounded-lg border-border/60 bg-muted/20">
    <Receipt className="size-8 text-muted-foreground/60 stroke-[1.5]" />
    <p className="mt-2 text-sm font-medium text-foreground">Aucun versement</p>
    <p className="text-xs text-muted-foreground max-w-50 mt-0.5">
      Historique vierge pour cette échéance financière.
    </p>
  </div>
);

export const PaymentAssignHistory: React.FC<PaymentAssignHistoryProps> = ({
  assignmentId,
}) => {
  const { data: payments, isLoading } = useGetStudentPayments({
    where: { studentPayments: { assignmentId: { $eq: assignmentId } } },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!payments?.length) return <EmptyState />;

  return (
    <div className="max-h-80 overflow-x-hidden overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      {payments.map((payment) => (
        <PaymentItem key={payment.paymentId} payment={payment} />
      ))}
    </div>
  );
};
