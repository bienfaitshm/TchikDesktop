import { useCallback } from "react";
import {
  ActionPrintContainer,
  PrinterConfigView,
  PrintInvoiceButton,
} from "@/renderer/components/invoices/invoice-print";
import { usePrintInvoiceForm } from "@/renderer/libs/queries/printing";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import { XCircleIcon } from "lucide-react";

export type InvoiceViewerPrintingProps = {
  invoiceViewer?: React.ReactNode;
  isReady: boolean;
  invoiceRef?: string;
  paymentId?: string;
  isPrinted?: boolean;
  invoiceCode?: string;
  isCancelling?: boolean;
  onSuccessPrint?: (data: {
    id: string;
    invoiceCode: string;
    invoiceRef: string;
  }) => void;
  onCancelPayment?: () => void;
};

/**
 * Manages invoice preview state, ticket print mutations, and payment cancellation actions.
 * @param props - Component configuration props including readiness, identifiers, and callbacks.
 * @returns The structured invoice printing and action container element.
 */
export const InvoiceViewerPrinting: React.FC<InvoiceViewerPrintingProps> = ({
  isReady,
  isPrinted,
  paymentId,
  invoiceRef,
  invoiceViewer,
  invoiceCode = "payment",
  isCancelling = false,
  onSuccessPrint,
  onCancelPayment,
}) => {
  const { isSubmitting, onSubmit } = usePrintInvoiceForm({
    onSuccess: onSuccessPrint,
  });

  const handlePrint = useCallback((): void => {
    if (paymentId && invoiceRef) {
      onSubmit({
        invoiceCode,
        id: paymentId,
        invoiceRef,
      });
    }
  }, [paymentId, invoiceRef, invoiceCode, onSubmit]);

  return (
    <ActionPrintContainer isPending={isSubmitting} isPrinted={isPrinted}>
      {invoiceViewer}
      <PrinterConfigView>
        {() => (
          <div className="flex items-center justify-end gap-3 w-full max-w-md">
            <LoadingButton
              variant="destructive"
              size="sm"
              className="text-xs rounded-full"
              loading={isCancelling}
              disabled={isSubmitting || isCancelling}
              onClick={onCancelPayment}
            >
              <XCircleIcon />
              <span>Annuler le paiement</span>
            </LoadingButton>
            <PrintInvoiceButton
              isPrinted={isPrinted}
              isPrinting={isSubmitting}
              isReady={isReady}
              onClick={handlePrint}
            />
          </div>
        )}
      </PrinterConfigView>
    </ActionPrintContainer>
  );
};
