"use client";

import React from "react";
import {
  PrintInvoiceButton,
  PaymentInvoice,
  PrinterConfigView,
} from "@/components/invoices";
import { useGetStudentPaymentById } from "@/renderer/libs/queries/finances";
import { type Invoice } from "@/renderer/libs/invoice-preview-printing";
import type { StudentPaymentDTO } from "@/packages/@core/data-access/db";
import { PAYMENT_STATUS_ENUM } from "@/packages/@core/data-access/db/options";
import { CancelPaymentButton } from "./payment-cancel-button";

const FALLBACK_INVOICE_REF = "no-ref";

/**
 * Extracts student code from payment DTO with fallback.
 * @param payment - The raw student payment DTO.
 * @returns The student code string.
 */
function extractStudentCode(payment: StudentPaymentDTO): string {
  return payment?.enrollment?.studentCode ?? "";
}

/**
 * Extracts student full name from payment DTO with fallback.
 * @param payment - The raw student payment DTO.
 * @returns The student full name string.
 */
function extractStudentName(payment: StudentPaymentDTO): string {
  return payment?.student?.fullName ?? "";
}

/**
 * Extracts classroom identifier from payment DTO with fallback.
 * @param payment - The raw student payment DTO.
 * @returns The classroom identifier string.
 */
function extractClassroomName(payment: StudentPaymentDTO): string {
  return payment?.classroom?.shortIdentifier ?? "";
}

/**
 * Maps student-related information from the payment DTO.
 * @param payment - The raw student payment DTO.
 * @returns Structured student details for the invoice.
 */
function mapStudentData(payment: StudentPaymentDTO) {
  return {
    code: extractStudentCode(payment),
    name: extractStudentName(payment),
    classroomName: extractClassroomName(payment),
  };
}

/**
 * Maps payment-related information and calculates status flags.
 * @param payment - The raw student payment DTO.
 * @returns Structured payment details for the invoice.
 */
function mapPaymentData(payment: StudentPaymentDTO) {
  const amount = payment?.amountReceived ?? 0;
  return {
    dueAmount: payment?.feeAssigment?.totalAmount ?? 0,
    feeTypeName: payment?.feeType?.name ?? "",
    paidAmount: amount,
    scheduleName: payment?.feeSchedule?.installmentName ?? "",
    currency: payment?.currencyReceived ?? "",
    receivedAmount: amount,
    isCanceled: payment?.status === PAYMENT_STATUS_ENUM.CANCELED,
  };
}

/**
 * Transforms a raw student payment DTO into structured invoice data format.
 * @param payment - The student payment DTO retrieved from the database.
 * @returns Structured object containing mapped invoice, student, and payment details.
 */
export function convertPaymentDataToInvoiceData(payment: StudentPaymentDTO) {
  return {
    date: payment?.createdAt,
    invoiceRef: payment?.transactionReference ?? FALLBACK_INVOICE_REF,
    student: mapStudentData(payment),
    payment: mapPaymentData(payment),
  };
}

/**
 * Properties for the PaymentInvoiceContent component.
 */
type PaymentInvoiceContentProps = {
  /** The student payment data record. */
  payment: StudentPaymentDTO;
};

/**
 * Renders specific payment receipt details and associated action toolbar.
 * @param props - Component properties containing the payment DTO.
 * @returns The rendered payment invoice component and actions.
 */
export function PaymentInvoiceContent({
  payment,
}: PaymentInvoiceContentProps): React.JSX.Element {
  const invoiceProps = convertPaymentDataToInvoiceData(payment);

  const invoiceMetadata: Invoice = {
    date: invoiceProps.date,
    id: payment.paymentId,
    invoiceRef: invoiceProps.invoiceRef,
    isPrinted: true,
    type: "payment",
  };

  return (
    <>
      <PaymentInvoice {...invoiceProps} />
      <PaymentActionToolbar
        invoice={invoiceMetadata}
        isCanceled={invoiceProps.payment.isCanceled}
      />
    </>
  );
}

/**
 * Renders the loading state feedback view.
 * @returns The rendered loading indicator element.
 */
function PaymentLoadingView(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
      Chargement des détails du paiement...
    </div>
  );
}

/**
 * Renders the error state feedback view.
 * @returns The rendered error indicator element.
 */
function PaymentErrorView(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center p-4 text-sm text-destructive">
      Échec du chargement des détails du paiement.
    </div>
  );
}

/**
 * Properties for the PaymentInvoiceContainer component.
 */
type PaymentInvoiceContainerProps = {
  /** The invoice record containing the payment ID. */
  invoice: Invoice;
};

/**
 * Container component that fetches student payment data and manages loading and error states.
 * @param props - Component properties containing the invoice record.
 * @returns The rendered payment invoice or loading/error feedback.
 */
export function PaymentInvoiceContainer({
  invoice,
}: PaymentInvoiceContainerProps): React.JSX.Element {
  const {
    data: payment,
    isLoading,
    isError,
  } = useGetStudentPaymentById(invoice.id);

  if (isLoading) {
    return <PaymentLoadingView />;
  }

  if (isError || !payment) {
    return <PaymentErrorView />;
  }

  return <PaymentInvoiceContent payment={payment} />;
}

/**
 * Properties for the PaymentActionToolbar component.
 */
export type PaymentActionToolbarProps = {
  /** Whether the action controls are disabled. */
  disabled?: boolean;
  /** Whether the invoice has been printed. */
  isPrinted?: boolean;
  /** Whether the print action is currently in progress. */
  isPrinting?: boolean;
  /** Whether the print system is ready. */
  isReady?: boolean;
  /** Callback triggered when the print action is invoked. */
  onPrint?(): void;
  /** The invoice record associated with the actions. */
  invoice: Invoice;
  /** Whether the payment has been canceled. */
  isCanceled?: boolean;
};

/**
 * Renders the payment action toolbar with cancellation and print controls.
 * @param props - Component properties for action controls.
 * @returns The rendered action toolbar element.
 */
export function PaymentActionToolbar({
  disabled,
  invoice,
  isCanceled,
}: PaymentActionToolbarProps): React.JSX.Element {
  return (
    <PrinterConfigView>
      {(isConfig, isConnected) => (
        <div className="flex items-center justify-end gap-3 w-full max-w-md">
          <CancelPaymentButton invoice={invoice} isCanceled={isCanceled} />
          <PrintInvoiceButton
            disabled={disabled || !isConfig || !isConnected}
            invoice={invoice}
          />
        </div>
      )}
    </PrinterConfigView>
  );
}
