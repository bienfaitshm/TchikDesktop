"use client";

import React from "react";
import {
  ActionPrintContainer,
  ActionPrintHeaderStatus,
  PrinterConfigView,
  PrintInvoiceButtonUI,
} from "@/components/invoices/invoice-print";
import { usePrintInvoiceForm } from "@/renderer/libs/queries/printing";
import {
  InvoiceHistoryDialog,
  useInvoiceStore,
  type Invoice,
} from "@/renderer/libs/invoice-preview-printing";
import { Suspense } from "@/renderer/libs/queries/suspense";

/**
 * Properties for the InvoicePrintContainer component.
 */
export type InvoicePrintContainerProps = {
  /** The invoice record to manage and print. */
  invoice: Invoice;
  /** Whether to display the print button controls. */
  showPrintButton?: boolean;
  /** The dynamic invoice content component to render inside the container. */
  invoiceContent?: React.ComponentType<{
    invoice: Invoice;
  }>;
};

/**
 * Custom hook encapsulating invoice printing mutation and store synchronization.
 * @param invoice - The invoice record to print.
 * @returns The submission state and print trigger handler.
 */
function useInvoicePrint(invoice: Invoice) {
  const markInvoiceAsPrinted = useInvoiceStore((state) => state.markAsPrinted);

  const mutation = usePrintInvoiceForm({
    onSuccess() {
      markInvoiceAsPrinted(invoice.id);
    },
  });

  const handlePrint = (): void => {
    mutation.onSubmit({
      invoiceCode: invoice.type,
      id: invoice.id,
      invoiceRef: invoice.invoiceRef,
    });
  };

  return {
    isSubmitting: mutation.isSubmitting,
    handlePrint,
  };
}

/**
 * Properties for the PrintInvoiceButton component.
 */
type PrintInvoiceButtonProps = {
  /** The invoice record to print. */
  invoice: Invoice;
  /** Whether the print button is disabled. */
  disabled?: boolean;
};

/**
 * Renders the print button connected to the printing mutation hook.
 * @param props - Component properties.
 * @returns The rendered print button element.
 */
export function PrintInvoiceButton({
  invoice,
  disabled,
}: PrintInvoiceButtonProps): React.JSX.Element {
  const { isSubmitting, handlePrint } = useInvoicePrint(invoice);

  return (
    <PrintInvoiceButtonUI
      disabled={disabled}
      isPrinted={invoice.isPrinted}
      isPrinting={isSubmitting}
      isReady={true}
      onClick={handlePrint}
    />
  );
}

/**
 * Properties for the InvoicePrintHeader component.
 */
type InvoicePrintHeaderProps = {
  /** The invoice record to display status for. */
  invoice: Invoice;
};

/**
 * Renders the header status and history dialog layout.
 * @param props - Component properties.
 * @returns The rendered header element.
 */
function InvoicePrintHeader({
  invoice,
}: InvoicePrintHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <ActionPrintHeaderStatus isPrinted={invoice.isPrinted} />
      <InvoiceHistoryDialog />
    </div>
  );
}

/**
 * Properties for the InvoicePrintToolbar component.
 */
type InvoicePrintToolbarProps = {
  /** The invoice record to print. */
  invoice: Invoice;
};

/**
 * Renders the printer configuration view and conditional print button.
 * @param props - Component properties.
 * @returns The rendered toolbar element.
 */
function InvoicePrintToolbar({
  invoice,
}: InvoicePrintToolbarProps): React.JSX.Element {
  return (
    <PrinterConfigView>
      {(isConfig, isConnected) => (
        <PrintInvoiceButton
          invoice={invoice}
          disabled={!isConfig || !isConnected}
        />
      )}
    </PrinterConfigView>
  );
}

/**
 * Manages printing actions, store mutations, history dialog, and layout container for any invoice type.
 * @param props - Properties containing the invoice record and components.
 * @returns The rendered print container layout with action triggers and history dialog.
 */
export function InvoicePrintContainer({
  invoice,
  invoiceContent: InvoiceContent,
  showPrintButton = true,
}: InvoicePrintContainerProps): React.JSX.Element {
  return (
    <ActionPrintContainer>
      <Suspense>
        <InvoicePrintHeader invoice={invoice} />
        {InvoiceContent && <InvoiceContent invoice={invoice} />}
        {showPrintButton && <InvoicePrintToolbar invoice={invoice} />}
      </Suspense>
    </ActionPrintContainer>
  );
}
