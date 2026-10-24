"use client";

import React, { useState, useEffect } from "react";
import { formatDate } from "@/packages/times";
import { useGetStudentPayments } from "@/renderer/libs/queries/finances";
import { Calendar, Receipt, Coins } from "lucide-react";
import {
  PAYMENT_METHOD_ENUM,
  PAYMENT_STATUS_ENUM,
  getPaymentStatusLabel,
} from "@/packages/@core/data-access/db/options";
import { cn } from "@/renderer/utils";
import { formatCurrency } from "@/packages/currency";
import { PaymentInvoiceContent } from "../components/payment-invoice-content";
import type { StudentPaymentDTO } from "@/packages/@core/data-access/db";

export type PaymentAssignHistoryProps = {
  /** The unique identifier of the financial fee assignment. */
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

type PaymentItemProps = {
  /** The student payment DTO record. */
  payment: StudentPaymentDTO;
  /** Whether the payment item is currently selected. */
  isSelected?: boolean;
  /** Callback triggered when the payment item is clicked. */
  onClick?: () => void;
};

/**
 * Renders an individual transaction row with payment details, method badges, and interactive states.
 * @param props - Payment item properties including transaction data and selection handlers.
 * @returns The structured payment item element.
 */
const PaymentItem: React.FC<PaymentItemProps> = ({
  payment,
  isSelected,
  onClick,
}) => {
  const hasConversion = payment.amountReceived !== payment.amountConverted;
  const method = PAYMENT_METHOD_CONFIG[payment.paymentMethod] ?? {
    label: payment.paymentMethod,
    className: "bg-accent text-muted-foreground",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start p-2 justify-between text-sm transition-all cursor-pointer rounded-md border",
        isSelected ? "bg-accent/80 " : "hover:bg-accent/50",
      )}
    >
      <div className="flex gap-2.5 items-start">
        <div className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground border border-border/20">
          <Receipt className="size-4" />
        </div>
        <div>
          <div className="font-semibold text-xs flex items-center gap-1.5">
            <span>Paiement</span>
            {payment.status && (
              <span
                className={cn(
                  "text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-30",
                  payment.status === PAYMENT_STATUS_ENUM.CANCELED &&
                    "text-destructive",
                )}
                title={payment.status}
              >
                {getPaymentStatusLabel(payment.status)}
              </span>
            )}
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

      <div className="flex flex-col items-end gap-1 text-xs">
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

PaymentItem.displayName = "PaymentItem";

/**
 * Renders an animated placeholder loading skeleton for transaction lists.
 * @returns The loading skeleton container element.
 */
const PaymentLoadingSkeleton: React.FC = () => (
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

PaymentLoadingSkeleton.displayName = "PaymentLoadingSkeleton";

/**
 * Renders an empty state placeholder when no payments are available.
 * @returns The empty state container element.
 */
const PaymentEmptyState: React.FC = () => (
  <div className="flex h-full flex-col items-center justify-center py-8 px-4 text-center border border-dashed rounded-lg border-border/60 bg-muted/20">
    <Receipt className="size-8 text-muted-foreground/60 stroke-[1.5]" />
    <p className="mt-2 text-sm font-medium text-foreground">Aucun versement</p>
    <p className="text-xs text-muted-foreground max-w-50 mt-0.5">
      Historique vierge pour cette échéance financière.
    </p>
  </div>
);

PaymentEmptyState.displayName = "PaymentEmptyState";

type PaymentInvoiceViewerProps = {
  /** Array of student payment records. */
  payments: StudentPaymentDTO[];
};

/**
 * Custom hook managing selected payment state and keyboard arrow navigation.
 * @param payments - Array of available student payments.
 * @returns Selected payment state and setter.
 */
function usePaymentNavigation(payments: StudentPaymentDTO[]) {
  const [selectedPayment, setSelectedPayment] =
    useState<StudentPaymentDTO | null>(payments[0] ?? null);

  useEffect(() => {
    setSelectedPayment(payments[0] ?? null);
  }, [payments]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (payments.length === 0) return;
      if (
        ["input", "textarea"].includes(
          (document.activeElement?.tagName ?? "").toLowerCase(),
        )
      ) {
        return;
      }

      const currentIndex = payments.findIndex(
        (payment) => payment.paymentId === selectedPayment?.paymentId,
      );

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex =
          currentIndex < payments.length - 1 ? currentIndex + 1 : 0;
        setSelectedPayment(payments[nextIndex]);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : payments.length - 1;
        setSelectedPayment(payments[prevIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [payments, selectedPayment]);

  return { selectedPayment, setSelectedPayment };
}

/**
 * Coordinates payment selection state, keyboard arrow navigation, and invoice preview rendering.
 * @param props - Payment viewer properties containing payment records.
 * @returns The structured invoice viewer and payment list component.
 */
const PaymentInvoiceViewer: React.FC<PaymentInvoiceViewerProps> = ({
  payments,
}) => {
  const { selectedPayment, setSelectedPayment } =
    usePaymentNavigation(payments);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="lg:sticky top-6 space-y-2">
        {payments.map((payment) => (
          <PaymentItem
            key={payment.paymentId}
            payment={payment}
            isSelected={selectedPayment?.paymentId === payment.paymentId}
            onClick={() => setSelectedPayment(payment)}
          />
        ))}
      </div>
      <div className="w-full min-w-0 max-w-full overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-md p-3 space-y-4">
          {selectedPayment && (
            <PaymentInvoiceContent payment={selectedPayment} />
          )}
        </div>
      </div>
    </div>
  );
};

PaymentInvoiceViewer.displayName = "PaymentInvoiceViewer";

/**
 * Manages fetching and presentation of student payment history for a given assignment identifier.
 * @param props - Component properties containing the target financial assignment identifier.
 * @returns The payment assignment history container component.
 */
export const PaymentAssignHistory: React.FC<PaymentAssignHistoryProps> = ({
  assignmentId,
}) => {
  const { data: payments = [], isLoading } = useGetStudentPayments({
    where: { studentPayments: { assignmentId } },
  });

  if (isLoading) return <PaymentLoadingSkeleton />;
  if (!payments?.length) return <PaymentEmptyState />;

  return <PaymentInvoiceViewer payments={payments} />;
};
