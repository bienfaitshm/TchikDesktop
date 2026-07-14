import React from "react";
import { formatDate } from "@/packages/times"; // Supposé formater une string ISO vers "12 Janv. 2026 à 14:32"
import { useGetStudentPayments } from "@/renderer/libs/queries/finances";
import { Calendar, Receipt, Coins } from "lucide-react";
import {
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";

// Définition propre du type basé sur ton schéma
export type Payment = {
  assignmentId: string;
  paymentId: string;
  amountReceived: number;
  currencyReceived: CURRENCY_ENUM;
  appliedExchangeRate: number;
  amountConverted: number;
  paymentMethod: PAYMENT_METHOD_ENUM;
  createdAt: string;
  updatedAt: string;
  transactionReference?: string | null;
};

export type PaymentAssignHistoryProps = {
  assignmentId: string;
};

// Map visuel pour rendre les méthodes de paiement plus élégantes (Badge style)
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
  // Ajoute d'autres méthodes de ton ENUM si nécessaire
};

export const PaymentAssignHistory: React.FC<PaymentAssignHistoryProps> = ({
  assignmentId,
}) => {
  // Adaptation selon la signature de ton hook (généralement il expose { data, isLoading })
  const { data: payments, isLoading } = useGetStudentPayments({
    where: { assignmentId },
  }) as { data: Payment[] | undefined; isLoading: boolean };

  // 1. État de chargement (Skeleton ou spinner discret)
  if (isLoading) {
    return (
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
  }

  // 2. État vide (Empty State)
  if (!payments || payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed rounded-lg border-border/60 bg-muted/20">
        <Receipt className="size-8 text-muted-foreground/60 stroke-[1.5]" />
        <p className="mt-2 text-sm font-medium text-foreground">
          Aucun versement
        </p>
        <p className="text-xs text-muted-foreground max-w-50 mt-0.5">
          Historique vierge pour cette échéance financière.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="py-2 space-y-3 max-h-80 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {payments.map((payment) => {
          // Formatage des montants (supposé en centimes/sous-unités, diviser par 100 pour l'affichage)
          const formattedConverted = (
            payment.amountConverted / 100
          ).toLocaleString();
          const formattedReceived = (
            payment.amountReceived / 100
          ).toLocaleString();
          const hasConversion =
            payment.appliedExchangeRate !== 1_000_000 &&
            payment.appliedExchangeRate > 0;

          const method = PAYMENT_METHOD_CONFIG[payment.paymentMethod] || {
            label: payment.paymentMethod,
            className: "bg-muted text-muted-foreground",
          };

          return (
            <div
              key={payment.paymentId}
              className="group flex items-start justify-between border-b border-border/30 pb-3 text-sm last:border-0 last:pb-0 transition-colors hover:bg-muted/5 p-1 rounded-lg"
            >
              {/* Infos Transaction (Gauche) */}
              <div className="flex gap-2.5 items-start">
                <div className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground group-hover:bg-background transition-colors border border-border/20">
                  <Receipt className="size-4 text-foreground/80" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    Reçu #{payment.paymentId.slice(-6).toUpperCase()}
                    {payment.transactionReference && (
                      <span
                        className="text-[10px] font-normal text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded"
                        title="Référence transaction"
                      >
                        {payment.transactionReference}
                      </span>
                    )}
                  </span>

                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="size-3" />
                    {formatDate(payment.createdAt)}
                  </span>
                </div>
              </div>

              {/* Montant & Méthode (Droite) */}
              <div className="flex flex-col items-end gap-1">
                <span className="font-mono font-bold text-foreground text-sm tracking-tight">
                  {/* Devise finale après conversion */}
                  {formattedConverted} {payment.currencyReceived}
                </span>

                {/* Si conversion, affiche discrètement le montant de base reçu */}
                {hasConversion && (
                  <span
                    className="text-[10px] text-muted-foreground/80 flex items-center gap-1"
                    title="Montant d'origine reçu avant conversion"
                  >
                    <Coins className="size-2.5" />
                    Reçu: {formattedReceived} {payment.currencyReceived}
                  </span>
                )}

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide scale-95 origin-right ${method.className}`}
                >
                  {method.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
