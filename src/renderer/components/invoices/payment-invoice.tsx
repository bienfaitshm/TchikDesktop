import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  InvoiceContainer,
  KeyValueRow,
  KeyLabel,
  ValueText,
  DashedDivider,
  RowTitle,
} from "./base";
import { formatCurrency } from "@/packages/currency";

/**
 * Payment transaction details for a fee item.
 */
export type PaymentInvoiceData = {
  /** Name of the fee line item. */
  feeTypeName: string;
  /** Schedule or installment designation. */
  scheduleName: string;
  /** Optional gross amount received from payer. */
  receivedAmount?: number;
  /** Total required amount to be paid. */
  dueAmount: number;
  /** Effective amount settled in this transaction. */
  paidAmount: number;
  /** ISO currency code or symbol. */
  currency?: string;
};

/**
 * Student demographic information for receipt assignment.
 */
export type StudentDetails = {
  /** Student full name. */
  name: string;
  /** Unique student identification code. */
  code: string;
  /** Classroom or grade section assignment. */
  classroomName?: string;
};

/**
 * Properties for the PaymentInvoice component.
 */
export type PaymentInvoiceProps = {
  /** Custom receipt header title override. */
  title?: string;
  /** Transaction reference or receipt number. */
  invoiceRef?: string;
  /** Date of receipt generation. */
  date?: string | Date | null;
  /** Student details assigned to the receipt. */
  student?: StudentDetails;
  /** Payment breakdown data. */
  payment?: PaymentInvoiceData;
  /** Identifier or name of the issuing cashier. */
  cashierName?: string;
};

/**
 * Configuration properties for key-value detail row rendering.
 */
interface DetailRowProps {
  /** Descriptive label for the detail entry. */
  label: string;
  /** Text content value to display. */
  value: string;
  /** Applies emphasis font weight when true. */
  isBold?: boolean;
  /** Truncates overflowing text with ellipsis when true. */
  isTruncated?: boolean;
}

/**
 * Renders a standardized key-value row with configurable typography options.
 * @param props - Component props controlling label, value, and styling.
 * @returns A structured key-value JSX row.
 */
function DetailRow({
  label,
  value,
  isBold = false,
  isTruncated = false,
}: DetailRowProps): React.JSX.Element {
  const valueClass = [
    isBold ? "font-bold" : "",
    isTruncated ? "truncate max-w-48" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <KeyValueRow>
      <KeyLabel>{label}</KeyLabel>
      <ValueText className={valueClass || undefined}>{value}</ValueText>
    </KeyValueRow>
  );
}

/**
 * Configuration properties for the total paid summary badge.
 */
interface TotalPaidBadgeProps {
  /** Numeric total paid amount to format. */
  amount: number;
  /** ISO currency code for amount formatting. */
  currency?: string;
}

/**
 * Renders an animated total paid summary badge with currency formatting.
 * @param props - Amount and currency properties for display.
 * @returns An animated JSX container displaying total paid amount.
 */
function TotalPaidBadge({
  amount,
  currency,
}: TotalPaidBadgeProps): React.JSX.Element {
  return (
    <div className="border-t-2 border-dashed border-slate-900 dark:border-zinc-100 pt-3 mt-1">
      <div className="flex justify-between items-center bg-slate-100 dark:bg-zinc-900 p-2 rounded">
        <span className="text-xs font-black uppercase tracking-wider">
          TOTAL PAYÉ
        </span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={amount}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-black text-sm text-emerald-600 dark:text-emerald-400"
          >
            {formatCurrency(amount, currency)}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Renders a printable payment receipt containing student information and payment summaries.
 * @param props - Configuration properties containing student, payment, and cashier details.
 * @returns A printable receipt component for payment transactions.
 */
export function PaymentInvoice({
  student,
  payment,
  title = "Reçu de paiement",
  invoiceRef,
  date,
  cashierName,
}: PaymentInvoiceProps): React.JSX.Element {
  return (
    <InvoiceContainer title={title} invoiceRef={invoiceRef} date={date}>
      <div className="text-xs flex flex-col gap-1">
        <AnimatePresence mode="popLayout">
          {student ? (
            <motion.div
              key={student.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-1"
            >
              <RowTitle>Identité de l'élève</RowTitle>
              <DetailRow
                label="NOM :"
                value={student.name}
                isBold
                isTruncated
              />
              <DetailRow label="CODE :" value={student.code} />
              {student.classroomName && (
                <DetailRow label="CLASSE :" value={student.classroomName} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty-student"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full text-slate-400 italic text-[10px] py-2"
            >
              Aucun ticket récent à afficher
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {payment && (
            <motion.div
              key={payment.feeTypeName}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1 text-[11px]"
            >
              <DashedDivider className="my-1" />
              <RowTitle>Désignation</RowTitle>
              {payment.feeTypeName && (
                <DetailRow
                  label={payment.feeTypeName}
                  value={formatCurrency(
                    payment.dueAmount ?? payment.receivedAmount ?? 0,
                    payment.currency,
                  )}
                  isBold
                  isTruncated
                />
              )}
              {payment.scheduleName && (
                <ValueText className="text-left">
                  [ {payment.scheduleName} ]
                </ValueText>
              )}
              <TotalPaidBadge
                amount={payment.paidAmount ?? 0}
                currency={payment.currency}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DashedDivider className="my-1" />
      <div className="text-center text-[9px] text-slate-400 pt-2 flex flex-col gap-0.5">
        {cashierName && <p>CAISSE: {cashierName}</p>}
        <p className="tracking-widest mt-1">*** MERCI DE VOTRE VISITE ***</p>
      </div>
    </InvoiceContainer>
  );
}
